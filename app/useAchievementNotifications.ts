'use client';

import { useEffect, useRef, useState } from 'react';

export type AchievementNotification = {
  id?: string;
  type: 'achievement' | 'quest';
  title: string;
  desc?: string;
  reward?: string;
  badge?: string;
  icon?: string;
  grade?: string;
};

/**
 * 전역 퀘스트 및 업적 토스트 트리거 함수
 * 앱 어디서든 (MenuCenter, 베팅, 출석 등) 호출하여 유저에게 즉시 토스트 알림을 띄웁니다.
 */
export function triggerAchievementToast(notif: AchievementNotification) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('mg:achievement-toast', { detail: notif }));
}

export function triggerQuestToast(notif: Omit<AchievementNotification, 'type'> & { type?: 'quest' }) {
  triggerAchievementToast({ ...notif, type: 'quest' });
}

type Progress = { streak: number; gamesPlayed: number; earned: string[] };

export function useAchievementNotifications() {
  const [queue, setQueue] = useState<AchievementNotification[]>([]);
  const progress = useRef<Record<string, Progress>>({});
  const current = queue[0];

  // 커스텀 이벤트 수신 대기
  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const detail = (e as CustomEvent<AchievementNotification>).detail;
      if (detail && detail.title) {
        setQueue(items => [...items, detail]);
      }
    };
    window.addEventListener('mg:achievement-toast', handleToastEvent);
    return () => window.removeEventListener('mg:achievement-toast', handleToastEvent);
  }, []);

  // 4.2초 후 자동 닫힘
  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(() => setQueue(items => items.slice(1)), 4200);
    return () => window.clearTimeout(timer);
  }, [current]);

  function recordResult(mode: 'member' | 'gold', won: boolean) {
    const key = `moneyground-achievements-v2-${mode}`;
    if (!progress.current[mode]) {
      let saved: Progress = { streak: 0, gamesPlayed: 0, earned: [] };
      try {
        const value = JSON.parse(localStorage.getItem(key) || 'null');
        if (value && Number.isInteger(value.streak) && Array.isArray(value.earned)) saved = value;
      } catch { /* Storage fallback */ }
      progress.current[mode] = saved;
    }
    const state = progress.current[mode];
    state.streak = won ? state.streak + 1 : 0;
    state.gamesPlayed = (state.gamesPlayed || 0) + 1;

    const unlocked: AchievementNotification[] = [];

    // 1. 배팅 적중
    if (won && !state.earned.includes('first-win')) {
      state.earned.push('first-win');
      unlocked.push({
        id: 'first-win',
        type: 'achievement',
        title: '첫 배팅 적중!',
        desc: '머니그라운드 첫 승리 달성',
        reward: mode === 'member' ? '전용 뱃지 & 칭호' : '+10,000P',
        badge: '/badges/badge-1.png',
        grade: '일반',
      });
    }

    // 2. 3연승
    if (state.streak >= 3 && !state.earned.includes('three-wins')) {
      state.earned.push('three-wins');
      unlocked.push({
        id: 'three-wins',
        type: 'achievement',
        title: '미니게임 3연승 달성!',
        desc: '미니게임 연속 3승 질주',
        reward: mode === 'member' ? '전용 뱃지 & 칭호 【직관의 승부사】' : '칭호 【직관의 승부사】 · +10,000P',
        badge: '/badges/badge-1.png',
        grade: '일반',
      });
    }

    // 3. 5연승
    if (state.streak >= 5 && !state.earned.includes('five-wins')) {
      state.earned.push('five-wins');
      unlocked.push({
        id: 'five-wins',
        type: 'achievement',
        title: '미니게임 5연승 달성!',
        desc: '미니게임 연속 5승 질주',
        reward: mode === 'member' ? '전용 뱃지 & 칭호 【예측의 달인】' : '칭호 【예측의 달인】 · +30,000P',
        badge: '/badges/badge-9.png',
        grade: '레어',
      });
    }

    // 4. 7연승
    if (state.streak >= 7 && !state.earned.includes('seven-wins')) {
      state.earned.push('seven-wins');
      unlocked.push({
        id: 'seven-wins',
        type: 'achievement',
        title: '미니게임 7연승 달성!',
        desc: '미니게임 연속 7승 대기록',
        reward: mode === 'member' ? '전용 뱃지 & 칭호 【확률의 지배자】' : '칭호 【확률의 지배자】 · +100,000P',
        badge: '/badges/badge-12.png',
        grade: '전설',
      });
    }

    // 5. 10연승
    if (state.streak >= 10 && !state.earned.includes('ten-wins')) {
      state.earned.push('ten-wins');
      unlocked.push({
        id: 'ten-wins',
        type: 'achievement',
        title: '미니게임 10연승 무패 신화 달성!',
        desc: '미니게임 10연승 무패 신화 등극',
        reward: mode === 'member' ? '전용 뱃지 & 칭호 【미니게임 황제】' : '칭호 【미니게임 황제】 · +300,000P',
        badge: '/badges/badge-3.png',
        grade: '신화',
      });
    }

    // 6. 퀘스트: 게임 플레이 3회
    if (state.gamesPlayed >= 3 && !state.earned.includes('quest-play-3')) {
      state.earned.push('quest-play-3');
      unlocked.push({
        id: 'quest-play-3',
        type: 'quest',
        title: '게임 플레이 3회 완료!',
        desc: '카지노/슬롯/미니게임 중 3회 플레이 완료',
        reward: mode === 'member' ? undefined : '3,000P + 30 경험치 획득!',
        icon: '🎲',
      });
    }

    try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* Session fallback */ }
    if (unlocked.length) setQueue(items => [...items, ...unlocked]);
  }

  return {
    activeToast: current,
    achievement: current ? current.title : null,
    recordResult,
    dismissAchievement: () => setQueue(items => items.slice(1)),
    queue,
  };
}
