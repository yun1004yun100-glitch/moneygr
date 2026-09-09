import { ACHIEVEMENT_BADGES } from './achievement-badges';

export type AchievementItem = {
  id: string;
  category: 'level' | 'referral' | 'deposit' | 'withdraw' | 'game' | 'single';
  gameType?: 'casino' | 'sports' | 'slots' | 'mini';
  name: string;
  desc: string;
  target: number;
  current: number;
  unit: string;
  rewardTitle?: string;
  grade?: string;
  badge?: string;
  rewardPoints: number;
};

export type QuestItem = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  target: number;
  current: number;
  reward: string;
  done?: boolean;
};

export const INITIAL_DETAILED_ACHIEVEMENTS: AchievementItem[] = [
  // 단일 업적 (첫 로그인, 오류 보고 1회, 업적 3/5/10개, 퀘스트완료 1/10/30/50/100회)
  { id: 'sng-login', category: 'single', name: '첫 로그인', desc: '머니그라운드 첫 방문 및 로그인 완료', target: 1, current: 1, unit: '회', rewardTitle: '첫 발걸음', grade: '일반', badge: ACHIEVEMENT_BADGES['첫 발걸음'], rewardPoints: 5000 },
  { id: 'sng-bug', category: 'single', name: '오류 보고 1회', desc: '고객센터를 통한 사이트 오류/버그 제보 완료', target: 1, current: 0, unit: '회', rewardTitle: '버그 헌터', grade: '일반', badge: ACHIEVEMENT_BADGES['버그 헌터'], rewardPoints: 20000 },
  { id: 'sng-ach3', category: 'single', name: '업적 3개 달성', desc: '다양한 칭호 및 업적 3개 완료하기', target: 3, current: 3, unit: '개', rewardTitle: '업적 도전자', grade: '일반', badge: ACHIEVEMENT_BADGES['업적 도전자'], rewardPoints: 30000 },
  { id: 'sng-ach5', category: 'single', name: '업적 5개 달성', desc: '다양한 칭호 및 업적 5개 완료하기', target: 5, current: 1, unit: '개', rewardTitle: '업적 수집가', grade: '영웅', badge: ACHIEVEMENT_BADGES['업적 수집가'], rewardPoints: 50000 },
  { id: 'sng-ach10', category: 'single', name: '업적 10개 달성', desc: '다양한 칭호 및 업적 10개 완료하기', target: 10, current: 1, unit: '개', rewardTitle: '업적 마스터', grade: '신화', badge: ACHIEVEMENT_BADGES['업적 마스터'], rewardPoints: 200000 },
  { id: 'sng-qst1', category: 'single', name: '퀘스트완료 1회', desc: '일일/주간/월간 퀘스트 누적 1회 완료', target: 1, current: 1, unit: '회', rewardTitle: '모험의 시작', grade: '일반', badge: ACHIEVEMENT_BADGES['모험의 시작'], rewardPoints: 10000 },
  { id: 'sng-qst10', category: 'single', name: '퀘스트완료 10회', desc: '일일/주간/월간 퀘스트 누적 10회 완료', target: 10, current: 2, unit: '회', rewardTitle: '성실한 모험가', grade: '레어', badge: ACHIEVEMENT_BADGES['성실한 모험가'], rewardPoints: 30000 },
  { id: 'sng-qst30', category: 'single', name: '퀘스트완료 30회', desc: '일일/주간/월간 퀘스트 누적 30회 완료', target: 30, current: 2, unit: '회', rewardTitle: '퀘스트 베테랑', grade: '영웅', badge: ACHIEVEMENT_BADGES['퀘스트 베테랑'], rewardPoints: 100000 },
  { id: 'sng-qst50', category: 'single', name: '퀘스트완료 50회', desc: '일일/주간/월간 퀘스트 누적 50회 완료', target: 50, current: 2, unit: '회', rewardTitle: '미션 해결사', grade: '전설', badge: ACHIEVEMENT_BADGES['미션 해결사'], rewardPoints: 200000 },
  { id: 'sng-qst100', category: 'single', name: '퀘스트완료 100회', desc: '일일/주간/월간 퀘스트 누적 100회 대기록 달성', target: 100, current: 2, unit: '회', rewardTitle: '개척자', grade: '신화', badge: ACHIEVEMENT_BADGES['개척자'], rewardPoints: 1000000 },
  // 레벨 달성
  { id: 'lvl-1', category: 'level', name: '1레벨 달성', desc: '머니그라운드 첫 발걸음 1레벨 도달', target: 1, current: 13, unit: '레벨', rewardTitle: '루키', grade: '일반', badge: ACHIEVEMENT_BADGES['루키'], rewardPoints: 10000 },
  { id: 'lvl-100', category: 'level', name: '100레벨 달성', desc: '플레이 레벨 100 도달', target: 100, current: 13, unit: '레벨', rewardTitle: '비기너', grade: '레어', badge: ACHIEVEMENT_BADGES['비기너'], rewardPoints: 30000 },
  { id: 'lvl-300', category: 'level', name: '300레벨 달성', desc: '플레이 레벨 300 도달', target: 300, current: 13, unit: '레벨', rewardTitle: '준프로', grade: '영웅', badge: ACHIEVEMENT_BADGES['준프로'], rewardPoints: 80000 },
  { id: 'lvl-500', category: 'level', name: '500레벨 달성', desc: '플레이 레벨 500 도달', target: 500, current: 13, unit: '레벨', rewardTitle: '프로', grade: '전설', badge: ACHIEVEMENT_BADGES['프로'], rewardPoints: 200000 },
  { id: 'lvl-1000', category: 'level', name: '1,000레벨 달성', desc: '신화의 최고 레벨 1,000 도달', target: 1000, current: 13, unit: '레벨', rewardTitle: '마스터', grade: '신화', badge: ACHIEVEMENT_BADGES['마스터'], rewardPoints: 5000000 },
  // 지인추천
  { id: 'ref-1', category: 'referral', name: '지인 1명 추천', desc: '첫 지인 초대 가입 완료', target: 1, current: 1, unit: '명', rewardTitle: '인맥의 시작', grade: '일반', badge: ACHIEVEMENT_BADGES['인맥의 시작'], rewardPoints: 10000 },
  { id: 'ref-3', category: 'referral', name: '지인 3명 추천', desc: '지인 3명 초대 가입 완료', target: 3, current: 0, unit: '명', rewardTitle: '소문난 인싸', grade: '레어', badge: ACHIEVEMENT_BADGES['소문난 인싸'], rewardPoints: 50000 },
  { id: 'ref-5', category: 'referral', name: '지인 5명 추천', desc: '지인 5명 초대 가입 완료', target: 5, current: 0, unit: '명', rewardTitle: '마당발', grade: '영웅', badge: ACHIEVEMENT_BADGES['마당발'], rewardPoints: 100000 },
  { id: 'ref-7', category: 'referral', name: '지인 7명 추천', desc: '지인 7명 초대 가입 완료', target: 7, current: 0, unit: '명', rewardTitle: '추천회장', grade: '전설', badge: ACHIEVEMENT_BADGES['추천회장'], rewardPoints: 250000 },
  { id: 'ref-10', category: 'referral', name: '지인 10명 추천', desc: '지인 10명 추천 달성', target: 10, current: 0, unit: '명', rewardTitle: '추천의 제왕', grade: '신화', badge: ACHIEVEMENT_BADGES['추천의 제왕'], rewardPoints: 500000 },
  // 입금
  { id: 'dep-10m', category: 'deposit', name: '누적 입금 1,000만', desc: '누적 입금액 1,000만 달성', target: 10000000, current: 0, unit: '원', rewardTitle: '실버 VIP', grade: '일반', badge: ACHIEVEMENT_BADGES['실버 VIP'], rewardPoints: 20000 },
  { id: 'dep-50m', category: 'deposit', name: '누적 입금 5,000만', desc: '누적 입금액 5,000만 달성', target: 50000000, current: 0, unit: '원', rewardTitle: '골드 VIP', grade: '레어', badge: ACHIEVEMENT_BADGES['골드 VIP'], rewardPoints: 100000 },
  { id: 'dep-100m', category: 'deposit', name: '누적 입금 1억', desc: '누적 입금액 1억 달성', target: 100000000, current: 0, unit: '원', rewardTitle: '다이아 클럽', grade: '영웅', badge: ACHIEVEMENT_BADGES['다이아 클럽'], rewardPoints: 300000 },
  { id: 'dep-300m', category: 'deposit', name: '누적 입금 3억', desc: '누적 입금액 3억 달성', target: 300000000, current: 0, unit: '원', rewardTitle: '입금의 귀족', grade: '전설', badge: ACHIEVEMENT_BADGES['입금의 귀족'], rewardPoints: 1000000 },
  { id: 'dep-10b', category: 'deposit', name: '누적 입금 100억', desc: '누적 입금액 100억 달성', target: 10000000000, current: 0, unit: '원', rewardTitle: '금고의 주인', grade: '신화', badge: ACHIEVEMENT_BADGES['금고의 주인'], rewardPoints: 10000000 },
  // 출금
  { id: 'wth-1m', category: 'withdraw', name: '누적 출금 100만', desc: '누적 출금액 100만 환전 완료', target: 1000000, current: 0, unit: '원', rewardTitle: '짜릿한 승리자', grade: '일반', badge: ACHIEVEMENT_BADGES['짜릿한 승리자'], rewardPoints: 10000 },
  { id: 'wth-50m', category: 'withdraw', name: '누적 출금 5,000만', desc: '누적 출금액 5,000만 환전 완료', target: 50000000, current: 0, unit: '원', rewardTitle: '환전의 달인', grade: '레어', badge: ACHIEVEMENT_BADGES['환전의 달인'], rewardPoints: 150000 },
  { id: 'wth-1b', category: 'withdraw', name: '누적 출금 10억', desc: '누적 출금액 10억 환전 달성', target: 1000000000, current: 0, unit: '원', rewardTitle: '현금화의 마술사', grade: '영웅', badge: ACHIEVEMENT_BADGES['현금화의 마술사'], rewardPoints: 1000000 },
  { id: 'wth-5b', category: 'withdraw', name: '누적 출금 50억', desc: '누적 출금액 50억 환전 신화', target: 5000000000, current: 0, unit: '원', rewardTitle: '슈퍼리치', grade: '전설', badge: ACHIEVEMENT_BADGES['슈퍼리치'], rewardPoints: 5000000 },
  { id: 'wth-10b', category: 'withdraw', name: '누적 출금 100억', desc: '누적 출금액 100억 환전 신화', target: 10000000000, current: 0, unit: '원', rewardTitle: '출금의 마스터', grade: '신화', badge: ACHIEVEMENT_BADGES['출금의 마스터'], rewardPoints: 10000000 },
  // 카지노
  { id: 'cas-3', category: 'game', gameType: 'casino', name: '카지노 3연승', desc: '라이브 카지노 연속 3승 달성', target: 3, current: 3, unit: '연승', rewardTitle: '승리의 기세', grade: '일반', badge: ACHIEVEMENT_BADGES['승리의 기세'], rewardPoints: 20000 },
  { id: 'cas-5', category: 'game', gameType: 'casino', name: '카지노 5연승', desc: '라이브 카지노 연속 5승 달성', target: 5, current: 0, unit: '연승', rewardTitle: '하이롤러', grade: '레어', badge: ACHIEVEMENT_BADGES['하이롤러'], rewardPoints: 50000 },
  { id: 'cas-7', category: 'game', gameType: 'casino', name: '카지노 7연승', desc: '라이브 카지노 연속 7승 대기록', target: 7, current: 0, unit: '연승', rewardTitle: '황금의 손', grade: '전설', badge: ACHIEVEMENT_BADGES['황금의 손'], rewardPoints: 150000 },
  { id: 'cas-10', category: 'game', gameType: 'casino', name: '카지노 10연승', desc: '라이브 카지노 10연승 무패 신화', target: 10, current: 0, unit: '연승', rewardTitle: '연승의 신', grade: '신화', badge: ACHIEVEMENT_BADGES['연승의 신'], rewardPoints: 500000 },
  // 스포츠
  { id: 'spt-3', category: 'game', gameType: 'sports', name: '스포츠 3폴더 적중', desc: '스포츠 3폴더 조합 적중', target: 3, current: 3, unit: '폴더', rewardTitle: '승부 예측가', grade: '일반', badge: ACHIEVEMENT_BADGES['승부 예측가'], rewardPoints: 20000 },
  { id: 'spt-5', category: 'game', gameType: 'sports', name: '스포츠 5폴더 적중', desc: '스포츠 5폴더 다폴더 적중', target: 5, current: 0, unit: '폴더', rewardTitle: '적중의 묘수', grade: '레어', badge: ACHIEVEMENT_BADGES['적중의 묘수'], rewardPoints: 50000 },
  { id: 'spt-6', category: 'game', gameType: 'sports', name: '스포츠 6폴더 적중', desc: '스포츠 6폴더 다폴더 적중', target: 6, current: 0, unit: '폴더', rewardTitle: '스포츠 전략가', grade: '영웅', badge: ACHIEVEMENT_BADGES['스포츠 전략가'], rewardPoints: 100000 },
  { id: 'spt-8', category: 'game', gameType: 'sports', name: '스포츠 8폴더 적중', desc: '스포츠 8폴더 고배당 적중', target: 8, current: 0, unit: '폴더', rewardTitle: '빅토리 마스터', grade: '전설', badge: ACHIEVEMENT_BADGES['빅토리 마스터'], rewardPoints: 300000 },
  { id: 'spt-10', category: 'game', gameType: 'sports', name: '스포츠 10폴더 적중', desc: '스포츠 10폴더 기적의 올적중', target: 10, current: 0, unit: '폴더', rewardTitle: '스포츠의 신', grade: '신화', badge: ACHIEVEMENT_BADGES['스포츠의 신'], rewardPoints: 1000000 },
  // 슬롯
  { id: 'slt-100', category: 'game', gameType: 'slots', name: '슬롯 100회 스핀', desc: '슬롯 머신 누적 100회 스핀', target: 100, current: 100, unit: '회', rewardTitle: '행운의 릴', grade: '일반', badge: ACHIEVEMENT_BADGES['행운의 릴'], rewardPoints: 10000 },
  { id: 'slt-500', category: 'game', gameType: 'slots', name: '슬롯 500회 스핀', desc: '슬롯 머신 누적 500회 스핀', target: 500, current: 0, unit: '회', rewardTitle: '스핀 매니아', grade: '레어', badge: ACHIEVEMENT_BADGES['스핀 매니아'], rewardPoints: 30000 },
  { id: 'slt-1k', category: 'game', gameType: 'slots', name: '슬롯 1,000회 스핀', desc: '슬롯 머신 누적 1,000회 스핀', target: 1000, current: 0, unit: '회', rewardTitle: '잭팟의 왕', grade: '영웅', badge: ACHIEVEMENT_BADGES['잭팟의 왕'], rewardPoints: 100000 },
  { id: 'slt-5k', category: 'game', gameType: 'slots', name: '슬롯 5,000회 스핀', desc: '슬롯 머신 누적 5,000회 스핀', target: 5000, current: 0, unit: '회', rewardTitle: '메가 볼텍스', grade: '전설', badge: ACHIEVEMENT_BADGES['메가 볼텍스'], rewardPoints: 300000 },
  { id: 'slt-10k', category: 'game', gameType: 'slots', name: '슬롯 10,000회 스핀', desc: '슬롯 머신 누적 10,000회 스핀', target: 10000, current: 0, unit: '회', rewardTitle: '슬롯의 신', grade: '신화', badge: ACHIEVEMENT_BADGES['슬롯의 신'], rewardPoints: 1000000 },
  // 미니게임
  { id: 'mini-3', category: 'game', gameType: 'mini', name: '미니게임 3연승', desc: '미니게임(홀짝/사다리) 연속 3연승', target: 3, current: 3, unit: '연승', rewardTitle: '직관의 승부사', grade: '일반', badge: ACHIEVEMENT_BADGES['직관의 승부사'], rewardPoints: 10000 },
  { id: 'mini-5', category: 'game', gameType: 'mini', name: '미니게임 5연승', desc: '미니게임(홀짝/사다리) 연속 5연승', target: 5, current: 0, unit: '연승', rewardTitle: '예측의 달인', grade: '레어', badge: ACHIEVEMENT_BADGES['예측의 달인'], rewardPoints: 30000 },
  { id: 'mini-7', category: 'game', gameType: 'mini', name: '미니게임 7연승', desc: '미니게임 연속 7연승 질주', target: 7, current: 0, unit: '연승', rewardTitle: '확률의 지배자', grade: '전설', badge: ACHIEVEMENT_BADGES['확률의 지배자'], rewardPoints: 100000 },
  { id: 'mini-10', category: 'game', gameType: 'mini', name: '미니게임 10연승', desc: '미니게임 연속 10연승 달성', target: 10, current: 0, unit: '연승', rewardTitle: '미니게임 황제', grade: '신화', badge: ACHIEVEMENT_BADGES['미니게임 황제'], rewardPoints: 300000 },
];

export const INITIAL_QUEST_DATABASE: Record<'daily' | 'weekly' | 'monthly', QuestItem[]> = {
  daily: [
    { id: 'q-d1', title: '매일 첫 출석체크', desc: '출석부에 출석하고 보너스 받기', icon: '📅', target: 1, current: 1, reward: '1,000P + 10 경험치', done: false },
    { id: 'q-d2', title: '게임 플레이 3회', desc: '카지노/슬롯/미니게임 중 3회 플레이', icon: '🎲', target: 3, current: 2, reward: '3,000P + 30 경험치', done: false },
    { id: 'q-d3', title: '일일 입금 충전 1회', desc: '오늘 1회 이상 입금 신청 완료', icon: '💳', target: 1, current: 0, reward: '5,000P + 50 경험치', done: false },
  ],
  weekly: [
    { id: 'q-w1', title: '주간 개근 출석', desc: '한 주 동안 5일 이상 출석체크', icon: '🏆', target: 5, current: 4, reward: '20,000P + 200 경험치', done: false },
    { id: 'q-w2', title: '주간 50회 베팅 도전', desc: '한 주 동안 게임 베팅 누적 50회', icon: '🎯', target: 50, current: 32, reward: '30,000P + 300 경험치', done: false },
    { id: 'q-w3', title: '주간 지인 1명 추천', desc: '이번 주 지인 1명 초대 가입 완료', icon: '👥', target: 1, current: 0, reward: '50,000P + 500 경험치', done: false },
  ],
  monthly: [
    { id: 'q-m1', title: '월간 25일 출석 마스터', desc: '한 달 동안 25일 이상 출석 달성', icon: '🌟', target: 25, current: 18, reward: '100,000P + 1,000 경험치', done: false },
    { id: 'q-m2', title: 'VIP 회원 등급 유지', desc: '월간 VIP 등급 자격 유지 및 달성', icon: '👑', target: 1, current: 1, reward: '200,000P + 2,000 경험치', done: false },
    { id: 'q-m3', title: '전 종목 정복 100회', desc: '카지노·스포츠·슬롯 통합 100회 달성', icon: '🔥', target: 100, current: 65, reward: '300,000P + 3,000 경험치', done: false },
  ],
};

const ACH_STORAGE_KEY = 'moneyground_claimed_achievements_v2';
const QUEST_STORAGE_KEY = 'moneyground_claimed_quests_v2';

export function getClaimedAchievementIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ACH_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function getClaimedQuestIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEST_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveClaimedAchievementId(id: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getClaimedAchievementIds();
    if (!current.includes(id)) {
      const next = [...current, id];
      localStorage.setItem(ACH_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('mg:achievements-updated'));
      window.dispatchEvent(new Event('storage'));
      return next;
    }
    return current;
  } catch {}
  return [];
}

export function saveClaimedQuestId(id: string): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = getClaimedQuestIds();
    if (!current.includes(id)) {
      const next = [...current, id];
      localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('mg:achievements-updated'));
      window.dispatchEvent(new Event('storage'));
      return next;
    }
    return current;
  } catch {}
  return [];
}

export function calculateUnclaimedCounts(level: number = 13, claimedAchIds: string[], claimedQIds: string[]) {
  const achievements = INITIAL_DETAILED_ACHIEVEMENTS.map(item => {
    if (item.category === 'level') {
      return { ...item, current: Math.max(item.current, level) };
    }
    return item;
  });

  const allQuests = [
    ...INITIAL_QUEST_DATABASE.daily,
    ...INITIAL_QUEST_DATABASE.weekly,
    ...INITIAL_QUEST_DATABASE.monthly,
  ];

  const unclaimedAchievements = achievements.filter(
    item => item.current >= item.target && !claimedAchIds.includes(item.id)
  );

  const unclaimedQuests = allQuests.filter(
    q => q.current >= q.target && !claimedQIds.includes(q.id)
  );

  const byCategory: Record<string, number> = {};
  for (const item of unclaimedAchievements) {
    const cat = item.category === 'game' ? (item.gameType || 'game') : item.category;
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    if (item.category === 'game') {
      byCategory['game'] = (byCategory['game'] || 0) + 1;
    }
  }

  return {
    achievements: unclaimedAchievements.length,
    quests: unclaimedQuests.length,
    total: unclaimedAchievements.length + unclaimedQuests.length,
    byCategory,
  };
}
