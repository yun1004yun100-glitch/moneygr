'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { BrandLogo } from './BrandLogo';
import { MenuCenter, type MenuScreen } from './MenuCenter';
import './home-header.css';

type Match = { id:number; sport:string; league:string; live?:string; time:string; home:string; away:string; score:string; odds:{label:string; value:number}[] };
type Game = { id:number; title:string; maker:string; icon:string; tone:string; category:string; badge?:string };
type Bet = { matchId:number; title:string; pick:string; odd:number };
type GoldPlayer = { id:string; nickname:string; money:number; gold:number; level:number; levelBetting:number; totalBetting:number; requiredBetting:number; progressPercent:number; pendingRewards:number; rewardVouchers:number; rewardHistory:{voucherCount:number;createdAt:string}[] };
type MemberPlayer = { level:number; levelBetting:number; requiredBetting:number; pendingRewards:number };
type AppView = 'landing'|'entry'|'home'|'sports'|'casino'|'mini'|'gold'|'goldSports'|'goldEvents'|'goldFlash'|'community';

const viewPaths:Record<AppView,string>={landing:'/',entry:'/entry',home:'/member',sports:'/sports',casino:'/casino',mini:'/mini',gold:'/gold-game',goldSports:'/gold/sports',goldEvents:'/gold/events',goldFlash:'/gold/play',community:'/community'};
const goldViews:AppView[]=['gold','goldSports','goldEvents','goldFlash','community'];
const viewFromPath=(path:string):AppView=>({
  '/':'landing','/entry':'entry','/member':'home','/sports':'sports','/casino':'casino','/mini':'mini','/gold-game':'gold','/gold/sports':'goldSports','/gold/events':'goldEvents','/gold/play':'goldFlash','/community':'community',
}[path.replace(/\/$/,'')||'/'] as AppView||'landing');

const matches: Match[] = [
  { id:1, sport:'축구', league:'K LEAGUE 1', live:'LIVE 62′', time:'진행 중', home:'서울 유나이티드', away:'부산 웨이브', score:'2 : 1', odds:[{label:'홈',value:1.74},{label:'무',value:3.2},{label:'원정',value:4.6}] },
  { id:2, sport:'농구', league:'KBL', live:'LIVE Q3', time:'진행 중', home:'서울 코멧츠', away:'인천 블루스', score:'68 : 64', odds:[{label:'홈',value:1.92},{label:'핸디',value:1.86},{label:'원정',value:1.88}] },
  { id:3, sport:'야구', league:'KBO', time:'오늘 20:30', home:'잠실 히어로즈', away:'대전 이글스', score:'VS', odds:[{label:'홈',value:1.64},{label:'U 8.5',value:1.91},{label:'원정',value:2.18}] },
  { id:4, sport:'축구', league:'PREMIER LEAGUE', time:'내일 01:00', home:'런던 시티', away:'머지 레즈', score:'VS', odds:[{label:'홈',value:2.16},{label:'무',value:3.45},{label:'원정',value:3.1}] },
];

const games: Game[] = [
  { id:1,title:'에메랄드 바카라',maker:'MG LIVE',icon:'♠',tone:'mint',category:'라이브',badge:'HOT' },
  { id:2,title:'스타라이트 룰렛',maker:'COSMIC TABLE',icon:'✦',tone:'violet',category:'라이브',badge:'LIVE' },
  { id:3,title:'골든 블랙잭',maker:'NOVA STUDIO',icon:'A',tone:'gold',category:'테이블' },
  { id:4,title:'메가 세븐',maker:'LUNA PLAY',icon:'7',tone:'coral',category:'슬롯',badge:'NEW' },
  { id:5,title:'크라운 드롭',maker:'ORBIT GAMES',icon:'♛',tone:'blue',category:'슬롯' },
  { id:6,title:'네온 다이스',maker:'MG ORIGINALS',icon:'⚄',tone:'mint',category:'테이블' },
];

const notices = [
  { tag:'안내', title:'머니그라운드 서비스 이용 안내', date:'08.28' },
  { tag:'이벤트', title:'신규 회원 웰컴 미션이 시작되었습니다', date:'08.27' },
  { tag:'안전', title:'이용 시간과 한도를 직접 관리하세요', date:'08.26' },
];

const lounges = [
  {name:'EMERALD LIVE',caption:'라이브 테이블',mark:'♠',tone:'emerald'},
  {name:'ORBIT ROULETTE',caption:'프리미엄 룰렛',mark:'◎',tone:'gold'},
  {name:'NOVA BLACKJACK',caption:'블랙잭 라운지',mark:'A',tone:'violet'},
  {name:'STADIUM SPORTS',caption:'라이브 스포츠',mark:'◉',tone:'blue'},
  {name:'GOLDEN SLOTS',caption:'인기 슬롯',mark:'7',tone:'coral'},
  {name:'MG ORIGINALS',caption:'머니그라운드 게임',mark:'MG',tone:'mint'},
];

const serviceMenus: {screen:MenuScreen;label:string;icon:string}[] = [
  {screen:'deposit',label:'입금신청',icon:'●'}, {screen:'withdraw',label:'출금신청',icon:'▰'},
  {screen:'events',label:'이벤트',icon:'▣'}, {screen:'notice',label:'공지/규정',icon:'▤'},
  {screen:'referral',label:'지인추천',icon:'♧'}, {screen:'attendance',label:'출석부',icon:'▦'},
  {screen:'achievement',label:'칭호 업적',icon:'♛'}, {screen:'coupon',label:'쿠폰',icon:'▥'}, {screen:'support',label:'고객센터',icon:'▧'},
  {screen:'messages',label:'쪽지',icon:'✉'},
];

export default function Home({initialPath='/'}:{initialPath?:string}) {
  const initialView=viewFromPath(initialPath);
  const [entryOpen,setEntryOpen] = useState(false);
  const [view,setView] = useState<AppView>(initialView);
  const [gameFilter,setGameFilter] = useState('전체');
  const [sportFilter,setSportFilter] = useState('전체');
  const [query,setQuery] = useState('');
  const [searchOpen,setSearchOpen] = useState(false);
  const [loginOpen,setLoginOpen] = useState(false);
  const [signupOpen,setSignupOpen] = useState(false);
  const [introPlaying,setIntroPlaying] = useState(false);
  const [liveChatOpen,setLiveChatOpen] = useState(false);
  const [loggedIn,setLoggedIn] = useState(false);
  const [favorites,setFavorites] = useState<number[]>([1,4]);
  const [bets,setBets] = useState<Bet[]>([]);
  const [slipOpen,setSlipOpen] = useState(false);
  const [stake,setStake] = useState(100);
  const [credit,setCredit] = useState(1250000);
  const [toast,setToast] = useState('');
  const [noticeOpen,setNoticeOpen] = useState(false);
  const [manageOpen,setManageOpen] = useState(false);
  const [limit,setLimit] = useState(5000000);
  const [sessionMinutes] = useState(18);
  const [menuScreen,setMenuScreen] = useState<MenuScreen|null>(null);
  const [goldMode,setGoldMode] = useState(goldViews.includes(initialView));
  const [goldRankingOpen,setGoldRankingOpen] = useState(false);
  const [goldAchievementOpen,setGoldAchievementOpen] = useState(false);
  const defaultMemberPlayer: MemberPlayer = {
    level: 13,
    levelBetting: 680000,
    requiredBetting: 1000000,
    pendingRewards: 2,
  };
  const [memberPlayer,setMemberPlayer] = useState<MemberPlayer>(defaultMemberPlayer);
  const [memberRewardClaimOpen,setMemberRewardClaimOpen] = useState(false);
  const [memberChestVideoOpen,setMemberChestVideoOpen] = useState(false);
  const defaultGoldPlayer: GoldPlayer = {
    id: 'test-grounder',
    nickname: '그라운더 님',
    money: 1250000,
    gold: 1000000,
    level: 9,
    levelBetting: 69000,
    totalBetting: 869000,
    requiredBetting: 1000000,
    progressPercent: 6.9,
    pendingRewards: 8,
    rewardVouchers: 3,
    rewardHistory: []
  };
  const [goldPlayer,setGoldPlayer] = useState<GoldPlayer>(defaultGoldPlayer);
  const [goldCoinBurst,setGoldCoinBurst] = useState(0);
  const [goldCoinFlight,setGoldCoinFlight] = useState<{id:number;startX:number;startY:number;endX:number;endY:number}|null>(null);
  const [goldRewardClaimOpen,setGoldRewardClaimOpen] = useState(false);
  const [goldRewardsOpen,setGoldRewardsOpen] = useState(false);
  const [goldRewardLockedMessage,setGoldRewardLockedMessage] = useState<string|null>(null);
  const goldApiUrl=typeof window!=='undefined'&&window.location.hostname==='localhost'?'http://localhost:3010/api/gold-player':'/api/gold-player';

  const updateMemberPlayer=(updater:MemberPlayer|((prev:MemberPlayer)=>MemberPlayer))=>{
    setMemberPlayer(prev=>{
      const next=typeof updater==='function'?updater(prev):updater;
      try{if(typeof window!=='undefined')window.localStorage.setItem('moneyground_member_player',JSON.stringify(next));}catch{}
      return next;
    });
  };

  const updateCredit=(updater:number|((prev:number)=>number))=>{
    setCredit(prev=>{
      const next=typeof updater==='function'?updater(prev):updater;
      try{if(typeof window!=='undefined')window.localStorage.setItem('moneyground_member_credit',next.toString());}catch{}
      return next;
    });
  };

  const claimMemberRewards=()=>{
    const count=memberPlayer.pendingRewards>0?memberPlayer.pendingRewards:1;
    const amount=count*100000;
    updateCredit(c=>c+amount);
    updateMemberPlayer(p=>({
      ...p,
      pendingRewards:0,
      levelBetting:p.levelBetting>=p.requiredBetting?p.levelBetting-p.requiredBetting:p.levelBetting
    }));
    setToast(`VIP 머니 보상 ${amount.toLocaleString()}원을 수령했습니다. 보유 머니에 충전되었습니다.`);
    setMemberRewardClaimOpen(false);
  };

  const updateGoldPlayer=(updater:GoldPlayer|((prev:GoldPlayer)=>GoldPlayer))=>{
    setGoldPlayer(prev=>{
      const next=typeof updater==='function'?updater(prev):updater;
      try{if(typeof window!=='undefined')window.localStorage.setItem('moneyground_gold_player',JSON.stringify(next));}catch{}
      return next;
    });
  };

  useEffect(()=>{
    try{
      const savedGold=window.localStorage.getItem('moneyground_gold_player');
      if(savedGold){const parsed=JSON.parse(savedGold);if(parsed&&typeof parsed==='object')setGoldPlayer(parsed);}
      const savedMember=window.localStorage.getItem('moneyground_member_player');
      if(savedMember){const parsedM=JSON.parse(savedMember);if(parsedM&&typeof parsedM==='object')setMemberPlayer(parsedM);}
      const savedCredit=window.localStorage.getItem('moneyground_member_credit');
      if(savedCredit){const val=Number(savedCredit);if(!isNaN(val)&&val>0)setCredit(val);}
      const savedLoggedIn=window.localStorage.getItem('moneyground_logged_in');
      if(savedLoggedIn==='true'){
        setLoggedIn(true);
      }
    }catch{}
  },[]);

  useEffect(()=>{ if(!toast) return; const t=setTimeout(()=>setToast(''),2600); return()=>clearTimeout(t); },[toast]);
  useEffect(()=>{
    const isLocked = entryOpen||loginOpen||signupOpen||introPlaying||liveChatOpen||manageOpen||menuScreen||goldRankingOpen||goldAchievementOpen||view==='landing';
    document.body.style.overflow = isLocked ? 'hidden' : '';
    document.documentElement.style.overflow = isLocked ? 'hidden' : '';
    if(view==='landing'){
      document.body.style.paddingBottom = '0px';
    } else {
      document.body.style.paddingBottom = '';
    }
    return ()=>{
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.style.paddingBottom = '';
    };
  },[entryOpen,loginOpen,signupOpen,introPlaying,liveChatOpen,manageOpen,menuScreen,goldRankingOpen,goldAchievementOpen,view]);
  useEffect(()=>{if(view!=='landing'||loggedIn)return;try{if(!window.localStorage.getItem('moneyground-intro-disabled')&&!window.sessionStorage.getItem('moneyground-intro-played'))setIntroPlaying(true)}catch{setIntroPlaying(true)}},[view,loggedIn]);
  useEffect(()=>{const resolvePath=()=>{const path=window.location.pathname.replace(/\/$/,'')||'/';if(path==='/gold'){window.history.replaceState({},'',viewPaths.landing);return 'landing' as AppView;}return viewFromPath(path);};const onPopState=()=>{const next=resolvePath();setEntryOpen(false);setView(next);setGoldMode(goldViews.includes(next));window.scrollTo({top:0,behavior:'auto'});};if((window.location.pathname.replace(/\/$/,'')||'/')==='/gold')onPopState();window.addEventListener('popstate',onPopState);return()=>window.removeEventListener('popstate',onPopState);},[]);
  useEffect(()=>{
    let active=true;
    const loadPlayer=()=>{
      fetch(goldApiUrl)
        .then(response=>{if(!response.ok)throw new Error();return response.json();})
        .then(player=>{if(active&&player&&player.id){updateGoldPlayer(player);}})
        .catch(()=>{/* Silently fallback to local state */});
    };
    loadPlayer();
    const timer=window.setInterval(loadPlayer,8000);
    return()=>{active=false;window.clearInterval(timer)};
  },[goldApiUrl]);

  const filteredGames = useMemo(()=>games.filter(g=>(gameFilter==='전체'||g.category===gameFilter)&&(`${g.title} ${g.maker}`).toLowerCase().includes(query.toLowerCase())),[gameFilter,query]);
  const filteredMatches = useMemo(()=>matches.filter(m=>(sportFilter==='전체'||m.sport===sportFilter)&&(`${m.home} ${m.away} ${m.league}`).toLowerCase().includes(query.toLowerCase())),[sportFilter,query]);
  const totalOdd = bets.reduce((a,b)=>a*b.odd,1);
  const expected = Math.floor(stake*totalOdd);

  const selectBet = (m:Match,pick:{label:string;value:number}) => {
    setBets(prev=>{
      const exists=prev.find(b=>b.matchId===m.id&&b.pick===pick.label);
      if(exists) return prev.filter(b=>!(b.matchId===m.id&&b.pick===pick.label));
      return [...prev.filter(b=>b.matchId!==m.id),{matchId:m.id,title:`${m.home} vs ${m.away}`,pick:pick.label,odd:pick.value}];
    });
    setSlipOpen(true);
  };
  const placeBet = () => {
    if(!bets.length){setToast('선택한 경기가 없습니다.');return;}
    if(stake<10||stake>credit||stake>limit){setToast('보유 머니 또는 설정 한도를 확인해주세요.');return;}
    updateCredit(c=>c-stake); setBets([]); setSlipOpen(false);
    updateMemberPlayer(prev => {
      let currentLevel = prev.level;
      let currentBetting = prev.levelBetting + stake;
      let newRewards = prev.pendingRewards;
      while (currentBetting >= prev.requiredBetting) {
        currentBetting -= prev.requiredBetting;
        currentLevel++;
        newRewards++;
      }
      return {
        ...prev,
        level: currentLevel,
        levelBetting: currentBetting,
        pendingRewards: newRewards,
      };
    });
    setToast(`베팅이 접수되었습니다 · MG${Date.now().toString().slice(-6)}`);
  };
  const toggleFav=(id:number)=>{setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);setToast(favorites.includes(id)?'즐겨찾기에서 삭제했습니다.':'즐겨찾기에 추가했습니다.');};
  const navigate=(next:AppView,behavior:ScrollBehavior='smooth')=>{setEntryOpen(false);setGoldMode(goldViews.includes(next));setView(next);if(window.location.pathname!==viewPaths[next])window.history.pushState({},'',viewPaths[next]);window.scrollTo({top:0,behavior});};
  const go=(next:'home'|'sports'|'casino'|'mini')=>navigate(next);
  const goGoldFlash=()=>navigate('goldFlash');
  const goGold=(next:'gold'|'goldSports'|'goldEvents')=>navigate(next);
  const goCommunity=()=>navigate('community');
  const enter=(next:'home'|'gold')=>navigate(next,'auto');
  const goldBalance=goldPlayer?.gold??1_000_000;

  const settleMemberBet=async(amount:number,pick:'홀'|'짝')=>{
    updateCredit(c=>Math.max(0,c-amount));
    let leveledUp=false;
    updateMemberPlayer(prev=>{
      let currentLevel=prev.level;
      let currentBetting=prev.levelBetting+amount;
      let newRewards=prev.pendingRewards;
      const req=prev.requiredBetting||1_000_000;
      while(currentBetting>=req){
        currentBetting-=req;
        currentLevel++;
        newRewards++;
        leveledUp=true;
      }
      return {
        ...prev,
        level:currentLevel,
        levelBetting:currentBetting,
        pendingRewards:newRewards,
      };
    });

    const resultNumber=Math.floor(Math.random()*10)+1;
    const resultPick:'홀'|'짝'=resultNumber%2===1?'홀':'짝';
    const won=pick===resultPick;
    if(won){
      updateCredit(c=>c+amount*2);
    }
    return {resultNumber,resultPick,won,leveledUp};
  };
  const refillGold=async()=>{
    try{
      const response=await fetch(goldApiUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'refill'})});
      if(response.ok){const player=await response.json() as GoldPlayer;updateGoldPlayer(player);setToast('무료 골드 100만 G가 충전되었습니다.');return;}
    }catch{}
    updateGoldPlayer(p=>({...p,gold:p.gold+1000000}));
    setToast('무료 골드 100만 G가 충전되었습니다.');
  };
  const startGoldCoinBurst=(origin:{x:number;y:number})=>{const target=document.querySelector('.gold-global-track')?.getBoundingClientRect();if(!target)return;const id=Date.now();setGoldCoinBurst(id);setGoldCoinFlight({id,startX:origin.x,startY:origin.y,endX:target.left+target.width*.78,endY:target.top+target.height/2});window.setTimeout(()=>setGoldCoinFlight(current=>current?.id===id?null:current),1200);window.setTimeout(()=>setGoldCoinBurst(current=>current===id?0:current),1100);};
  const settleGoldBet=async(amount:number,pick:'홀'|'짝')=>{
    try{
      const response=await fetch(goldApiUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'bet',amount,pick})});
      if(response.ok){const data=await response.json() as {error?:string;player:GoldPlayer;resultNumber:number;resultPick:'홀'|'짝';won:boolean;leveledUp:boolean};updateGoldPlayer(data.player);return data;}
    }catch{}
    const resultNumber=Math.floor(Math.random()*10)+1;
    const resultPick:'홀'|'짝'=resultNumber%2===1?'홀':'짝';
    const won=pick===resultPick;
    let nextPlayer=goldPlayer;
    const levelBefore=nextPlayer.level;
    let currentLevel=nextPlayer.level;
    let currentBetting=nextPlayer.levelBetting+amount;
    while(currentLevel<1000){
      const req=Math.round(1000000*(1.01**(currentLevel-1)));
      if(currentBetting<req)break;
      currentBetting-=req;
      currentLevel++;
    }
    const leveledUpCount=currentLevel-levelBefore;
    const req=Math.round(1000000*(1.01**(currentLevel-1)));
    const updated:GoldPlayer={
      ...nextPlayer,
      gold:won?nextPlayer.gold+amount:nextPlayer.gold-amount,
      level:currentLevel,
      levelBetting:currentBetting,
      totalBetting:nextPlayer.totalBetting+amount,
      pendingRewards:nextPlayer.pendingRewards+leveledUpCount,
      requiredBetting:req,
      progressPercent:Math.min(100,(currentBetting/req)*100)
    };
    updateGoldPlayer(updated);
    return {resultNumber,resultPick,won,leveledUp:currentLevel>levelBefore,player:updated};
  };
  const claimGoldRewards=async()=>{
    try{
      const response=await fetch(goldApiUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'claimRewards'})});
      if(response.ok){const data=await response.json() as {error?:string;player:GoldPlayer;claimedRewards:number};updateGoldPlayer(data.player);setToast(`누적 보상 상자 ${data.claimedRewards}개를 열었습니다.`);return;}
    }catch{}
    const count=goldPlayer.pendingRewards;
    if(!count){setToast('수령할 보상이 없습니다.');return;}
    updateGoldPlayer(p=>({...p,pendingRewards:0,rewardVouchers:p.rewardVouchers+count,rewardHistory:[{voucherCount:count,createdAt:new Date().toISOString()},...(p.rewardHistory||[])]}));
    setToast(`누적 보상 상자 ${count}개를 열었습니다.`);
  };
  const useGoldVoucher=async()=>{
    try{
      const response=await fetch(goldApiUrl,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'useVoucher'})});
      if(response.ok){const data=await response.json() as {error?:string;player:GoldPlayer};updateGoldPlayer(data.player);setToast('10만 골드 교환권을 사용했습니다.');return;}
    }catch{}
    if(goldPlayer.rewardVouchers<=0){setToast('사용할 교환권이 없습니다.');return;}
    updateGoldPlayer(p=>({...p,rewardVouchers:p.rewardVouchers-1,gold:p.gold+100000}));
    setToast('10만 골드 교환권을 사용했습니다.');
  };

  if(view==='entry') return <EntryGate onCasino={()=>enter('home')} onSports={()=>enter('gold')}/>;

  return (
    <main id="top" className={`${goldMode||view==='gold'||view==='goldSports'||view==='goldEvents'||view==='goldFlash'?'gold-mode':''} ${view==='gold'?'gold-mobile-v2-active':''} ${view==='goldFlash'?'gold-betting-view':''} ${view==='landing'?'landing-view':''} ${view==='community'?'community-view':''}`}>
      {introPlaying&&<LandingIntro onDone={disableNextTime=>{try{window.sessionStorage.setItem('moneyground-intro-played','1');if(disableNextTime)window.localStorage.setItem('moneyground-intro-disabled','1')}catch{}setIntroPlaying(false);setLoginOpen(true)}}/>}
      <header className="topbar">
        <button className="brand" onClick={()=>navigate(goldMode?'gold':'home')} aria-label={goldMode?'골드게임 홈':'유료회원 홈'}><BrandLogo/>{(['gold','goldSports','goldEvents','goldFlash'] as string[]).includes(view)&&<span className="gold-page-brand">GOLD GAME</span>}</button>
        {(['gold','goldSports','goldEvents','goldFlash'] as string[]).includes(view) ? <nav aria-label="골드게임 주요 메뉴"><button className={view==='gold'?'active':''} onClick={()=>goGold('gold')}>홈</button><button className={view==='goldFlash'?'active':''} onClick={goGoldFlash}>플래시게임</button><button className={view==='goldSports'?'active':''} onClick={()=>goGold('goldSports')}>스포츠</button><button className={view==='goldEvents'?'active':''} onClick={()=>goGold('goldEvents')}>이벤트</button><button className={goldAchievementOpen?'active':''} onClick={()=>setGoldAchievementOpen(true)}>칭호/업적</button><button className={goldRankingOpen?'active':''} onClick={()=>setGoldRankingOpen(true)}>골드랭킹</button></nav> : <nav aria-label="회원 주요 메뉴"><button className={view==='home'?'active':''} onClick={()=>go('home')}>홈</button><button className={view==='casino'?'active':''} onClick={()=>go('casino')}>카지노</button><button className={view==='sports'?'active':''} onClick={()=>go('sports')}>스포츠</button><button className={view==='mini'?'active':''} onClick={()=>go('mini')}>미니게임</button><button onClick={()=>document.getElementById('events')?.scrollIntoView({behavior:'smooth'})}>이벤트</button><button onClick={()=>setMenuScreen('achievement')}>칭호 업적</button></nav>}
        <div className="head-actions">{(['gold','goldSports','goldEvents','goldFlash'] as string[]).includes(view)?<div className="gold-top-balance"><small>보유 골드</small><b>{goldBalance.toLocaleString()} <em>G</em></b></div>:<div className="member-top-balances"><div className="member-top-balance"><small>보유 머니</small><b>{credit.toLocaleString()} <em>원</em></b></div><div className="member-top-balance member-top-point"><small>보유 포인트</small><b>18,500 <em>P</em></b></div></div>}<button className="icon-btn badge-btn" onClick={()=>setMenuScreen('messages')} aria-label="쪽지">✉<i>3</i></button><button className="icon-btn notice-btn" onClick={()=>setNoticeOpen(v=>!v)} aria-label="안내사항">※</button>{loggedIn?<button className="profile-btn" onClick={()=>setMenuScreen('profile')} aria-label="프로필 마이메뉴"><span aria-label="프로필"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></span><b>그라운더</b></button>:<><button className="login-btn" onClick={()=>setLoginOpen(true)}>로그인</button><button className="join-btn" onClick={()=>setMenuScreen('join')}>회원가입</button></>}</div>
        {noticeOpen&&<div className="notification-pop"><div><b>알림</b><button onClick={()=>setNoticeOpen(false)}>×</button></div>{notices.map(n=><button key={n.title} onClick={()=>setToast(`${n.title} 상세를 확인했습니다.`)}><span>{n.tag}</span><p>{n.title}<small>{n.date}</small></p></button>)}<button className="all-read" onClick={()=>setToast('모든 알림을 읽음 처리했습니다.')}>모두 읽음 처리</button></div>}
      </header>

      {(['gold','goldSports','goldEvents','goldFlash'] as string[]).includes(view)&&<GoldGlobalProgress totalBetting={goldPlayer?.levelBetting??0} rewardTarget={goldPlayer?.requiredBetting??1_000_000} level={goldPlayer?.level??1} pendingRewards={goldPlayer?.pendingRewards??0} coinBurst={goldCoinBurst} onRewards={()=>setGoldRewardClaimOpen(true)} onLockedRewards={setGoldRewardLockedMessage}/>}
      {(view==='home'||view==='mini')&&<MemberGlobalProgress totalBetting={memberPlayer?.levelBetting??0} rewardTarget={memberPlayer?.requiredBetting??1_000_000} level={memberPlayer?.level??1} pendingRewards={memberPlayer?.pendingRewards??0} onRewards={()=>setMemberChestVideoOpen(true)} onLockedRewards={msg=>setToast(msg)}/>}

      {view==='landing'&&<MoneygroundLanding onLogin={()=>setLoginOpen(true)} onJoin={()=>setSignupOpen(true)} onCommunity={goCommunity} onSupport={()=>setLiveChatOpen(true)}/>}
      {view==='community'&&<CommunityPage onGold={()=>goGold('gold')} onToast={setToast}/>}

      {searchOpen&&<section className="search-drawer"><div><span>⌕</span><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="게임, 팀, 리그를 검색하세요" aria-label="통합 검색어"/><small>{query.length>1?`${filteredGames.length+filteredMatches.length}개 결과`:'2글자 이상 입력'}</small><button onClick={()=>{setQuery('');setSearchOpen(false)}}>닫기</button></div></section>}

      {!(['home','gold','goldSports','goldEvents','goldFlash','mini'] as string[]).includes(view)&&<nav className="service-bar" aria-label="회원 서비스 메뉴"><div>{serviceMenus.map(item=><button onClick={()=>setMenuScreen(item.screen)} key={item.screen}><span>{item.icon}</span>{item.label}</button>)}<i/><button className="money-status" onClick={()=>setMenuScreen('money')}><small>머니</small><b>{credit.toLocaleString()} 원</b></button><button className="money-status" onClick={()=>setMenuScreen('point')}><small>포인트</small><b>18,500 P</b></button><button className="my-menu" onClick={()=>setMenuScreen('profile')}>MY 메뉴⌄</button></div></nav>}

      {view==='gold'&&<>
        <GoldMobileV2
          balance={goldBalance}
          onCasino={goGoldFlash}
          onSports={()=>goGold('goldSports')}
          onAchievement={()=>setGoldAchievementOpen(true)}
          onRanking={()=>setGoldRankingOpen(true)}
          onCommunity={goCommunity}
          onRefill={refillGold}
        />
        <section className="gold-home-overview gold-v1-overview"><GoldIntroSlider/><aside className="gold-home-sidebar"><GoldHomePanel balance={goldBalance} totalBetting={goldPlayer?.totalBetting??0} onAchievement={()=>setGoldAchievementOpen(true)} onRefill={refillGold}/><GoldHomeRankBoard balance={goldBalance} totalBetting={goldPlayer?.totalBetting??0}/></aside></section>
      </>}
      {view==='goldFlash'&&<GoldFlash onBack={()=>goGold('gold')} onToast={setToast} balance={goldBalance} onBetStart={startGoldCoinBurst} onResolveBet={settleGoldBet}/>}
      {view==='goldEvents'&&<GoldEvents onToast={setToast}/>} 

      {view==='mini'&&<MemberFlash onBack={()=>go('home')} onToast={setToast} balance={credit} onBet={settleMemberBet}/>}

      {view==='home'&&<>
        <MemberMobileV2
          balance={credit}
          onCasino={()=>go('casino')}
          onSports={()=>go('sports')}
          onSlots={()=>{go('casino');setGameFilter('슬롯');}}
          onMini={()=>go('mini')}
          onVirtual={()=>setToast('가상게임 라운지에 입장합니다.')}
          onEvents={()=>setMenuScreen('events')}
          onDeposit={()=>setMenuScreen('deposit')}
          onWithdraw={()=>setMenuScreen('withdraw')}
          onSupport={()=>setLiveChatOpen(true)}
          onProfile={()=>setMenuScreen('profile')}
          onMoney={()=>setMenuScreen('money')}
        />
        <section className="hero">
          <div className="hero-copy"><span className="eyebrow"><i/> MONEYGROUND · MEMBER PLAY</span><h1>회원 게임의<br/><em>새로운 그라운드.</em></h1><p>프리미엄 카지노와 실시간 스포츠를 한 화면에서 더 빠르고 편안하게 탐색하세요.</p><div className="hero-ctas"><button className="primary" onClick={()=>go('casino')}>카지노 둘러보기 <b>→</b></button><button className="secondary" onClick={()=>go('sports')}>라이브 스포츠</button></div><div className="trust-row"><span>◆ 안전 보증 솔루션</span><span>● 실시간 입출금</span><span>◈ VIP 롤링 리워드</span></div></div>
        </section>
      </>}

      {(view==='home'||view==='sports'||view==='gold'||view==='goldSports')&&<section className="content-section sports-section" id="sports"><div className="section-head"><div><span className="kicker">{(view==='gold'||view==='goldSports')?'GOLD GAME SPORTS':'LIVE SPORTS'}</span><h2>{(view==='gold'||view==='goldSports')?'무료 스포츠 게임':view==='sports'?'스포츠 센터':'지금 주목할 경기'}</h2></div>{view==='home'&&<button onClick={()=>go('sports')}>전체 경기 <span>→</span></button>}</div><div className="filter-row">{['전체','축구','야구','농구'].map(x=><button className={sportFilter===x?'active':''} onClick={()=>setSportFilter(x)} key={x}>{x}</button>)}</div><div className="match-layout"><div className="match-list">{filteredMatches.map(m=><article className="match-card" key={m.id}><div className="match-top"><span>{m.sport} · {m.league}</span><b className={m.live?'live':''}>{m.live||m.time}</b><button onClick={()=>setToast('경기 시작 알림을 설정했습니다.')} aria-label="경기 알림">♢</button></div><div className="teams"><strong>{m.home}<small>HOME</small></strong><b>{m.score}</b><strong>{m.away}<small>AWAY</small></strong></div><div className="odds">{m.odds.map(p=>{const selected=bets.some(b=>b.matchId===m.id&&b.pick===p.label);return <button className={selected?'selected':''} onClick={()=>selectBet(m,p)} key={p.label}><small>{p.label}</small><b>{p.value.toFixed(2)}</b></button>})}</div></article>)}</div>{(view==='sports')&&<aside className="desktop-slip"><Slip bets={bets} setBets={setBets} stake={stake} setStake={setStake} totalOdd={totalOdd} expected={expected} credit={credit} limit={limit} onPlace={placeBet}/></aside>}</div></section>}

      {(view==='home'||view==='casino')&&<section className="content-section" id="casino"><div className="section-head"><div><span className="kicker">CURATED GAMES</span><h2>{view==='casino'?'카지노 라운지':'오늘의 추천 게임'}</h2></div>{view==='home'&&<button onClick={()=>go('casino')}>전체 게임 <span>→</span></button>}</div><div className="filter-row">{['전체','라이브','슬롯','테이블'].map(x=><button className={gameFilter===x?'active':''} onClick={()=>setGameFilter(x)} key={x}>{x}</button>)}</div><div className={`game-grid ${view==='casino'?'expanded':''}`}>{filteredGames.map(g=><article className={`game-card ${g.tone}`} key={g.id}><div className="game-visual"><span>{g.icon}</span>{g.badge&&<i>{g.badge}</i>}<button className={favorites.includes(g.id)?'fav':''} onClick={()=>toggleFav(g.id)} aria-label={`${g.title} 즐겨찾기`}>{favorites.includes(g.id)?'★':'☆'}</button><div className="play-layer"><button onClick={()=>setToast(`${g.title} 로비를 열었습니다.`)}>게임 입장</button></div></div><div><small>{g.maker}</small><h3>{g.title}</h3><span>{g.category}</span></div></article>)}</div></section>}
      {view==='home'&&<section className="content-section lounge-section"><div className="section-head"><div><span className="kicker">PREMIUM LOUNGES</span><h2>프리미엄 게임 라운지</h2></div><button onClick={()=>go('casino')}>전체 라운지 <span>→</span></button></div><div className="lounge-grid">{lounges.map(l=><button key={l.name} className={`lounge-card ${l.tone}`} onClick={()=>go(l.tone==='blue'?'sports':'casino')}><span>{l.mark}</span><div><b>{l.name}</b><small>{l.caption}</small></div><i>→</i></button>)}</div></section>}

      {view==='home'&&<><section className="promo-grid" id="events"><article className="promo emerald"><span>MEMBER BENEFIT 01</span><h3>아이콘 솔루션</h3><p>검증된 솔루션과 안정적인 플레이 환경</p><button onClick={()=>setToast('솔루션 안내를 확인했습니다.')}>자세히 보기 →</button></article><article className="promo gold"><span>MEMBER BENEFIT 02</span><h3>프리미엄 라이브</h3><p>라이브 테이블의 생생한 인터페이스를 경험하세요</p><button onClick={()=>go('casino')}>게임 보기 →</button></article><article className="promo violet"><span>MEMBER BENEFIT 03</span><h3>스포츠 센터</h3><p>팀과 리그를 빠르게 찾고 픽을 구성하세요</p><button onClick={()=>go('sports')}>경기 보기 →</button></article></section><section className="info-section"><div><span className="kicker">NOTICE</span><h2>새로운 소식</h2></div><div className="notice-list">{notices.map(n=><button key={n.title} onClick={()=>setToast(n.title)}><span>{n.tag}</span><b>{n.title}</b><time>{n.date}</time><i>→</i></button>)}</div></section></>}

      <footer><div className="footer-brand"><BrandLogo compact/></div><p>머니그라운드 회원 서비스 · 안전하고 편안한 이용 환경을 제공합니다.</p><button onClick={()=>setManageOpen(true)}>책임 있는 이용 · 이용 관리</button></footer>

      {(!!bets.length&&view!=='sports'&&!(['gold','goldSports'] as string[]).includes(view))&&<button className="slip-bar" onClick={()=>setSlipOpen(true)}><span><b>{bets.length}</b> 베팅슬립</span><strong>총 배당 {totalOdd.toFixed(2)} <i>⌃</i></strong></button>}
      {(['gold','goldSports'] as string[]).includes(view)&&<button className={`gold-slip-icon ${bets.length?'has-bets':''}`} onClick={()=>setSlipOpen(true)} aria-label="골드 베팅슬립 열기"><span>▤</span>{bets.length>0&&<i>{bets.length}</i>}<small>베팅슬립</small></button>}
      {slipOpen&&<div className="sheet-backdrop" onClick={()=>setSlipOpen(false)}><div className="bet-sheet" onClick={e=>e.stopPropagation()}><button className="sheet-close" onClick={()=>setSlipOpen(false)}>×</button><Slip bets={bets} setBets={setBets} stake={stake} setStake={setStake} totalOdd={totalOdd} expected={expected} credit={credit} limit={limit} onPlace={placeBet} gold={(['gold','goldSports'] as string[]).includes(view)}/></div></div>}

      {(goldViews.includes(view)||view==='landing')
        ? <nav className="mobile-nav gold-mobile-nav gold-v2-global-nav" aria-label="골드게임 모바일 메뉴">
            <button className={goldRewardsOpen?'active':''} onClick={()=>view==='landing'?setLoginOpen(true):setGoldRewardsOpen(true)}>
              <span className="gold-nav-icon-wrap">
                <img className="gold-nav-icon" src="/gold-nav-reward.png" alt=""/>
                {(((goldPlayer?.pendingRewards??0)+(goldPlayer?.rewardVouchers??0))||3)>0&&<i className="gold-nav-badge">{((goldPlayer?.pendingRewards??0)+(goldPlayer?.rewardVouchers??0))||3}</i>}
              </span>
              보상
            </button>
            <button onClick={()=>view==='landing'?setLoginOpen(true):setMenuScreen('coupon')}>
              <span className="gold-nav-icon-wrap">
                <img className="gold-nav-icon" src="/gold-nav-coupon.png" alt=""/>
                <i className="gold-nav-badge">2</i>
              </span>
              쿠폰
            </button>
            <button className={`home ${view==='gold'?'active':''}`} onClick={()=>view==='landing'?undefined:goGold('gold')}><img src="/moneyground-mg-emblem.png" alt=""/>홈</button>
            <button className={view==='community'?'active':''} onClick={goCommunity}><img className="gold-nav-icon" src="/gold-nav-community.png" alt=""/>커뮤니티</button>
            <button className={liveChatOpen?'active':''} onClick={()=>setLiveChatOpen(true)}><img className="gold-nav-icon" src="/gold-nav-support.png" alt=""/>고객센터</button>
          </nav>
        : <nav className="mobile-nav member-mobile-nav gold-v2-global-nav" aria-label="회원 모바일 메뉴">
            <button className={(memberRewardClaimOpen||memberChestVideoOpen)?'active':''} onClick={()=>memberPlayer.pendingRewards>0?setMemberChestVideoOpen(true):setToast(`VIP 보상까지 ${Math.max(0,memberPlayer.requiredBetting-memberPlayer.levelBetting).toLocaleString()}원 남았습니다.`)}>
              <span className="gold-nav-icon-wrap">
                <img className="gold-nav-icon" src="/gold-nav-reward.png" alt=""/>
                {memberPlayer.pendingRewards>0&&<i className="gold-nav-badge">{memberPlayer.pendingRewards}</i>}
              </span>
              보상
            </button>
            <button onClick={()=>setMenuScreen('coupon')}>
              <span className="gold-nav-icon-wrap">
                <img className="gold-nav-icon" src="/gold-nav-coupon.png" alt=""/>
                <i className="gold-nav-badge">2</i>
              </span>
              쿠폰
            </button>
            <button className={`home ${view==='home'?'active':''}`} onClick={()=>go('home')}><img src="/moneyground-mg-emblem.png" alt=""/>홈</button>
            <button className={view==='casino'?'active':''} onClick={()=>go('casino')}><img className="gold-nav-icon" src="/gold-nav-guarantee.png" alt=""/>카지노</button>
            <button className={liveChatOpen?'active':''} onClick={()=>setLiveChatOpen(true)}><img className="gold-nav-icon" src="/gold-nav-support.png" alt=""/>고객센터</button>
          </nav>}

      {loginOpen&&<LoginModal onClose={()=>setLoginOpen(false)} onLogin={()=>{setLoggedIn(true);try{window.localStorage.setItem('moneyground_logged_in','true');}catch{}setLoginOpen(false);go('home');setToast('머니그라운드에 로그인했습니다.');}} onSignup={()=>{setLoginOpen(false);setSignupOpen(true)}}/>}
      {signupOpen&&<SignupModal onClose={()=>setSignupOpen(false)} onToast={setToast} onComplete={()=>{setSignupOpen(false);setLoggedIn(true);try{window.localStorage.setItem('moneyground_logged_in','true');}catch{}go('home');setToast('회원가입이 완료되었습니다. 로그인되었습니다.');}}/>}
      {liveChatOpen&&<LiveChatModal onClose={()=>setLiveChatOpen(false)}/>}
      {manageOpen&&<Modal title="MY · 이용 관리" onClose={()=>setManageOpen(false)}><div className="manage"><div className="member-card"><span>MG</span><div><b>그라운더 님</b><small>MEMBER · 세션 {sessionMinutes}분</small></div><strong>{credit.toLocaleString()} 원</strong></div><h3>책임 있는 이용</h3><label>일일 베팅 한도 <b>{limit.toLocaleString()} 원</b><input type="range" min="500" max="12000" step="500" value={limit} onChange={e=>setLimit(Number(e.target.value))}/></label><div className="manage-grid"><button onClick={()=>setToast('30분 이용 알림을 설정했습니다.')}><span>◷</span><b>시간 알림</b><small>30분마다 안내</small></button><button onClick={()=>setToast('24시간 휴식 모드가 설정되었습니다.')}><span>☾</span><b>잠시 쉬기</b><small>24시간 차단</small></button><button onClick={()=>setToast('즐겨찾기 목록을 확인했습니다.')}><span>★</span><b>즐겨찾기</b><small>{favorites.length}개 게임</small></button><button onClick={()=>setToast('활동 내역을 확인했습니다.')}><span>▤</span><b>활동 내역</b><small>최근 30일</small></button></div><button className="logout" onClick={()=>{setLoggedIn(false);try{window.localStorage.removeItem('moneyground_logged_in');}catch{}setManageOpen(false);navigate('landing');setToast('로그아웃했습니다.');}}>로그아웃</button></div></Modal>}
      {menuScreen&&<MenuCenter initial={menuScreen} onClose={()=>setMenuScreen(null)} onToast={setToast} credit={credit}/>} 
      {goldAchievementOpen&&<GoldAchievement balance={goldBalance} onClose={()=>setGoldAchievementOpen(false)} onRefill={refillGold}/>}
      {goldRankingOpen&&<GoldRanking credit={goldBalance} totalBetting={goldPlayer?.totalBetting??0} onClose={()=>setGoldRankingOpen(false)}/>}
      {goldRewardClaimOpen&&<GoldRewardClaim count={goldPlayer?.pendingRewards??0} onClose={()=>setGoldRewardClaimOpen(false)} onClaim={async()=>{await claimGoldRewards();setGoldRewardClaimOpen(false)}}/>}
      {memberChestVideoOpen&&<ChestVideoModal onDone={()=>{setMemberChestVideoOpen(false);setMemberRewardClaimOpen(true);}}/>}
      {memberRewardClaimOpen&&<MemberRewardClaim count={memberPlayer.pendingRewards>0?memberPlayer.pendingRewards:1} onClose={()=>setMemberRewardClaimOpen(false)} onClaim={claimMemberRewards}/>}
      {goldRewardLockedMessage&&<GoldRewardLocked message={goldRewardLockedMessage} onClose={()=>setGoldRewardLockedMessage(null)}/>}
      {goldRewardsOpen&&<GoldRewardWallet vouchers={goldPlayer?.rewardVouchers??0} history={goldPlayer?.rewardHistory??[]} onClose={()=>setGoldRewardsOpen(false)} onUse={useGoldVoucher}/>}
      {goldCoinFlight&&<img className="gold-flight-coin" src="/gold-bet-coin.png" alt="" style={{'--start-x':`${goldCoinFlight.startX}px`,'--start-y':`${goldCoinFlight.startY}px`,'--end-x':`${goldCoinFlight.endX}px`,'--end-y':`${goldCoinFlight.endY}px`} as CSSProperties}/>}
      {toast&&<div className="toast" role="status"><span>✓</span>{toast}<button onClick={()=>setToast('')}>×</button></div>}
    </main>
  );
}

function MoneygroundLanding({onLogin,onJoin,onCommunity,onSupport}:{onLogin:()=>void;onJoin:()=>void;onCommunity:()=>void;onSupport:()=>void}){
  const slides=[
    {image:'/landing-reward-slide-user.png',alt:'배팅 게이지 100% 달성 시 보상 지급 안내'},
    {image:'/landing-reward-slide-2.png',eyebrow:'REWARD GAUGE',title:'배팅할수록\n보상이 가까워집니다',detail:'게이지 100% 달성 시 즉시 보상 지급'},
    {image:'/landing-reward-slide-3.png',eyebrow:'LEVEL UP REWARD',title:'레벨업마다\n쌓이는 특별 보상',detail:'쿠폰 · 골드 · 다양한 혜택을 한 번에'}
  ];
  const [slide,setSlide]=useState(0);
  useEffect(()=>{const timer=window.setInterval(()=>setSlide(current=>(current+1)%slides.length),4000);return()=>window.clearInterval(timer)},[]);
  return <section className="landing-reference" aria-label="머니그라운드 시작 페이지"><img src="/landing-page-reference.png" alt="머니그라운드 보상 게이지와 업적 리워드 안내"/><section className="landing-reward-hero" aria-label="보상 안내 이미지 슬라이드">{slides.map((item,index)=><article key={item.image} className={`landing-reward-slide ${slide===index?'active':''}`} aria-hidden={slide!==index}><img src={item.image} alt={item.alt??''}/>{item.title&&<div className="landing-reward-slide-copy"><span>{item.eyebrow}</span><b>{item.title.split('\n').map((line,i)=><>{i>0&&<br/>}{line}</>)}</b><small>{item.detail}</small></div>}</article>)}</section><img className="landing-achievement-rewards-image" src="/landing-achievement-rewards.png" alt="머니그라운드 업적 리워드: 슬롯스핀, 첫 입금, 첫 배팅, 스포츠 적중 등 8개 뱃지"/><button className="landing-auth-action login" onClick={onLogin}>로그인</button><button className="landing-auth-action join" onClick={onJoin}>회원가입</button><button className="landing-reward-claim-hotspot" onClick={onLogin} aria-label="보상 받기 로그인 또는 회원가입"/></section>;
}

function LandingIntro({onDone}:{onDone:(disableNextTime:boolean)=>void}){
  const [disableNextTime,setDisableNextTime]=useState(false);
  return <section className="landing-intro" aria-label="머니그라운드 인트로 영상" onClick={()=>onDone(disableNextTime)}><video src="/landing-intro.mp4" autoPlay muted playsInline preload="auto" onEnded={()=>onDone(disableNextTime)} onError={()=>onDone(disableNextTime)}/><label className="landing-intro-skip" onClick={event=>event.stopPropagation()}><input type="checkbox" checked={disableNextTime} onChange={event=>setDisableNextTime(event.target.checked)}/><span>다음 접속 시 영상 재생 안 함</span></label></section>;
}

function CommunityPage({onGold,onToast}:{onGold:()=>void;onToast:(message:string)=>void}){
  const openTelegram=(label:string)=>window.open('https://t.me/','_blank','noopener,noreferrer')||onToast(`${label} 링크를 열 수 없습니다.`);
  return <section className="community-page" aria-label="머니그라운드 커뮤니티"><div className="community-primary-banners"><button className="community-banner telegram-notice" onClick={()=>openTelegram('텔레그램 공지방')}><span>TELEGRAM · OFFICIAL</span><b>텔레그램 공지방 입장하기</b><small>머니그라운드 공식 소식을 가장 빠르게 확인하세요</small><i>↗</i></button><button className="community-banner telegram-chat" onClick={()=>openTelegram('텔레그램 소통방')}><span>TELEGRAM · COMMUNITY</span><b>텔레그램 소통방 입장하기</b><small>회원들과 실시간으로 소통해보세요</small><i>↗</i></button></div><div className="community-secondary-banners"><button className="community-banner solution-banner" onClick={()=>window.location.assign('/member')}><span>PARTNER SOLUTION</span><b>아이콘 솔루션</b><small>안정적인 게임 환경을 만나보세요</small><i>→</i></button><button className="community-banner free-gold-banner" onClick={onGold}><span>GOLD GAME · FREE PLAY</span><b>무료골드게임 이동하기</b><small>매일 무료 골드로 즐기는 게임</small><i>→</i></button></div></section>;
}

function EntryGate({onCasino,onSports}:{onCasino:()=>void;onSports:()=>void}){
  return <main className="entry-gate">
    <section className="entry-mobile" aria-label="머니그라운드 회원 메인">
      <div className="entry-mobile-hero">
        <div className="entry-mobile-copy">
          <BrandLogo/>
          <span>MONEYGROUND · CASINO &amp; SPORTS</span>
          <h1>프리미엄<br/><em>카지노 &amp; 스포츠</em></h1>
          <p>차원이 다른 즐거움, 지금 바로 경험하세요.</p>
        </div>
      </div>
      <div className="entry-mobile-choice-grid">
        <button className="entry-mobile-choice casino" onClick={onCasino}>
          <span>PREMIUM CASINO</span>
          <strong>카지노·슬롯<br/>회원 게임</strong>
          <small>라이브 카지노와 인기 슬롯을<br/>한곳에서 만나보세요.</small>
          <i>카지노 게임 보기</i>
        </button>
        <button className="entry-mobile-choice gold" onClick={onSports}>
          <span>GOLD GAME</span>
          <strong>무료골드<br/>무료등록 게임</strong>
          <small>입금없이 무료 스포츠와<br/>게임을 플레이 해보세요.</small>
          <i>게임 목록 보기</i>
        </button>
      </div>
      <div className="entry-mobile-banner-stack" aria-label="머니그라운드 프로모션">
        <button className="entry-mobile-banner wallet" onClick={onCasino}><b>텔레그램 지갑연동[암호화폐] 입출금</b><small>안정적인 입출금 서비스</small></button>
        <button className="entry-mobile-banner solution" onClick={onCasino}><b>아이콘솔루션</b><small>검증된 솔루션, 안정적인 서비스</small></button>
        <button className="entry-mobile-banner jackpot" onClick={onCasino}><b>메가 잭팟</b><small>인생을 바꿀 단 한 번의 기회</small></button>
        <button className="entry-mobile-banner sports" onClick={onSports}><b>스포츠 베팅</b><small>국내외 다양한 경기를 실시간으로</small></button>
      </div>
    </section>
    <section className="entry-desktop" aria-label="머니그라운드 회원 메인">
      <div className="entry-stage">
        <div className="entry-copy">
          <BrandLogo/>
          <p className="entry-label">MONEYGROUND · CASINO &amp; SPORTS</p>
          <h2>프리미엄 카지노 &amp; 스포츠</h2>
          <p className="entry-description">차원이 다른 즐거움, 지금 바로 경험하세요.</p>
        </div>
        <div className="entry-choice-grid">
          <button className="entry-choice casino" onClick={onCasino}>
            <span className="entry-choice-kicker">PREMIUM CASINO</span>
            <strong>카지노·슬롯 <em>회원 게임</em></strong>
            <small>라이브 카지노와 인기 슬롯을<br/>한곳에서 편하게 둘러보세요</small>
            <i><span>카지노 게임 보기</span> <b>→</b></i>
          </button>
          <button className="entry-choice gold" onClick={onSports}>
            <span className="entry-choice-kicker">GOLD GAME</span>
            <strong>무료골드 <em>무료등록 게임</em></strong>
            <small>입금없이 무료로 스포츠와<br/>게임을 플레이 해보세요</small>
            <i><span>게임 목록 보기</span> <b>→</b></i>
          </button>
        </div>
        <div className="entry-banner-grid" aria-label="머니그라운드 프로모션">
          <button className="entry-banner wallet-banner" onClick={onCasino}><span><strong>텔레그램 지갑연동[암호화폐] 입출금</strong></span></button>
          <button className="entry-banner solution-banner" onClick={onCasino}><span><strong>아이콘솔루션</strong></span></button>
          <button className="entry-banner jackpot-banner" onClick={onCasino}><span><strong>메가 잭팟</strong></span></button>
          <button className="entry-banner sports-banner" onClick={onSports}><span><strong>스포츠 베팅</strong></span></button>
        </div>
      </div>
    </section>
  </main>
}

function formatRemainingBetting(amount:number){
  const safe=Math.max(0,Math.floor(amount));
  if(safe>=100_000_000){
    const eok=Math.floor(safe/100_000_000);
    const man=Math.floor((safe%100_000_000)/10_000);
    return man>0?`${eok}억 ${man.toLocaleString()}만`:`${eok}억`;
  }
  if(safe>=10_000) return `${Math.floor(safe/10_000).toLocaleString()}만`;
  return `${safe.toLocaleString()} G`;
}

function GoldGlobalProgress({totalBetting,rewardTarget,level,pendingRewards,coinBurst,onRewards,onLockedRewards}:{totalBetting:number;rewardTarget:number;level:number;pendingRewards:number;coinBurst:number;onRewards:()=>void;onLockedRewards:(message:string)=>void}){
  const [displayBetting,setDisplayBetting]=useState(totalBetting);
  useEffect(()=>{
    const initial=displayBetting;
    const startedAt=performance.now();
    let frame=0;
    const animate=(now:number)=>{
      const completion=Math.min(1,(now-startedAt)/760);
      const eased=1-Math.pow(1-completion,3);
      setDisplayBetting(initial+(totalBetting-initial)*eased);
      if(completion<1) frame=requestAnimationFrame(animate);
    };
    frame=requestAnimationFrame(animate);
    return()=>cancelAnimationFrame(frame);
  },[totalBetting]);
  const remainingBetting=Math.max(0,rewardTarget-displayBetting);
  const remainingBettingLabel=formatRemainingBetting(remainingBetting);
  const progressPercent=Math.min(100,(displayBetting/rewardTarget)*100);
  const isRewardReady=pendingRewards>0;
  return <section className={`gold-global-progress ${isRewardReady?'reward-ready':''}`} aria-label="골드 레벨 보상 진행 상황">
    {coinBurst>0&&<span className="gold-coin-burst" key={coinBurst} aria-hidden="true">{[0,1,2].map(index=><img src="/gold-bet-coin.png" alt="" style={{'--coin-delay':`${index*90}ms`,'--coin-x':`${index===0?-16:index===1?9:28}px`} as CSSProperties} key={index}/>)}</span>}
    <div className="gold-global-copy"><small>나의 레벨</small><b>LV. {level}</b></div>
    <button className="gold-global-bar" onClick={isRewardReady?onRewards:undefined} disabled={!isRewardReady} aria-label={isRewardReady?'보상 열기':'이번 레벨 목표 달성까지 남은 베팅액'}>
      <span className="gold-global-track" style={{backgroundImage:"url('/gold-progress-industrial.png')",'--progress':`${progressPercent}%`} as CSSProperties}><i aria-hidden="true"/><b>{isRewardReady?`보상 ${pendingRewards}개 수령 가능`:`${remainingBettingLabel} 남음`}</b></span>
      <small>{isRewardReady?'상자를 눌러 누적 보상을 받으세요':`${progressPercent.toFixed(1)}% 적립 · 베팅 완료 때마다 즉시 반영`}</small>
    </button>
    <button className="gold-global-reward" onClick={isRewardReady?onRewards:()=>onLockedRewards(`${remainingBettingLabel} 배팅후 보상을 받으세요`)} aria-label={isRewardReady?'누적 보상 상자 열기':`${remainingBettingLabel} 배팅 후 보상 수령 가능`}><img className="gold-global-aura" src="/gold-reward-aura-unlocked.png" alt=""/><img className="gold-global-case" src="/gold-reward-case.png" alt=""/>{isRewardReady&&<b className="gold-reward-count">{pendingRewards>99?'99+':pendingRewards}</b>}</button>
  </section>;
}

function GoldMobileV2({balance,onCasino,onSports,onAchievement,onRanking,onCommunity,onRefill}:{balance:number;onCasino:()=>void;onSports:()=>void;onAchievement:()=>void;onRanking:()=>void;onCommunity:()=>void;onRefill:()=>void}){
  const tiles=[
    {kind:'casino',label:'카지노',sub:'룰렛 · 라이브 테이블',action:onCasino},
    {kind:'rank',label:'오늘의 랭킹',sub:'골드 TOP 10',action:onRanking},
    {kind:'honor',label:'명예의 전당',sub:'칭호 · 업적',action:onAchievement},
    {kind:'mini',label:'미니게임',sub:'가볍게 즐기는 게임',action:onCasino},
    {kind:'slots',label:'슬롯',sub:'잭팟 게임',action:onCasino},
    {kind:'sports',label:'스포츠',sub:'무료 스포츠 게임',action:onSports},
    {kind:'gift',label:'오늘의 보상',sub:'무료 골드 리필',action:onRefill},
    {kind:'lotto',label:'로또',sub:'매일 행운의 번호',action:onRanking},
    {kind:'friends',label:'나의친구',sub:'친구와 함께하는 혜택',action:onCommunity},
    {kind:'refill',label:'머니리필',sub:'매일 무료 골드 받기',action:onRefill},
  ];
  return <section className="gold-mobile-v2" aria-label="골드게임 모바일 홈">
    <section className="gold-v2-unified-card" aria-label="내 프로필 및 보유 골드">
      <button className="gold-v2-unified-profile" onClick={onAchievement}>
        <img className="gold-v2-badge-img" src="/badges/badge-1.png" alt="연승의 신 뱃지"/>
        <div className="gold-v2-profile-content">
          <img className="gold-v2-title-img" src="/gold-title-streak-god.png" alt="연승의 신 칭호"/>
          <div className="gold-v2-profile-user">
            <b>그라운더 님</b>
            <span className="gold-v2-diamond-badge"><i>💎</i>다이아몬드</span>
          </div>
        </div>
      </button>
      <div className="gold-v2-unified-divider" aria-hidden="true"/>
      <button className="gold-v2-unified-money" onClick={onRefill}>
        <span>보유 골드</span>
        <b>{balance.toLocaleString()} <i>G</i></b>
      </button>
    </section>
    <GoldIntroSlider/>
    <section className="gold-v2-grid" aria-label="골드게임 메뉴">{tiles.map(tile=><button className={`gold-v2-tile ${tile.kind}`} key={tile.label} onClick={tile.action}><div><b>{tile.label}</b><small>{tile.sub}</small></div></button>)}</section>
  </section>;
}

function GoldIntroSlider(){
  const slides=[
    {tag:'GOLD GAME · WELCOME BENEFIT',title:'골드게임 혜택',copy:'무료 골드 이용 후 카지노 회원가입 시 10+5 입금 플러스를 지급합니다.',image:'/gold-slide-welcome.png'},
    {tag:'MONEYGROUND · HONOR PLACE',title:'입금 없는 명예의 장소',copy:'골드게임은 입금 없이 매일 무료로 이용 가능한 머니그라운드 명예의 공간입니다.',image:'/gold-slide-honor.png'},
    {tag:'DAILY TOP RANK REWARD',title:'매일 랭킹 쿠폰 지급',copy:'매일 골드 랭킹 1·2·3등에게 본사이트 쿠폰을 지급합니다.',image:'/gold-slide-rank.png'},
  ];
  const [active,setActive]=useState(0);
  useEffect(()=>{const timer=window.setInterval(()=>setActive(i=>(i+1)%slides.length),5000);return()=>window.clearInterval(timer)},[slides.length]);
  const slide=slides[active];
  return <section className="gold-intro gold-intro-slider" style={{backgroundImage:`linear-gradient(90deg,rgba(10,11,8,.96) 0%,rgba(14,15,10,.88) 36%,rgba(11,12,9,.2) 72%,rgba(9,10,8,.54)),url('${slide.image}')`}}><div><span>{slide.tag}</span><h1>{slide.title}</h1><p>{slide.copy}</p><nav aria-label="골드게임 혜택 슬라이드">{slides.map((item,index)=><button className={active===index?'active':''} aria-label={`${item.title} 보기`} onClick={()=>setActive(index)} key={item.title}/>)}</nav></div></section>;
}

function GoldHomePanel({balance,totalBetting,onAchievement,onRefill}:{balance:number;totalBetting:number;onAchievement:()=>void;onRefill:()=>void}){
  return <aside className="gold-home-panel" aria-label="골드게임 내 정보 및 순위">
    <div className="gold-home-balance"><small>보유 골드</small><b>{balance.toLocaleString()} <em>G</em></b></div>
    <button className="gold-home-profile" onClick={onAchievement}><img src="/badges/badge-1.png" alt="연승의 신 뱃지"/><div><small>나의 칭호</small><b>연승의 신 <em>[그라운더] 님</em></b><span>칭호 · 뱃지 보기 ›</span></div></button>
    <div className="gold-home-total"><small>누적 총 배팅</small><b>{totalBetting.toLocaleString()} <em>G</em></b></div>
    <button className="gold-home-refill" onClick={onRefill}><i>▷</i><span><b>영상보고 무료골드 리필받기</b><small>시청 후 즉시 충전</small></span><em>받기 ›</em></button>
  </aside>;
}

function GoldHomeRankBoard({balance,totalBetting}:{balance:number;totalBetting:number}){
  const ranks=[['황금손','골드폭격기','9,850,000'],['제국경비대','새벽킹','8,420,000'],['불멸의 승부사','올인마스터','7,760,000'],['전설의 수집가','럭키세븐','6,930,000'],['황금 사냥꾼','골드헌터','5,880,000'],['연승의 신','테스트','4,720,000'],['행운의 기사','축복림','3,960,000'],['골드 마스터','반쨔손','3,210,000'],['대박의 주인','한방승부','2,740,000'],['빛나는 신예','새싹왕','2,180,000']];
  return <section className="gold-home-rank-board" aria-label="오늘의 골드 순위"><header><div><span>TODAY'S GOLD RANK</span><h2>오늘의 골드 순위</h2></div><small>보유 골드 기준 · 실시간 반영</small></header><div className="gold-rank-labels"><span>순위</span><span>뱃지</span><span>칭호 · 닉네임</span><span>보유 골드</span></div><ol>{ranks.map(([title,nickname,gold],index)=><li className={index<3?`top-${index+1}`:''} key={nickname}><strong>{index+1}</strong><img src={`/badges/badge-${index+1}.png`} alt={`${title} 뱃지`}/><div><small>{title}</small><b>[{nickname}] 님</b></div><em>{gold} <i>G</i></em></li>)}</ol><footer><span>내 순위</span><img src="/badges/badge-1.png" alt="연승의 신 뱃지"/><div><small>연승의 신</small><b>[그라운더] 님</b></div><em>342위 · {balance.toLocaleString()} <i>G</i></em><small>누적 총 배팅 {totalBetting.toLocaleString()} G</small></footer></section>;
}

function Slip({bets,setBets,stake,setStake,totalOdd,expected,credit,limit,onPlace,gold=false}:{bets:Bet[];setBets:(b:Bet[])=>void;stake:number;setStake:(n:number)=>void;totalOdd:number;expected:number;credit:number;limit:number;onPlace:()=>void;gold?:boolean}){
  const unit=gold?'G':'CR'; const balance=gold?843800:credit; const dailyLimit=gold?1000000:limit;
  return <div className={`slip ${gold?'gold-slip':''}`}><div className="slip-title"><div><span>{gold?'GOLD BET SLIP':'BET SLIP'}</span><h3>나의 픽 <b>{bets.length}</b></h3></div>{bets.length>0&&<button onClick={()=>setBets([])}>전체 삭제</button>}</div>{bets.length===0?<div className="empty-slip"><span>＋</span><b>경기를 선택해주세요</b><p>배당을 누르면 이곳에 추가됩니다.</p></div>:<div className="bet-items">{bets.map(b=><div key={b.matchId}><button onClick={()=>setBets(bets.filter(x=>x.matchId!==b.matchId))}>×</button><span>{b.title}</span><small>{b.pick}</small><b>{b.odd.toFixed(2)}</b></div>)}</div>}<label className="stake-label"><span>{gold?'베팅 골드':'베팅 머니'} <small>보유 {balance.toLocaleString()} {unit}</small></span><div><input type="number" min="0" value={stake} onChange={e=>setStake(Number(e.target.value))}/><b>{unit}</b></div></label><div className="stake-chips">{[100,500,1000].map(n=><button onClick={()=>setStake(n)} key={n}>+{n.toLocaleString()}</button>)}<button onClick={()=>setStake(0)}>초기화</button></div><div className="return-row"><span>총 배당 <b>{totalOdd.toFixed(2)}</b></span><span>예상 반환 <strong>{expected.toLocaleString()} {unit}</strong></span></div><p className="limit-note">일일 한도: {dailyLimit.toLocaleString()} {unit}</p><button className="place-btn" onClick={onPlace}>베팅하기</button></div>;
}

function LoginModal({onClose,onLogin,onSignup}:{onClose:()=>void;onLogin:()=>void;onSignup:()=>void}){
  return <Modal title="로그인" onClose={onClose}><form className="login-form landing-auth-form" onSubmit={event=>{event.preventDefault();onLogin()}}><label>아이디<input defaultValue="grounder" required autoComplete="username" placeholder="아이디를 입력하세요"/></label><label>비밀번호<input defaultValue="123456" required type="password" autoComplete="current-password" placeholder="비밀번호를 입력하세요"/></label><div className="form-row"><label><input type="checkbox" defaultChecked/> 아이디 저장</label><button type="button">비밀번호 찾기</button></div><button className="submit-btn">로그인</button><button className="signup-link" type="button" onClick={onSignup}>회원가입</button></form></Modal>;
}

function SignupModal({onClose,onToast,onComplete}:{onClose:()=>void;onToast:(message:string)=>void;onComplete:()=>void}){
  const [id,setId]=useState('');
  const [password,setPassword]=useState('');
  const [nickname,setNickname]=useState('');
  const [phone,setPhone]=useState('');
  const [phoneVerified,setPhoneVerified]=useState(false);
  const [withdrawPassword,setWithdrawPassword]=useState('');
  const [bank,setBank]=useState('');
  const [account,setAccount]=useState('');
  const [referrer,setReferrer]=useState('');
  const [couponCode,setCouponCode]=useState('');
  const reservedIds=['grounder','admin','moneyground'];
  const reservedNicknames=['그라운더','관리자','머니그라운드'];
  const idMessage=!id?'':!/^[a-z0-9]{4,16}$/.test(id)?'영문 소문자와 숫자 4~16자로 입력하세요.':reservedIds.includes(id.toLowerCase())?'이미 사용 중인 아이디입니다. 변경해주세요.':'사용 가능한 아이디입니다.';
  const nicknameMessage=!nickname?'':nickname.length<2||nickname.length>12?'닉네임은 2~12자로 입력하세요.':reservedNicknames.includes(nickname)?'이미 사용 중인 닉네임입니다. 변경해주세요.':'사용 가능한 닉네임입니다.';
  const idAvailable=idMessage==='사용 가능한 아이디입니다.';
  const nicknameAvailable=nicknameMessage==='사용 가능한 닉네임입니다.';
  const verifyPhone=()=>{if(!/^010\d{7,8}$/.test(phone.replace(/-/g,''))){onToast('휴대폰 번호를 정확히 입력해주세요.');return;}setPhoneVerified(true);onToast('휴대폰 번호 인증이 완료되었습니다.');};
  const submit=(event:React.FormEvent)=>{event.preventDefault();if(!id||!password||!nickname||!phone||!withdrawPassword||!bank||!account||!phoneVerified||!idAvailable||!nicknameAvailable){onToast('필수 항목을 모두 입력하고 중복 확인 및 휴대폰 인증을 완료해주세요.');return;}onComplete();};
  return (
    <Modal title="회원가입" onClose={onClose}>
      <form className="signup-form" onSubmit={submit}>
        <p className="signup-required">
          <b>필수</b> 표시는 반드시 입력해야 합니다. 추천인과 가입쿠폰코드는 선택입니다.
        </p>

        <div className="signup-field">
          <label className="signup-label">아이디</label>
          <div className="signup-input-wrap">
            <input
              value={id}
              onChange={event=>setId(event.target.value)}
              placeholder="영문 소문자·숫자 4~16자"
              autoComplete="username"
            />
            <span className="signup-input-badge required">필수</span>
          </div>
          {idMessage && (
            <small className={idAvailable?'available':'unavailable'}>{idMessage}</small>
          )}
        </div>

        <div className="signup-field">
          <label className="signup-label">비밀번호</label>
          <div className="signup-input-wrap">
            <input
              type="password"
              value={password}
              onChange={event=>setPassword(event.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoComplete="new-password"
            />
            <span className="signup-input-badge required">필수</span>
          </div>
        </div>

        <div className="signup-field">
          <label className="signup-label">닉네임</label>
          <div className="signup-input-wrap">
            <input
              value={nickname}
              onChange={event=>setNickname(event.target.value)}
              placeholder="2~12자"
            />
            <span className="signup-input-badge required">필수</span>
          </div>
          {nicknameMessage && (
            <small className={nicknameAvailable?'available':'unavailable'}>{nicknameMessage}</small>
          )}
        </div>

        <div className="signup-field">
          <label className="signup-label">휴대폰 번호</label>
          <div className="signup-inline">
            <div className="signup-input-wrap">
              <input
                value={phone}
                onChange={event=>{setPhone(event.target.value);setPhoneVerified(false)}}
                inputMode="tel"
                placeholder="01012345678"
              />
              <span className="signup-input-badge required">필수</span>
            </div>
            <button type="button" onClick={verifyPhone}>
              {phoneVerified?'인증완료':'인증하기'}
            </button>
          </div>
          <small className={phoneVerified?'available':'unavailable'}>
            {phoneVerified?'휴대폰 번호 인증이 완료되었습니다.':'휴대폰 번호 인증이 필요합니다.'}
          </small>
        </div>

        <div className="signup-field">
          <label className="signup-label">환전 비밀번호</label>
          <div className="signup-input-wrap">
            <input
              type="password"
              value={withdrawPassword}
              onChange={event=>setWithdrawPassword(event.target.value.replace(/\D/g,'').slice(0,4))}
              inputMode="numeric"
              maxLength={4}
              placeholder="숫자 4자리"
            />
            <span className="signup-input-badge required">필수</span>
          </div>
          <small>숫자 4자리만 입력할 수 있습니다.</small>
        </div>

        <div className="signup-account">
          <div className="signup-field">
            <label className="signup-label">환전 은행</label>
            <div className="signup-input-wrap">
              <select value={bank} onChange={event=>setBank(event.target.value)}>
                <option value="">은행 선택</option>
                <option>국민은행</option>
                <option>신한은행</option>
                <option>우리은행</option>
                <option>하나은행</option>
                <option>농협은행</option>
                <option>카카오뱅크</option>
              </select>
              <span className="signup-input-badge required">필수</span>
            </div>
          </div>
          <div className="signup-field">
            <label className="signup-label">환전 계좌번호</label>
            <div className="signup-input-wrap">
              <input
                value={account}
                onChange={event=>setAccount(event.target.value.replace(/[^0-9-]/g,''))}
                inputMode="numeric"
                placeholder="숫자만 입력"
              />
              <span className="signup-input-badge required">필수</span>
            </div>
          </div>
        </div>

        <div className="signup-field">
          <label className="signup-label">추천인</label>
          <div className="signup-input-wrap">
            <input
              value={referrer}
              onChange={event=>setReferrer(event.target.value)}
              placeholder="추천인 아이디 또는 코드"
            />
            <span className="signup-input-badge optional">선택</span>
          </div>
        </div>

        <div className="signup-field">
          <label className="signup-label">가입쿠폰코드</label>
          <div className="signup-input-wrap">
            <input
              value={couponCode}
              onChange={event=>setCouponCode(event.target.value)}
              placeholder="가입 쿠폰 코드"
            />
            <span className="signup-input-badge optional">선택</span>
          </div>
        </div>

        <button className="signup-submit">가입하기</button>
      </form>
    </Modal>
  );
}

function LiveChatModal({onClose}:{onClose:()=>void}){
  const [messages,setMessages]=useState([{sender:'support',text:'안녕하세요. 머니그라운드 고객센터입니다. 무엇을 도와드릴까요?'}]);
  const [draft,setDraft]=useState('');
  const send=(event:React.FormEvent)=>{event.preventDefault();const text=draft.trim();if(!text)return;setMessages(current=>[...current,{sender:'user',text},{sender:'support',text:'문의 내용을 확인했습니다. 상담원이 순차적으로 답변드리겠습니다.'}]);setDraft('');};
  return <Modal title="라이브채팅 고객센터" onClose={onClose}><section className="live-chat"><header><span><i/> 상담 가능</span><small>로그인 없이 문의할 수 있습니다</small></header><div className="live-chat-log">{messages.map((message,index)=><p className={message.sender} key={`${message.sender}-${index}`}><b>{message.sender==='support'?'고객센터':'나'}</b>{message.text}</p>)}</div><form onSubmit={send}><input value={draft} onChange={event=>setDraft(event.target.value)} placeholder="문의 내용을 입력하세요"/><button>전송</button></form><small className="live-chat-note">계좌번호, 비밀번호 등 민감한 정보는 입력하지 마세요.</small></section></Modal>;
}

function Modal({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
  useEffect(()=>{const f=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',f);return()=>window.removeEventListener('keydown',f)},[onClose]);
  return <div className="modal-backdrop" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><div className="mini-brand"><BrandLogo compact/></div><button aria-label="닫기" onClick={onClose}>×</button></div><div className="modal-body"><span className="kicker">MONEYGROUND</span><h2>{title}</h2>{children}</div></section></div>;
}

function GoldAchievement({balance,onClose,onRefill}:{balance:number;onClose:()=>void;onRefill:()=>void}){
  const titles=[['브론즈','보유 골드 1,000 G 달성'],['실버','스포츠 게임 10회 참여'],['골드','보유 골드 50,000 G 달성'],['다이아몬드','연속 10회 승리'],['레전드','보유 골드 1,000,000 G 달성']];
  const badges=[['연승의 신','10연승 달성'],['스포츠 고수','스포츠 50회 참여'],['스포츠 왕','6폴더 적중'],['로또 1황','골드 미션 7회 완료'],['로또 황제','골드 이벤트 8회 완료']];
  return <div className="gold-achievement-backdrop" onMouseDown={onClose}>
    <section className="gold-achievement" role="dialog" aria-modal="true" aria-label="골드게임 칭호 업적" onMouseDown={e=>e.stopPropagation()}>
      <header><div><span>GOLD GAME · MY PROFILE</span><h2>칭호 업적</h2></div><button aria-label="닫기" onClick={onClose}>×</button></header>
      <article className="gold-title-card">
        <img src="/badges/badge-1.png" alt="연승의 신 뱃지"/>
        <div><small>나의 칭호</small><b>연승의 신 <em>[그라운더] 님</em></b><span>개인정보 수정 ›</span></div>
      </article>
      <article className="gold-refill-card">
        <span>▷</span><div><b>영상보고 무료골드 리필받기</b><small>영상 시청 후 무료골드를 즉시 충전</small></div><button onClick={onRefill}>받기 ›</button>
      </article>
      <section className="gold-title-guide"><div><span>TITLE GUIDE</span><b>칭호 획득 조건</b></div><ol>{titles.map(([name,condition],index)=><li className={index===3?'current':''} key={name}><i>{index+1}</i><b>{name}</b><small>{condition}</small>{index===3&&<em>현재</em>}</li>)}</ol></section>
      <section className="gold-badge-guide"><div><span>BADGE COLLECTION</span><b>뱃지와 획득 방법</b></div><div>{badges.map(([name,condition],index)=><article key={name}><img src={`/badges/badge-${index+1}.png`} alt={`${name} 뱃지`}/><b>{name}</b><small>{condition}</small><em>{index===0?'획득':'도전 중'}</em></article>)}</div></section>
      <footer><span>현재 보유 골드</span><b>{balance.toLocaleString()} <small>G</small></b></footer>
    </section>
  </div>;
}

function GoldRanking({credit,totalBetting,onClose}:{credit:number;totalBetting:number;onClose:()=>void}){
  const rankings=[
    ['황금손','골드폭격기','9,850,000'],['제국경비대','새벽킹','8,420,000'],['불멸의 승부사','올인마스터','7,760,000'],['전설의 수집가','럭키세븐','6,930,000'],['황금 사냥꾼','골드헌터','5,880,000'],['연승의 신','테스트','4,720,000'],['행운의 기사','축복림','3,960,000'],['골드 마스터','반쨔손','3,210,000'],['대박의 주인','한방승부','2,740,000'],['빛나는 신예','새싹왕','2,180,000'],
  ];
  return <div className="ranking-backdrop" onMouseDown={onClose}><section className="gold-ranking" role="dialog" aria-modal="true" aria-label="골드 랭킹" onMouseDown={e=>e.stopPropagation()}><button className="ranking-close" aria-label="닫기" onClick={onClose}>×</button><header><span>♛</span><div><b>골드 랭킹</b><small>보유 골드 순 회원 랭킹</small></div><em>실시간 TOP 10</em></header><div className="ranking-list">{rankings.map(([title,nickname,gold],index)=><article className={`rank-row rank-${index+1}`} key={nickname}><strong>{index+1}</strong><img src={`/badges/badge-${index+1}.png`} alt=""/><div><span>{title}</span><b>[{nickname}] 님</b></div><em>{gold} <small>G</small></em></article>)}</div><footer><span>나의 보유 골드</span><b>{credit.toLocaleString()} <small>G</small></b><p>누적 총 배팅 {totalBetting.toLocaleString()} G · 랭킹은 보유 골드를 기준으로 반영됩니다.</p></footer></section></div>
}

function GoldEvents({onToast}:{onToast:(s:string)=>void}){
  const events=[
    ['DAILY GOLD','데일리 골드 출석','매일 접속하고 골드 보너스를 받아보세요.','1,500 G','✦'],
    ['WEEKEND MATCH','주말 스포츠 챌린지','주말 스포츠 경기에 참여하면 추가 골드가 지급됩니다.','3,000 G','⚽'],
    ['FLASH MISSION','플래시게임 미션','바카라 3회 참여 후 오늘의 미션을 완료하세요.','5,000 G','♠'],
  ];
  return <section className="gold-events"><header><span>GOLD GAME · EVENTS</span><h1>골드 이벤트</h1><p>골드게임 안에서 즐기는 무료 참여 혜택입니다.</p></header><div className="gold-event-grid">{events.map(([tag,title,copy,reward,icon],index)=><article className={`gold-event-card event-${index+1}`} key={title}><span>{tag}</span><i>{icon}</i><h2>{title}</h2><p>{copy}</p><footer><b>{reward}</b><button onClick={()=>onToast(`${title} 참여 안내를 확인했습니다.`)}>자세히 보기</button></footer></article>)}</div></section>
}

function GoldRewardClaim({count,onClose,onClaim}:{count:number;onClose:()=>void;onClaim:()=>Promise<void>}){
  return <div className="gold-reward-backdrop" onMouseDown={onClose}><section className="gold-reward-modal" onMouseDown={event=>event.stopPropagation()} role="dialog" aria-modal="true" aria-label="누적 보상 상자"><button className="gold-reward-close" onClick={onClose}>×</button><span>REWARD CHEST</span><h2>누적 보상 {count}개</h2><div className="gold-voucher-card"><img src="/gold-reward-case.png" alt="보상 상자"/><div><small>지급 보상</small><b>10만 골드 교환권</b><em>× {count}</em></div></div><p>수령한 교환권은 하단 <b>보상</b> 메뉴에서 사용할 수 있습니다.</p><button className="gold-reward-claim" onClick={onClaim}>보상 모두 수령하기</button></section></div>;
}

function GoldRewardLocked({message,onClose}:{message:string;onClose:()=>void}){
  return <div className="gold-reward-backdrop" onMouseDown={onClose}><section className="gold-reward-modal gold-reward-locked" onMouseDown={event=>event.stopPropagation()} role="dialog" aria-modal="true" aria-label="보상 획득 조건 안내"><button className="gold-reward-close" onClick={onClose}>×</button><span>REWARD CHEST</span><img src="/gold-reward-case.png" alt="잠긴 보상 상자"/><h2>{message}</h2><button className="gold-reward-claim" onClick={onClose}>확인</button></section></div>;
}

function GoldRewardWallet({vouchers,history,onClose,onUse}:{vouchers:number;history:{voucherCount:number;createdAt:string}[];onClose:()=>void;onUse:()=>Promise<void>}){
  return <div className="gold-reward-backdrop" onMouseDown={onClose}><section className="gold-reward-modal" onMouseDown={event=>event.stopPropagation()} role="dialog" aria-modal="true" aria-label="받은 보상"><button className="gold-reward-close" onClick={onClose}>×</button><span>MY REWARDS</span><h2>받은 보상 내역</h2><div className="gold-voucher-card"><img src="/gold-reward-case.png" alt="10만 골드 교환권"/><div><small>보유 교환권</small><b>10만 골드 교환권</b><em>× {vouchers}</em></div></div><div className="gold-reward-history">{history.length?history.map(item=><p key={`${item.createdAt}-${item.voucherCount}`}>10만 골드 교환권 <b>× {item.voucherCount}</b><small>{item.createdAt.slice(0,10)}</small></p>):<p>수령한 보상이 없습니다.</p>}</div><p>{vouchers>0?'교환권 1장 사용 시 보유 골드가 100,000 G 증가합니다.':'사용할 교환권이 없습니다.'}</p><button className="gold-reward-claim" disabled={!vouchers} onClick={onUse}>교환권 사용하기</button></section></div>;
}

function GoldFlash({onBack,onToast,balance,onBetStart,onResolveBet}:{onBack:()=>void;onToast:(s:string)=>void;balance:number;onBetStart:(origin:{x:number;y:number})=>void;onResolveBet:(amount:number,pick:'홀'|'짝')=>Promise<{resultNumber:number;resultPick:'홀'|'짝';won:boolean;leveledUp:boolean}>}){
  const [pick,setPick]=useState<'홀'|'짝'|null>(null);
  const [amount,setAmount]=useState(0);
  const [rolling,setRolling]=useState(false);
  const [result,setResult]=useState<number|null>(null);
  const chips=[5000,10000,50000,100000,200000,500000];
  const play=()=>{
    if(!pick||!amount){onToast('홀 또는 짝을 선택하고 금액을 입력해주세요.');return;}
    if(amount>balance){onToast('보유 골드보다 큰 금액은 베팅할 수 없습니다.');return;}
    const button=document.querySelector('.gold-play')?.getBoundingClientRect();if(button)onBetStart({x:button.left+button.width/2,y:button.top+button.height/2});setRolling(true);setResult(null);
    window.setTimeout(async()=>{
      try{
        const outcome=await onResolveBet(amount,pick);
        setResult(outcome.resultNumber);setRolling(false);
        onToast(outcome.won?`${outcome.resultNumber} · ${outcome.resultPick} 당첨! ${amount.toLocaleString()} G를 획득했습니다.${outcome.leveledUp?' 레벨 업!':''}`:`${outcome.resultNumber} · ${outcome.resultPick} 결과 · 다음 라운드에 도전하세요.${outcome.leveledUp?' 레벨 업!':''}`);
      }catch(error){setRolling(false);onToast(error instanceof Error?error.message:'베팅 처리에 실패했습니다.');}
    },720);
  };
  return <section className="gold-flash"><header className="flash-head"><button onClick={onBack}>← 골드게임 홈</button><div><span>GOLD GAME · TEST MINI GAME</span><h1>골드 홀짝</h1></div><small>테스트용 · 베팅액만큼 게이지 적립</small></header><div className="flash-table"><div className="flash-live"><div className="live-visual mini-live"><span>ODD · EVEN</span><b>{rolling?'ROLLING…':result===null?'홀 · 짝':`${result} · ${result%2?'홀':'짝'}`}</b><i>{rolling?'결과를 확인하는 중입니다':'매 라운드 베팅액이 총배팅 게이지에 즉시 반영됩니다'}</i></div><div className="roadmap">{Array.from({length:42},(_,i)=><i className={i%2?'banker':'player'} key={i}>{i%2?'짝':'홀'}</i>)}</div></div><aside className="flash-stats"><b>TEST RULES</b><div className="result-tabs"><span>선택</span><span>결과</span><span>정산</span></div><div className="result-row"><small>홀</small><b>1 · 3 · 5 · 7 · 9</b><em>2.00</em></div><div className="result-row"><small>짝</small><b>2 · 4 · 6 · 8 · 10</b><em>2.00</em></div><div className="round-clock"><span>보상 목표</span><b>100만 G</b><strong>LIVE</strong></div><div className="flash-summary"><span>BET <b>즉시</b></span><span>GAUGE <b>반영</b></span><span>REWARD <b>100%</b></span></div></aside></div><section className="flash-bet"><div className="bet-countdown"><span>홀짝 테스트 라운드</span><b>{rolling?'결과 계산 중':'지금 베팅 가능'}</b></div><div className="bet-picks">{(['홀','짝'] as const).map((name,index)=><button className={`${name} ${pick===name?'selected':''}`} onClick={()=>setPick(name)} disabled={rolling} key={name}><span>{name}</span><b>2.00</b><small>{index===0?'ODD':'EVEN'}</small></button>)}</div><div className="gold-stake"><div className="gold-balance"><small>보유 골드</small><b>{balance.toLocaleString()} <em>G</em></b></div><label><span>베팅 금액</span><input value={amount||''} inputMode="numeric" disabled={rolling} onChange={e=>setAmount(Number(e.target.value.replace(/\D/g,''))||0)} placeholder="금액을 입력하세요"/></label><div className="expected"><small>당첨 시 획득</small><b>{pick&&amount?(amount*2).toLocaleString():'0'} <em>G</em></b></div><div className="gold-chip-row">{chips.map(chip=><button disabled={rolling} onClick={()=>setAmount(a=>Math.min(balance,a+chip))} key={chip}>+{chip.toLocaleString()}</button>)}<button disabled={rolling} onClick={()=>setAmount(0)}>초기화</button></div><button className="gold-play" disabled={rolling} onClick={play}>{rolling?'결과 확인 중':'베팅하고 게이지 올리기'}</button></div></section></section>;
}

function MemberFlash({onBack,onToast,balance,onBet}:{onBack:()=>void;onToast:(s:string)=>void;balance:number;onBet:(amount:number,pick:'홀'|'짝')=>Promise<{resultNumber:number;resultPick:'홀'|'짝';won:boolean;leveledUp:boolean}>}){
  const [pick,setPick]=useState<'홀'|'짝'|null>(null);
  const [amount,setAmount]=useState(0);
  const [rolling,setRolling]=useState(false);
  const [result,setResult]=useState<number|null>(null);
  const [history,setHistory]=useState<('홀'|'짝')[]>(['홀','짝','홀','홀','짝','짝','홀','짝']);
  const chips=[10000,50000,100000,200000,500000,1000000];

  const play=()=>{
    if(!pick||!amount){onToast('홀 또는 짝을 선택하고 베팅 금액을 입력해주세요.');return;}
    if(amount>balance){onToast('보유 머니가 부족합니다. 충전 후 이용해주세요.');return;}
    setRolling(true);
    setResult(null);
    window.setTimeout(async()=>{
      try{
        const outcome=await onBet(amount,pick);
        setResult(outcome.resultNumber);
        setHistory(prev=>[outcome.resultPick,...prev.slice(0,41)]);
        setRolling(false);
        if(outcome.won){
          const winAmount=amount*2;
          onToast(`🎉 ${outcome.resultNumber} · ${outcome.resultPick} 당첨! ${winAmount.toLocaleString()}원 획득! (VIP 게이지 +${amount.toLocaleString()}원 적립${outcome.leveledUp?' · 레벨 업!':''})`);
        }else{
          onToast(`${outcome.resultNumber} · ${outcome.resultPick} 결과 · 낙첨되었습니다. (VIP 게이지 +${amount.toLocaleString()}원 적립${outcome.leveledUp?' · 레벨 업!':''})`);
        }
      }catch(error){
        setRolling(false);
        onToast(error instanceof Error?error.message:'베팅 처리에 실패했습니다.');
      }
    },720);
  };

  return (
    <section className="gold-flash member-flash" aria-label="머니 홀짝 미니게임">
      <header className="flash-head">
        <button onClick={onBack}>← 회원 홈으로</button>
        <div>
          <span>VIP MEMBER · MONEY MINI GAME</span>
          <h1>머니 홀짝</h1>
        </div>
        <small>머니 전용 베팅 · 베팅액만큼 VIP 게이지 즉시 적립</small>
      </header>
      <div className="flash-table">
        <div className="flash-live">
          <div className="live-visual mini-live">
            <span>ODD · EVEN</span>
            <b>{rolling?'ROLLING…':result===null?'홀 · 짝':`${result} · ${result%2?'홀':'짝'}`}</b>
            <i>{rolling?'결과를 확인하는 중입니다':'머니 베팅 시 VIP 누적 게이지가 실시간으로 적립됩니다'}</i>
          </div>
          <div className="roadmap">
            {history.map((h,i)=><i className={h==='짝'?'banker':'player'} key={i}>{h}</i>)}
          </div>
        </div>
        <aside className="flash-stats">
          <b>VIP RULES</b>
          <div className="result-tabs">
            <span>선택</span>
            <span>결과</span>
            <span>배당</span>
          </div>
          <div className="result-row">
            <small>홀</small>
            <b>1 · 3 · 5 · 7 · 9</b>
            <em>2.00</em>
          </div>
          <div className="result-row">
            <small>짝</small>
            <b>2 · 4 · 6 · 8 · 10</b>
            <em>2.00</em>
          </div>
          <div className="round-clock">
            <span>VIP 보상 목표</span>
            <b>100만 원</b>
            <strong>LIVE</strong>
          </div>
          <div className="flash-summary">
            <span>BET <b>머니</b></span>
            <span>GAUGE <b>실시간</b></span>
            <span>REWARD <b>10만원</b></span>
          </div>
        </aside>
      </div>
      <section className="flash-bet">
        <div className="bet-countdown">
          <span>머니 홀짝 베팅 라운드</span>
          <b>{rolling?'결과 추첨 중…':'베팅 가능 (머니 전용)'}</b>
        </div>
        <div className="bet-picks">
          {(['홀','짝'] as const).map((name,index)=>(
            <button className={`${name} ${pick===name?'selected':''}`} onClick={()=>setPick(name)} disabled={rolling} key={name}>
              <span>{name}</span>
              <b>2.00</b>
              <small>{index===0?'ODD':'EVEN'}</small>
            </button>
          ))}
        </div>
        <div className="gold-stake">
          <div className="gold-balance">
            <small>보유 머니</small>
            <b>{balance.toLocaleString()} <em>원</em></b>
          </div>
          <label>
            <span>베팅 금액 (원)</span>
            <input value={amount||''} inputMode="numeric" disabled={rolling} onChange={e=>setAmount(Number(e.target.value.replace(/\D/g,''))||0)} placeholder="베팅할 머니 입력"/>
          </label>
          <div className="expected">
            <small>당첨 시 획득 머니</small>
            <b>{pick&&amount?(amount*2).toLocaleString():'0'} <em>원</em></b>
          </div>
          <div className="gold-chip-row">
            {chips.map(chip=><button disabled={rolling} onClick={()=>setAmount(a=>Math.min(balance,a+chip))} key={chip}>+{chip>=10000?`${(chip/10000).toLocaleString()}만`:chip.toLocaleString()}</button>)}
            <button disabled={rolling} onClick={()=>setAmount(balance)}>전액</button>
            <button disabled={rolling} onClick={()=>setAmount(0)}>초기화</button>
          </div>
          <button className="gold-play member-bet-btn" disabled={rolling} onClick={play}>
            {rolling?'추첨 진행 중…':'배팅하기'}
          </button>
        </div>
      </section>
    </section>
  );
}

function MemberGlobalProgress({
  totalBetting,
  rewardTarget,
  level,
  pendingRewards,
  onRewards,
  onLockedRewards
}:{
  totalBetting:number;
  rewardTarget:number;
  level:number;
  pendingRewards:number;
  onRewards:()=>void;
  onLockedRewards:(msg:string)=>void;
}){
  const [displayBetting,setDisplayBetting]=useState(totalBetting);
  useEffect(()=>{
    let frame:number;
    const start=displayBetting;
    const diff=totalBetting-start;
    if(diff===0)return;
    const startTime=performance.now();
    const duration=500;
    const animate=(currentTime:number)=>{
      const elapsed=currentTime-startTime;
      const progress=Math.min(elapsed/duration,1);
      const easeProgress=1-Math.pow(1-progress,3);
      setDisplayBetting(Math.round(start+diff*easeProgress));
      if(progress<1)frame=requestAnimationFrame(animate);
    };
    frame=requestAnimationFrame(animate);
    return()=>cancelAnimationFrame(frame);
  },[totalBetting]);

  const remainingBetting=Math.max(0,rewardTarget-displayBetting);
  const progressPercent=Math.min(100,(displayBetting/rewardTarget)*100);
  const isRewardReady=pendingRewards>0 || progressPercent>=100;
  const readyCount=pendingRewards>0?pendingRewards:1;

  return (
    <section className={`member-global-progress ${isRewardReady?'reward-ready':''}`} aria-label="VIP 머니 보상 진행 상황">
      <div className="member-cyber-badge">
        <span className="member-cyber-badge-kicker">VIP</span>
        <b className="member-cyber-badge-level">LV.{level}</b>
      </div>
      <button className="member-cyber-center" onClick={isRewardReady?onRewards:undefined} disabled={!isRewardReady} aria-label={isRewardReady?'보상 열기':'이번 레벨 머니 목표 달성까지 남은 베팅액'}>
        <div className="member-cyber-info-row">
          <b className="member-cyber-amount">{isRewardReady?`VIP 보상 ${readyCount}개 수령 가능`:`${remainingBetting.toLocaleString()} 원 남음`}</b>
          <small className="member-cyber-sub">{isRewardReady?'상자를 눌러 보상 받기':'베팅 시 자동 적립'}</small>
        </div>
        <div className="member-cyber-track">
          <div className="member-cyber-fill" style={{width:`${progressPercent}%`}}>
            <span className="member-cyber-flare"/>
          </div>
          <span className="member-cyber-track-label">{isRewardReady?'100% 달성':`${progressPercent.toFixed(0)}% 적립`}</span>
        </div>
      </button>
      <button className="member-cyber-chest" onClick={isRewardReady?onRewards:()=>onLockedRewards(`${remainingBetting.toLocaleString()} 원 추가 베팅 후 10만원 머니 보상을 받으세요`)} aria-label={isRewardReady?'누적 머니 보상 상자 열기':`${remainingBetting.toLocaleString()} 원 추가 베팅 시 수령 가능`}>
        {isRewardReady&&<span className="member-cyber-chest-halo"/>}
        <img className="member-cyber-chest-case" src="/cyber-reward-case.png" alt="보상 상자"/>
        {isRewardReady&&<b className="member-cyber-chest-badge">{readyCount>99?'99+':readyCount}</b>}
      </button>
    </section>
  );
}

function MemberMobileV2({balance,onCasino,onSports,onSlots,onMini,onVirtual,onEvents,onDeposit,onWithdraw,onSupport,onProfile,onMoney}:{balance:number;onCasino:()=>void;onSports:()=>void;onSlots:()=>void;onMini:()=>void;onVirtual:()=>void;onEvents:()=>void;onDeposit:()=>void;onWithdraw:()=>void;onSupport:()=>void;onProfile:()=>void;onMoney:()=>void}){
  const tiles=[
    {kind:'casino',label:'카지노',sub:'라이브 바카라·룰렛',action:onCasino},
    {kind:'sports',label:'스포츠',sub:'국내·해외 실시간',action:onSports},
    {kind:'slots',label:'슬롯',sub:'정품 잭팟 게임',action:onSlots},
    {kind:'mini',label:'미니게임',sub:'빠른 승부 라운지',action:onMini},
    {kind:'rank',label:'가상게임',sub:'축구·경마·농구',action:onVirtual},
    {kind:'gift',label:'이벤트',sub:'충전 & 첫입금 혜택',action:onEvents},
    {kind:'refill',label:'입금신청',sub:'안전 가상계좌',action:onDeposit},
    {kind:'honor',label:'출금신청',sub:'3분 초고속 환전',action:onWithdraw},
    {kind:'friends',label:'고객센터',sub:'24시간 1:1 상담',action:onSupport},
  ];
  return (
    <section className="member-mobile-v2" aria-label="회원 모바일 홈">
      <section className="member-v2-unified-card" aria-label="내 프로필 및 보유 머니">
        <button className="member-v2-unified-profile" onClick={onProfile}>
          <div className="member-v2-badge-wrap">
            <img className="member-v2-badge-img" src="/badges/badge-1.png" alt="회원 뱃지"/>
            <span className="member-v2-diamond-badge"><i>💎</i>VIP 3</span>
          </div>
          <div className="member-v2-profile-content">
            <img className="member-v2-title-img" src="/gold-title-streak-god.png" alt="연승의 신 칭호"/>
            <div className="member-v2-profile-user">
              <b>그라운더 님</b>
            </div>
          </div>
        </button>
        <div className="member-v2-unified-divider" aria-hidden="true"/>
        <button className="member-v2-unified-money" onClick={onMoney}>
          <span>보유 머니</span>
          <b>{balance.toLocaleString()} <i>원</i></b>
        </button>
      </section>
      <MemberIntroSlider/>
      <section className="member-v2-grid" aria-label="회원 전용 게임 메뉴">
        {tiles.map(tile=>(
          <button className={`member-v2-tile ${tile.kind}`} key={tile.label} onClick={tile.action}>
            <div>
              <b>{tile.label}</b>
              <small>{tile.sub}</small>
            </div>
          </button>
        ))}
      </section>
    </section>
  );
}

function MemberIntroSlider(){
  const slides=[
    {tag:'VIP CASHBACK · REWARD',title:'프리미엄 롤링 리워드',copy:'베팅할 때마다 머니 게이지가 즉시 적립되며 100% 달성 시 10만원 현금 보상이 지급됩니다.',image:'/gold-slide-welcome.png'},
    {tag:'EXCLUSIVE LOUNGE',title:'에볼루션 & 프라그마틱',copy:'공식 라이선스 인증 최고 배당률 라이브 카지노와 인기 슬롯 라운지를 즐기세요.',image:'/gold-slide-honor.png'},
    {tag:'FAST DEPOSIT & WITHDRAWAL',title:'안전하고 빠른 입출금',copy:'3분 내 신속한 입출금 처리와 24시간 전문 고객센터 1:1 상담 케어를 지원합니다.',image:'/gold-slide-rank.png'},
  ];
  const [active,setActive]=useState(0);
  useEffect(()=>{const timer=window.setInterval(()=>setActive(i=>(i+1)%slides.length),5000);return()=>window.clearInterval(timer)},[slides.length]);
  const slide=slides[active];
  return (
    <section className="member-intro-slider" style={{backgroundImage:`linear-gradient(90deg,rgba(5,18,17,.95) 0%,rgba(6,22,20,.85) 40%,rgba(5,18,17,.25) 75%,rgba(3,14,13,.6)),url('${slide.image}')`}}>
      <div>
        <span>{slide.tag}</span>
        <h1>{slide.title}</h1>
        <p>{slide.copy}</p>
        <nav aria-label="회원 혜택 슬라이드">
          {slides.map((item,index)=>(
            <button className={active===index?'active':''} aria-label={`${item.title} 보기`} onClick={()=>setActive(index)} key={item.title}/>
          ))}
        </nav>
      </div>
    </section>
  );
}

function ChestVideoModal({onDone}:{onDone:()=>void}){
  useEffect(()=>{
    // Fallback: auto-close after 4.5s in case onEnded doesn't fire
    const timer = window.setTimeout(onDone, 4500);
    return ()=>window.clearTimeout(timer);
  },[onDone]);

  return (
    <div className="chest-video-backdrop" onClick={onDone} role="dialog" aria-modal="true" aria-label="보상 상자 개봉 연출">
      <div className="chest-video-wrap" onClick={e=>e.stopPropagation()}>
        <button className="chest-video-skip" onClick={onDone} aria-label="영상 건너뛰기">
          건너뛰기 ✕
        </button>
        <div className="chest-video-frame">
          <video
            src="/reward-chest-open.mp4"
            autoPlay
            playsInline
            muted
            onEnded={onDone}
            className="chest-video-player"
          />
        </div>
        <div className="chest-video-guide">
          <span className="chest-video-guide-pulse">✨ 보상 상자가 열리는 중입니다... ✨</span>
        </div>
      </div>
    </div>
  );
}

function MemberRewardClaim({count,onClose,onClaim}:{count:number;onClose:()=>void;onClaim:()=>void}){
  const actualCount = Math.max(1, count);
  const totalAmount = actualCount * 100000;
  return (
    <div className="gold-reward-backdrop" onMouseDown={onClose}>
      <section className="gold-reward-modal member-reward-modal" onMouseDown={event=>event.stopPropagation()} role="dialog" aria-modal="true" aria-label="VIP 머니 보상 상자">
        <button className="gold-reward-close" onClick={onClose}>×</button>
        <span className="member-reward-unlocked-badge">✨ CHEST OPENED! REWARD UNLOCKED ✨</span>
        <h2>보상 상자 개봉 완료!</h2>
        <div className="member-reward-result-visual">
          <div className="member-reward-result-aura" />
          <img className="member-reward-chest-img" src="/cyber-reward-case.png" alt="개봉된 보상 상자"/>
          <div className="member-reward-item-pill">
            <span className="member-reward-item-icon">💰</span>
            <strong>{totalAmount.toLocaleString()} 원</strong>
          </div>
        </div>
        <div className="gold-voucher-card member-voucher-card">
          <div className="member-reward-detail">
            <small>🎁 보상 상자에서 나온 아이템</small>
            <b>{totalAmount.toLocaleString()} 원 현금 머니</b>
            <em>(10만 원 머니 충전권 × {actualCount}개 획득)</em>
          </div>
        </div>
        <p className="member-reward-msg">
          축하합니다! 보상 상자에서 총 <strong>{totalAmount.toLocaleString()} 원</strong>의 머니가 나왔습니다.<br/>
          수령 즉시 보유 머니 잔고에 자동 충전되어 바로 게임에 사용하실 수 있습니다.
        </p>
        <button className="gold-reward-claim member-reward-claim-btn" onClick={onClaim}>
          {totalAmount.toLocaleString()} 원 머니 즉시 수령하기
        </button>
      </section>
    </div>
  );
}
