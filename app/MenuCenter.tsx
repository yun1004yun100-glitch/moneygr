'use client';

import { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { MenuIcon } from './MenuIcon';
import { DepositCouponPanel } from './DepositCouponPanel';
import { depositCoupons, depositPreview } from './deposit-coupons';
import './coupon-tickets.css';
import './achievement-center.css';
import { triggerAchievementToast, triggerQuestToast } from './useAchievementNotifications';
import {
  INITIAL_DETAILED_ACHIEVEMENTS,
  INITIAL_QUEST_DATABASE,
  getClaimedAchievementIds,
  getClaimedQuestIds,
  saveClaimedAchievementId,
  saveClaimedQuestId,
  calculateUnclaimedCounts,
  type AchievementItem,
  type QuestItem,
} from './achievements-data';

export type MenuScreen =
  | 'deposit' | 'withdraw' | 'coupon'
  | 'events' | 'notice' | 'support' | 'messages'
  | 'attendance' | 'referral' | 'achievement' | 'point' | 'money'
  | 'password' | 'profile' | 'staff' | 'join';

const titles: Record<MenuScreen,string> = {
  deposit:'입금신청', withdraw:'출금신청', coupon:'쿠폰', events:'이벤트', notice:'공지사항',
  support:'고객센터', messages:'쪽지', attendance:'출석부', referral:'지인추천', point:'포인트 전환',
  achievement:'칭호 업적', money:'머니내역', password:'비밀번호 변경', profile:'개인정보수정', staff:'담당자 연결', join:'회원가입',
};

const infoTabs: {key:MenuScreen;label:string;icon:string}[] = [
  {key:'events',label:'이벤트',icon:'▣'},{key:'notice',label:'공지사항',icon:'▤'},
  {key:'support',label:'고객센터',icon:'▧'},{key:'messages',label:'쪽지',icon:'✉'},
];
const financeTabs: {key:MenuScreen;label:string;icon:string}[] = [
  {key:'deposit',label:'입금신청',icon:'●'},{key:'withdraw',label:'출금신청',icon:'▰'},{key:'coupon',label:'쿠폰',icon:'▥'},
];

export function MenuCenter({initial,onClose,onToast,credit,onUpdateCredit,onLogout,userNickname,onUpdateNickname,bets,memberLevel=1,equippedTitle:propTitle,equippedBadge:propBadge,equippedGrade:propGrade,onEquipTitle}:{initial:MenuScreen;onClose:()=>void;onToast:(s:string)=>void;credit:number;onUpdateCredit?:(updater:number|((prev:number)=>number))=>void;onLogout:()=>void;userNickname?:string;onUpdateNickname?:(name:string)=>void;bets?:any[];memberLevel?:number;equippedTitle?:string;equippedBadge?:string;equippedGrade?:string;onEquipTitle?:(t:string,b:string,g:string)=>void}){
  const [screen,setScreen]=useState<MenuScreen>(initial);
  const [detail,setDetail]=useState<string|null>(null);
  const [amount,setAmount]=useState(30000);
  const [couponTab,setCouponTab]=useState<'plus'|'free'|'history'>('plus');
  const [messageOpen,setMessageOpen]=useState(false);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [month,setMonth]=useState(4);

  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',key);document.body.style.overflow='hidden';return()=>{window.removeEventListener('keydown',key);document.body.style.overflow=''}},[onClose]);
  useEffect(()=>{setDetail(null);setMessageOpen(false);setHistoryOpen(false)},[screen]);
  useEffect(()=>{setScreen(initial);},[initial]);

  const isInfo=['events','notice','support','messages'].includes(screen);
  const isFinance=['deposit','withdraw','coupon'].includes(screen);
  const switchScreen=(next:MenuScreen)=>{setScreen(next);setDetail(null)};
  const submit=(text:string)=>(e:React.FormEvent)=>{e.preventDefault();onToast(text)};

  return <div className="mc-backdrop" onMouseDown={onClose}>
    <section className="mc-shell" role="dialog" aria-modal="true" aria-label={titles[screen]} onMouseDown={e=>e.stopPropagation()}>
      <header className="mc-top"><BrandLogo compact/><div className="mc-context">MEMBER CENTER</div><button onClick={onClose} aria-label="닫기">×</button></header>
      {(isInfo||isFinance)&&<nav className="mc-tabs" aria-label="관련 메뉴">{(isInfo?infoTabs:financeTabs).map(t=><button className={screen===t.key?'active':''} onClick={()=>switchScreen(t.key)} key={t.key}><MenuIcon name={t.key}/>{t.label}</button>)}</nav>}
      <div className="mc-title"><h2>{titles[screen]}</h2><i/></div>
      <div className="mc-content">
        {screen==='deposit'&&<Deposit amount={amount} setAmount={setAmount} historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} submit={submit} onToast={onToast}/>} 
        {screen==='withdraw'&&<Withdraw amount={amount} setAmount={setAmount} credit={credit} onUpdateCredit={onUpdateCredit} historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} onToast={onToast}/>} 
        {screen==='coupon'&&<Coupon tab={couponTab} setTab={setCouponTab} onToast={onToast}/>} 
        {screen==='events'&&<Events detail={detail} setDetail={setDetail}/>} 
        {screen==='notice'&&<Notice detail={detail} setDetail={setDetail}/>} 
        {screen==='support'&&<Support onToast={onToast} userNickname={userNickname} bets={bets}/>} 
        {screen==='messages'&&<Messages open={messageOpen} setOpen={setMessageOpen} onToast={onToast}/>} 
        {screen==='attendance'&&<Attendance month={month} setMonth={setMonth} onToast={onToast}/>} 
        {screen==='referral'&&<Referral onToast={onToast}/>} 
        {screen==='achievement'&&<Achievement onToast={onToast} level={memberLevel} equippedTitle={propTitle} equippedBadge={propBadge} equippedGrade={propGrade} onEquipTitle={onEquipTitle}/>} 
        {screen==='point'&&<Point submit={submit}/>} 
        {screen==='money'&&<Money/>} 
        {screen==='password'&&<Password submit={submit}/>} 
        {screen==='profile'&&<><Profile onToast={onToast} userNickname={userNickname} onUpdateNickname={onUpdateNickname}/><button type="button" className="logout profile-logout" onClick={onLogout}>로그아웃</button></>}
        {screen==='staff'&&<Staff submit={submit}/>} 
        {screen==='join'&&<Join submit={submit}/>} 
      </div>
    </section>
  </div>;
}

// 전 카테고리 칭호 / 등급 / 전용 뱃지 통합 레지스트리
export const ALL_TITLES_REGISTRY: Record<string, { grade: string; badge: string; desc: string }> = {
  // 단일 업적 & 퀘스트
  '첫 발걸음': { grade: '일반', badge: '/badges/badge-1.png', desc: '첫 로그인 달성' },
  '모험의 시작': { grade: '일반', badge: '/badges/badge-1.png', desc: '퀘스트 완료 1회 달성' },
  '버그 헌터': { grade: '일반', badge: '/badges/badge-2.png', desc: '오류 보고 1회 달성' },
  '업적 도전자': { grade: '일반', badge: '/badges/badge-9.png', desc: '업적 3개 달성' },
  '업적 수집가': { grade: '영웅', badge: '/badges/badge-10.png', desc: '업적 5개 달성' },
  '업적 마스터': { grade: '신화', badge: '/badges/badge-3.png', desc: '업적 10개 달성' },
  '성실한 모험가': { grade: '레어', badge: '/badges/badge-11.png', desc: '퀘스트 완료 10회 달성' },
  '퀘스트 베테랑': { grade: '영웅', badge: '/badges/badge-12.png', desc: '퀘스트 완료 30회 달성' },
  '미션 해결사': { grade: '전설', badge: '/badges/badge-4.png', desc: '퀘스트 완료 50회 달성' },
  '개척자': { grade: '신화', badge: '/badges/badge-level-1000.png', desc: '퀘스트 완료 100회 달성' },
  // 레벨 달성
  '루키': { grade: '일반', badge: '/badges/badge-1.png', desc: '1레벨 달성' },
  '비기너': { grade: '레어', badge: '/badges/badge-2.png', desc: '100레벨 달성' },
  '준프로': { grade: '영웅', badge: '/badges/badge-9.png', desc: '300레벨 달성' },
  '프로': { grade: '전설', badge: '/badges/badge-4.png', desc: '500레벨 달성' },
  '마스터': { grade: '신화', badge: '/badges/badge-level-1000.png', desc: '최고 1,000레벨 달성' },
  // 지인추천
  '인맥의 시작': { grade: '일반', badge: '/badges/badge-9.png', desc: '지인 1명 추천 가입' },
  '소문난 인싸': { grade: '레어', badge: '/badges/badge-10.png', desc: '지인 3명 추천 가입' },
  '마당발': { grade: '영웅', badge: '/badges/badge-2.png', desc: '지인 5명 추천 가입' },
  '추천회장': { grade: '전설', badge: '/badges/badge-12.png', desc: '지인 7명 추천 가입' },
  '추천의 제왕': { grade: '신화', badge: '/badges/badge-3.png', desc: '지인 10명 추천 달성' },
  // 누적 입금
  '실버 VIP': { grade: '일반', badge: '/badges/badge-11.png', desc: '누적 입금 1,000만 달성' },
  '골드 VIP': { grade: '레어', badge: '/badges/badge-12.png', desc: '누적 입금 5,000만 달성' },
  '다이아 클럽': { grade: '영웅', badge: '/badges/badge-2.png', desc: '누적 입금 1억 달성' },
  '입금의 귀족': { grade: '전설', badge: '/badges/badge-3.png', desc: '누적 입금 3억 달성' },
  '금고의 주인': { grade: '신화', badge: '/badges/badge-4.png', desc: '누적 입금 100억 달성' },
  // 누적 출금
  '짜릿한 승리자': { grade: '일반', badge: '/badges/badge-13.png', desc: '누적 출금 100만 달성' },
  '환전의 달인': { grade: '레어', badge: '/badges/badge-14.png', desc: '누적 출금 5,000만 달성' },
  '현금화의 마술사': { grade: '영웅', badge: '/badges/badge-15.png', desc: '누적 출금 10억 달성' },
  '슈퍼리치': { grade: '전설', badge: '/badges/badge-4.png', desc: '누적 출금 50억 달성' },
  '출금의 마스터': { grade: '신화', badge: '/badges/badge-level-1000.png', desc: '누적 출금 100억 달성' },
  // 카지노
  '승리의 기세': { grade: '일반', badge: '/badges/badge-1.png', desc: '카지노 3연승 달성' },
  '하이롤러': { grade: '레어', badge: '/badges/badge-2.png', desc: '카지노 5연승 달성' },
  '황금의 손': { grade: '전설', badge: '/badges/badge-12.png', desc: '카지노 7연승 달성' },
  '연승의 신': { grade: '신화', badge: '/badges/badge-3.png', desc: '카지노 10연승 신화 달성' },
  // 스포츠
  '승부 예측가': { grade: '일반', badge: '/badges/badge-1.png', desc: '스포츠 3폴더 적중' },
  '적중의 묘수': { grade: '레어', badge: '/badges/badge-2.png', desc: '스포츠 5폴더 적중' },
  '스포츠 전략가': { grade: '영웅', badge: '/badges/badge-7.png', desc: '스포츠 6폴더 적중' },
  '빅토리 마스터': { grade: '전설', badge: '/badges/badge-4.png', desc: '스포츠 8폴더 적중' },
  '스포츠의 신': { grade: '신화', badge: '/badges/badge-8.png', desc: '스포츠 10폴더 적중' },
  // 슬롯
  '행운의 릴': { grade: '일반', badge: '/badges/badge-1.png', desc: '슬롯 머신 100회 스핀' },
  '스핀 매니아': { grade: '레어', badge: '/badges/badge-2.png', desc: '슬롯 머신 500회 스핀' },
  '잭팟의 왕': { grade: '영웅', badge: '/badges/badge-5.png', desc: '슬롯 머신 1,000회 스핀' },
  '메가 볼텍스': { grade: '전설', badge: '/badges/badge-4.png', desc: '슬롯 머신 5,000회 스핀' },
  '슬롯의 신': { grade: '신화', badge: '/badges/badge-6.png', desc: '슬롯 머신 10,000회 스핀' },
  // 미니게임
  '직관의 승부사': { grade: '일반', badge: '/badges/badge-1.png', desc: '미니게임 3연승 달성' },
  '예측의 달인': { grade: '레어', badge: '/badges/badge-9.png', desc: '미니게임 5연승 달성' },
  '확률의 지배자': { grade: '전설', badge: '/badges/badge-12.png', desc: '미니게임 7연승 달성' },
  '미니게임 황제': { grade: '신화', badge: '/badges/badge-3.png', desc: '미니게임 10연승 달성' },
};

function Achievement({onToast,level,equippedTitle:propTitle,equippedBadge:propBadge,equippedGrade:propGrade,onEquipTitle}:{onToast:(s:string)=>void;level:number;equippedTitle?:string;equippedBadge?:string;equippedGrade?:string;onEquipTitle?:(t:string,b:string,g:string)=>void}){
  const [mainTab, setMainTab] = useState<'achievements' | 'quests'>('achievements');
  const [road, setRoad] = useState<'level' | 'referral' | 'deposit' | 'withdraw' | 'casino' | 'sports' | 'slots' | 'mini' | 'single'>('level');
  const [questPeriod, setQuestPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const [equippedTitle, setEquippedTitle] = useState(() => {
    try {
      return window.localStorage.getItem('moneyground_equipped_title') || propTitle || '연승의 신';
    } catch {
      return propTitle || '연승의 신';
    }
  });
  const [equippedBadge, setEquippedBadge] = useState(() => {
    try {
      return window.localStorage.getItem('moneyground_equipped_badge') || propBadge || '/badges/badge-3.png';
    } catch {
      return propBadge || '/badges/badge-3.png';
    }
  });
  const [equippedGrade, setEquippedGrade] = useState(() => {
    try {
      return window.localStorage.getItem('moneyground_equipped_grade') || propGrade || '신화';
    } catch {
      return propGrade || '신화';
    }
  });
  const [claimedIds, setClaimedIds] = useState<string[]>(() => getClaimedAchievementIds());
  const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>(() => getClaimedQuestIds());

  useEffect(() => {
    const handleSync = () => {
      setClaimedIds(getClaimedAchievementIds());
      setClaimedQuestIds(getClaimedQuestIds());
    };
    window.addEventListener('storage', handleSync);
    window.addEventListener('mg:achievements-updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('mg:achievements-updated', handleSync);
    };
  }, []);

  // 세분화된 상세 마일스톤 구간 (유저 설정 유지 + 단일 업적 추가)
  const levelValues = [1, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  const referralValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const depositValues = [0, 10_000_000, 50_000_000, 100_000_000, 300_000_000, 400_000_000, 500_000_000, 600_000_000, 700_000_000, 800_000_000, 900_000_000, 1_000_000_000, 2_000_000_000, 3_000_000_000, 4_000_000_000, 5_000_000_000, 6_000_000_000, 7_000_000_000, 8_000_000_000, 9_000_000_000, 10_000_000_000];
  const withdrawValues = [0, 1_000_000, 5_000_000, 10_000_000, 30_000_000, 50_000_000, 100_000_000, 300_000_000, 500_000_000, 1_000_000_000, 3_000_000_000, 5_000_000_000, 10_000_000_000];
  const casinoValues = [0, 3, 5, 7, 10];
  const miniValues = [0, 3, 5, 7, 10];
  const slotValues = [0, 100, 500, 1000, 3000, 5000, 10000];
  const sportsValues = [0, 3, 4, 5, 6, 7, 8, 9, 10];
  const singleValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  // 2D 로드맵 노드 좌표 (좌우 14%~86% 여백 확보로 글자 잘림 완전 방지)
  const standardPoints = [
    [14, 26], [32, 26], [50, 26], [68, 26], [86, 26],
    [86, 54], [68, 54], [50, 54], [32, 54],
    [18, 76], [50, 84]
  ];
  const depositPoints = depositValues.map((_, index) => {
    const row = Math.floor(index / 5);
    const column = index % 5;
    return [row % 2 === 0 ? 14 + column * 18 : 86 - column * 18, 24 + row * 16];
  });
  const withdrawPoints = withdrawValues.map((_, index) => {
    const row = Math.floor(index / 4);
    const column = index % 4;
    return [row % 2 === 0 ? 14 + column * 24 : 86 - column * 24, 24 + row * 20];
  });
  const sportsPoints = sportsValues.map((_, index) => {
    const row = Math.floor(index / 5);
    const column = index % 5;
    return [row === 0 ? 14 + column * 18 : 86 - (index - 5) * 24, 32 + row * 36];
  });
  const slotPoints = slotValues.map((_, index) => {
    const row = Math.floor(index / 4);
    const column = index % 4;
    return [row === 0 ? 14 + column * 24 : 86 - (index - 4) * 28, 34 + row * 34];
  });
  const fivePoints = [[14, 52], [32, 52], [50, 52], [68, 52], [86, 52]];

  const gameRoad = ['casino', 'sports', 'slots', 'mini'].includes(road);
  const values = road === 'level' ? levelValues
    : road === 'referral' ? referralValues
    : road === 'deposit' ? depositValues
    : road === 'withdraw' ? withdrawValues
    : road === 'casino' ? casinoValues
    : road === 'mini' ? miniValues
    : road === 'slots' ? slotValues
    : road === 'single' ? singleValues
    : sportsValues;

  const points = road === 'deposit' ? depositPoints
    : road === 'withdraw' ? withdrawPoints
    : road === 'slots' ? slotPoints
    : road === 'sports' ? sportsPoints
    : (road === 'casino' || road === 'mini') ? fivePoints
    : standardPoints.slice(0, values.length);

  const current = road === 'level' ? Math.min(1000, Math.max(1, level))
    : road === 'single' ? 1
    : 0;

  const segment = Math.min(
    values.length - 2,
    Math.max(
      0,
      values.findIndex((target, index) => index < values.length - 1 && current >= target && current < values[index + 1])
    )
  );
  const progress = values[segment + 1] === values[segment] ? 0 : (current - values[segment]) / (values[segment + 1] - values[segment]);
  const from = points[segment];
  const to = points[Math.min(segment + 1, points.length - 1)];
  const marker = [from[0] + (to[0] - from[0]) * progress, from[1] + (to[1] - from[1]) * progress];

  const singleStepNames = [
    '도전 시작', '첫 로그인', '오류 보고 1회', '업적 3개 달성',
    '퀘스트 10회', '업적 5개 달성', '퀘스트 30회', '퀘스트 50회',
    '업적 10개 달성', '퀘스트 100회'
  ];

  const label = (value: number) =>
    road === 'level' ? (value === 0 ? '0레벨 시작' : `${value.toLocaleString()}레벨 달성`)
    : road === 'referral' ? (value === 0 ? '추천 시작' : `${value}명 추천`)
    : road === 'deposit' ? (value === 0 ? '입금 시작' : value < 100_000_000 ? `${value / 10_000}만 달성` : `${value / 100_000_000}억 달성`)
    : road === 'withdraw' ? (value === 0 ? '출금 시작' : value < 100_000_000 ? `${value / 10_000}만 달성` : `${value / 100_000_000}억 달성`)
    : road === 'slots' ? (value === 0 ? '스핀 시작' : `${value.toLocaleString()}회 스핀`)
    : road === 'sports' ? (value === 0 ? '도전 시작' : `${value}폴더 성공`)
    : road === 'single' ? singleStepNames[value] || `${value}단계`
    : (value === 0 ? '도전 시작' : `${value}연승`);

  const roadTitle =
    road === 'level' ? '레벨 달성 여정'
    : road === 'referral' ? '지인추천 여정'
    : road === 'deposit' ? '누적 입금 여정'
    : road === 'withdraw' ? '누적 출금 여정'
    : road === 'single' ? '단일 업적 여정'
    : road === 'casino' ? '카지노 연승 여정'
    : road === 'mini' ? '미니게임 연승 여정'
    : road === 'slots' ? '슬롯 누적 스핀 여정'
    : '스포츠 폴더 적중 여정';

  const finalReward =
    road === 'level' ? '마스터 칭호 + 전용 뱃지'
    : road === 'referral' ? '추천의 제왕 칭호 + 전용 뱃지'
    : road === 'deposit' ? '금고의 주인 칭호 + 전용 뱃지'
    : road === 'withdraw' ? '출금의 마스터 칭호 + 전용 뱃지'
    : road === 'single' ? '개척자 칭호 + 전용 뱃지'
    : road === 'slots' ? '슬롯의 신 칭호 + 전용 뱃지'
    : road === 'sports' ? '스포츠의 신 칭호 + 전용 뱃지'
    : '연승의 신 칭호 + 전용 뱃지';

  const rewardNote = (value: number, index: number) => {
    if (road === 'deposit') {
      if (index === values.length - 1) return '금고의 주인 칭호';
      if (value === 10_000_000) return '실버 VIP';
      if (value === 50_000_000) return '골드 VIP';
      if (value === 100_000_000) return '다이아 클럽';
      if (value === 300_000_000) return '입금의 귀족';
      if (value > 0) return '+보상';
    }
    if (road === 'withdraw') {
      if (index === values.length - 1) return '출금의 마스터';
      if (value === 1_000_000) return '짜릿한 승리자';
      if (value === 50_000_000) return '환전의 달인';
      if (value === 1_000_000_000) return '현금화의 마술사';
      if (value === 5_000_000_000) return '슈퍼리치';
      if (value > 0) return '+보상';
    }
    if (road === 'single') {
      if (value === 1) return '첫 발걸음 칭호';
      if (value === 2) return '버그 헌터 칭호';
      if (value === 3) return '업적 도전자';
      if (value === 5) return '업적 수집가';
      if (value === 8) return '업적 마스터';
      if (index === values.length - 1) return '개척자 칭호';
      return '+보상';
    }
    if (road === 'slots') {
      if (value === 100) return '행운의 릴';
      if (value === 500) return '스핀 매니아';
      if (value === 1000) return '잭팟의 왕';
      if (value === 5000) return '메가 볼텍스';
      if (value === 10000) return '슬롯의 신';
      if (value > 0) return '+보상';
    }
    if (road === 'sports') {
      if (value === 3) return '승부 예측가';
      if (value === 5) return '적중의 묘수';
      if (value === 6) return '스포츠 전략가';
      if (value === 8) return '빅토리 마스터';
      if (value === 10) return '스포츠의 신';
      if (value > 0) return '+보상';
    }
    if (road === 'casino') {
      if (value === 3) return '승리의 기세';
      if (value === 5) return '하이롤러';
      if (value === 7) return '황금의 손';
      if (value === 10) return '연승의 신';
      if (value > 0) return '+보상';
    }
    if (road === 'mini') {
      if (value === 3) return '직관의 승부사';
      if (value === 5) return '예측의 달인';
      if (value === 7) return '확률의 지배자';
      if (value === 10) return '미니게임 황제';
      if (value > 0) return '+보상';
    }
    if (road === 'referral') {
      if (value === 1) return '인맥의 시작';
      if (value === 3) return '소문난 인싸';
      if (value === 5) return '마당발';
      if (value === 7) return '추천회장';
      if (value === 10) return '추천의 제왕';
      if (value > 0) return '+보상';
    }
    if (road === 'level') {
      if (value === 1) return '루키 칭호';
      if (value === 100) return '비기너 칭호';
      if (value === 300) return '준프로 칭호';
      if (value === 500) return '프로 칭호';
      if (index === values.length - 1) return '마스터 칭호';
      if (value > 0) return '+보상';
    }
    return undefined;
  };

  // 칭호 등급별 프레임 클래스 매핑
  const getGradeClass = (grade?: string) => {
    if (grade === '신화') return 'title-frame-mythic';
    if (grade === '전설') return 'title-frame-legendary';
    if (grade === '영웅') return 'title-frame-heroic';
    if (grade === '레어' || grade === '희귀') return 'title-frame-rare';
    return 'title-frame-common';
  };

  const isTitleUnlocked = (t: string) => {
    if (t === '연승의 신' || t === '첫 발걸음' || t === '루키') return true;
    if (t === '비기너' && level >= 100) return true;
    if (t === '준프로' && level >= 300) return true;
    if (t === '프로' && level >= 500) return true;
    if (t === '마스터' && level >= 1000) return true;
    return INITIAL_DETAILED_ACHIEVEMENTS.some(ach => ach.rewardTitle === t && claimedIds.includes(ach.id));
  };

  // Titles in wardrobe
  const wardrobeTitles = [
    // 단일 업적 & 퀘스트
    { title: '첫 발걸음', grade: '일반', desc: '첫 로그인 달성', badge: '/badges/badge-1.png', unlocked: isTitleUnlocked('첫 발걸음') },
    { title: '모험의 시작', grade: '일반', desc: '퀘스트 완료 1회 달성', badge: '/badges/badge-1.png', unlocked: isTitleUnlocked('모험의 시작') },
    { title: '버그 헌터', grade: '일반', desc: '오류 보고 1회 달성', badge: '/badges/badge-2.png', unlocked: isTitleUnlocked('버그 헌터') },
    { title: '업적 도전자', grade: '일반', desc: '업적 3개 달성', badge: '/badges/badge-9.png', unlocked: isTitleUnlocked('업적 도전자') },
    { title: '업적 수집가', grade: '영웅', desc: '업적 5개 달성', badge: '/badges/badge-10.png', unlocked: isTitleUnlocked('업적 수집가') },
    { title: '업적 마스터', grade: '신화', desc: '업적 10개 달성', badge: '/badges/badge-3.png', unlocked: isTitleUnlocked('업적 마스터') },
    { title: '성실한 모험가', grade: '레어', desc: '퀘스트 완료 10회 달성', badge: '/badges/badge-11.png', unlocked: isTitleUnlocked('성실한 모험가') },
    { title: '퀘스트 베테랑', grade: '영웅', desc: '퀘스트 완료 30회 달성', badge: '/badges/badge-12.png', unlocked: isTitleUnlocked('퀘스트 베테랑') },
    { title: '미션 해결사', grade: '전설', desc: '퀘스트 완료 50회 달성', badge: '/badges/badge-4.png', unlocked: isTitleUnlocked('미션 해결사') },
    { title: '개척자', grade: '신화', desc: '퀘스트 완료 100회 달성', badge: '/badges/badge-level-1000.png', unlocked: isTitleUnlocked('개척자') },
    // 레벨 달성
    { title: '루키', grade: '일반', desc: '1레벨 달성', badge: '/badges/badge-1.png', unlocked: isTitleUnlocked('루키') },
    { title: '비기너', grade: '레어', desc: '100레벨 달성', badge: '/badges/badge-2.png', unlocked: isTitleUnlocked('비기너') },
    { title: '준프로', grade: '영웅', desc: '300레벨 달성', badge: '/badges/badge-9.png', unlocked: isTitleUnlocked('준프로') },
    { title: '프로', grade: '전설', desc: '500레벨 달성', badge: '/badges/badge-4.png', unlocked: isTitleUnlocked('프로') },
    { title: '마스터', grade: '신화', desc: '최고 1,000레벨 달성', badge: '/badges/badge-level-1000.png', unlocked: isTitleUnlocked('마스터') },
    // 지인추천
    { title: '인맥의 시작', grade: '일반', desc: '지인 1명 추천 가입', badge: '/badges/badge-9.png', unlocked: isTitleUnlocked('인맥의 시작') },
    { title: '소문난 인싸', grade: '레어', desc: '지인 3명 추천 가입', badge: '/badges/badge-10.png', unlocked: isTitleUnlocked('소문난 인싸') },
    { title: '마당발', grade: '영웅', desc: '지인 5명 추천 가입', badge: '/badges/badge-2.png', unlocked: isTitleUnlocked('마당발') },
    { title: '추천회장', grade: '전설', desc: '지인 7명 추천 가입', badge: '/badges/badge-12.png', unlocked: isTitleUnlocked('추천회장') },
    { title: '추천의 제왕', grade: '신화', desc: '지인 10명 추천 달성', badge: '/badges/badge-3.png', unlocked: isTitleUnlocked('추천의 제왕') },
    // 누적 입금
    { title: '실버 VIP', grade: '일반', desc: '누적 입금 1,000만 달성', badge: '/badges/badge-11.png', unlocked: isTitleUnlocked('실버 VIP') },
    { title: '골드 VIP', grade: '레어', desc: '누적 입금 5,000만 달성', badge: '/badges/badge-12.png', unlocked: isTitleUnlocked('골드 VIP') },
    { title: '다이아 클럽', grade: '영웅', desc: '누적 입금 1억 달성', badge: '/badges/badge-2.png', unlocked: isTitleUnlocked('다이아 클럽') },
    { title: '입금의 귀족', grade: '전설', desc: '누적 입금 3억 달성', badge: '/badges/badge-3.png', unlocked: isTitleUnlocked('입금의 귀족') },
    { title: '금고의 주인', grade: '신화', desc: '누적 입금 100억 달성', badge: '/badges/badge-4.png', unlocked: isTitleUnlocked('금고의 주인') },
    // 누적 출금
    { title: '짜릿한 승리자', grade: '일반', desc: '누적 출금 100만 달성', badge: '/badges/badge-13.png', unlocked: isTitleUnlocked('짜릿한 승리자') },
    { title: '환전의 달인', grade: '레어', desc: '누적 출금 5,000만 달성', badge: '/badges/badge-14.png', unlocked: isTitleUnlocked('환전의 달인') },
    { title: '현금화의 마술사', grade: '영웅', desc: '누적 출금 10억 달성', badge: '/badges/badge-15.png', unlocked: isTitleUnlocked('현금화의 마술사') },
    { title: '슈퍼리치', grade: '전설', desc: '누적 출금 50억 달성', badge: '/badges/badge-4.png', unlocked: isTitleUnlocked('슈퍼리치') },
    { title: '출금의 마스터', grade: '신화', desc: '누적 출금 100억 달성', badge: '/badges/badge-level-1000.png', unlocked: isTitleUnlocked('출금의 마스터') },
    // 카지노
    { title: '승리의 기세', grade: '일반', desc: '카지노 3연승 달성', badge: '/badges/badge-1.png', unlocked: isTitleUnlocked('승리의 기세') },
    { title: '하이롤러', grade: '레어', desc: '카지노 5연승 달성', badge: '/badges/badge-2.png', unlocked: isTitleUnlocked('하이롤러') },
    { title: '황금의 손', grade: '전설', desc: '카지노 7연승 달성', badge: '/badges/badge-12.png', unlocked: isTitleUnlocked('황금의 손') },
    { title: '연승의 신', grade: '신화', desc: '카지노 10연승 신화 달성', badge: '/badges/badge-3.png', unlocked: true },
    // 스포츠
    { title: '승부 예측가', grade: '일반', desc: '스포츠 3폴더 적중', badge: '/badges/badge-1.png', unlocked: isTitleUnlocked('승부 예측가') },
    { title: '적중의 묘수', grade: '레어', desc: '스포츠 5폴더 적중', badge: '/badges/badge-2.png', unlocked: isTitleUnlocked('적중의 묘수') },
    { title: '스포츠 전략가', grade: '영웅', desc: '스포츠 6폴더 적중', badge: '/badges/badge-7.png', unlocked: isTitleUnlocked('스포츠 전략가') },
    { title: '빅토리 마스터', grade: '전설', desc: '스포츠 8폴더 적중', badge: '/badges/badge-4.png', unlocked: isTitleUnlocked('빅토리 마스터') },
    { title: '스포츠의 신', grade: '신화', desc: '스포츠 10폴더 적중', badge: '/badges/badge-8.png', unlocked: isTitleUnlocked('스포츠의 신') },
    // 슬롯
    { title: '행운의 릴', grade: '일반', desc: '슬롯 머신 100회 스핀', badge: '/badges/badge-1.png', unlocked: isTitleUnlocked('행운의 릴') },
    { title: '스핀 매니아', grade: '레어', desc: '슬롯 머신 500회 스핀', badge: '/badges/badge-2.png', unlocked: isTitleUnlocked('스핀 매니아') },
    { title: '잭팟의 왕', grade: '영웅', desc: '슬롯 머신 1,000회 스핀', badge: '/badges/badge-5.png', unlocked: isTitleUnlocked('잭팟의 왕') },
    { title: '메가 볼텍스', grade: '전설', desc: '슬롯 머신 5,000회 스핀', badge: '/badges/badge-4.png', unlocked: isTitleUnlocked('메가 볼텍스') },
    { title: '슬롯의 신', grade: '신화', desc: '슬롯 머신 10,000회 스핀', badge: '/badges/badge-6.png', unlocked: isTitleUnlocked('슬롯의 신') },
    // 미니게임
    { title: '직관의 승부사', grade: '일반', desc: '미니게임 3연승 달성', badge: '/badges/badge-1.png', unlocked: isTitleUnlocked('직관의 승부사') },
    { title: '예측의 달인', grade: '레어', desc: '미니게임 5연승 달성', badge: '/badges/badge-9.png', unlocked: isTitleUnlocked('예측의 달인') },
    { title: '확률의 지배자', grade: '전설', desc: '미니게임 7연승 달성', badge: '/badges/badge-12.png', unlocked: isTitleUnlocked('확률의 지배자') },
    { title: '미니게임 황제', grade: '신화', desc: '미니게임 10연승 달성', badge: '/badges/badge-3.png', unlocked: isTitleUnlocked('미니게임 황제') },
  ];

  // Quests database & Detailed achievements
  const questDatabase = INITIAL_QUEST_DATABASE;

  const detailedAchievements: AchievementItem[] = INITIAL_DETAILED_ACHIEVEMENTS.map(item => {
    if (item.category === 'level') {
      return { ...item, current: Math.max(item.current, level) };
    }
    return item;
  });

  const unclaimedCounts = calculateUnclaimedCounts(level, claimedIds, claimedQuestIds);

  // Filter achievements matching the active road
  const currentCategory = road === 'level' ? 'level'
    : road === 'referral' ? 'referral'
    : road === 'deposit' ? 'deposit'
    : road === 'withdraw' ? 'withdraw'
    : road === 'single' ? 'single'
    : 'game';

  const filteredAchievements = detailedAchievements.filter(item => {
    if (currentCategory === 'game') {
      return item.category === 'game' && item.gameType === road;
    }
    return item.category === currentCategory;
  });

  const handleClaim = (item: AchievementItem) => {
    if (!claimedIds.includes(item.id)) {
      const next = saveClaimedAchievementId(item.id);
      setClaimedIds(next);
      triggerAchievementToast({
        id: item.id,
        type: 'achievement',
        title: `${item.name} 달성!`,
        desc: item.desc,
        reward: `+${item.rewardPoints.toLocaleString()}P${item.rewardTitle ? ` · 칭호 【${item.rewardTitle}】 획득!` : ''}`,
        badge: item.badge,
        grade: item.grade,
      });
      if (item.rewardTitle) {
        onToast(`[${item.name}] 보상 ${item.rewardPoints.toLocaleString()}P 수령! 칭호 【${item.rewardTitle}】 획득!`);
      } else {
        onToast(`[${item.name}] 보상 ${item.rewardPoints.toLocaleString()}P를 수령했습니다!`);
      }
    }
  };

  const handleClaimQuest = (q: QuestItem) => {
    if (!claimedQuestIds.includes(q.id)) {
      const next = saveClaimedQuestId(q.id);
      setClaimedQuestIds(next);
      triggerQuestToast({
        id: q.id,
        type: 'quest',
        title: `${q.title} 완료!`,
        desc: q.desc,
        reward: `${q.reward} 획득!`,
        icon: q.icon,
      });
      onToast(`[${q.title}] 퀘스트 보상을 수령했습니다!`);
    }
  };

  const handleEquipTitle = (titleObj: typeof wardrobeTitles[0]) => {
    if (!titleObj.unlocked) {
      onToast('아직 해금되지 않은 칭호입니다.');
      return;
    }
    setEquippedTitle(titleObj.title);
    setEquippedBadge(titleObj.badge);
    setEquippedGrade(titleObj.grade);
    try {
      window.localStorage.setItem('moneyground_equipped_title', titleObj.title);
      window.localStorage.setItem('moneyground_equipped_badge', titleObj.badge);
      window.localStorage.setItem('moneyground_equipped_grade', titleObj.grade);
      window.dispatchEvent(new Event('storage'));
    } catch {}
    onEquipTitle?.(titleObj.title, titleObj.badge, titleObj.grade);
    setWardrobeOpen(false);
    onToast(`칭호를 【${titleObj.title}】(으)로 장착했습니다.`);
  };

  // 칭호 메타정보 자동 동기화 (연승의 신 => 신화 프레임 & 뱃지 매핑)
  const currentGrade = ALL_TITLES_REGISTRY[equippedTitle]?.grade || equippedGrade || '신화';
  const currentBadge = ALL_TITLES_REGISTRY[equippedTitle]?.badge || equippedBadge || '/badges/badge-3.png';

  return (
    <div className="achievement-hub member-achievement-view">
      {/* 1. Header: 내 칭호 프로필 카드 */}
      <section className="achievement-profile-card member-achievement-profile">
        <div className="profile-badge-visual member-achievement-badge">
          <img className="profile-badge-img" src={currentBadge} alt="장착 뱃지" />
        </div>
        <div className="profile-meta">
          <div className="current-title-name">
            <span className={`profile-title-frame-pill ${getGradeClass(currentGrade)}`}>
              【{equippedTitle}】
            </span>
            <span className="current-title-tag">장착 중</span>
          </div>
          <div className="profile-sub">
            <span>{level}레벨</span>
            <div className="profile-progress-bar-wrap">
              <div className="profile-mini-bar">
                <div className="profile-mini-fill" style={{ width: `${Math.min(100, (level / 100) * 100)}%` }} />
              </div>
              <small>다음 칭호까지 {Math.max(0, 500 - level)}레벨</small>
            </div>
          </div>
        </div>
        <button type="button" className="btn-open-wardrobe" onClick={() => setWardrobeOpen(true)}>
          칭호 보관함 / 변경
        </button>
      </section>

      {/* 2. 메인 탭 네비게이션: 좌측 [칭호 & 업적 리스트] / 우측 [퀘스트 센터] */}
      <nav className="achievement-main-nav" aria-label="메인 탭">
        <button
          type="button"
          className={mainTab === 'achievements' ? 'active' : ''}
          onClick={() => setMainTab('achievements')}
        >
          🏆 칭호 & 업적 리스트
          {unclaimedCounts.achievements > 0 && (
            <span className="tab-badge-pill">{unclaimedCounts.achievements}</span>
          )}
        </button>
        <button
          type="button"
          className={mainTab === 'quests' ? 'active' : ''}
          onClick={() => setMainTab('quests')}
        >
          ⚔️ 퀘스트 센터
          {unclaimedCounts.quests > 0 && (
            <span className="tab-badge-pill">{unclaimedCounts.quests}</span>
          )}
        </button>
      </nav>

      {/* 3. 퀘스트 뷰 */}
      {mainTab === 'quests' && (
        <section className="quest-list-container">
          <div className="quest-tabs-row">
            {(['daily', 'weekly', 'monthly'] as const).map(p => {
              const label = p === 'daily' ? '일일 퀘스트' : p === 'weekly' ? '주간 퀘스트' : '월간 퀘스트';
              const pCount = questDatabase[p].filter(q => q.current >= q.target && !claimedQuestIds.includes(q.id)).length;
              return (
                <button
                  key={p}
                  type="button"
                  className={questPeriod === p ? 'active' : ''}
                  onClick={() => setQuestPeriod(p)}
                >
                  {label}
                  {pCount > 0 && <span className="tab-badge-pill tab-badge-mini">{pCount}</span>}
                </button>
              );
            })}
          </div>

          <div className="achievement-section-title">
            <h4>⚔️ {questPeriod === 'daily' ? '일일 미션' : questPeriod === 'weekly' ? '주간 미션' : '월간 미션'} 목록</h4>
            <span>매 자정/기간별 초기화</span>
          </div>

          {questDatabase[questPeriod].map(q => {
            const isReady = q.current >= q.target;
            return (
              <article key={q.id} className={`quest-card ${isReady ? 'completed' : ''}`}>
                <div className="quest-icon-box">{q.icon}</div>
                <div className="card-body">
                  <b className="card-name">{q.title}</b>
                  <p className="card-desc">{q.desc}</p>
                  <div className="card-reward-line">
                    <span>리워드:</span>
                    <span className="point-value">{q.reward}</span>
                  </div>
                  <div className="card-progress-row">
                    <div className="card-progress-bar">
                      <div
                        className="card-progress-fill"
                        style={{ width: `${Math.min(100, (q.current / q.target) * 100)}%` }}
                      />
                    </div>
                    <span className="card-progress-text">{q.current} / {q.target}</span>
                  </div>
                </div>
                <div className="card-action">
                  {claimedQuestIds.includes(q.id) ? (
                    <button type="button" className="btn-card-done" disabled>
                      수령 완료 ✓
                    </button>
                  ) : isReady ? (
                    <button
                      type="button"
                      className="btn-card-claim"
                      onClick={() => handleClaimQuest(q)}
                    >
                      획득하기
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-card-disabled"
                      disabled
                    >
                      진행중 ({q.current}/{q.target})
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* 4. 칭호 & 업적 리스트 (세분화 마일스톤 여정 + 업적 리스트) */}
      {mainTab === 'achievements' && (
        <>
          {/* 세분화 마일스톤 분류 탭: 3개씩 2줄 (총 6개) */}
          <nav className="member-achievement-tabs" aria-label="업적 분류">
            {[
              ['레벨달성', 'level'],
              ['게임', 'casino'],
              ['입금', 'deposit'],
              ['출금', 'withdraw'],
              ['지인추천', 'referral'],
              ['단일 업적', 'single'],
            ].map(([tab, key]) => {
              const catKey = tab === '게임' ? 'game' : key;
              const catCount = unclaimedCounts.byCategory[catKey] || 0;
              return (
                <button
                  type="button"
                  className={(tab === '게임' ? gameRoad : road === key) ? 'active' : ''}
                  onClick={() => setRoad((tab === '게임' ? 'casino' : key) as any)}
                  key={tab}
                >
                  {tab}
                  {catCount > 0 && <span className="tab-badge-pill tab-badge-mini">{catCount}</span>}
                </button>
              );
            })}
          </nav>

          {/* 게임 선택 시 세부 게임 탭 */}
          {gameRoad && (
            <nav className="member-game-achievement-tabs" aria-label="게임 업적 분류">
              {[
                ['카지노', 'casino'],
                ['스포츠', 'sports'],
                ['슬롯', 'slots'],
                ['미니게임', 'mini'],
              ].map(([tab, key]) => {
                const count = unclaimedCounts.byCategory[key] || 0;
                return (
                  <button
                    type="button"
                    className={road === key ? 'active' : ''}
                    onClick={() => setRoad(key as any)}
                    key={key}
                  >
                    {tab}
                    {count > 0 && <span className="tab-badge-pill tab-badge-mini">{count}</span>}
                  </button>
                );
              })}
            </nav>
          )}

          {/* 세분화 마일스톤 여정 맵 (단일 업적 카테고리는 로드맵 없이 리스트만 표시) */}
          {road !== 'single' && (
            <>
              <section
                className={`member-level-map ${road === 'deposit' ? 'member-deposit-road' : road === 'withdraw' ? 'member-withdraw-road' : ''}`}
                aria-label={`${roadTitle} 진행 경로`}
              >
                <header>
                  <b>{roadTitle}</b>
                  <small>
                    {road === 'level' ? `현재 위치 ${current.toLocaleString()}레벨`
                      : road === 'referral' ? '현재 추천 0명'
                      : road === 'deposit' ? '현재 누적 입금 0원'
                      : road === 'withdraw' ? '현재 누적 출금 0원'
                      : road === 'slots' ? '현재 누적 스핀 0회'
                      : '현재 연승 0회'}
                  </small>
                </header>

                <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <polyline points={points.map(p => p.join(',')).join(' ')} />
                </svg>

                {values.map((target, index) => {
                  const note = rewardNote(target, index);
                  const isFinalNode = index === values.length - 1;
                  const matchedAchievement = detailedAchievements.find(item => {
                    if (road === 'casino' || road === 'sports' || road === 'slots' || road === 'mini') {
                      return item.category === 'game' && item.gameType === road && item.target === target;
                    }
                    return item.category === road && item.target === target;
                  });

                  const hasBadge = !!matchedAchievement?.badge || isFinalNode;
                  const badgeSrc = matchedAchievement?.badge || (road === 'level' ? '/badges/badge-level-1000.png' : '/badges/badge-3.png');

                  return (
                    <div
                      key={target}
                      className={`member-level-node ${current >= target ? 'complete' : ''} ${isFinalNode ? 'final' : ''} ${hasBadge ? 'badge-reward' : ''}`}
                      style={{ left: `${points[index][0]}%`, top: `${points[index][1]}%` }}
                    >
                      {hasBadge ? (
                        <img className={isFinalNode ? 'member-final-badge' : 'member-milestone-badge'} src={badgeSrc} alt={`${label(target)} 보상 뱃지`} />
                      ) : (
                        <i />
                      )}
                      <b>{label(target)}</b>
                      {note && <small className={note.includes('칭호') ? 'title-reward' : ''}>{note}</small>}
                    </div>
                  );
                })}

                <span className="member-level-marker" style={{ left: `${marker[0]}%`, top: `${marker[1]}%` }} />
              </section>

              {/* 마일스톤 달성 보상 배너 */}
              <footer className="member-level-reward">
                <span>
                  {road === 'level' ? '1,000레벨'
                    : road === 'referral' ? '추천 10명'
                    : road === 'deposit' ? '누적 입금 100억'
                    : road === 'withdraw' ? '누적 출금 100억'
                    : road === 'slots' ? '누적 10,000회 스핀'
                    : road === 'sports' ? '10폴더 적중'
                    : '10연승'} 달성 보상
                </span>
                <b>{finalReward}</b>
                <small>
                  {road === 'deposit' ? '3억 달성 시 입금의 귀족 칭호를 먼저 지급합니다.'
                    : road === 'withdraw' ? '10억 달성 시 현금화의 마술사 칭호를 먼저 지급합니다.'
                    : '각 구간 달성 시 리워드와 칭호가 지급됩니다.'}
                </small>
              </footer>
            </>
          )}

          {/* 전용 업적 리스트 (Achievement Cards) */}
          <section className="achievement-list-container">
            <div className="achievement-section-title">
              <h4>
                <span>📋</span> {road === 'single' ? '단일' : roadTitle.replace(' 여정', '')} 업적 리스트
              </h4>
              <span>달성 {filteredAchievements.filter(i => i.current >= i.target).length} / {filteredAchievements.length}</span>
            </div>

            {filteredAchievements.map(item => {
              const isDone = item.current >= item.target;
              const isClaimed = claimedIds.includes(item.id);
              const progressPct = Math.min(100, Math.floor((item.current / item.target) * 100));

              return (
                <article
                  key={item.id}
                  className={`achievement-card ${isClaimed ? 'is-completed' : isDone ? 'is-ready' : ''}`}
                >
                  <div className="card-badge-box">
                    <img src={item.badge} alt={item.name} />
                  </div>

                  <div className="card-body">
                    <div className="card-header-row">
                      <span className="card-category-tag">
                        {item.category === 'level' ? '레벨'
                          : item.category === 'game' ? `게임 · ${item.gameType}`
                          : item.category === 'deposit' ? '입금'
                          : item.category === 'withdraw' ? '출금'
                          : item.category === 'single' ? '단일'
                          : '지인추천'}
                      </span>
                      {item.rewardTitle && (
                        <span className={`card-title-reward-pill ${getGradeClass(item.grade)}`}>
                          【{item.rewardTitle}】
                        </span>
                      )}
                    </div>
                    <h4 className="card-name">{item.name}</h4>
                    <p className="card-desc">{item.desc}</p>
                    <div className="card-reward-line">
                      <span>보상:</span>
                      <span className="point-value">+{item.rewardPoints.toLocaleString()}P</span>
                      {item.rewardTitle && <span>+ 전용 뱃지 & 칭호</span>}
                    </div>

                    <div className="card-progress-row">
                      <div className="card-progress-bar">
                        <div className="card-progress-fill" style={{ width: `${progressPct}%` }} />
                      </div>
                      <span className="card-progress-text">
                        {item.current.toLocaleString()} / {item.target.toLocaleString()}{item.unit} ({progressPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="card-action">
                    {isClaimed ? (
                      <button type="button" className="btn-card-done" disabled>
                        달성 완료 ✓
                      </button>
                    ) : isDone ? (
                      <button
                        type="button"
                        className="btn-card-claim"
                        onClick={() => handleClaim(item)}
                      >
                        획득하기
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-card-disabled"
                        disabled
                      >
                        획득하기
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}

      {/* 5. 칭호 보관함 모달 */}
      {wardrobeOpen && (
        <div className="wardrobe-backdrop" onClick={() => setWardrobeOpen(false)}>
          <div className="wardrobe-modal" onClick={e => e.stopPropagation()}>
            <header className="wardrobe-header">
              <h3>👑 내 칭호 보관함 ({wardrobeTitles.filter(t => t.unlocked).length}개 보유)</h3>
              <button type="button" className="close" onClick={() => setWardrobeOpen(false)}>×</button>
            </header>
            <div className="wardrobe-list">
              {wardrobeTitles.filter(t => t.unlocked).map(t => {
                const isEquipped = equippedTitle === t.title;
                return (
                  <div
                    key={t.title}
                    className={`wardrobe-item ${isEquipped ? 'equipped' : ''}`}
                  >
                    <img src={t.badge} alt={t.title} />
                    <div className="info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                        <span className={`card-title-reward-pill ${getGradeClass(t.grade)}`}>
                          【{t.title}】
                        </span>
                        <small style={{ display: 'inline', fontWeight: 800, color: t.grade === '신화' ? '#ff3366' : t.grade === '전설' ? '#ffd700' : t.grade === '영웅' ? '#a8ff78' : t.grade === '레어' ? '#00f0ff' : '#88d7cf' }}>
                          [{t.grade}]
                        </small>
                      </div>
                      <small>{t.desc}</small>
                    </div>
                    <div>
                      {isEquipped ? (
                        <span className="equipped-badge">장착 중</span>
                      ) : (
                        <button
                          type="button"
                          className="btn-equip"
                          onClick={() => handleEquipTitle(t)}
                        >
                          장착하기
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {wardrobeTitles.filter(t => t.unlocked).length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 10px', color: '#8da9a3', fontSize: '13px' }}>
                  획득한 칭호가 없습니다. 업적을 완료하고 칭호를 획득해보세요!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AmountPicker({amount,setAmount}:{amount:number;setAmount:(n:number)=>void}){
  return <><label className="mc-field"><span>신청 금액</span><div><input type="number" min="0" value={amount} onChange={e=>setAmount(Number(e.target.value))}/><b>원</b></div></label><div className="amount-buttons">{[30000,50000,100000,300000,500000,1000000].map(n=><button type="button" onClick={()=>setAmount(n)} key={n}>{n>=10000?`${n/10000}만`:n}</button>)}<button type="button" className="reset" onClick={()=>setAmount(0)}>정정하기</button></div></>;
}

function Deposit({amount,setAmount,historyOpen,setHistoryOpen,submit,onToast}:{amount:number;setAmount:(n:number)=>void;historyOpen:boolean;setHistoryOpen:(v:boolean)=>void;submit:(s:string)=>(e:React.FormEvent)=>void;onToast:(s:string)=>void}){
  const [couponId,setCouponId]=useState('');
  const [depositMethod,setDepositMethod]=useState('계좌입금');
  const [giftPin,setGiftPin]=useState('');
  useEffect(()=>{if(depositMethod!=='상품권 입금')setGiftPin('');},[depositMethod]);
  useEffect(()=>{if(couponId&&!depositPreview(amount,couponId).eligible)setCouponId('');},[amount,couponId]);
  function handleDepositSubmit(e:React.FormEvent) {
    e.preventDefault();
    if(depositMethod==='상품권 입금'&&!/^[0-9]{16}$/.test(giftPin)){onToast('상품권 핀번호 16자리를 입력해주세요.');return;}
    const preview=depositPreview(amount,couponId);
    if(!preview.valid){onToast('입금 금액을 1원 이상의 정수로 입력해주세요.');return;}
    if(couponId&&!preview.eligible){setCouponId('');onToast('쿠폰 조건을 확인해주세요.');return;}
    onToast(`입금 ${amount.toLocaleString()}원 + 쿠폰 ${preview.bonus.toLocaleString()}원 = ${preview.total.toLocaleString()}원 충전 예정 (샘플 미리보기)`);
    triggerQuestToast({
      id: 'q-d3',
      type: 'quest',
      title: '일일 입금 충전 1회 달성!',
      desc: '오늘 1회 이상 입금 신청 완료',
      reward: '5,000P + 50 경험치 획득!',
      icon: '💳',
    });
  }
  return <div className="mc-flow"><div className="deposit-method-buttons" role="group" aria-label="입금 방식 선택">{['계좌입금','가상계좌 입금','상품권 입금'].map(method=><button type="button" key={method} aria-pressed={depositMethod===method} className={depositMethod===method?'selected':''} onClick={()=>setDepositMethod(method)}>{method}</button>)}</div><p className="deposit-method-selected">선택한 입금 방식: <b>{depositMethod}</b></p>{depositMethod!=='상품권 입금'&&<div className="mc-alert"><span>i</span><p><b>입금 전용 계좌를 확인해주세요.</b> 정확한 입금자명과 신청금액을 입력하세요.</p><button onClick={()=>onToast('전용 계좌 안내를 확인했습니다.')}>전용 계좌 확인</button></div>}<section className="mc-guide"><b>입금 주의사항</b><h3>입금(충전) 안내</h3><p>입금자명과 신청금액을 확인한 뒤 신청해주세요.</p><p>신청 내역은 아래의 내역 버튼에서 상태별로 확인할 수 있습니다.</p></section><form className="mc-form" onSubmit={handleDepositSubmit}>{depositMethod==='상품권 입금'&&<section className="gift-pin-section"><button type="button" className="kp-link-button" disabled title="KP 주소 등록 후 이용할 수 있습니다">KP 링크 이동하기 ↗</button><small>KP 연결 주소 등록 대기 중</small><label className="mc-field"><span>핀번호 입력하기</span><p id="gift-pin-help">상품권에 표시된 숫자 16자리를 입력해주세요.</p><input type="text" inputMode="numeric" pattern="[0-9]{16}" minLength={16} maxLength={16} required value={giftPin} onChange={e=>setGiftPin(e.target.value.replace(/[^0-9]/g,'').slice(0,16))} placeholder="16자리 핀번호 입력" autoComplete="off" spellCheck={false} aria-describedby="gift-pin-help gift-pin-count"/></label><span id="gift-pin-count" className="gift-pin-count">{giftPin.length} / 16자리</span></section>}<div className="history-head"><span/><button type="button" onClick={()=>setHistoryOpen(!historyOpen)}>▤ 입금내역</button></div>{historyOpen&&<History kind="입금"/>}<label className="mc-field"><span>입금자명</span><input defaultValue="그라운더"/></label><label className="mc-field"><span>휴대폰번호</span><input defaultValue="010-0000-0000"/></label><div className="bonus-choice"><span>보너스 선택</span><label><input type="radio" name="bonus" defaultChecked/> 충전 포인트 받기</label><label><input type="radio" name="bonus"/> 충전 포인트 안받기</label></div><AmountPicker amount={amount} setAmount={setAmount}/><DepositCouponPanel amount={amount} couponId={couponId} onChange={setCouponId}/><div className="mc-actions">{depositMethod!=='상품권 입금'&&<button type="button" className="accent" onClick={()=>onToast('전용 계좌를 확인했습니다.')}>계좌확인</button>}<button className="danger">입금신청</button><button type="button" onClick={()=>setAmount(0)}>취소</button></div></form></div>;
}

const WITHDRAW_COOLDOWN_MS = 3 * 60 * 60 * 1000; // 3 hours

function Withdraw({
  amount,
  setAmount,
  credit,
  onUpdateCredit,
  historyOpen,
  setHistoryOpen,
  onToast,
}: {
  amount: number;
  setAmount: (n: number) => void;
  credit: number;
  onUpdateCredit?: (updater: number | ((prev: number) => number)) => void;
  historyOpen: boolean;
  setHistoryOpen: (v: boolean) => void;
  onToast: (s: string) => void;
}) {
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [tipModalOpen, setTipModalOpen] = useState(false);
  const [tipAmount, setTipAmount] = useState<number>(10000);
  const [tipConfirmOpen, setTipConfirmOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (tipConfirmOpen) setTipConfirmOpen(false);
        else if (tipModalOpen) setTipModalOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tipConfirmOpen, tipModalOpen]);

  useEffect(() => {
    const updateCooldown = () => {
      try {
        const lastTimeStr = localStorage.getItem('mg_last_withdraw_completed_time');
        if (lastTimeStr) {
          const lastTime = parseInt(lastTimeStr, 10);
          if (!isNaN(lastTime)) {
            const elapsed = Date.now() - lastTime;
            const remaining = Math.max(0, WITHDRAW_COOLDOWN_MS - elapsed);
            setCooldownRemaining(remaining);
            return;
          }
        }
        setCooldownRemaining(0);
      } catch {
        setCooldownRemaining(0);
      }
    };

    updateCooldown();
    const timer = setInterval(updateCooldown, 1000);
    return () => clearInterval(timer);
  }, []);

  const isCooldown = cooldownRemaining > 0;

  const formatRemaining = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}시간 ${m}분 ${s}초`;
    if (m > 0) return `${m}분 ${s}초`;
    return `${s}초`;
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCooldown) {
      onToast(`환전후 재환전은 3시간 대기후 가능합니다. (남은 시간: ${formatRemaining(cooldownRemaining)})`);
      return;
    }
    if (!amount || amount <= 0) {
      onToast('출금 신청 금액을 1원 이상 입력해주세요.');
      return;
    }
    if (amount > credit) {
      onToast('보유금보다 큰 금액은 출금할 수 없습니다.');
      return;
    }

    const now = Date.now();
    try {
      localStorage.setItem('mg_last_withdraw_completed_time', String(now));
    } catch {}
    setCooldownRemaining(WITHDRAW_COOLDOWN_MS);
    setAmount(0);
    setWithdrawPassword('');
    onToast('출금신청이 접수되었습니다. 환전후 재환전은 3시간 대기후 가능합니다.');
  };

  return (
    <div className="mc-flow">
      <section className="mc-guide">
        <b>확인 및 필독사항</b>
        <h3>출금신청 안내</h3>
        <p>신청 금액과 등록 계좌 정보를 확인한 뒤 출금신청을 진행해주세요.</p>
        <p>※ 환전 신청 완료 후 재환전은 3시간 대기 후 가능합니다.</p>
      </section>
      <form className="mc-form" onSubmit={handleWithdrawSubmit}>
        <div className="history-head withdraw-history-head">
          <button
            type="button"
            className="tip-open-btn"
            onClick={() => {
              setTipAmount(10000);
              setTipModalOpen(true);
            }}
          >
            담당 팁주기
          </button>
          <button type="button" onClick={() => setHistoryOpen(!historyOpen)}>
            ▤ 출금내역
          </button>
        </div>
        {historyOpen && <History kind="출금" />}

        {tipModalOpen && (
          <div className="tip-modal-backdrop" onMouseDown={() => setTipModalOpen(false)}>
            <div
              className="tip-modal-card"
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="담당 팁주기"
            >
              <div className="tip-modal-header">
                <h3>담당 팁주기</h3>
                <button
                  type="button"
                  className="tip-close-btn"
                  onClick={() => setTipModalOpen(false)}
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>

              <div className="tip-guide-box">
                <p className="tip-guide-msg">
                  담당자에게 감사를 전해주세요
                </p>
                <div className="tip-current-balance">
                  <span>보유 머니</span>
                  <b>{credit.toLocaleString()} 원</b>
                </div>
              </div>

              <div className="tip-amount-section">
                <span className="tip-section-label">팁 금액 선택</span>
                <div className="tip-amount-buttons" role="group" aria-label="팁 금액 선택">
                  {[10000, 50000, 100000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      className={`tip-btn-preset ${tipAmount === amt ? 'active' : ''}`}
                      onClick={() => setTipAmount(amt)}
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <div className="tip-selected-display">
                  <span>전달할 팁</span>
                  <strong>{tipAmount.toLocaleString()} <i>원</i></strong>
                </div>
              </div>

              <div className="tip-modal-actions">
                <button
                  type="button"
                  className="btn-tip-submit"
                  onClick={() => {
                    if (tipAmount <= 0) {
                      onToast('팁 금액을 선택해주세요.');
                      return;
                    }
                    if (tipAmount > credit) {
                      onToast('보유 머니가 부족합니다.');
                      return;
                    }
                    setTipConfirmOpen(true);
                  }}
                >
                  팁주기
                </button>
                <button
                  type="button"
                  className="btn-tip-cancel"
                  onClick={() => setTipModalOpen(false)}
                >
                  취소하기
                </button>
              </div>
            </div>
          </div>
        )}

        {tipConfirmOpen && (
          <div className="tip-confirm-backdrop" onMouseDown={() => setTipConfirmOpen(false)}>
            <div
              className="tip-confirm-dialog"
              onMouseDown={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="팁 전달 확인"
            >
              <h4>정말 팁을 주시겠습니까?</h4>
              <p className="tip-confirm-amount-badge">
                전달 팁: <strong>{tipAmount.toLocaleString()} 원</strong>
              </p>
              <p className="tip-confirm-warning">
                ※ 보유 금액에서 즉시 차감 되십니다
              </p>
              <div className="tip-confirm-actions">
                <button
                  type="button"
                  className="btn-confirm-yes"
                  onClick={() => {
                    if (tipAmount > credit) {
                      onToast('보유 머니가 부족합니다.');
                      setTipConfirmOpen(false);
                      return;
                    }
                    if (onUpdateCredit) {
                      onUpdateCredit((prev) => prev - tipAmount);
                    } else {
                      try {
                        const nextCredit = Math.max(0, credit - tipAmount);
                        localStorage.setItem('moneyground_member_credit', String(nextCredit));
                        window.dispatchEvent(new Event('storage'));
                      } catch {}
                    }
                    onToast(`담당 실장님께 팁 ${tipAmount.toLocaleString()}원을 전달하였습니다. 감사합니다!`);
                    setTipConfirmOpen(false);
                    setTipModalOpen(false);
                  }}
                >
                  확인
                </button>
                <button
                  type="button"
                  className="btn-confirm-no"
                  onClick={() => setTipConfirmOpen(false)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
        <label className="mc-field">
          <span>보유금</span>
          <input readOnly value={credit.toLocaleString()} />
        </label>
        <label className="mc-field">
          <span>은행명</span>
          <input readOnly value="머니그라운드 은행" />
        </label>
        <label className="mc-field">
          <span>계좌번호</span>
          <input readOnly value="000-****-0000" />
        </label>
        <AmountPicker amount={amount} setAmount={setAmount} />
        <label className="mc-field">
          <span>환전 비밀번호</span>
          <input
            type="password"
            placeholder="환전 비밀번호 입력"
            value={withdrawPassword}
            onChange={(e) => setWithdrawPassword(e.target.value)}
          />
        </label>
        <div className="mc-actions">
          <button className="danger" type="submit" disabled={isCooldown}>
            {isCooldown ? '환전 대기중' : '출금신청'}
          </button>
          <button type="button" onClick={() => setAmount(0)}>
            취소
          </button>
        </div>
        <p className={`withdraw-cooldown-notice ${isCooldown ? 'in-cooldown' : ''}`}>
          <span>환전후 재환전은 3시간 대기후 가능합니다</span>
          {isCooldown && (
            <b className="cooldown-timer">
              (남은 시간: {formatRemaining(cooldownRemaining)})
            </b>
          )}
        </p>
      </form>
    </div>
  );
}

function History({kind}:{kind:string}){return <div className="history-box"><div><b>금액</b><b>상태</b><b>날짜</b></div>{[[30000,'완료'],[50000,'대기중'],[100000,'취소']].map((x,i)=><div key={i}><span>{Number(x[0]).toLocaleString()}</span><span className={x[1]==='완료'?'ok':x[1]==='취소'?'no':''}>{x[1]}</span><span>26-08-{28-i}</span></div>)}<small>{kind} 신청 내역입니다.</small></div>}

function Coupon({tab,setTab,onToast}:{tab:'plus'|'free'|'history';setTab:(t:'plus'|'free'|'history')=>void;onToast:(s:string)=>void}){
  const plusCoupons = depositCoupons;
  const freeCoupons = [
    { amount: 10000, req: '조건 없이 즉시 사용 가능' },
    { amount: 20000, req: '조건 없이 즉시 사용 가능' },
    { amount: 30000, req: '출석 및 미션 달성 보상' },
  ];
  const list = tab === 'free' ? freeCoupons : plusCoupons;
  const couponTypeLabel = tab === 'free' ? '지원금 쿠폰' : '입금 플러스 쿠폰';

  return (
    <div>
      <div className="sub-tabs">
        <button className={tab==='plus'?'active':''} onClick={()=>setTab('plus')}>입금 플러스</button>
        <button className={tab==='free'?'active':''} onClick={()=>setTab('free')}>지원금 쿠폰</button>
        <button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>쿠폰 사용내역</button>
      </div>
      {tab==='history' ? (
        <div className="mc-table">
          <div><b>쿠폰종류</b><b>쿠폰명</b><b>쿠폰금액</b><b>사용일자</b><b>상태</b></div>
          {['웰컴 쿠폰','주간 미션 쿠폰','출석 쿠폰'].map((x,i)=>(
            <div key={x}>
              <span>{i?'지원금 쿠폰':'입금 플러스'}</span>
              <span>{x}</span>
              <span>{(5000*(i+1)).toLocaleString()} 원</span>
              <span>26-08-{26+i}</span>
              <span className={i===2?'expired':''}>{i===2?'만료':'사용완료'}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mg-ticket-grid">
          {list.map((c)=>(
            <article key={c.amount} className={`mg-ticket mg-ticket--${tab}`}>
              <span className="mg-ticket-label">{couponTypeLabel}</span>
              <strong className="mg-ticket-value">{c.amount.toLocaleString()}<small>원</small></strong>
              <p className="mg-ticket-condition">{c.req}</p>
              <button className="mg-ticket-use" type="button" aria-label={`${couponTypeLabel} ${c.amount.toLocaleString()}원 사용하기`} onClick={()=>onToast(`${c.amount.toLocaleString()}원 쿠폰을 사용했습니다.`)}>사용하기 <span aria-hidden="true">→</span></button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Events({detail,setDetail}:{detail:string|null;setDetail:(s:string|null)=>void}){
  const items=[['출석체크 이벤트','매일 접속하고 특별 배지를 모아보세요','▣'],['주간활동 이벤트','이번 주 플레이 미션을 확인하세요','777'],['친구추천 이벤트','함께 즐기는 멤버 라운지','◎'],['레벨업 이벤트','활동에 따라 새로운 배지가 열립니다','↑']];
  if(detail)return <Detail back={()=>setDetail(null)} title={detail}><div className="event-poster"><span>WEEKLY ACTIVITIES</span><strong>777</strong><h3>주간활동 이벤트</h3><p>일주일 동안 미션을 완료하면 포인트와 배지를 받을 수 있습니다.</p><ul><li>이벤트 조건과 지급 일정은 공지사항에서 확인할 수 있습니다.</li><li>미션 완료 상태는 활동 내역에 저장됩니다.</li></ul></div></Detail>;
  return <div className="event-grid">{items.map(x=><button onClick={()=>setDetail(x[0])} key={x[0]}><span>{x[2]}</span><h3>{x[0]}</h3><p>{x[1]}</p><i>자세히 보기 →</i></button>)}</div>;
}

function Notice({detail,setDetail}:{detail:string|null;setDetail:(s:string|null)=>void}){
  const items=['머니그라운드 서비스 안내','개인 통신 환경 및 영상관련 안내','쿠폰 사용 방법 및 안내','입출금 이용 규정','첫 이용 및 재이용 보너스 안내'];
  if(detail)return <Detail back={()=>setDetail(null)} title={detail}><div className="article-copy"><p>머니그라운드 이용에 필요한 안내입니다.</p><p>머니, 쿠폰, 배당 및 이용 내역은 회원 상태에 따라 표시됩니다.</p><p>문의가 필요한 경우 고객센터 메뉴에서 새 문의를 작성할 수 있습니다.</p></div></Detail>;
  return <div className="board"><div><b>번호</b><b>제목</b><b>게시일</b></div>{items.map((x,i)=><button onClick={()=>setDetail(x)} key={x}><span>{i<2?'★':i+1}</span><b>{x}</b><time>26-08-{28-i}</time></button>)}</div>;
}
function Detail({back,title,children}:{back:()=>void;title:string;children:React.ReactNode}){return <div><button className="back-btn" onClick={back}>‹ 목록으로</button><div className="detail-head"><b>{title}</b><time>26-08-28</time></div><section className="detail-body">{children}</section></div>}

interface SupportInquiry {
  id: string;
  category: string;
  title: string;
  content: string;
  createdAt: string;
  status: '대기중' | '답변완료';
  adminReply?: {
    author: string;
    repliedAt: string;
    content: string;
  } | null;
  attachedBet?: {
    match: string;
    pick: string;
    odds: number;
    stake: number;
    time: string;
  } | null;
}

const defaultInquiries: SupportInquiry[] = [
  {
    id: 'inq-1',
    category: '계좌요청',
    title: '[계좌요청] 입금 전용 안전 가상계좌 발급 요청합니다.',
    content: '입금 전용 안전 가상계좌 발급 요청드립니다.\n\n- 회원 닉네임: 그라운더\n- 입금 예정 금액: 100,000 원\n- 입금자 성명: 김그라운드\n\n안전 계좌 확인 부탁드립니다.',
    createdAt: '26-09-07 14:10',
    status: '답변완료',
    adminReply: {
      author: '머니그라운드 고객센터 지원팀',
      repliedAt: '26-09-07 14:12',
      content: '안녕하세요, 회원님. 머니그라운드 1:1 고객센터입니다.\n\n요청하신 회원 전용 안전 가상계좌를 발급해 드렸습니다.\n\n■ 은행명: 신한은행\n■ 계좌번호: 110-482-992810\n■ 예금주: (주)엠지페이먼트\n\n※ 해당 계좌는 30분 동안 유효한 1회용 안전 가상계좌이오니, 30분 이내에 입금신청 금액과 동일하게 송금해 주시기 바랍니다.\n이용 중 궁금하신 사항은 언제든 문의 남겨주세요. 감사합니다.',
    },
  },
  {
    id: 'inq-2',
    category: '배팅문의',
    title: '[배팅문의] 프리미어리그 아스널 vs 첼시 경기 정산 확인 요청',
    content: '어제 진행된 경기 베팅 내역 정산 여부 문의드립니다.\n\n[첨부된 배팅 정보]\n• 대상 경기: 프리미어리그 [아스널 vs 첼시]\n• 선택 픽: 아스널 승 (배당 2.45)\n• 배팅 금액: 50,000 원\n• 접수 시각: 26-09-06 20:15\n\n정상 정산 반영되었는지 확인 부탁드립니다.',
    createdAt: '26-09-06 22:30',
    status: '답변완료',
    adminReply: {
      author: '스포츠 정산 운영팀',
      repliedAt: '26-09-06 22:35',
      content: '안녕하세요, 회원님. 머니그라운드 스포츠 운영팀입니다.\n\n문의하신 프리미어리그 [아스널 vs 첼시] 경기는 2:1 아스널 승리로 공식 확인되어 정상 당첨 처리(122,500원) 완료되었습니다.\n\n회원님의 보유금에 즉시 지급 반영되었으며, [머니내역] 메뉴에서 상세 변동 내역을 확인하실 수 있습니다. 이용해 주셔서 감사합니다.',
    },
    attachedBet: {
      match: '프리미어리그 아스널 vs 첼시',
      pick: '아스널 승',
      odds: 2.45,
      stake: 50000,
      time: '26-09-06 20:15',
    },
  },
  {
    id: 'inq-3',
    category: '이용문의',
    title: '빅휠 룰렛 쿠폰 사용 및 프리미엄 참여 기준 문의',
    content: '매일 지급되는 빅휠 룰렛 쿠폰 사용 유효기간과 프리미엄 룰렛 참여 조건에 대해 자세히 알고 싶습니다.',
    createdAt: '26-09-07 15:45',
    status: '대기중',
    adminReply: null,
  },
];

function Support({onToast,userNickname,bets}:{onToast:(s:string)=>void;userNickname?:string;bets?:any[]}){
  const [mode,setMode]=useState<'list'|'write'|'detail'>('list');
  const [inquiries,setInquiries]=useState<SupportInquiry[]>(()=>{
    if(typeof window==='undefined') return defaultInquiries;
    try{
      const raw=window.localStorage.getItem('moneyground_support_inquiries');
      if(raw){
        const parsed=JSON.parse(raw);
        if(Array.isArray(parsed)&&parsed.length>0) return parsed;
      }
    }catch{}
    return defaultInquiries;
  });
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [category,setCategory]=useState<string>('일반문의');
  const [draftTitle,setDraftTitle]=useState('');
  const [draftContent,setDraftContent]=useState('');
  const [attachedBetInfo,setAttachedBetInfo]=useState<{match:string;pick:string;odds:number;stake:number;time:string}|null>(null);

  const categories=['계좌요청','배팅문의','충환전','이용문의','기타'];

  const saveInquiries=(list:SupportInquiry[])=>{
    setInquiries(list);
    try{
      window.localStorage.setItem('moneyground_support_inquiries',JSON.stringify(list));
    }catch{}
  };

  const handleRequestAccount=()=>{
    setCategory('계좌요청');
    setDraftTitle('[계좌요청] 입금 전용 안전 가상계좌 발급 요청합니다.');
    setDraftContent(`[입금 전용 안전 가상계좌 발급 요청]\n- 회원 닉네임: ${userNickname||'그라운더'}\n- 입금 예정 금액: 50,000 원\n- 입금자 성명: (입금하실 예금주 성명을 입력해주세요)\n\n※ 안전하고 신속한 충전을 위해 회원 전용 안전 가상계좌 발급을 요청합니다.`);
    onToast('계좌요청 양식이 자동 입력되었습니다.');
  };

  const handleAttachBet=()=>{
    const activeBet=bets&&bets.length>0?bets[0]:null;
    const now=new Date();
    const nowStr=`${String(now.getFullYear()).slice(2)}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const betData=activeBet?{
      match:activeBet.title||'K LEAGUE 울산 vs 전북',
      pick:activeBet.pick||'홈 승',
      odds:activeBet.odd||2.15,
      stake:50000,
      time:nowStr,
    }:{
      match:'프리미어리그 아스널 vs 첼시',
      pick:'아스널 승',
      odds:2.45,
      stake:50000,
      time:nowStr,
    };
    setAttachedBetInfo(betData);
    setCategory('배팅문의');
    if(!draftTitle){
      setDraftTitle(`[배팅문의] ${betData.match} 배팅 내역 정산 확인 요청`);
    }
    const betSnippet=`\n\n[첨부된 최근 배팅 내역]\n• 대상 경기: ${betData.match}\n• 선택 픽: ${betData.pick} (배당 ${betData.odds.toFixed(2)})\n• 배팅 금액: ${betData.stake.toLocaleString()} 원\n• 접수 시각: ${betData.time}\n• 상태: 경기 종료 / 정산 결과 확인 요청`;
    setDraftContent(prev=>prev?prev+betSnippet:`아래 첨부된 배팅 내역 확인 부탁드립니다.`+betSnippet);
    onToast('최근 배팅내역이 본문에 첨부되었습니다.');
  };

  const handleSubmit=(e:React.FormEvent)=>{
    e.preventDefault();
    if(!draftTitle.trim()||!draftContent.trim()){
      onToast('제목과 내용을 모두 입력해주세요.');
      return;
    }
    const now=new Date();
    const dateStr=`${String(now.getFullYear()).slice(2)}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const newInq:SupportInquiry={
      id:`inq-${Date.now()}`,
      category,
      title:draftTitle.trim(),
      content:draftContent.trim(),
      createdAt:dateStr,
      status:'대기중',
      adminReply:null,
      attachedBet:attachedBetInfo,
    };
    const updated=[newInq,...inquiries];
    saveInquiries(updated);
    setDraftTitle('');
    setDraftContent('');
    setAttachedBetInfo(null);
    setMode('list');
    onToast('문의가 정상 접수되었습니다. (답변 대기중)');
  };

  const handleDelete=(id:string,e?:React.MouseEvent)=>{
    if(e)e.stopPropagation();
    const updated=inquiries.filter(x=>x.id!==id);
    saveInquiries(updated);
    if(selectedId===id){
      setSelectedId(null);
      setMode('list');
    }
    onToast('문의 내역이 삭제되었습니다.');
  };

  const handleSimulateAdminReply=(id:string)=>{
    const target=inquiries.find(x=>x.id===id);
    if(!target)return;
    const now=new Date();
    const dateStr=`${String(now.getFullYear()).slice(2)}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    let replyText='안녕하세요, 회원님. 머니그라운드 1:1 고객센터입니다.\n\n문의하신 내용을 확인하였으며 담당 부서에서 신속하게 확인 및 처리 완료하였습니다.\n이용 중 추가로 궁금하신 사항은 언제든 새 문의를 남겨주시기 바랍니다. 감사합니다.';
    if(target.category==='계좌요청'){
      replyText='안녕하세요, 회원님. 머니그라운드 1:1 고객센터입니다.\n\n요청하신 회원 전용 안전 가상계좌를 발급해 드렸습니다.\n\n■ 은행명: 우리은행\n■ 계좌번호: 1002-392-881920\n■ 예금주: (주)엠지인터내셔널\n\n※ 해당 계좌는 30분 동안 유효한 안전 계좌이오니, 30분 이내에 입금신청 금액과 동일하게 송금해 주시기 바랍니다. 감사합니다.';
    }else if(target.category==='배팅문의'){
      replyText='안녕하세요, 회원님. 머니그라운드 스포츠 정산 운영팀입니다.\n\n첨부해 주신 배팅 내역을 공식 경기 기록과 대조하여 정상 확인하였습니다. 적중 처리가 완료되어 보유금으로 즉시 지급되었으니 [머니내역] 메뉴에서 확인 부탁드립니다.';
    }
    const updated=inquiries.map(item=>item.id===id?{
      ...item,
      status:'답변완료' as const,
      adminReply:{
        author:target.category==='배팅문의'?'스포츠 정산 운영팀':'고객센터 운영지원팀',
        repliedAt:dateStr,
        content:replyText,
      }
    }:item);
    saveInquiries(updated);
    onToast('관리자 답변이 등록되었습니다!');
  };

  if(mode==='write'){
    return (
      <div className="support-write-wrap">
        <button className="back-btn" onClick={()=>setMode('list')}>‹ 문의 목록으로</button>
        
        {/* Quick Action Buttons */}
        <div className="support-quick-bar">
          <button type="button" className="support-quick-btn account" onClick={handleRequestAccount}>
            <span>🏦</span> [계좌요청]
          </button>
          <button type="button" className="support-quick-btn betting" onClick={handleAttachBet}>
            <span>📋</span> [배팅내역 첨부]
          </button>
        </div>

        {/* Category Chips */}
        <div className="support-category-row">
          {categories.map(c=>(
            <button
              type="button"
              key={c}
              className={`support-category-btn ${category===c?'active':''}`}
              onClick={()=>setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <form className="support-write" onSubmit={handleSubmit}>
          <input
            required
            value={draftTitle}
            onChange={e=>setDraftTitle(e.target.value)}
            placeholder="문의 제목을 입력해주세요"
          />
          <textarea
            required
            value={draftContent}
            onChange={e=>setDraftContent(e.target.value)}
            placeholder="문의 내용을 상세히 입력해주세요. (실제 금융 비밀번호 등 민감정보는 입력하지 마세요)"
          />
          {attachedBetInfo&&(
            <div className="support-bet-ticket">
              <div className="support-bet-ticket-title">✓ 최근 배팅내역 첨부 완료</div>
              <div className="support-bet-ticket-row"><span>경기</span><b>{attachedBetInfo.match}</b></div>
              <div className="support-bet-ticket-row"><span>선택</span><b>{attachedBetInfo.pick} ({attachedBetInfo.odds.toFixed(2)})</b></div>
              <div className="support-bet-ticket-row"><span>베팅금액</span><b>{attachedBetInfo.stake.toLocaleString()} 원</b></div>
            </div>
          )}
          <div className="mc-actions">
            <button className="accent">문의 등록</button>
            <button type="button" onClick={()=>setMode('list')}>취소</button>
          </div>
        </form>
      </div>
    );
  }

  if(mode==='detail'&&selectedId){
    const inquiry=inquiries.find(x=>x.id===selectedId);
    if(!inquiry){
      return (
        <div>
          <p>문의 내역을 찾을 수 없습니다.</p>
          <button className="back-btn" onClick={()=>setMode('list')}>‹ 문의 목록</button>
        </div>
      );
    }

    return (
      <div className="support-detail-wrap">
        <div className="support-detail-top-bar">
          <button className="back-btn" onClick={()=>setMode('list')}>‹ 문의 목록</button>
          <button type="button" className="support-item-del-btn" onClick={()=>handleDelete(inquiry.id)}>
            삭제하기 ✕
          </button>
        </div>

        {/* 1. User Inquiry Card */}
        <article className="support-user-card">
          <div className="support-user-header">
            <div className="support-user-meta">
              <span className={`support-item-badge ${inquiry.status==='답변완료'?'answered':'pending'}`}>
                {inquiry.status}
              </span>
              <span className="support-item-category">[{inquiry.category}]</span>
              <span className="support-item-date">{inquiry.createdAt}</span>
            </div>
            <small style={{color:'var(--dim)'}}>{userNickname||'회원'} 님</small>
          </div>
          <h3 className="support-user-title">{inquiry.title}</h3>
          <div className="support-user-content">{inquiry.content}</div>

          {inquiry.attachedBet&&(
            <div className="support-bet-ticket">
              <div className="support-bet-ticket-title">📋 첨부된 배팅 정보</div>
              <div className="support-bet-ticket-row"><span>경기</span><b>{inquiry.attachedBet.match}</b></div>
              <div className="support-bet-ticket-row"><span>선택</span><b>{inquiry.attachedBet.pick} ({inquiry.attachedBet.odds.toFixed(2)})</b></div>
              <div className="support-bet-ticket-row"><span>베팅금</span><b>{inquiry.attachedBet.stake.toLocaleString()} 원</b></div>
              <div className="support-bet-ticket-row"><span>접수시각</span><b>{inquiry.attachedBet.time}</b></div>
            </div>
          )}
        </article>

        {/* 2. Admin Reply Card */}
        <article className={`support-admin-card ${inquiry.status==='대기중'?'pending':''}`}>
          <div className="support-admin-header">
            <div className="support-admin-badge">
              <span>🛡️</span>
              <b>{inquiry.adminReply?.author||'머니그라운드 고객센터'}</b>
              <em>{inquiry.status==='답변완료'?'공식답변':'확인중'}</em>
            </div>
            {inquiry.adminReply&&<span className="support-item-date">{inquiry.adminReply.repliedAt}</span>}
          </div>

          {inquiry.status==='답변완료'&&inquiry.adminReply?(
            <div className="support-admin-content">
              {inquiry.adminReply.content}
            </div>
          ):(
            <div className="support-admin-pending-msg">
              <p><b>⏳ 고객센터 담당자가 접수된 문의를 확인하고 있습니다.</b></p>
              <p style={{margin:'6px 0 0',fontSize:'11.5px',color:'#b29c66'}}>
                회원님의 문의가 정상 접수되어 상담원에게 배정되었습니다.<br/>
                신속히 확인 후 답변드리겠습니다. (평균 소요 시간: 3~5분)
              </p>
              <button
                type="button"
                className="support-admin-simulate-btn"
                onClick={()=>handleSimulateAdminReply(inquiry.id)}
              >
                ⚡ 관리자 즉시 답변 시뮬레이션
              </button>
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Action Buttons at top of List */}
      <div className="support-quick-bar">
        <button
          type="button"
          className="support-quick-btn account"
          onClick={()=>{handleRequestAccount();setMode('write');}}
        >
          <span>🏦</span> [계좌요청]
        </button>
        <button
          type="button"
          className="support-quick-btn betting"
          onClick={()=>{handleAttachBet();setMode('write');}}
        >
          <span>📋</span> [배팅내역 첨부]
        </button>
      </div>

      <div className="support-list-container">
        {inquiries.length===0?(
          <div style={{textAlign:'center',padding:'40px 10px',color:'var(--muted)'}}>
            <p>남긴 고객센터 문의 내역이 없습니다.</p>
          </div>
        ):(
          inquiries.map(item=>(
            <div
              key={item.id}
              className="support-card-item"
              onClick={()=>{setSelectedId(item.id);setMode('detail');}}
            >
              <span className={`support-item-badge ${item.status==='답변완료'?'answered':'pending'}`}>
                {item.status}
              </span>
              <div className="support-item-body">
                <div className="support-item-meta">
                  <span className="support-item-category">[{item.category}]</span>
                  <span className="support-item-date">{item.createdAt}</span>
                </div>
                <div className="support-item-title">{item.title}</div>
              </div>
              <button
                type="button"
                className="support-item-del-btn"
                onClick={e=>handleDelete(item.id,e)}
                title="문의 삭제"
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>

      <div className="support-actions">
        <button
          type="button"
          className="support-new-btn"
          onClick={()=>{
            setDraftTitle('');
            setDraftContent('');
            setAttachedBetInfo(null);
            setCategory('일반문의');
            setMode('write');
          }}
        >
          ＋ 새 문의 남기기
        </button>
      </div>
    </div>
  );
}

function Messages({open,setOpen,onToast}:{open:boolean;setOpen:(v:boolean)=>void;onToast:(s:string)=>void}){
  return <div><div className="board messages"><div><b>받은시간</b><b>제목</b><b>상태</b></div><button onClick={()=>setOpen(true)}><span>26-08-28 16:42</span><b>회원님, 새로운 미션을 확인하세요.</b><time className="unread">안읽음</time></button><button onClick={()=>setOpen(true)}><span>26-08-27 12:15</span><b>출석 배지가 지급되었습니다.</b><time>읽음</time></button></div>{open&&<section className="message-body"><p>회원님, 오늘의 주간활동 미션이 준비되었습니다. 이벤트 메뉴에서 내용을 확인해주세요.</p></section>}<div className="board-actions"><button onClick={()=>onToast('모든 쪽지를 읽음 처리했습니다.')}>전체읽음</button><button onClick={()=>onToast('쪽지를 전체 삭제했습니다.')}>전체삭제</button></div></div>;
}

function Attendance({month,setMonth,onToast}:{month:number;setMonth:(n:number)=>void;onToast:(s:string)=>void}){
  const [done, setDone] = useState<number[]>([1,3,5,6,9,12,14,15,17,18,20,22,23,24,29,30]);
  const handleCheck = (day: number) => {
    if (done.includes(day)) {
      onToast(`${month}월 ${day}일은 이미 출석 완료된 날짜입니다.`);
    } else {
      setDone(prev => [...prev, day]);
      triggerQuestToast({
        id: 'q-d1',
        type: 'quest',
        title: '매일 첫 출석체크 완료!',
        desc: `${month}월 ${day}일 출석체크 성공!`,
        reward: '1,000P + 10 경험치 획득!',
        icon: '📅',
      });
      onToast(`${month}월 ${day}일 출석체크 완료! (1,000P 지급)`);
    }
  };
  return <div><div className="calendar-head"><button onClick={()=>setMonth(Math.max(1,month-1))}>‹ 이전</button><h3>2026년 {String(month).padStart(2,'0')}월</h3><button onClick={()=>setMonth(Math.min(12,month+1))}>다음 ›</button></div><div className="calendar"><div className="week">{['월','화','수','목','금','토','일'].map(x=><b key={x}>{x}</b>)}</div><div className="days">{Array.from({length:35},(_,i)=>i<2||i>31?<span key={i}/>:<button className={done.includes(i-1)?'done':''} onClick={()=>handleCheck(i-1)} key={i}><small>{i-1}</small><i>MG</i><b>{done.includes(i-1)?'출석완료':'미출석'}</b></button>)}</div></div></div>;
}

function Referral({onToast}:{onToast:(s:string)=>void}){return <div><div className="referral-summary"><span>나의 추천 코드</span><strong>MG-GROUND-26</strong><button onClick={()=>onToast('추천 코드를 복사했습니다.')}>코드 복사</button></div><p className="center-copy">현재 총 <b>8명</b>의 지인을 추천했습니다.</p><div className="mc-table compact-table"><div><b>No.</b><b>아이디</b><b>최종 접속일자</b></div>{['abcd3301','ground02','orbit29d','play00dm','wave22'].map((x,i)=><div key={x}><span>{i+1}</span><span>{x}</span><span>26.08.{28-i} 12:32</span></div>)}</div></div>}

function Point({submit}:{submit:(s:string)=>(e:React.FormEvent)=>void}){return <form className="point-box" onSubmit={submit('포인트 5,000 P가 머니로 전환되었습니다.')}><div><small>지원금</small><strong>18,500 <b>P</b></strong></div><span>→</span><div><small>전환 후 머니</small><strong>23,500 <b>원</b></strong></div><label className="mc-field"><span>전환할 포인트</span><input defaultValue="5000"/></label><button>포인트 전환하기</button><p>출석, 미션, 지인추천으로 받은 포인트를 전환할 수 있습니다.</p></form>}

function Money(){return <div><div className="money-summary"><div><small>보유금</small><strong>12,000 원</strong></div><div><small>지원금</small><strong>18,500 P</strong></div><div><small>이번 달 활동</small><strong>24건</strong></div></div><div className="mc-table money-table"><div><b>구분</b><b>내용</b><b>변동</b><b>잔액</b><b>날짜</b></div>{[['베팅','K LEAGUE 픽','-1,000','11,000'],['충전','머니 충전','+1,000','12,000'],['쿠폰','출석 쿠폰 사용','+5,000','11,000'],['당첨','스포츠 결과','+2,500','6,000']].map((x,i)=><div key={i}><span>{x[0]}</span><span>{x[1]}</span><span className={x[2][0]==='+'?'plus':'minus'}>{x[2]} 원</span><span>{x[3]} 원</span><span>08.{28-i}</span></div>)}</div></div>}

function Password({submit}:{submit:(s:string)=>(e:React.FormEvent)=>void}){return <form className="profile-form" onSubmit={submit('비밀번호가 변경되었습니다.')}><label className="mc-field"><span>기존 비밀번호</span><input type="password" required/></label><label className="mc-field"><span>신규 비밀번호</span><input type="password" required placeholder="영문·숫자·특수문자 조합"/></label><label className="mc-field"><span>신규 비밀번호 확인</span><input type="password" required/></label><div className="mc-actions"><button className="danger">변경하기</button><button type="reset">취소</button></div></form>}

function Profile({onToast,userNickname,onUpdateNickname}:{onToast:(s:string)=>void;userNickname?:string;onUpdateNickname?:(name:string)=>void}){
  const [nickname,setNickname]=useState(userNickname||'그라운더');
  const [currentPw,setCurrentPw]=useState('');
  const [newPw,setNewPw]=useState('');
  const [confirmPw,setConfirmPw]=useState('');

  const handleSave=(e:React.FormEvent)=>{
    e.preventDefault();
    if(!nickname.trim()){
      onToast('닉네임을 입력해주세요.');
      return;
    }
    if(newPw||confirmPw||currentPw){
      if(!currentPw){
        onToast('기존 비밀번호를 입력해주세요.');
        return;
      }
      if(newPw!==confirmPw){
        onToast('신규 비밀번호가 일치하지 않습니다.');
        return;
      }
      if(newPw.length<6){
        onToast('신규 비밀번호는 6자 이상이어야 합니다.');
        return;
      }
      if(onUpdateNickname)onUpdateNickname(nickname.trim());
      onToast('닉네임 및 비밀번호가 성공적으로 변경되었습니다.');
      setCurrentPw('');setNewPw('');setConfirmPw('');
    }else{
      if(onUpdateNickname)onUpdateNickname(nickname.trim());
      onToast('닉네임이 성공적으로 변경되었습니다.');
    }
  };

  return (
    <form className="profile-form" onSubmit={handleSave}>
      <label className="mc-field">
        <span>아이디</span>
        <input readOnly disabled value="grounder" style={{opacity:0.65,cursor:'not-allowed',backgroundColor:'#0e1617',borderColor:'#223537'}} title="아이디는 변경할 수 없습니다."/>
        <small style={{display:'block',marginTop:'4px',fontSize:'11px',color:'#718c89'}}>* 아이디는 변경할 수 없습니다.</small>
      </label>
      <label className="mc-field">
        <span>닉네임</span>
        <input value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="변경할 닉네임 입력" maxLength={12} required/>
      </label>
      <label className="mc-field">
        <span>휴대폰번호</span>
        <input readOnly disabled value="010-****-0000" style={{opacity:0.65,cursor:'not-allowed',backgroundColor:'#0e1617',borderColor:'#223537'}}/>
      </label>
      <div style={{margin:'20px 0 12px',borderTop:'1px solid rgba(126,235,217,0.18)',paddingTop:'16px'}}>
        <b style={{display:'block',color:'#7cebd9',fontSize:'13px',marginBottom:'12px',fontWeight:800}}>비밀번호 변경 (선택)</b>
        <label className="mc-field">
          <span>기존 비밀번호</span>
          <input type="password" value={currentPw} onChange={e=>setCurrentPw(e.target.value)} placeholder="현재 비밀번호 입력"/>
        </label>
        <label className="mc-field">
          <span>신규 비밀번호</span>
          <input type="password" value={newPw} onChange={e=>setNewPw(e.target.value)} placeholder="변경할 새 비밀번호 입력 (6자 이상)"/>
        </label>
        <label className="mc-field">
          <span>신규 비밀번호 확인</span>
          <input type="password" value={confirmPw} onChange={e=>setConfirmPw(e.target.value)} placeholder="신규 비밀번호 재입력"/>
        </label>
      </div>
      <p className="field-note">회원 정보는 안전하게 암호화되어 관리됩니다.</p>
      <div className="mc-actions">
        <button type="submit" className="danger">저장하기</button>
        <button type="button" onClick={()=>{setNickname(userNickname||'그라운더');setCurrentPw('');setNewPw('');setConfirmPw('');}}>취소</button>
      </div>
    </form>
  );
}

function Staff({submit}:{submit:(s:string)=>(e:React.FormEvent)=>void}){return <div className="staff-box"><div className="agent-card"><span>MG</span><div><b>머니그라운드 지원팀</b><small><i/> 상담 가능 · 평균 응답 3분</small></div></div><form onSubmit={submit('담당자에게 문의를 보냈습니다.')}><textarea required placeholder="문의 내용을 입력해주세요."/><button>담당자에게 문의하기</button></form></div>}

function Join({submit}:{submit:(s:string)=>(e:React.FormEvent)=>void}){return <form className="join-grid" onSubmit={submit('머니그라운드 회원가입이 완료되었습니다.')}><label className="mc-field"><span>아이디</span><input required placeholder="4자 이상 영문·숫자"/></label><label className="mc-field"><span>닉네임</span><input required placeholder="한글·영문·숫자"/></label><label className="mc-field"><span>비밀번호</span><input required type="password"/></label><label className="mc-field"><span>비밀번호 확인</span><input required type="password"/></label><label className="mc-field"><span>휴대폰번호</span><input required placeholder="010-0000-0000"/></label><label className="mc-field"><span>이메일</span><input required type="email"/></label><label className="join-check"><input required type="checkbox"/> 만 19세 이상이며 이용약관에 동의합니다.</label><button>회원가입</button></form>}
