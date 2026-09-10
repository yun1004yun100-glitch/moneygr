import type { BetFunding } from './bet-funding';

export type MemberBetCategory = 'sports' | 'mini';
export type MemberBetRecord = {
  id: string;
  createdAt: string;
  category: MemberBetCategory;
  game: string;
  funding: BetFunding;
  amount: number;
  odds: number;
  selections: { title: string; pick: string; odds: number }[];
  status: 'pending' | 'won' | 'lost';
  payout: number | null;
  result?: string;
};

export const MEMBER_BET_CATEGORIES = {
  sports: '스포츠', mini: '미니게임',
} as const;
export const MEMBER_BET_STATUSES = { pending: '결과 대기', won: '당첨', lost: '낙첨' } as const;

export function createSportsBetRecord(
  bets: { title: string; pick: string; odd: number }[], amount: number, funding: BetFunding,
): MemberBetRecord {
  return {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), category: 'sports',
    game: bets.length > 1 ? `스포츠 ${bets.length}폴더` : '스포츠 단폴더', funding, amount,
    odds: bets.reduce((total, bet) => total * bet.odd, 1),
    selections: bets.map(bet => ({ title: bet.title, pick: bet.pick, odds: bet.odd })),
    status: 'pending', payout: null,
  };
}

export function memberMiniGameTitle(gameId: string | null | undefined) {
  return gameId === 'baccarat-1' ? '바카라1' : gameId === 'baccarat-2' ? '바카라2'
    : gameId === 'lotus-baccarat' ? '로투스 바카라' : '로투스 홀짝';
}

export function createMiniBetRecord({ gameId, amount, funding, pick, result, won }: {
  gameId: string | null; amount: number; funding: BetFunding; pick: string; result: string; won: boolean;
}): MemberBetRecord {
  const odds = pick === '뱅커' ? 1.95 : pick === '타이' ? 8 : 2;
  const game = memberMiniGameTitle(gameId);
  return {
    id: crypto.randomUUID(), createdAt: new Date().toISOString(), category: 'mini', game,
    funding, amount, odds, selections: [{ title: game, pick, odds }],
    status: won ? 'won' : 'lost', payout: won ? Math.floor(amount * odds) : 0, result,
  };
}

export function filterMemberBets(records: readonly MemberBetRecord[], category: 'all' | MemberBetCategory, status: 'all' | MemberBetRecord['status']) {
  return records.filter(record => (category === 'all' || record.category === category) && (status === 'all' || record.status === status));
}
