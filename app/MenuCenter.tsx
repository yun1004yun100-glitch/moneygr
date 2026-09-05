'use client';

import { useEffect, useState } from 'react';
import { BrandLogo } from './BrandLogo';

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

export function MenuCenter({initial,onClose,onToast,credit}:{initial:MenuScreen;onClose:()=>void;onToast:(s:string)=>void;credit:number}){
  const [screen,setScreen]=useState<MenuScreen>(initial);
  const [detail,setDetail]=useState<string|null>(null);
  const [amount,setAmount]=useState(30000);
  const [couponTab,setCouponTab]=useState<'plus'|'free'|'history'>('plus');
  const [supportMode,setSupportMode]=useState<'list'|'write'|'detail'>('list');
  const [messageOpen,setMessageOpen]=useState(false);
  const [historyOpen,setHistoryOpen]=useState(false);
  const [month,setMonth]=useState(4);

  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose()};window.addEventListener('keydown',key);document.body.style.overflow='hidden';return()=>{window.removeEventListener('keydown',key);document.body.style.overflow=''}},[onClose]);
  useEffect(()=>{setDetail(null);setSupportMode('list');setMessageOpen(false);setHistoryOpen(false)},[screen]);

  const isInfo=['events','notice','support','messages'].includes(screen);
  const isFinance=['deposit','withdraw','coupon'].includes(screen);
  const switchScreen=(next:MenuScreen)=>{setScreen(next);setDetail(null)};
  const submit=(text:string)=>(e:React.FormEvent)=>{e.preventDefault();onToast(text)};

  return <div className="mc-backdrop" onMouseDown={onClose}>
    <section className="mc-shell" role="dialog" aria-modal="true" aria-label={titles[screen]} onMouseDown={e=>e.stopPropagation()}>
      <header className="mc-top"><BrandLogo compact/><div className="mc-context">MEMBER CENTER</div><button onClick={onClose} aria-label="닫기">×</button></header>
      {(isInfo||isFinance)&&<nav className="mc-tabs" aria-label="관련 메뉴">{(isInfo?infoTabs:financeTabs).map(t=><button className={screen===t.key?'active':''} onClick={()=>switchScreen(t.key)} key={t.key}><i>{t.icon}</i>{t.label}</button>)}</nav>}
      <div className="mc-title"><span>{titles[screen]}</span><h2>{titles[screen]}</h2><i/></div>
      <div className="mc-content">
        {screen==='deposit'&&<Deposit amount={amount} setAmount={setAmount} historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} submit={submit} onToast={onToast}/>} 
        {screen==='withdraw'&&<Withdraw amount={amount} setAmount={setAmount} credit={credit} historyOpen={historyOpen} setHistoryOpen={setHistoryOpen} submit={submit}/>} 
        {screen==='coupon'&&<Coupon tab={couponTab} setTab={setCouponTab} onToast={onToast}/>} 
        {screen==='events'&&<Events detail={detail} setDetail={setDetail}/>} 
        {screen==='notice'&&<Notice detail={detail} setDetail={setDetail}/>} 
        {screen==='support'&&<Support mode={supportMode} setMode={setSupportMode} submit={submit}/>} 
        {screen==='messages'&&<Messages open={messageOpen} setOpen={setMessageOpen} onToast={onToast}/>} 
        {screen==='attendance'&&<Attendance month={month} setMonth={setMonth} onToast={onToast}/>} 
        {screen==='referral'&&<Referral onToast={onToast}/>} 
        {screen==='achievement'&&<Achievement onToast={onToast}/>} 
        {screen==='point'&&<Point submit={submit}/>} 
        {screen==='money'&&<Money/>} 
        {screen==='password'&&<Password submit={submit}/>} 
        {screen==='profile'&&<Profile submit={submit}/>} 
        {screen==='staff'&&<Staff submit={submit}/>} 
        {screen==='join'&&<Join submit={submit}/>} 
      </div>
    </section>
  </div>;
}

function Achievement({onToast}:{onToast:(s:string)=>void}){
  const [questTab,setQuestTab]=useState<'daily'|'weekly'|'monthly'>('daily');
  const [title,setTitle]=useState('연승의 신');
  const tiers=[['BRONZE','브론즈','0 ~ 1,000만','1단계 달성'],['SILVER','실버','1,000만 ~ 5,000만','감사 선물'],['GOLD','골드','5,000만 ~ 5억','퍼스널 매니저 · 특별 쿠폰'],['DIAMOND','다이아몬드','5억 ~ 10억','경조사 쿠폰 · 행사 초대'],['LEGEND','레전드','100억 이상','영구 명예의 전당']];
  const badges=[['연승의 신','10연승','earned'],['스포츠 고수','5폴더 성공','earned'],['스포츠 왕','6폴더 성공','earned'],['로또 1황','7폴더 성공','earned'],['로또 황제','8폴더 성공','earned'],['10배 환전','10배 달성','locked'],['20배 환전','20배 달성','locked'],['30배 환전','30배 달성','locked'],['40배 환전','40배 달성','locked'],['잭팟 마스터','1,000배 달성','locked'],['인맥 루키','지인추천 1명','locked'],['인맥 브론즈','지인추천 2명','locked'],['인맥 실버','지인추천 3명','locked'],['인맥 골드','지인추천 4명','locked'],['인맥 킹','지인추천 5명','locked']];
  const quests={daily:[['당일 출석','출석 체크 완료','진행중'],['스포츠 1.51배당','3폴더 3회 이상','진행중'],['에볼루션 카지노','3연승','도전'],['슬롯 배당 300회','당일 달성','도전']],weekly:[['주간 루키','5,000만 달성','완료'],['주간 러너','2억 달성','진행중'],['주간 하이롤러','5억 달성','도전'],['주간 랭커','10억 달성','도전']],monthly:[['월간 플레이어','활동 20회','완료'],['월간 챌린저','활동 50회','진행중'],['명예 랭커','상위 100위','도전'],['명예 챔피언','상위 10위','도전']]} as const;
  return <div className="achievement-view">
    <section className="achievement-exp achievement-summary"><div className="achievement-summary-copy"><span>업적 리워드</span><h3>베팅 경험치</h3><p><i/> 현재 내 베팅 총량</p><strong>6억 8,000만</strong><div className="achievement-meter"><i/></div><div className="achievement-meter-label"><small>5억 · 골드</small><b>다음 칭호까지 3.2억</b><small>10억 · 플래티넘</small></div></div><button className="achievement-level-card" onClick={()=>onToast(`${title} 칭호 정보를 확인했습니다.`)}><span>MY LEVEL</span><i>D</i><b>다이아몬드</b><small>VIP 5 쿠폰</small></button></section>
    <section className="honor-section"><div className="achievement-section-head"><div><span>HONOR ROAD</span><b>칭호 및 리워드</b></div><small>실시간 반영</small></div><div className="honor-road">{tiers.map((tier,i)=><article className={i===3?'current':''} key={tier[0]}><i/><div><b>{tier[1]}</b><small>{tier[2]}</small></div><span/ ><p>{tier[3]}</p></article>)}</div></section>
    <section className="achievement-stats"><article className="weekly-card"><span>WEEKLY RANK</span><h3>주간 베팅 총량</h3><strong>3억 4,000만</strong><div className="weekly-meter"><i/></div><ul>{[['주간 루키 · 5,000만',true],['주간 러너 · 2억',true],['주간 하이롤러 · 5억',false],['주간 랭커 · 10억',false],['주간 챔피언 · 30억',false]].map(([label,done])=><li className={done?'done':''} key={label}>{done?'✓':'○'} <b>{label}</b></li>)}</ul><footer><small>내 주간 베팅 랭킹</small><b>342위</b></footer></article></section>
    <section className="badge-collection"><div className="achievement-section-head"><span>BADGE COLLECTION</span><b>업적 뱃지</b><small>5 / 15 획득</small></div><div className="badge-grid">{badges.map(([name,desc,state],index)=><button className={state} key={name} onClick={()=>state==='earned'&&setTitle(name)}><img src={`/badges/badge-${index+1}.png`} alt=""/><b>{name}</b><small>{desc}</small><em>{state==='earned'?'현재 획득':'미습득'}</em></button>)}</div><div className="badge-current"><span>♢</span><div><small>현재 장착 칭호</small><b>{title}</b></div><button onClick={()=>onToast(`${title} 칭호가 프로필에 적용되었습니다.`)}>칭호 적용하기</button></div></section>
    <section><div className="achievement-section-head"><span>QUEST MISSION</span><b>퀘스트 미션</b><small>보상 자동 지급</small></div><div className="achievement-tabs"><button className={questTab==='daily'?'active':''} onClick={()=>setQuestTab('daily')}>매일 퀘스트</button><button className={questTab==='weekly'?'active':''} onClick={()=>setQuestTab('weekly')}>주간 퀘스트</button><button className={questTab==='monthly'?'active':''} onClick={()=>setQuestTab('monthly')}>월간 퀘스트</button></div><div className="quest-grid">{quests[questTab].map(([name,desc,state])=><article key={name}><span>{state}</span><b>{name}</b><small>{desc}</small><i>{state==='완료'?'✓':'→'}</i></article>)}</div></section>
  </div>;
}

function AmountPicker({amount,setAmount}:{amount:number;setAmount:(n:number)=>void}){
  return <><label className="mc-field"><span>신청 금액</span><div><input type="number" min="0" value={amount} onChange={e=>setAmount(Number(e.target.value))}/><b>원</b></div></label><div className="amount-buttons">{[30000,50000,100000,300000,500000,1000000].map(n=><button onClick={()=>setAmount(n)} key={n}>{n>=10000?`${n/10000}만`:n}</button>)}<button className="reset" onClick={()=>setAmount(0)}>정정하기</button></div></>;
}

function Deposit({amount,setAmount,historyOpen,setHistoryOpen,submit,onToast}:{amount:number;setAmount:(n:number)=>void;historyOpen:boolean;setHistoryOpen:(v:boolean)=>void;submit:(s:string)=>(e:React.FormEvent)=>void;onToast:(s:string)=>void}){
  return <div className="mc-flow"><div className="mc-alert"><span>i</span><p><b>입금 전용 계좌를 확인해주세요.</b> 정확한 입금자명과 신청금액을 입력하세요.</p><button onClick={()=>onToast('전용 계좌 안내를 확인했습니다.')}>전용 계좌 확인</button></div><section className="mc-guide"><b>입금 주의사항</b><h3>입금(충전) 안내</h3><p>입금자명과 신청금액을 확인한 뒤 신청해주세요.</p><p>신청 내역은 아래의 내역 버튼에서 상태별로 확인할 수 있습니다.</p></section><form className="mc-form" onSubmit={submit('입금신청이 접수되었습니다.')}><div className="history-head"><span/><button type="button" onClick={()=>setHistoryOpen(!historyOpen)}>▤ 입금내역</button></div>{historyOpen&&<History kind="입금"/>}<label className="mc-field"><span>입금자명</span><input defaultValue="그라운더"/></label><label className="mc-field"><span>휴대폰번호</span><input defaultValue="010-0000-0000"/></label><div className="bonus-choice"><span>보너스 선택</span><label><input type="radio" name="bonus" defaultChecked/> 충전 포인트 받기</label><label><input type="radio" name="bonus"/> 충전 포인트 안받기</label></div><AmountPicker amount={amount} setAmount={setAmount}/><div className="mc-actions"><button type="button" className="accent" onClick={()=>onToast('전용 계좌를 확인했습니다.')}>계좌확인</button><button className="danger">입금신청</button><button type="button" onClick={()=>setAmount(0)}>취소</button></div></form></div>;
}

function Withdraw({amount,setAmount,credit,historyOpen,setHistoryOpen,submit}:{amount:number;setAmount:(n:number)=>void;credit:number;historyOpen:boolean;setHistoryOpen:(v:boolean)=>void;submit:(s:string)=>(e:React.FormEvent)=>void}){
  return <div className="mc-flow"><section className="mc-guide"><b>확인 및 필독사항</b><h3>출금신청 안내</h3><p>신청 금액과 등록 계좌 정보를 확인한 뒤 출금신청을 진행해주세요.</p></section><form className="mc-form" onSubmit={submit('출금신청이 접수되었습니다.')}><div className="history-head"><span/><button type="button" onClick={()=>setHistoryOpen(!historyOpen)}>▤ 출금내역</button></div>{historyOpen&&<History kind="출금"/>}<label className="mc-field"><span>보유 머니</span><input readOnly value={credit.toLocaleString()}/></label><label className="mc-field"><span>은행명</span><input readOnly value="머니그라운드 은행"/></label><label className="mc-field"><span>계좌번호</span><input readOnly value="000-****-0000"/></label><AmountPicker amount={amount} setAmount={setAmount}/><label className="mc-field"><span>환전 비밀번호</span><input type="password" placeholder="환전 비밀번호 입력"/></label><div className="mc-actions"><button className="danger">출금신청</button><button type="button" onClick={()=>setAmount(0)}>취소</button></div></form></div>;
}

function History({kind}:{kind:string}){return <div className="history-box"><div><b>금액</b><b>상태</b><b>날짜</b></div>{[[30000,'완료'],[50000,'대기중'],[100000,'취소']].map((x,i)=><div key={i}><span>{Number(x[0]).toLocaleString()}</span><span className={x[1]==='완료'?'ok':x[1]==='취소'?'no':''}>{x[1]}</span><span>26-08-{28-i}</span></div>)}<small>{kind} 신청 내역입니다.</small></div>}

function Coupon({tab,setTab,onToast}:{tab:'plus'|'free'|'history';setTab:(t:'plus'|'free'|'history')=>void;onToast:(s:string)=>void}){
  return <div><div className="sub-tabs"><button className={tab==='plus'?'active':''} onClick={()=>setTab('plus')}>입금 플러스</button><button className={tab==='free'?'active':''} onClick={()=>setTab('free')}>무료 쿠폰</button><button className={tab==='history'?'active':''} onClick={()=>setTab('history')}>쿠폰 사용내역</button></div>{tab==='history'?<div className="mc-table"><div><b>쿠폰종류</b><b>쿠폰명</b><b>쿠폰금액</b><b>사용일자</b><b>상태</b></div>{['웰컴 쿠폰','주간 미션 쿠폰','출석 쿠폰'].map((x,i)=><div key={x}><span>{i?'무료쿠폰':'입금 플러스'}</span><span>{x}</span><span>{(5000*(i+1)).toLocaleString()} CR</span><span>26-08-{26+i}</span><span className={i===2?'expired':''}>{i===2?'만료':'사용완료'}</span></div>)}</div>:<div className="coupon-grid">{[15000,30000].map((n,i)=><article key={n}><span>MG</span><small>{tab==='free'?'FREE COUPON':'DEPOSIT PLUS'}</small><h3>{n.toLocaleString()} <b>CR</b></h3><p>{i? '100,000 CR 이상 충전 시':'50,000 CR 이상 충전 시'}</p><button onClick={()=>onToast(`${n.toLocaleString()} CR 쿠폰을 사용했습니다.`)}>사용하기 →</button></article>)}</div>}</div>;
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

function Support({mode,setMode,submit}:{mode:'list'|'write'|'detail';setMode:(m:'list'|'write'|'detail')=>void;submit:(s:string)=>(e:React.FormEvent)=>void}){
  if(mode==='write')return <div><button className="back-btn" onClick={()=>setMode('list')}>‹ 문의 목록</button><form className="support-write" onSubmit={e=>{submit('고객센터 문의가 접수되었습니다.')(e);setMode('list')}}><input required placeholder="제목을 입력해주세요"/><textarea required placeholder="문의 내용을 입력해주세요. 실제 금융정보는 입력하지 마세요."/><div className="mc-actions"><button className="danger">문의하기</button><button type="button" onClick={()=>setMode('list')}>목록가기</button></div></form></div>;
  if(mode==='detail')return <Detail back={()=>setMode('list')} title="이용 문의"><div className="qa"><div><b>문의</b><p>베팅슬립과 쿠폰 화면 사용법을 알려주세요.</p></div><div><b>답변</b><p>각 경기의 배당을 선택하면 베팅슬립이 열립니다. 쿠폰은 입금신청 화면의 쿠폰 탭에서 확인할 수 있습니다.</p></div></div></Detail>;
  return <div><div className="board support"><div><b>문의일시</b><b>제목</b><b>상태</b></div><button onClick={()=>setMode('detail')}><span>26-08-28 16:42</span><b>이용 문의</b><time className="answered">답변완료</time></button><button onClick={()=>setMode('detail')}><span>26-08-27 12:15</span><b>쿠폰 사용 문의</b><time>답변대기중</time></button></div><div className="board-actions"><button onClick={()=>setMode('write')}>＋ 문의하기</button></div></div>;
}

function Messages({open,setOpen,onToast}:{open:boolean;setOpen:(v:boolean)=>void;onToast:(s:string)=>void}){
  return <div><div className="board messages"><div><b>받은시간</b><b>제목</b><b>상태</b></div><button onClick={()=>setOpen(true)}><span>26-08-28 16:42</span><b>회원님, 새로운 미션을 확인하세요.</b><time className="unread">안읽음</time></button><button onClick={()=>setOpen(true)}><span>26-08-27 12:15</span><b>출석 배지가 지급되었습니다.</b><time>읽음</time></button></div>{open&&<section className="message-body"><p>회원님, 오늘의 주간활동 미션이 준비되었습니다. 이벤트 메뉴에서 내용을 확인해주세요.</p></section>}<div className="board-actions"><button onClick={()=>onToast('모든 쪽지를 읽음 처리했습니다.')}>전체읽음</button><button onClick={()=>onToast('쪽지를 전체 삭제했습니다.')}>전체삭제</button></div></div>;
}

function Attendance({month,setMonth,onToast}:{month:number;setMonth:(n:number)=>void;onToast:(s:string)=>void}){
  const done=[1,3,5,6,9,12,14,15,17,18,20,22,23,24,29,30];
  return <div><div className="calendar-head"><button onClick={()=>setMonth(Math.max(1,month-1))}>‹ 이전</button><h3>2026년 {String(month).padStart(2,'0')}월</h3><button onClick={()=>setMonth(Math.min(12,month+1))}>다음 ›</button></div><div className="calendar"><div className="week">{['월','화','수','목','금','토','일'].map(x=><b key={x}>{x}</b>)}</div><div className="days">{Array.from({length:35},(_,i)=>i<2||i>31?<span key={i}/>:<button className={done.includes(i-1)?'done':''} onClick={()=>onToast(`${month}월 ${i-1}일 출석 상태를 확인했습니다.`)} key={i}><small>{i-1}</small><i>MG</i><b>{done.includes(i-1)?'출석완료':'미출석'}</b></button>)}</div></div></div>;
}

function Referral({onToast}:{onToast:(s:string)=>void}){return <div><div className="referral-summary"><span>나의 추천 코드</span><strong>MG-GROUND-26</strong><button onClick={()=>onToast('추천 코드를 복사했습니다.')}>코드 복사</button></div><p className="center-copy">현재 총 <b>8명</b>의 지인을 추천했습니다.</p><div className="mc-table compact-table"><div><b>No.</b><b>아이디</b><b>최종 접속일자</b></div>{['abcd3301','ground02','orbit29d','play00dm','wave22'].map((x,i)=><div key={x}><span>{i+1}</span><span>{x}</span><span>26.08.{28-i} 12:32</span></div>)}</div></div>}

function Point({submit}:{submit:(s:string)=>(e:React.FormEvent)=>void}){return <form className="point-box" onSubmit={submit('포인트 5,000 P가 머니로 전환되었습니다.')}><div><small>보유 포인트</small><strong>18,500 <b>P</b></strong></div><span>→</span><div><small>전환 후 머니</small><strong>23,500 <b>CR</b></strong></div><label className="mc-field"><span>전환할 포인트</span><input defaultValue="5000"/></label><button>포인트 전환하기</button><p>출석, 미션, 지인추천으로 받은 포인트를 전환할 수 있습니다.</p></form>}

function Money(){return <div><div className="money-summary"><div><small>보유 머니</small><strong>12,000 CR</strong></div><div><small>보유 포인트</small><strong>18,500 P</strong></div><div><small>이번 달 활동</small><strong>24건</strong></div></div><div className="mc-table money-table"><div><b>구분</b><b>내용</b><b>변동</b><b>잔액</b><b>날짜</b></div>{[['베팅','K LEAGUE 픽','-1,000','11,000'],['충전','머니 충전','+1,000','12,000'],['쿠폰','출석 쿠폰 사용','+5,000','11,000'],['당첨','스포츠 결과','+2,500','6,000']].map((x,i)=><div key={i}><span>{x[0]}</span><span>{x[1]}</span><span className={x[2][0]==='+'?'plus':'minus'}>{x[2]} CR</span><span>{x[3]} CR</span><span>08.{28-i}</span></div>)}</div></div>}

function Password({submit}:{submit:(s:string)=>(e:React.FormEvent)=>void}){return <form className="profile-form" onSubmit={submit('비밀번호가 변경되었습니다.')}><label className="mc-field"><span>기존 비밀번호</span><input type="password" required/></label><label className="mc-field"><span>신규 비밀번호</span><input type="password" required placeholder="영문·숫자·특수문자 조합"/></label><label className="mc-field"><span>신규 비밀번호 확인</span><input type="password" required/></label><div className="mc-actions"><button className="danger">변경하기</button><button type="reset">취소</button></div></form>}

function Profile({submit}:{submit:(s:string)=>(e:React.FormEvent)=>void}){return <form className="profile-form" onSubmit={submit('개인정보가 수정되었습니다.')}><label className="mc-field"><span>아이디</span><input readOnly value="grounder"/></label><label className="mc-field"><span>닉네임</span><input defaultValue="그라운더"/></label><label className="mc-field"><span>휴대폰번호</span><input defaultValue="010-****-0000"/></label><label className="mc-field"><span>이메일</span><input defaultValue="member@moneyground.com"/></label><p className="field-note">회원 정보는 안전하게 관리됩니다.</p><div className="mc-actions"><button className="danger">저장하기</button><button type="reset">취소</button></div></form>}

function Staff({submit}:{submit:(s:string)=>(e:React.FormEvent)=>void}){return <div className="staff-box"><div className="agent-card"><span>MG</span><div><b>머니그라운드 지원팀</b><small><i/> 상담 가능 · 평균 응답 3분</small></div></div><form onSubmit={submit('담당자에게 문의를 보냈습니다.')}><textarea required placeholder="문의 내용을 입력해주세요."/><button>담당자에게 문의하기</button></form></div>}

function Join({submit}:{submit:(s:string)=>(e:React.FormEvent)=>void}){return <form className="join-grid" onSubmit={submit('머니그라운드 회원가입이 완료되었습니다.')}><label className="mc-field"><span>아이디</span><input required placeholder="4자 이상 영문·숫자"/></label><label className="mc-field"><span>닉네임</span><input required placeholder="한글·영문·숫자"/></label><label className="mc-field"><span>비밀번호</span><input required type="password"/></label><label className="mc-field"><span>비밀번호 확인</span><input required type="password"/></label><label className="mc-field"><span>휴대폰번호</span><input required placeholder="010-0000-0000"/></label><label className="mc-field"><span>이메일</span><input required type="email"/></label><label className="join-check"><input required type="checkbox"/> 만 19세 이상이며 이용약관에 동의합니다.</label><button>회원가입</button></form>}
