import { MEMBER_LANDING_BADGES } from './member-landing-badges';
import './member-landing-achievements.css';

export function MemberLandingAchievements({ onClaim }: { onClaim: () => void }) {
  return (
    <div className="landing-rewards-content">
      <section className="landing-achievement-panel" aria-labelledby="landing-achievement-heading">
        <h2 id="landing-achievement-heading">머니그라운드 업적 리워드!</h2>
        <ul className="landing-achievement-grid">
          {MEMBER_LANDING_BADGES.map(badge => (
            <li key={badge.id}>
              <img
                src={badge.image}
                alt=""
                aria-hidden="true"
                width={512}
                height={512}
                decoding="async"
                draggable={false}
              />
              <span>{badge.label}</span>
            </li>
          ))}
        </ul>
      </section>
      <button type="button" className="landing-reward-claim" aria-label="보상 받기" onClick={onClaim}>
        <img
          src="/landing-reward-claim-cutout-v2.png"
          alt=""
          aria-hidden="true"
          width={367}
          height={116}
          decoding="async"
          draggable={false}
        />
      </button>
    </div>
  );
}
