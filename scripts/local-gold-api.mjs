import { createServer } from 'node:http';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomInt } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';

const TEST_USER_ID='test-grounder';
const MAX_LEVEL=1000;
const STARTING_LEVEL_BET=1_000_000;
const dataDir=join(process.cwd(),'.data');
mkdirSync(dataDir,{recursive:true});
const db=new DatabaseSync(join(dataDir,'moneyground-test.sqlite'));
db.exec(`CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY,nickname TEXT NOT NULL,money INTEGER NOT NULL,gold INTEGER NOT NULL,level INTEGER NOT NULL DEFAULT 1,level_betting INTEGER NOT NULL DEFAULT 0,total_betting INTEGER NOT NULL DEFAULT 0,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS level_config (level INTEGER PRIMARY KEY,required_betting INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS gold_bet_history (id INTEGER PRIMARY KEY AUTOINCREMENT,player_id TEXT NOT NULL,amount INTEGER NOT NULL,pick TEXT NOT NULL,result_number INTEGER NOT NULL,result_pick TEXT NOT NULL,won INTEGER NOT NULL,level_before INTEGER NOT NULL,level_after INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS gold_reward_history (id INTEGER PRIMARY KEY AUTOINCREMENT,player_id TEXT NOT NULL,voucher_count INTEGER NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX IF NOT EXISTS idx_gold_bet_history_player_created ON gold_bet_history(player_id,created_at DESC);`);
const pendingRewardsColumn=db.prepare("SELECT 1 FROM pragma_table_info('players') WHERE name='pending_rewards'").get();
if(!pendingRewardsColumn){
  db.exec('ALTER TABLE players ADD COLUMN pending_rewards INTEGER NOT NULL DEFAULT 0');
  db.exec('UPDATE players SET pending_rewards=MAX(level-1,0) WHERE level>1');
}
const rewardVoucherColumn=db.prepare("SELECT 1 FROM pragma_table_info('players') WHERE name='reward_vouchers'").get();
if(!rewardVoucherColumn)db.exec('ALTER TABLE players ADD COLUMN reward_vouchers INTEGER NOT NULL DEFAULT 0');
if(db.prepare('SELECT COUNT(*) AS count FROM level_config').get().count===0){const insert=db.prepare('INSERT INTO level_config(level,required_betting) VALUES (?,?)');db.exec('BEGIN');for(let level=1;level<=MAX_LEVEL;level++)insert.run(level,Math.round(STARTING_LEVEL_BET*1.01**(level-1)));db.exec('COMMIT');}
db.prepare('INSERT OR IGNORE INTO players(id,nickname,money,gold,level,level_betting,total_betting) VALUES (?,?,?,?,1,0,0)').run(TEST_USER_ID,'테스트 그라운더',12_000,1_000_000);

function player(){const current=db.prepare('SELECT * FROM players WHERE id=?').get(TEST_USER_ID);const config=db.prepare('SELECT required_betting FROM level_config WHERE level=?').get(current.level);const rewardHistory=db.prepare('SELECT voucher_count AS voucherCount,created_at AS createdAt FROM gold_reward_history WHERE player_id=? ORDER BY id DESC LIMIT 20').all(TEST_USER_ID);return {id:current.id,nickname:current.nickname,money:current.money,gold:current.gold,level:current.level,levelBetting:current.level_betting,totalBetting:current.total_betting,requiredBetting:config.required_betting,progressPercent:Math.min(100,current.level_betting/config.required_betting*100),pendingRewards:current.pending_rewards,rewardVouchers:current.reward_vouchers,rewardHistory};}
function json(response,status,payload){response.writeHead(status,{'content-type':'application/json','access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'});response.end(JSON.stringify(payload));}

createServer(async(request,response)=>{
  if(request.method==='OPTIONS')return json(response,204,{});
  if(request.url!=='/api/gold-player')return json(response,404,{error:'찾을 수 없는 경로입니다.'});
  if(request.method==='GET')return json(response,200,player());
  if(request.method!=='POST')return json(response,405,{error:'허용되지 않은 요청입니다.'});
  const body=await new Promise(resolve=>{let data='';request.on('data',chunk=>data+=chunk);request.on('end',()=>resolve(data));});
  const payload=JSON.parse(body||'{}');
  if(payload.action==='refill'){db.prepare('UPDATE players SET gold=gold+?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(1_000_000,TEST_USER_ID);return json(response,200,player());}
  if(payload.action==='claimRewards'){const current=db.prepare('SELECT * FROM players WHERE id=?').get(TEST_USER_ID);if(!current.pending_rewards)return json(response,400,{error:'수령할 누적 보상이 없습니다.'});db.exec('BEGIN IMMEDIATE');db.prepare('UPDATE players SET pending_rewards=0,reward_vouchers=reward_vouchers+?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(current.pending_rewards,TEST_USER_ID);db.prepare('INSERT INTO gold_reward_history(player_id,voucher_count) VALUES (?,?)').run(TEST_USER_ID,current.pending_rewards);db.exec('COMMIT');return json(response,200,{player:player(),claimedRewards:current.pending_rewards});}
  if(payload.action==='useVoucher'){const current=db.prepare('SELECT * FROM players WHERE id=?').get(TEST_USER_ID);if(!current.reward_vouchers)return json(response,400,{error:'사용할 10만 골드 교환권이 없습니다.'});db.prepare('UPDATE players SET gold=gold+100000,reward_vouchers=reward_vouchers-1,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(TEST_USER_ID);return json(response,200,{player:player()});}
  if(payload.action!=='bet'||!Number.isSafeInteger(payload.amount)||payload.amount<=0||(payload.pick!=='홀'&&payload.pick!=='짝'))return json(response,400,{error:'잘못된 요청입니다.'});
  const current=db.prepare('SELECT * FROM players WHERE id=?').get(TEST_USER_ID);
  if(payload.amount>current.gold)return json(response,400,{error:'보유 골드가 부족합니다.'});
  const resultNumber=randomInt(1,11),resultPick=resultNumber%2?'홀':'짝',won=payload.pick===resultPick,levelBefore=current.level;
  let level=current.level,levelBetting=current.level_betting+payload.amount;
  while(level<MAX_LEVEL){const required=db.prepare('SELECT required_betting FROM level_config WHERE level=?').get(level).required_betting;if(levelBetting<required)break;levelBetting-=required;level++;}
  db.exec('BEGIN IMMEDIATE');
  db.prepare('UPDATE players SET gold=?,level=?,level_betting=?,total_betting=total_betting+?,pending_rewards=pending_rewards+?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(current.gold+(won?payload.amount:-payload.amount),level,levelBetting,payload.amount,level-levelBefore,TEST_USER_ID);
  db.prepare('INSERT INTO gold_bet_history(player_id,amount,pick,result_number,result_pick,won,level_before,level_after) VALUES (?,?,?,?,?,?,?,?)').run(TEST_USER_ID,payload.amount,payload.pick,resultNumber,resultPick,won?1:0,levelBefore,level);
  db.exec('COMMIT');
  return json(response,200,{player:player(),resultNumber,resultPick,won,leveledUp:level>levelBefore});
}).listen(3010,()=>console.log('Gold SQLite API listening on http://localhost:3010'));
