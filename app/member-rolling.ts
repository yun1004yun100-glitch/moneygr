export type MemberRolling = { deposited:number; bonus:number; wagered:number };
const money=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0?n:0;
export function rollingProgress(value?:MemberRolling) {
  const deposited=money(value?.deposited),bonus=money(value?.bonus),wagered=money(value?.wagered);
  const target=deposited+bonus;
  return {deposited,bonus,wagered,target,percent:target>0?wagered/target*100:0,remaining:Math.max(0,target-wagered)};
}
export function recordRollingBet(value:MemberRolling|undefined,amount:number):MemberRolling|undefined {
  if(!value||rollingProgress(value).target<=0||!Number.isSafeInteger(amount)||amount<=0)return value;
  return {...value,wagered:rollingProgress(value).wagered+amount};
}
