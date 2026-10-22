'use client';
import {useEffect,useRef} from 'react';

function lastVisualLineWordCount(el){
  if(!el) return 0;
  const textNode=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE) || el.firstChild;
  if(!textNode || !textNode.textContent?.trim()) return 0;
  const text=textNode.textContent;
  const matches=[...text.matchAll(/\S+/g)];
  if(!matches.length) return 0;
  const rows=[];
  for(const m of matches){
    const range=document.createRange();
    range.setStart(textNode,m.index);
    range.setEnd(textNode,m.index+m[0].length);
    const rect=range.getBoundingClientRect();
    const row=rows.find(r=>Math.abs(r.top-rect.top)<2);
    if(row) row.count+=1; else rows.push({top:rect.top,count:1});
  }
  rows.sort((a,b)=>a.top-b.top);
  return rows.at(-1)?.count || 0;
}

export default function StickyProcessGuard({children}){
  const ref=useRef(null);
  useEffect(()=>{
    const aside=ref.current;
    if(!aside) return;
    const title=aside.querySelector('.desktop-sticky-whatsapp h2');
    const update=()=>{
      // Keep normal sticky behaviour when only the final word wraps.
      // Guard only when the final visual line contains two or more words.
      const risky=lastVisualLineWordCount(title)>=2;
      aside.classList.toggle('sticky-wrap-guard',risky);
    };
    update();
    const ro=new ResizeObserver(update);
    ro.observe(aside);
    if(title) ro.observe(title);
    window.addEventListener('resize',update,{passive:true});
    return()=>{ro.disconnect();window.removeEventListener('resize',update)};
  },[]);
  return <aside ref={ref}>{children}</aside>;
}
