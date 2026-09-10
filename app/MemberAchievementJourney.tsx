import type { CSSProperties } from 'react';
import type { AchievementItem } from './achievements-data';
import { getJourneyLayout, getJourneyMarker, type JourneyRoad } from './achievement-journey';

export function MemberAchievementJourney({ road, title, values, current, label, achievements }: {
  road: JourneyRoad;
  title: string;
  values: number[];
  current: number;
  label: (target: number) => string;
  achievements: AchievementItem[];
}) {
  const { points, height } = getJourneyLayout(road, values.length);
  const marker = getJourneyMarker(values, points, current);
  // Use the same reward records as the claim cards, not a separate title-name table.
  const milestones = values.map(target => achievements.find(item => item.target === target));
  const finalAchievement = milestones[milestones.length - 1];
  const finalReward = [
    finalAchievement?.rewardTitle && `${finalAchievement.rewardTitle} 칭호`,
    finalAchievement?.badge && '전용 뱃지',
  ].filter(Boolean).join(' + ');
  const currentLabel = road === 'level' ? `현재 위치 ${current.toLocaleString()}레벨`
    : road === 'referral' ? `현재 추천 ${current.toLocaleString()}명`
    : road === 'deposit' ? `현재 누적 입금 ${current.toLocaleString()}원`
    : road === 'withdraw' ? `현재 누적 출금 ${current.toLocaleString()}원`
    : road === 'slots' ? `현재 누적 스핀 ${current.toLocaleString()}회`
    : road === 'sports' ? `현재 적중 ${current.toLocaleString()}폴더`
    : `현재 연승 ${current.toLocaleString()}회`;

  return <>
    <section
      className="member-level-map member-achievement-journey"
      data-road={road}
      style={height ? { '--journey-height': `${height}px` } as CSSProperties : undefined}
      aria-label={`${title} 진행 경로`}
    >
      <header><b>{title}</b><small>{currentLabel}</small></header>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline points={points.map(point => point.join(',')).join(' ')} />
      </svg>
      {values.map((target, index) => {
        const achievement = milestones[index];
        const isFinal = index === values.length - 1;
        const rewardTitle = achievement?.rewardTitle;
        const note = rewardTitle ? `${rewardTitle} 칭호` : target > 0 ? '+보상' : undefined;
        return <div
          key={target}
          className={`member-level-node ${current >= target ? 'complete' : ''} ${isFinal ? 'final' : ''} ${achievement?.badge ? 'badge-reward' : ''}`}
          data-achievement-id={achievement?.id}
          style={{ left: `${points[index][0]}%`, top: `${points[index][1]}%` }}
        >
          {achievement?.badge
            ? <img className={isFinal ? 'member-final-badge' : 'member-milestone-badge'} src={achievement.badge} alt={`${label(target)} 보상 뱃지`} />
            : <i />}
          <b>{label(target)}</b>
          {note && <small className={rewardTitle ? 'title-reward' : ''}>{note}</small>}
        </div>;
      })}
      <span className="member-level-marker" role="img" aria-label={currentLabel} style={{ left: `${marker[0]}%`, top: `${marker[1]}%` }} />
    </section>
    <footer className="member-level-reward">
      <span>{label(values[values.length - 1])} 보상</span>
      <b>{finalReward}</b>
      <small>{road === 'deposit' ? '3억 달성 시 입금의 귀족 칭호를 먼저 지급합니다.'
        : road === 'withdraw' ? '10억 달성 시 현금화의 마술사 칭호를 먼저 지급합니다.'
        : '각 구간 달성 시 리워드와 칭호가 지급됩니다.'}</small>
    </footer>
  </>;
}
