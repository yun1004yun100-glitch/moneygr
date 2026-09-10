import type { MenuScreen } from './MenuCenter';
import './member-desktop-navigation.css';

type MemberView = 'home' | 'casino' | 'sports' | 'mini';
type Props = {
  view: string;
  menuScreen: MenuScreen | null;
  supportOpen: boolean;
  achievementCount: number;
  services: readonly { screen: MenuScreen; label: string }[];
  onNavigate: (view: MemberView) => void;
  onMenu: (screen: MenuScreen) => void;
  onCommunity: () => void;
  onSupport: () => void;
  onSupportFund: () => void;
  onBettingHistory: () => void;
  onBigWheel: () => void;
};

const primaryScreens = new Set<MenuScreen>(['events', 'achievement', 'coupon', 'support']);

export function MemberDesktopNavigation({ view, menuScreen, supportOpen, achievementCount, services, onNavigate, onMenu, onCommunity, onSupport, onSupportFund, onBettingHistory, onBigWheel }: Props) {
  const count = (value: number) => value > 0 ? <span className="member-nav-count" aria-label={`${value}개 알림`}>{value > 99 ? '99+' : value}</span> : null;
  const active = (selected: boolean) => selected ? 'active' : undefined;
  return <>
    <nav className="member-primary-nav" aria-label="회원 주요 메뉴">
      {([['home', '홈'], ['casino', '카지노'], ['sports', '스포츠'], ['mini', '미니게임']] as const).map(([target, label]) =>
        <button type="button" key={target} className={active(!menuScreen && view === target)} onClick={() => onNavigate(target)}>{label}</button>)}
      <button type="button" className={active(!menuScreen && view === 'bigwheel')} onClick={onBigWheel}>빅휠</button>
      <button type="button" className={active(menuScreen === 'events')} onClick={() => onMenu('events')}>이벤트</button>
      <button type="button" className={active(menuScreen === 'achievement')} onClick={() => onMenu('achievement')}>칭호/업적{count(achievementCount)}</button>
      <button type="button" className={active(menuScreen === 'coupon')} onClick={() => onMenu('coupon')}>쿠폰{count(2)}</button>
      <button type="button" className={active(!menuScreen && view === 'community')} onClick={onCommunity}>커뮤니티</button>
      <button type="button" className={active(supportOpen || menuScreen === 'support')} onClick={onSupport}>고객센터</button>
    </nav>
    <nav className="member-service-nav" aria-label="회원 서비스 바로가기">
      {services.filter(item => !primaryScreens.has(item.screen)).map(item =>
        <button type="button" key={item.screen} className={active(menuScreen === item.screen)} onClick={() => onMenu(item.screen)}>{item.label}</button>)}
      <button type="button" className={active(!menuScreen && view === 'bettingHistory')} onClick={onBettingHistory}>배팅내역</button>
      <button type="button" className={active(menuScreen === 'money')} onClick={() => onMenu('money')}>머니내역</button>
      <button type="button" onClick={onSupportFund}>지원금 안내</button>
      <button type="button" className={active(menuScreen === 'profile')} onClick={() => onMenu('profile')}>마이페이지</button>
    </nav>
  </>;
}
