export const MEMBER_SPORTS_CATEGORIES = ['국내스포츠', '해외스포츠', '스페셜', '실시간'] as const;
export type MemberSportsCategory = typeof MEMBER_SPORTS_CATEGORIES[number];

const domesticLeagues = new Set(['K LEAGUE 1', 'KBL', 'KBO']);

export function filterMemberSportsMatches<T extends { league: string; live?: string; special?: boolean }>(matches: T[], category: MemberSportsCategory): T[] {
  return matches.filter(match => {
    if (category === '실시간') return Boolean(match.live);
    if (category === '스페셜') return match.special === true;
    return category === '국내스포츠' ? domesticLeagues.has(match.league) : !domesticLeagues.has(match.league);
  });
}
