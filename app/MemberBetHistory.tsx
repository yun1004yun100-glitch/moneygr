'use client';

import { useState } from 'react';
import { BET_FUNDING } from './bet-funding';
import { MEMBER_BET_CATEGORIES, MEMBER_BET_STATUSES, filterMemberBets, type MemberBetCategory, type MemberBetRecord } from './member-bet-history';
import './member-bet-history.css';

export function MemberBetHistory({ records, loggedIn, onLogin, onBack }: {
  records: MemberBetRecord[]; loggedIn: boolean; onLogin: () => void; onBack: () => void;
}) {
  const [category, setCategory] = useState<'all' | MemberBetCategory>('all');
  const [status, setStatus] = useState<'all' | MemberBetRecord['status']>('all');
  const filtered = filterMemberBets(records, category, status);
  return <section className="member-bet-history" aria-labelledby="member-bet-history-title">
    <header className="member-history-heading">
      <div><button type="button" className="member-history-back" onClick={onBack}>← 회원 홈</button><h1 id="member-bet-history-title">배팅내역</h1></div>
      {loggedIn && <span>총 <b>{records.length}</b>건</span>}
    </header>
    {!loggedIn ? <div className="member-history-empty"><h2>로그인 후 확인할 수 있습니다</h2><button type="button" onClick={onLogin}>로그인</button></div> : <>
      <p className="member-history-notice">현재 화면에서 접수한 스포츠·미니게임 내역입니다. 새로고침 또는 로그아웃 시 초기화되며, 서버 내역은 아직 연결되지 않았습니다.</p>
      <div className="member-history-filters">
        <div className="member-history-categories" role="group" aria-label="게임 종류">
          <button type="button" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>전체</button>
          {Object.entries(MEMBER_BET_CATEGORIES).map(([key, label]) => <button type="button" key={key} aria-pressed={category === key} onClick={() => setCategory(key as MemberBetCategory)}>{label}</button>)}
        </div>
        <label className="member-history-status">결과
          <select value={status} onChange={event => setStatus(event.target.value as typeof status)}>
            <option value="all">전체 결과</option>
            {Object.entries(MEMBER_BET_STATUSES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
      </div>
      <p className="member-history-count" aria-live="polite">조회 내역 <b>{filtered.length}건</b></p>
      {filtered.length === 0 ? <div className="member-history-empty"><span aria-hidden="true">▤</span><h2>배팅내역이 없습니다</h2><p>{records.length ? '선택한 종류와 결과에 해당하는 내역이 없습니다.' : '배팅이 접수되면 이곳에서 확인할 수 있습니다.'}</p></div>
        : <div className="member-history-list">{filtered.map(record => <MemberBetHistoryCard key={record.id} record={record} />)}</div>}
    </>}
  </section>;
}

export function MemberBetHistoryCard({ record }: { record: MemberBetRecord }) {
  const wallet = BET_FUNDING[record.funding];
  const money = (value: number) => `${value.toLocaleString('ko-KR')} ${wallet.unit}`;
  return <article className="member-history-card" aria-label={`${record.game} ${MEMBER_BET_STATUSES[record.status]}`}>
    <header>
      <div><span className="member-history-category">{MEMBER_BET_CATEGORIES[record.category]}</span><h2>{record.game}</h2><time dateTime={record.createdAt}>{new Date(record.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false })}</time></div>
      <span className={`member-history-result ${record.status}`}>{MEMBER_BET_STATUSES[record.status]}</span>
    </header>
    <ul className="member-history-selections">{record.selections.map((selection, index) => <li key={index}><span>{selection.title}</span><b>{selection.pick} <em>{selection.odds.toFixed(2)}</em></b></li>)}</ul>
    {record.result && <p className="member-history-outcome">결과 <b>{record.result}</b></p>}
    <dl>
      <div><dt>배팅 수단</dt><dd>{wallet.label}</dd></div>
      <div><dt>배팅금액</dt><dd>{money(record.amount)}</dd></div>
      <div><dt>총 배당</dt><dd>{record.odds.toFixed(2)}</dd></div>
      <div><dt>{record.status === 'pending' ? '예상 당첨금' : '지급금액'}</dt><dd className={record.status === 'won' ? 'is-win' : undefined}>{money(record.payout ?? Math.floor(record.amount * record.odds))}</dd></div>
    </dl>
    <small className="member-history-id">접수번호 {record.id}</small>
  </article>;
}
