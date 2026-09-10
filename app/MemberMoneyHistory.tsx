'use client';

import { useState } from 'react';
import './member-money-history.css';

const categories = [
  { id: 'deposit', label: '입금내역' },
  { id: 'withdraw', label: '출금내역' },
  { id: 'usage', label: '사용내역' },
  { id: 'support', label: '지원금내역' },
  { id: 'tip', label: '팁내역' },
] as const;
type Category = typeof categories[number]['id'];
type Entry = { id: number; category: Category; title: string; amount: number; balance: number; date: string; unit: string; status: string };
// Existing member money history is a preview; do not represent these as live transactions.
const previewEntries: Entry[] = [
  { id: 1, category: 'deposit', title: '머니 입금', amount: 30000, balance: 42000, date: '2026-08-28T16:30', unit: '원', status: '입금 완료' },
  { id: 2, category: 'deposit', title: '머니 입금', amount: 10000, balance: 12000, date: '2026-08-25T10:15', unit: '원', status: '입금 완료' },
  { id: 3, category: 'withdraw', title: '머니 출금', amount: -20000, balance: 22000, date: '2026-08-28T17:00', unit: '원', status: '출금 완료' },
  { id: 4, category: 'usage', title: 'K LEAGUE 스포츠 베팅', amount: -1000, balance: 21000, date: '2026-08-28T18:10', unit: '원', status: '사용 완료' },
  { id: 5, category: 'usage', title: '스포츠 결과 당첨', amount: 2500, balance: 23500, date: '2026-08-28T20:30', unit: '원', status: '정산 완료' },
  { id: 6, category: 'support', title: '지원금 쿠폰 등록', amount: 5000, balance: 18500, date: '2026-08-27T12:00', unit: 'P', status: '지급 완료' },
  { id: 7, category: 'support', title: '지원금 게임 이용', amount: -1000, balance: 17500, date: '2026-08-28T14:20', unit: 'P', status: '사용 완료' },
  { id: 8, category: 'tip', title: '고객센터 팁 보내기', amount: -1000, balance: 22500, date: '2026-08-28T21:00', unit: '원', status: '전달 완료' },
];

export function MemberMoneyHistory({ credit }: { credit: number }) {
  const [category, setCategory] = useState<Category>('deposit');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [range, setRange] = useState({ start: '', end: '' });
  const [error, setError] = useState('');
  const rows = previewEntries.filter(row => row.category === category && (!range.start || row.date.slice(0, 10) >= range.start) && (!range.end || row.date.slice(0, 10) <= range.end)).sort((a, b) => b.date.localeCompare(a.date));
  const label = categories.find(item => item.id === category)!.label;
  return <section className="mmh" aria-label="머니내역 조회">
    <div className="mmh-balance"><span>보유금</span><strong>{credit.toLocaleString()} <small>원</small></strong></div>
    <div className="mmh-categories" role="group" aria-label="내역 종류">{categories.map(item => <button type="button" key={item.id} aria-pressed={category === item.id} className={category === item.id ? 'active' : ''} onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
    <form className="mmh-filter" onSubmit={event => { event.preventDefault(); if (start && end && start > end) { setError('종료일은 시작일과 같거나 이후로 선택해주세요.'); return; } setError(''); setRange({ start, end }); }}>
      <div className="mmh-dates"><label htmlFor="mmh-start">시작일<input id="mmh-start" type="date" value={start} aria-describedby={error ? 'mmh-error' : undefined} onChange={event => setStart(event.target.value)}/></label><label htmlFor="mmh-end">종료일<input id="mmh-end" type="date" value={end} aria-describedby={error ? 'mmh-error' : undefined} onChange={event => setEnd(event.target.value)}/></label></div>
      <div className="mmh-filter-actions"><button type="button" onClick={() => { setStart(''); setEnd(''); setRange({ start: '', end: '' }); setError(''); }}>전체 기간</button><button type="submit">조회</button></div>
      {error && <p id="mmh-error" className="mmh-error" role="alert">{error}</p>}
    </form>
    <div className="mmh-result-head"><h3>{label}</h3><span aria-live="polite">{rows.length}건</span></div>
    <p className="mmh-period">{range.start || range.end ? `${range.start || '처음'} ~ ${range.end || '현재'}` : '전체 기간'}</p>
    <div className="mmh-list">{rows.length ? rows.map(row => <article key={row.id} className="mmh-entry"><div className="mmh-entry-top"><time dateTime={row.date}>{row.date.replace('T', ' ')}</time><span>{row.status}</span></div><div className="mmh-entry-main"><h4>{row.title}</h4><strong className={row.amount > 0 ? 'income' : 'outgoing'}>{row.amount > 0 ? '+' : ''}{row.amount.toLocaleString()} {row.unit}</strong></div><p>{category === 'support' ? '지원금 잔액' : '거래 후 잔액'} <b>{row.balance.toLocaleString()} {row.unit}</b></p></article>) : <p className="mmh-empty" role="status">선택한 기간에 {label}이 없습니다.</p>}</div>
    <p className="mmh-preview">내역은 화면 확인용 예시입니다. 실제 거래 내역은 서버 연결 후 제공됩니다.</p>
  </section>;
}
