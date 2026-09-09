// Existing demo inventory, shared by the coupon list and deposit preview.
// Replace with server-owned inventory before enabling real redemption.
export const depositCoupons = [
  { id:'plus-15', amount:15000, minimum:50000, req:'50,000원 이상 충전 시' },
  { id:'plus-30', amount:30000, minimum:100000, req:'100,000원 이상 충전 시' },
  { id:'plus-50', amount:50000, minimum:200000, req:'200,000원 이상 충전 시' },
];

export function depositPreview(amount:number, couponId:string, coupons=depositCoupons) {
  const valid=Number.isSafeInteger(amount)&&amount>0;
  const coupon=coupons.find(c=>c.id===couponId);
  const eligible=valid&&!!coupon&&amount>=coupon.minimum;
  const bonus=eligible?coupon.amount:0;
  return {valid,coupon,eligible,bonus,total:valid?amount+bonus:0};
}
