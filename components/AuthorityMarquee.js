'use client'
import {useEffect,useRef} from 'react'

function Icon({type}){
 const common={width:20,height:20,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':'true',focusable:'false'};
 const paths={
  court:<><path d="M12 3v18M5 7h14M7 7l-4 7h8L7 7Zm10 0-4 7h8l-4-7ZM7 21h10"/></>,
  justice:<><path d="M3 21h18M5 18h14M7 18V9m5 9V9m5 9V9M4 9h16L12 3 4 9Z"/></>,
  mofa:<><circle cx="12" cy="12" r="8"/><path d="M4 12h16M12 4c2.4 2.2 3.6 4.9 3.6 8S14.4 17.8 12 20c-2.4-2.2-3.6-4.9-3.6-8S9.6 6.2 12 4Z"/></>,
  property:<><path d="M3 11.5 12 4l9 7.5M5.5 10v10h13V10M9 20v-6h6v6"/></>,
  vehicle:<><path d="M4 16v-5l2-4h12l2 4v5M6 16h12M7 19h.01M17 19h.01M5 12h14"/></>,
  business:<><path d="M4 21V7h16v14M8 7V3h8v4M8 11h2m4 0h2m-8 4h2m4 0h2M3 21h18"/></>,
  identity:<><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.8-1.7 2-2.5 3-2.5s2.2.8 3 2.5m3-5h3m-3 4h3"/></>,
  immigration:<><path d="M5 3h10v18H5zM15 7h4v10h-4M8 12h4M10 10v4"/></>,
  notary:<><path d="M6 3h9l3 3v15H6zM14 3v4h4M9 11h6m-6 4h4"/><path d="m14 18 4-4 2 2-4 4-3 1 1-3Z"/></>,
  freezone:<><path d="M4 21V8l8-5 8 5v13M8 21v-5h8v5M8 10h2m4 0h2"/><path d="M2 21h20"/></>
 };
 return <svg {...common}>{paths[type]||paths.business}</svg>
}
const types=['court','justice','mofa','property','vehicle','business','identity','immigration','notary','freezone'];

export default function AuthorityMarquee({authorities,label}){
 const viewportRef=useRef(null),runnerRef=useRef(null),stateRef=useRef({x:0,last:0,paused:false,dragging:false,startX:0,startOffset:0,half:1,dir:1,raf:0});
 const items=authorities.map((name,i)=>({name,type:types[i]||'business'}));
 const Track=({duplicate=false})=><div className="authority-marquee-track" aria-hidden={duplicate?'true':undefined}>{items.map((item,i)=><span className="authority-marquee-item" key={`${duplicate?'d':'p'}-${i}`}><Icon type={item.type}/><span>{item.name}</span></span>)}</div>;
 useEffect(()=>{
  const viewport=viewportRef.current,runner=runnerRef.current,s=stateRef.current;if(!viewport||!runner)return;
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const measure=()=>{s.half=Math.max(1,runner.scrollWidth/2);s.dir=getComputedStyle(viewport).direction==='rtl'?1:-1};measure();
  const ro=new ResizeObserver(measure);ro.observe(runner);
  const normalize=()=>{if(s.dir<0){while(s.x<=-s.half)s.x+=s.half;while(s.x>0)s.x-=s.half}else{while(s.x>=s.half)s.x-=s.half;while(s.x<0)s.x+=s.half}};
  const paint=()=>{normalize();runner.style.transform=`translate3d(${s.x}px,0,0)`};
  const tick=(now)=>{if(!s.last)s.last=now;const dt=Math.min(40,now-s.last);s.last=now;if(!reduce&&!s.paused&&!s.dragging)s.x+=s.dir*(dt*.025);paint();s.raf=requestAnimationFrame(tick)};
  s.raf=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(s.raf);ro.disconnect()}
 },[]);
 const down=e=>{const s=stateRef.current;s.dragging=true;s.paused=true;s.startX=e.clientX;s.startOffset=s.x;e.currentTarget.setPointerCapture?.(e.pointerId)};
 const move=e=>{const s=stateRef.current;if(!s.dragging)return;s.x=s.startOffset+(e.clientX-s.startX)};
 const up=e=>{const s=stateRef.current;if(!s.dragging)return;s.dragging=false;e.currentTarget.releasePointerCapture?.(e.pointerId);if(e.pointerType!=='mouse')s.paused=false};
 const enter=()=>{stateRef.current.paused=true};
 const leave=()=>{const s=stateRef.current;if(!s.dragging)s.paused=false};
 return <section className="authority-marquee-block" aria-label={label}><div ref={viewportRef} className="authority-marquee" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerEnter={enter} onPointerLeave={leave}><div ref={runnerRef} className="authority-marquee-runner"><Track/><Track duplicate/></div></div></section>
}
