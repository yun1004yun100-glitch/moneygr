'use client';
import {useEffect,useState} from 'react';
import './slot-lobby.css';

const providers=[
  {id:'pragmatic',name:'프라그마틱 슬롯'},
  {id:'microgaming',name:'마이크로게이밍 슬롯'},
  {id:'playtech',name:'플레이테크 슬롯'},
  {id:'skywind',name:'스카이윈드 슬롯'},
  {id:'popok',name:'POPOK 슬롯'},
];
const themes=[
  {name:'골든 피라미드',en:'GOLDEN TEMPLE',symbol:'△',tone:'temple'},
  {name:'행운의 판다',en:'LUCKY PANDA',symbol:'◎',tone:'forest'},
  {name:'슈가 파티',en:'SUGAR PARTY',symbol:'✦',tone:'candy'},
  {name:'로열 세븐',en:'ROYAL SEVEN',symbol:'777',tone:'seven'},
  {name:'오션 트레저',en:'OCEAN TREASURE',symbol:'◇',tone:'ocean'},
  {name:'문라이트 젬',en:'MOONLIGHT GEM',symbol:'◆',tone:'moon'},
];
const favoriteKey='moneyground_slot_provider_favorites_v1';

export default function SlotLobby({onToast}:{onToast:(message:string)=>void}){
  const [provider,setProvider]=useState('pragmatic');
  const [favorites,setFavorites]=useState<string[]>([]);
  const [favoriteOnly,setFavoriteOnly]=useState(false);
  const [query,setQuery]=useState('');
  const [search,setSearch]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{
    try{const saved=JSON.parse(localStorage.getItem(favoriteKey)||'[]');if(Array.isArray(saved))setFavorites(saved.filter((id:unknown)=>typeof id==='string'&&providers.some(p=>p.id===id)));}catch{}
  },[]);
  function toggleFavorite(){
    const next=favorites.includes(provider)?favorites.filter(id=>id!==provider):[...favorites,provider];
    setFavorites(next);
    try{localStorage.setItem(favoriteKey,JSON.stringify(next));}catch{onToast('즐겨찾기는 현재 화면에만 유지됩니다.');}
  }
  const selected=providers.find(p=>p.id===provider)!;
  const ordered=[...providers].sort((a,b)=>Number(favorites.includes(b.id))-Number(favorites.includes(a.id)));
  const games=themes.filter(g=>(!favoriteOnly||favorites.includes(provider))&&(!search||(g.name+' '+g.en).toLowerCase().includes(search.toLowerCase())));
  return <section className="slot-lobby" aria-label="슬롯 게임 선택">
    <div className="slot-provider-row">
      <label className="slot-provider-select"><span>게임사 선택</span><select value={provider} onChange={e=>{setProvider(e.target.value);setQuery('');setSearch('');setError('');}}>{ordered.map(p=><option key={p.id} value={p.id}>{favorites.includes(p.id)?'★ ':''}{p.name}</option>)}</select></label>
      <button type="button" className={`slot-provider-star ${favorites.includes(provider)?'saved':''}`} aria-label={selected.name+' 즐겨찾기'} aria-pressed={favorites.includes(provider)} onClick={toggleFavorite}>{favorites.includes(provider)?'★':'☆'}</button>
    </div>
    <div className="slot-favorite-controls"><button type="button" aria-pressed={favoriteOnly} onClick={()=>setFavoriteOnly(!favoriteOnly)}>★ 즐겨찾는 게임사만 {favoriteOnly?'켜짐':'보기'}</button><small>{favorites.length}개 저장</small></div>
    {favorites.length>0&&<div className="slot-provider-shortcuts">{ordered.filter(p=>favorites.includes(p.id)).map(p=><button type="button" key={p.id} aria-pressed={provider===p.id} onClick={()=>{setProvider(p.id);setQuery('');setSearch('');setError('');}}>★ {p.name.replace(' 슬롯','')}</button>)}</div>}
    <form className="slot-search" onSubmit={e=>{e.preventDefault();const value=query.trim();if(value.length===1){setError('게임명을 2자 이상 입력해주세요.');return;}setError('');setSearch(value);}}>
      <input aria-label="게임명 검색" placeholder="게임명을 2자 이상 입력해주세요" value={query} onChange={e=>setQuery(e.target.value)}/><button type="submit">검색</button>
    </form>
    {error&&<p className="slot-search-error" role="alert">{error}</p>}
    <div className="slot-list-heading"><b>{selected.name}</b><span>{games.length}개 · 예시 게임</span></div>
    <div className="slot-example-grid">{games.map((g,i)=><button type="button" className={`slot-example-card ${g.tone}`} key={provider+'-'+g.name} onClick={()=>onToast(`${selected.name} · ${g.name} 선택 — 실제 게임 연결 전 예시입니다.`)}>
      <div className="slot-example-art" aria-hidden="true"><img className="slot-example-logo" src={`/casino-providers/logos/${provider}.png`} alt=""/><span className="slot-art-symbol">{g.symbol}</span><strong>{g.en}</strong><small>DEMO</small></div><span className="slot-example-title">{g.name}</span>
    </button>)}</div>
    {games.length===0&&<p className="slot-empty">{favoriteOnly&&!favorites.includes(provider)?'이 게임사를 별 버튼으로 추가하거나, 위에서 즐겨찾는 게임사를 선택해주세요.':'검색된 게임이 없습니다.'}</p>}
    <p className="slot-demo-note">선택 화면 예시입니다. 게임 목록·썸네일은 데모이며 실제 게임 실행은 연결 전입니다.</p>
  </section>;
}
