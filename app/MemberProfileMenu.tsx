'use client';

import { useEffect, useRef, useState } from 'react';
import './member-profile-menu.css';

export function MemberProfileMenu({ nickname, onHistory, onProfile }: {
  nickname: string; onHistory: () => void; onProfile: () => void;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    element?.showModal();
    const media = window.matchMedia('(max-width: 720px)');
    const onResize = () => { if (!media.matches) setOpen(false); };
    media.addEventListener('change', onResize);
    return () => { media.removeEventListener('change', onResize); element?.close(); };
  }, [open]);
  const select = (action: () => void) => { setOpen(false); action(); };
  return <>
    <button type="button" className="profile-btn" aria-label="프로필 마이메뉴" aria-haspopup="dialog" aria-expanded={open}
      onClick={() => window.matchMedia('(max-width: 720px)').matches ? setOpen(true) : onProfile()}>
      <span aria-label="프로필"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></span><b>{nickname}</b>
    </button>
    {open && <dialog ref={dialog} className="member-profile-dialog" aria-labelledby="member-profile-dialog-title" onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="member-profile-dialog-content">
        <header><h2 id="member-profile-dialog-title">내 프로필</h2><button type="button" onClick={() => setOpen(false)} aria-label="프로필 메뉴 닫기">×</button></header>
        <p>{nickname} 님</p>
        <button type="button" className="member-profile-link" onClick={() => select(onHistory)}><span>배팅내역</span><span aria-hidden="true">→</span></button>
        <button type="button" className="member-profile-link" onClick={() => select(onProfile)}><span>개인정보 수정</span><span aria-hidden="true">→</span></button>
      </div>
    </dialog>}
  </>;
}
