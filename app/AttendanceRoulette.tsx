'use client';

import { useEffect, useRef, useState } from 'react';
import './attendance-roulette.css';

const prizes = [500, 1000, 2000, 3000, 4000, 5000];
const probabilities = [5, 50, 30, 10, 3, 2];
function prizeIndexForTicket(ticket: number) {
  let cumulative = 0;
  return probabilities.findIndex(probability => { cumulative += probability; return ticket < cumulative; });
}
type RecordState = { days: number; lastDate: string; prize: number | null };
const empty: RecordState = { days: 0, lastDate: '', prize: null };
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export function AttendanceRoulette({ nickname }: { nickname?: string }) {
  const key = `moneyground_attendance_roulette_preview_v1:${nickname || 'guest'}`;
  const [record, setRecord] = useState<RecordState>(empty);
  const [ready, setReady] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [notice, setNotice] = useState('');
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const read = (): RecordState => {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...empty };
    const value = JSON.parse(raw);
    if (!Number.isInteger(value.days) || value.days < 0 || value.days > 10 || typeof value.lastDate !== 'string' || (value.prize !== null && (!prizes.includes(value.prize) || value.days !== 10))) throw new Error('Invalid attendance record');
    return value;
  };
  useEffect(() => {
    try { const saved = read(); setRecord(saved); setAngle(saved.prize === null ? 0 : (360 - (prizes.indexOf(saved.prize) * 60 + 30)) % 360); setReady(true); }
    catch { setNotice('출석 기록을 불러오지 못했습니다. 브라우저 저장 설정을 확인해주세요.'); }
    const sync = (event: StorageEvent) => { if (event.key === key) { try { setRecord(read()); } catch { setReady(false); } } };
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('storage', sync); if (timer.current) clearTimeout(timer.current); };
  }, [key]);

  async function act(kind: 'check' | 'spin', day = 0) {
    if (!ready || busy.current) return;
    busy.current = true;
    const run = () => {
      try {
        const current = read();
        setRecord(current);
        if (kind === 'check') {
          if (current.lastDate === today()) { setNotice('오늘은 이미 출석했습니다. 00시가 지난 뒤 다시 시도해주세요.'); return; }
          if (current.days === 10 && current.prize === null) { setNotice('10일 출석을 달성했습니다. 중앙의 스핀 버튼을 눌러주세요.'); return; }
          const count = current.prize !== null ? 0 : current.days;
          if (day !== count + 1) { setNotice(`${count + 1}일차 칸을 눌러 순서대로 출석해주세요.`); return; }
          const next = { days: count + 1, lastDate: today(), prize: null };
          localStorage.setItem(key, JSON.stringify(next)); setRecord(next); setAngle(0);
        } else {
          if (current.days !== 10 || current.prize !== null) return;
          const random = new Uint32Array(1);
          // Reject the incomplete final bucket to keep all 100 tickets equally likely.
          do { crypto.getRandomValues(random); } while (random[0] >= 4294967200);
          const index = prizeIndexForTicket(random[0] % 100);
          const next = { ...current, prize: prizes[index] };
          // Persist before animation so closing/reopening cannot reroll this cycle.
          localStorage.setItem(key, JSON.stringify(next));
          setRecord(next); setSpinning(true);
          setAngle(360 * 6 + (360 - (index * 60 + 30)) % 360);
          timer.current = setTimeout(() => { setSpinning(false); setNotice(`${next.prize.toLocaleString()}원 당첨! 미리보기 추첨 결과가 저장되었습니다.`); }, 4400);
        }
      } catch { setNotice('출석 기록을 저장하지 못했습니다. 저장 공간과 브라우저 설정을 확인한 뒤 다시 시도해주세요.'); }
    };
    try { if (navigator.locks) await navigator.locks.request(key, run); else run(); }
    finally { busy.current = false; }
  }

  return <section className="ar-panel" aria-label="10일 출석 룰렛">
    <p className="ar-intro">하루 한 칸, 10일을 채우면 스핀!</p>
    <div className="ar-progress"><b>{record.days} / 10일</b><span>00시 기준</span></div>
    <div className="ar-days">{Array.from({ length: 10 }, (_, i) => <button type="button" key={i} className={i < record.days ? 'done' : ''} disabled={!ready || spinning} aria-label={`${i + 1}일차 ${i < record.days ? '출석 완료' : '출석하기'}`} onClick={() => act('check', i + 1)}><span>{i < record.days ? '✓' : '○'}</span><b>{i + 1}일차</b></button>)}</div>
    <div className={`ar-stage ${record.days === 10 ? 'unlocked' : ''}`}>
      <div className="ar-pointer" aria-hidden="true">▼</div>
      <div className="ar-wheel" style={{ transform: `rotate(${angle}deg)` }}>
        {prizes.map((prize, i) => <div className="ar-prize" key={prize} style={{ transform: `rotate(${i * 60 + 30}deg)` }}><b>{prize.toLocaleString()}<small>원</small></b></div>)}
      </div>
      <button type="button" className="ar-spin" disabled={!ready || record.days !== 10 || record.prize !== null || spinning} onClick={() => act('spin')}>{spinning ? '추첨 중' : record.prize !== null ? '완료' : '스핀'}<small>{record.days < 10 ? '10일 달성 시' : record.prize !== null ? '결과 저장됨' : 'SPIN'}</small></button>
    </div>
    <div className="ar-status" aria-live="polite">{spinning ? '행운의 금액을 추첨하고 있습니다…' : record.prize !== null ? <><strong>{record.prize.toLocaleString()}원 당첨</strong><span>다음 출석 가능일부터 1일차를 다시 시작하세요.</span></> : record.days === 10 ? '10일 달성! 중앙의 스핀 버튼을 눌러주세요.' : `${record.days + 1}일차 칸을 눌러 출석해주세요.`}</div>
    <div className="ar-odds" aria-label="금액별 당첨 확률"><h3>당첨 확률</h3><dl>{prizes.map((prize, i) => <div key={prize}><dt>{prize.toLocaleString()}원</dt><dd>{probabilities[i]}%</dd></div>)}</dl></div>
    <p className="ar-note">룰렛 칸의 크기와 관계없이 위 확률로 추첨됩니다. 출석은 누적 10일 기준입니다.</p>
    <p className="ar-note">미리보기 · 이 브라우저에 기록 저장 · 실제 금액 지급 없음</p>
    {notice && <div className="ar-alert-backdrop" onClick={e => e.stopPropagation()}><section role="alertdialog" aria-modal="true" aria-labelledby="ar-alert-title" className="ar-alert"><h3 id="ar-alert-title">출석부 룰렛 안내</h3><p>{notice}</p><button type="button" autoFocus onClick={() => setNotice('')}>확인</button></section></div>}
  </section>;
}
