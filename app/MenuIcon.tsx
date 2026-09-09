import type { CSSProperties } from 'react';
import './menu-icons.css';

const icons:Record<string,string>={deposit:'deposit',withdraw:'withdraw',coupon:'coupon',events:'event',notice:'notice',referral:'friend',attendance:'check',achievement:'star',support:'cs',messages:'message',profile:'mypage',point:'point'};

export function MenuIcon({name}:{name:string}) {
  const file=icons[name];
  if(!file)return null;
  return <span className="mg-menu-pictogram" aria-hidden="true" style={{'--menu-icon':`url("/menu-icons/${file}.png")`} as CSSProperties}/>;
}
