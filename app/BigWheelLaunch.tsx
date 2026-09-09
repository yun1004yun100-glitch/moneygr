'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './big-wheel.css';

export default function BigWheelLaunch({onOpen}:{onOpen:()=>void}) {
  const [opening,setOpening]=useState(false);
  const busy=useRef(false);
  const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
  useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
  function open(){
    if(busy.current)return;
    busy.current=true;setOpening(true);
    const reduced=typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    timer.current=setTimeout(()=>{setOpening(false);busy.current=false;onOpen();},reduced?100:1650);
  }
  return <button type="button" className={`big-wheel-launch${opening?' is-opening':''}`} onClick={open} disabled={opening} aria-label="빅휠 룰렛 열기">
    <span className="mini-wheel-window" aria-hidden="true"><span className="mini-wheel-disc">
      {['★','₩','★','₩','★','₩','★','₩'].map((symbol,index)=><span className="mini-wheel-mark" key={index} style={{'--angle':`${index*45+22.5}deg`} as CSSProperties}>{symbol}</span>)}
      <span className="mini-wheel-hub"/>
    </span></span><span className="mini-wheel-pointer" aria-hidden="true"/><span className="mini-wheel-name">빅휠</span>
  </button>;
}
