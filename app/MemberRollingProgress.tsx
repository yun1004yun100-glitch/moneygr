import {rollingProgress,type MemberRolling} from './member-rolling';
import './member-rolling.css';
export function MemberRollingProgress({value}:{value?:MemberRolling}) {
  const p=rollingProgress(value);
  return <small className="member-rolling-line" aria-live="polite">{p.target>0?`입금후 ${Number(p.percent.toFixed(1))}% 롤링중`:'롤링 대기중'}</small>;
}
