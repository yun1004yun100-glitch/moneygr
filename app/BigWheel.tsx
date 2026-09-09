'use client';

import { useEffect, useRef, useState } from 'react';
import './big-wheel.css';
import {wheelRewards as rewards,wheelWeights,drawRewardIndex} from './wheel-rewards';

type Tier = 'normal' | 'premium';
const couponKey = 'moneyground_roulette_coupons';
const couponSeedKey = 'moneyground_roulette_coupons_seed_100_v1';

function readCoupons(): Record<Tier, number> {
  try {
    const seeded = localStorage.getItem(couponSeedKey);
    if (!seeded) {
      const initial = { normal: 100, premium: 100 };
      localStorage.setItem(couponKey, JSON.stringify(initial));
      localStorage.setItem(couponSeedKey, '1');
      return initial;
    }
    const saved = JSON.parse(localStorage.getItem(couponKey) || '{}');
    return {
      normal: Number.isSafeInteger(saved.normal) && saved.normal >= 0 ? saved.normal : 100,
      premium: Number.isSafeInteger(saved.premium) && saved.premium >= 0 ? saved.premium : 100,
    };
  } catch {
    return { normal: 100, premium: 100 };
  }
}

// Web Audio API Sound Effects (Mechanical Tick & Victory Fanfare)
function playTick(ctxRef: React.MutableRefObject<AudioContext | null>) {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = ctxRef.current || (ctxRef.current = new AudioCtx());
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.025);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  } catch {}
}

function playWin(ctxRef: React.MutableRefObject<AudioContext | null>) {
  try {
    if (typeof window === 'undefined') return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = ctxRef.current || (ctxRef.current = new AudioCtx());
    if (ctx.state === 'suspended') ctx.resume();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch {}
}

const wheelSectorColors: Record<Tier, string[]> = {
  normal: [
    '#0e6856', // 3,000 (Deep Emerald Green)
    '#68218a', // 5,000 (Royal Purple)
    '#b45309', // 10,000 (Warm Amber Gold)
    '#1e40af', // 20,000 (Cobalt Sapphire Blue)
    '#a21caf', // 30,000 (Magenta Orchid)
    '#991b1b', // 50,000 (Crimson Ruby)
    '#c28a10', // 100,000 (Jackpot Gold)
  ],
  premium: [
    '#4c1d95', // 15,000 (Deep Imperial Violet)
    '#9f1239', // 20,000 (Velvet Crimson Ruby)
    '#1e3a8a', // 30,000 (Deep Royal Sapphire)
    '#047857', // 50,000 (Vibrant Emerald Jade)
    '#86198f', // 100,000 (Royal Fuchsia Plum)
    '#0e7490', // 300,000 (Lapis Electric Teal)
    '#d97706', // 1,000,000 (Grand Jackpot Gold)
  ],
};

const PREMIUM_FRAME_STUDS = Array.from({ length: 28 }, (_, i) => {
  const angle = (i * 360) / 28 - 90;
  const rad = (angle * Math.PI) / 180;
  return {
    cx: Number((220 + 203 * Math.cos(rad)).toFixed(2)),
    cy: Number((220 + 203 * Math.sin(rad)).toFixed(2)),
    i,
  };
});

export default function BigWheel({
  loggedIn,
  onLogin,
  onPrize,
  onBack,
  initialTier,
}: {
  loggedIn: boolean;
  onLogin: () => void;
  onPrize: (amount: number) => void;
  onBack?: () => void;
  initialTier?: Tier;
}) {
  const [tier, setTier] = useState<Tier>(() => {
    if (initialTier) return initialTier;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tier') === 'premium') return 'premium';
    }
    return 'normal';
  });
  const [coupons, setCoupons] = useState<Record<Tier, number>>({ normal: 0, premium: 0 });
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [pointerState, setPointerState] = useState<'idle' | 'fast' | 'slow' | 'win'>('idle');

  const discRef = useRef<HTMLDivElement | null>(null);
  const rotationRef = useRef(0);
  const busy = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const refresh = () => setCoupons(readCoupons());
    refresh();
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tier') === 'premium') setTier('premium');
    } catch {}
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try { audioCtxRef.current.close(); } catch {}
      }
    };
  }, []);

  // Sync disc rotation style
  useEffect(() => {
    if (discRef.current) {
      discRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
    }
  }, [tier]);

  const sectorAngle = 360 / rewards[tier].length;
  const colors = wheelSectorColors[tier];
  const divider = 1.0; // 1도 황금색 구분선
  const sectorBackground =
    'conic-gradient(' +
    rewards[tier]
      .map((_, i) => {
        const color = colors[i % colors.length];
        const start = i * sectorAngle;
        const end = (i + 1) * sectorAngle;
        return `${color} ${start.toFixed(2)}deg ${(end - divider).toFixed(2)}deg, #fde047 ${(end - divider).toFixed(2)}deg ${end.toFixed(2)}deg`;
      })
      .join(', ') +
    ')';

  const spin = () => {
    if (!loggedIn) {
      onLogin();
      return;
    }
    if (busy.current || spinning) return;
    busy.current = true;
    setError('');

    const available = readCoupons();
    if (available[tier] < 1) {
      setCoupons(available);
      setError(`${tier === 'normal' ? '일반' : '프리미엄'} 룰렛 쿠폰이 필요합니다.`);
      busy.current = false;
      return;
    }

    // 1. Pick winner
    const index = drawRewardIndex(tier);
    const amount = rewards[tier][index];

    // 2. Consume coupon
    available[tier]--;
    localStorage.setItem(couponKey, JSON.stringify(available));
    setCoupons(available);

    // 3. Setup spinning states
    setResult(null);
    setWinningIndex(null);
    setSpinning(true);
    setPointerState('fast');

    // 4. Calculate target rotation
    const center = index * sectorAngle + sectorAngle / 2;
    const variation = (Math.random() - 0.5) * 16;
    const targetAngle = (360 - center + variation + 360) % 360;

    const startAngle = rotationRef.current;
    const startNorm = ((startAngle % 360) + 360) % 360;
    let diff = targetAngle - startNorm;
    while (diff <= 0) diff += 360;

    // 8 full rotations + diff for suspenseful dynamic spin
    const totalTurns = 8 * 360;
    const totalDelta = totalTurns + diff;
    const finalAngle = startAngle + totalDelta;

    const duration = 4400; // 4.4 seconds of casino wheel spin
    const startTime = performance.now();
    let lastSectorTick = -1;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const frame = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);

      // Easing curve: crisp start -> high-speed spin -> dramatic deceleration
      let progress: number;
      if (t < 0.08) {
        const p = t / 0.08;
        progress = 0.04 * (p * p);
      } else {
        const p = (t - 0.08) / 0.92;
        progress = 0.04 + 0.96 * (1 - Math.pow(1 - p, 4));
      }

      const currentDeg = startAngle + totalDelta * progress;
      rotationRef.current = currentDeg;

      if (discRef.current) {
        discRef.current.style.transform = `rotate(${currentDeg}deg)`;
      }

      // Tick detection on sector pins
      const currentPeg = Math.floor(currentDeg / sectorAngle);
      if (currentPeg !== lastSectorTick) {
        lastSectorTick = currentPeg;
        playTick(audioCtxRef);
      }

      // Adjust pointer vibration
      if (t > 0.72 && t < 0.95) {
        setPointerState('slow');
      } else if (t >= 0.95) {
        setPointerState('idle');
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(frame);
      } else {
        // Spin complete
        rotationRef.current = finalAngle;
        if (discRef.current) {
          discRef.current.style.transform = `rotate(${finalAngle}deg)`;
        }
        setSpinning(false);
        setPointerState('win');
        setWinningIndex(index);
        setResult(amount);
        onPrize(amount);
        playWin(audioCtxRef);
        busy.current = false;
        setTimeout(() => setPointerState('idle'), 1800);
      }
    };

    animFrameRef.current = requestAnimationFrame(frame);
  };

  return (
    <section className={`big-wheel-page ${tier}`} aria-label="빅휠 룰렛">
      <header className="big-wheel-header">
        <div className="wheel-header-nav">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="wheel-back-btn"
            >
              ← 홈으로
            </button>
          )}
          <span className="wheel-title-badge">{tier === 'premium' ? '👑 VIP WHEEL' : 'BIG WHEEL'}</span>
        </div>
        <h1>{tier === 'premium' ? '프리미엄 럭셔리 룰렛' : '쿠폰으로 여는 행운'}</h1>
        <p>{tier === 'premium' ? '최대 1,000,000원 그랜드 잭팟의 행운에 도전하세요!' : '룰렛 쿠폰 1장으로 한 번 참여하세요.'}</p>
      </header>

      <div className="wheel-tabs" role="group" aria-label="룰렛 종류">
        <button
          aria-pressed={tier === 'normal'}
          disabled={spinning}
          onClick={() => {
            setTier('normal');
            setResult(null);
            setWinningIndex(null);
          }}
        >
          일반 룰렛<small>5천 ~ 10만 원</small>
        </button>
        <button
          className="tab-premium"
          aria-pressed={tier === 'premium'}
          disabled={spinning}
          onClick={() => {
            setTier('premium');
            setResult(null);
            setWinningIndex(null);
          }}
        >
          👑 프리미엄 룰렛<small>1만 5천 ~ 100만 원</small>
        </button>
      </div>

      <div className={`wheel-coupon-count ${tier === 'premium' ? 'is-premium-count' : ''}`}>
        {tier === 'premium' && <span className="premium-count-badge">VIP</span>}
        보유 {tier === 'normal' ? '일반' : '프리미엄'} 쿠폰 <strong>{coupons[tier]}장</strong>
        {loggedIn && (
          <button
            type="button"
            className="coupon-charge-btn"
            onClick={() => {
              const next = { ...coupons, [tier]: (coupons[tier] || 0) + 100 };
              setCoupons(next);
              try {
                localStorage.setItem(couponKey, JSON.stringify(next));
              } catch {}
            }}
          >
            +100장 충전 (테스트)
          </button>
        )}
      </div>

      <div className={`wheel-stage ${spinning ? 'is-spinning' : ''} ${tier === 'premium' ? 'is-premium' : ''}`}>
        {/* Luxury Background Glow for Premium */}
        {tier === 'premium' && <div className="wheel-stage-aura" aria-hidden="true" />}

        {/* Dynamic Pointer with mechanical bounce */}
        <div className={`wheel-pointer pointer-${pointerState}`} aria-hidden="true">
          {tier === 'premium' && <div className="pointer-crown-gem" />}
          <div className="pointer-arrow" />
        </div>

        {/* Outer Wheel Disc with continuous requestAnimationFrame rotation */}
        <div ref={discRef} className="wheel-disc" style={{background:sectorBackground}} aria-hidden="true">
          {rewards[tier].map((amount, index) => {
            const isWinner = winningIndex === index && !spinning;
            const isGrand = tier === 'premium' && amount === 1000000;
            return (
              <div
                className={`wheel-sector-label ${isWinner ? 'is-winner' : ''} ${isGrand ? 'is-grand' : ''}`}
                key={amount}
                style={{ transform: `rotate(${index * sectorAngle + sectorAngle / 2}deg)` }}
              >
                <span>
                  {isGrand && <small className="grand-badge">JACKPOT</small>}
                  {amount.toLocaleString()}
                  <small>원</small>
                </span>
              </div>
            );
          })}

          {/* Golden Perimeter Pegs/Pins */}
          {rewards[tier].map((_,i)=>i*sectorAngle).map((deg) => (
            <div
              key={deg}
              className="wheel-rim-pin"
              style={{ transform: `rotate(${deg}deg)` }}
            />
          ))}
        </div>

        {/* Circular Frame Overlay for Premium Wheel */}
        {tier === 'premium' && (
          <div className="wheel-premium-frame-overlay" aria-hidden="true">
            <svg className="wheel-premium-frame-svg" viewBox="0 0 440 440">
              <defs>
                <linearGradient id="goldFrameGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fff8db" />
                  <stop offset="22%" stopColor="#ffd966" />
                  <stop offset="50%" stopColor="#b47818" />
                  <stop offset="78%" stopColor="#ffd966" />
                  <stop offset="100%" stopColor="#6e4402" />
                </linearGradient>
                <linearGradient id="goldFrameGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffe89e" />
                  <stop offset="30%" stopColor="#dfa732" />
                  <stop offset="70%" stopColor="#875608" />
                  <stop offset="100%" stopColor="#ffd966" />
                </linearGradient>
                <radialGradient id="frameRivetGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="40%" stopColor="#ffe680" />
                  <stop offset="75%" stopColor="#e5a110" />
                  <stop offset="100%" stopColor="#573300" />
                </radialGradient>
                <radialGradient id="frameRubyGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#ffb3c1" />
                  <stop offset="40%" stopColor="#ff1744" />
                  <stop offset="85%" stopColor="#990024" />
                  <stop offset="100%" stopColor="#4a000f" />
                </radialGradient>
                <filter id="goldFrameGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Outer decorative gold bevel and rings */}
              <circle cx="220" cy="220" r="217" fill="none" stroke="rgba(255, 215, 0, 0.45)" strokeWidth="1.5" filter="url(#goldFrameGlow)" />
              <circle cx="220" cy="220" r="214" fill="none" stroke="url(#goldFrameGrad1)" strokeWidth="6" />
              <circle cx="220" cy="220" r="209" fill="none" stroke="#2c1a06" strokeWidth="2.5" />
              <circle cx="220" cy="220" r="203" fill="none" stroke="url(#goldFrameGrad2)" strokeWidth="13" />
              <circle cx="220" cy="220" r="203" fill="none" stroke="#683d03" strokeWidth="11" opacity="0.4" />

              {/* 28 Studded Luxury Frame Jewels / Rivets */}
              {PREMIUM_FRAME_STUDS.map(({ cx, cy, i }) => (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="4.2" fill={i % 7 === 0 ? 'url(#frameRubyGrad)' : 'url(#frameRivetGrad)'} stroke="#fff8db" strokeWidth="0.8" />
                  <circle cx={cx - 1.2} cy={cy - 1.2} r="1.2" fill="#ffffff" opacity="0.85" />
                </g>
              ))}

              {/* Inner bevels and framing that encase the spinning wheel */}
              <circle cx="220" cy="220" r="195" fill="none" stroke="url(#goldFrameGrad1)" strokeWidth="3.5" />
              <circle cx="220" cy="220" r="192" fill="none" stroke="#1f1003" strokeWidth="2" />
              <circle cx="220" cy="220" r="190" fill="none" stroke="#ffd966" strokeWidth="1.5" />
            </svg>

            {/* Top Ornate Crown Crest Flanking the Pointer Mount */}
            <div className="wheel-frame-crest">
              <span className="crest-wing left">❖</span>
              <span className="crest-crown">👑 VIP LUXURY</span>
              <span className="crest-wing right">❖</span>
            </div>
          </div>
        )}

        {/* Center Hub */}
        <div className={`wheel-hub ${spinning ? 'hub-spinning' : ''}`} aria-hidden="true">
          {tier === 'premium' ? (
            <div className="wheel-hub-vip">
              <span className="hub-vip-crown">👑</span>
              <span className="hub-vip-title">VIP</span>
              <small className="hub-vip-sub">MG GOLD</small>
            </div>
          ) : (
            <>
              MG
              <br />
              <small>BIG WHEEL</small>
            </>
          )}
        </div>
      </div>

      <button
        className={`wheel-spin-button ${spinning ? 'is-spinning' : ''} ${tier === 'premium' ? 'btn-premium' : ''}`}
        disabled={spinning || (loggedIn && coupons[tier] === 0)}
        onClick={spin}
      >
        {!loggedIn
          ? '로그인 후 이용하기'
          : spinning
          ? '⚡ 룰렛이 회전 중입니다... ⚡'
          : coupons[tier] === 0
          ? `${tier === 'normal' ? '일반' : '프리미엄'} 룰렛 쿠폰이 필요합니다`
          : tier === 'premium'
          ? '프리미엄 룰렛 돌리기'
          : '쿠폰 1장 사용하고 돌리기'}
      </button>

      <div className="wheel-result" role="status" aria-live="polite">
        {result !== null ? (
          <div className={`wheel-win-card ${tier === 'premium' ? 'win-card-vip' : ''}`}>
            <span className="win-sparkle">🎉</span>
            <b>{result.toLocaleString()}원 당첨!</b>
            <p>{result === 1000000 ? '🎊 축하합니다! 그랜드 잭팟 달성! 🎊' : '보유금에 즉시 충전되었습니다.'}</p>
          </div>
        ) : (
          error || '일반 쿠폰과 프리미엄 쿠폰은 각각의 룰렛에서 사용됩니다.'
        )}
      </div>

      <details>
        <summary>보상 금액 및 확률</summary>
        <ul>
          {rewards[tier].map((amount,index) => (
            <li key={amount}>
              <span>{amount.toLocaleString()}원</span>
              <b>{wheelWeights[tier][index]/10}%</b>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
