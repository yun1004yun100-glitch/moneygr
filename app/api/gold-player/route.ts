import { NextResponse } from 'next/server';

interface GoldPlayer {
  id: string;
  nickname: string;
  money: number;
  gold: number;
  level: number;
  levelBetting: number;
  totalBetting: number;
  requiredBetting: number;
  progressPercent: number;
  pendingRewards: number;
  rewardVouchers: number;
  rewardHistory: Array<{ voucherCount: number; createdAt: string }>;
}

let memoryPlayer: GoldPlayer = {
  id: 'test-grounder',
  nickname: '그라운더 님',
  money: 12000,
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

const STARTING_LEVEL_BET = 1000000;
const MAX_LEVEL = 1000;

function getRequiredBetting(level: number) {
  return Math.round(STARTING_LEVEL_BET * (1.01 ** (level - 1)));
}

export async function GET() {
  memoryPlayer.requiredBetting = getRequiredBetting(memoryPlayer.level);
  memoryPlayer.progressPercent = Math.min(100, (memoryPlayer.levelBetting / memoryPlayer.requiredBetting) * 100);
  return NextResponse.json(memoryPlayer, {
    headers: {
      'Cache-Control': 'no-store, max-age=0'
    }
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (payload.action === 'refill') {
      memoryPlayer.gold += 1000000;
      return NextResponse.json(memoryPlayer);
    }

    if (payload.action === 'claimRewards') {
      const count = memoryPlayer.pendingRewards;
      if (!count) {
        return NextResponse.json({ error: '수령할 보상이 없습니다.' }, { status: 400 });
      }
      memoryPlayer.rewardVouchers += count;
      memoryPlayer.pendingRewards = 0;
      memoryPlayer.rewardHistory.unshift({
        voucherCount: count,
        createdAt: new Date().toISOString()
      });
      return NextResponse.json({
        player: memoryPlayer,
        claimedRewards: count
      });
    }

    if (payload.action === 'useVoucher') {
      if (memoryPlayer.rewardVouchers <= 0) {
        return NextResponse.json({ error: '사용할 교환권이 없습니다.' }, { status: 400 });
      }
      memoryPlayer.rewardVouchers -= 1;
      memoryPlayer.gold += 100000;
      return NextResponse.json({ player: memoryPlayer });
    }

    if (payload.action === 'bet') {
      const amount = Number(payload.amount);
      const pick = payload.pick as '홀' | '짝';

      if (!amount || amount <= 0 || (pick !== '홀' && pick !== '짝')) {
        return NextResponse.json({ error: '잘못된 베팅 요청입니다.' }, { status: 400 });
      }

      if (amount > memoryPlayer.gold) {
        return NextResponse.json({ error: '보유 골드가 부족합니다.' }, { status: 400 });
      }

      const resultNumber = Math.floor(Math.random() * 10) + 1;
      const resultPick: '홀' | '짝' = resultNumber % 2 === 1 ? '홀' : '짝';
      const won = pick === resultPick;
      const levelBefore = memoryPlayer.level;

      let currentLevel = memoryPlayer.level;
      let currentBetting = memoryPlayer.levelBetting + amount;

      while (currentLevel < MAX_LEVEL) {
        const required = getRequiredBetting(currentLevel);
        if (currentBetting < required) break;
        currentBetting -= required;
        currentLevel++;
      }

      const leveledUpCount = currentLevel - levelBefore;

      memoryPlayer.gold = won ? memoryPlayer.gold + amount : memoryPlayer.gold - amount;
      memoryPlayer.level = currentLevel;
      memoryPlayer.levelBetting = currentBetting;
      memoryPlayer.totalBetting += amount;
      memoryPlayer.pendingRewards += leveledUpCount;
      memoryPlayer.requiredBetting = getRequiredBetting(currentLevel);
      memoryPlayer.progressPercent = Math.min(100, (currentBetting / memoryPlayer.requiredBetting) * 100);

      return NextResponse.json({
        player: memoryPlayer,
        resultNumber,
        resultPick,
        won,
        leveledUp: currentLevel > levelBefore
      });
    }

    return NextResponse.json({ error: '알 수 없는 요청입니다.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: '요청 처리에 실패했습니다.' }, { status: 500 });
  }
}
