'use client';

import { useId } from 'react';
import { BET_FUNDING, type BetFunding } from './bet-funding';
import './bet-funding.css';

export function BetFundingSelector({ value, onChange, money, support, disabled = false }: {
  value: BetFunding;
  onChange: (value: BetFunding) => void;
  money: number;
  support: number;
  disabled?: boolean;
}) {
  const name = useId();
  const hasSupport = Number.isFinite(support) && support > 0;
  return <fieldset className="bet-funding" disabled={disabled}>
    <legend>베팅 수단 선택</legend>
    <div className="bet-funding-options">
      {(['money', 'support'] as const).map(source => <label className={`${value === source ? 'selected' : ''} ${source === 'support' && !hasSupport ? 'unavailable' : ''}`} key={source}>
        <input type="radio" name={name} value={source} checked={value === source} disabled={source === 'support' && !hasSupport} onChange={() => { if (!disabled && (source === 'money' || hasSupport)) onChange(source); }} />
        <span><strong>{BET_FUNDING[source].label}로 베팅</strong><small>{source === 'support' && !hasSupport ? '지원금 없음' : `${(source === 'money' ? money : support).toLocaleString()} ${BET_FUNDING[source].unit}`}</small></span>
      </label>)}
    </div>
  </fieldset>;
}
