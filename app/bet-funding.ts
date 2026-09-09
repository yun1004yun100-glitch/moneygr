export type BetFunding = 'money' | 'support';

export const BET_FUNDING = {
  money: { label: '보유머니', unit: '원' },
  support: { label: '지원금', unit: 'P' },
} as const;

export function betFundingError(amount: number, balance: number, minimum = 1, limit = Infinity): string | null {
  if (!Number.isSafeInteger(amount) || amount < minimum) return minimum + ' 이상으로 베팅 금액을 입력해주세요.';
  if (amount > balance) return '선택한 잔액이 부족합니다.';
  if (amount > limit) return '설정된 베팅 한도를 초과했습니다.';
  return null;
}
