import { depositCoupons, depositPreview } from './deposit-coupons';
import './deposit-coupons.css';

export function DepositCouponPanel({amount,couponId,onChange}:{amount:number;couponId:string;onChange:(id:string)=>void}) {
  const preview=depositPreview(amount,couponId);
  const recommended=depositCoupons.filter(c=>preview.valid&&amount>=c.minimum).sort((a,b)=>b.amount-a.amount)[0];
  return <section className="deposit-coupon-panel" aria-label="입금 플러스 쿠폰 선택">
    <h3>보유 입금 플러스 쿠폰 <small>{depositCoupons.length}장 · 샘플</small></h3>
    <label className="deposit-coupon-option"><input type="radio" name="deposit-coupon" checked={!couponId} onChange={()=>onChange('')}/><span>쿠폰 사용 안 함</span></label>
    {depositCoupons.map(c=>{
      const eligible=preview.valid&&amount>=c.minimum;
      return <label key={c.id} className={`deposit-coupon-option ${eligible?'':'unavailable'}`}>
        <input type="radio" name="deposit-coupon" checked={couponId===c.id} disabled={!eligible} onChange={()=>onChange(c.id)}/>
        <span><b>+{c.amount.toLocaleString()}원 {recommended?.id===c.id&&<em>추천</em>}</b><small>{c.req}{!eligible&&` · ${Math.max(0,c.minimum-(preview.valid?amount:0)).toLocaleString()}원 추가 필요`}</small></span>
      </label>;
    })}
    <div className="deposit-credit-preview" aria-live="polite" aria-atomic="true">
      <div><span>입금 예정액</span><b>{(preview.valid?amount:0).toLocaleString()}원</b></div>
      <div><span>입금 플러스 쿠폰</span><b>+ {preview.bonus.toLocaleString()}원</b></div>
      <strong>{preview.total.toLocaleString()}원 충전 예정</strong>
      <p>{(preview.valid?amount:0).toLocaleString()}원 + {preview.bonus.toLocaleString()}원 = {preview.total.toLocaleString()}원</p>
    </div>
    <p className="deposit-coupon-note">입금 승인 시 적용될 예상 금액입니다. 충전 포인트는 합계에 포함되지 않으며, 쿠폰과의 중복 지급 여부는 확인이 필요합니다.</p>
    <p className="deposit-coupon-note">현재는 샘플 미리보기입니다. 실제 입금 접수·지급·쿠폰 차감은 처리되지 않습니다.</p>
  </section>;
}
