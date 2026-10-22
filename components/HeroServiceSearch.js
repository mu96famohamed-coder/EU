'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {norm,rankServices} from '../lib/serviceSearchCore.mjs';

let indexPromise;
function fetchSearchIndex(){
 if(!indexPromise) indexPromise=fetch('/api/service-search').then(r=>{if(!r.ok)throw new Error('Search unavailable');return r.json()}).then(data=>{if(!Array.isArray(data))throw new Error('Invalid search index');return data}).catch(error=>{indexPromise=undefined;throw error});
 return indexPromise;
}



export default function HeroServiceSearch({lang,searchIndex,labels,loadingLabel}){
  const [q,setQ]=useState('');
  const [allIndex,setAllIndex]=useState(null),[loading,setLoading]=useState(false);
  const mounted=useRef(true),loadingRef=useRef(false),loadedRef=useRef(false);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[]);
  const loadIndex=()=>{
    if(loadingRef.current||loadedRef.current)return;
    loadingRef.current=true;setLoading(true);
    fetchSearchIndex().then(data=>{if(mounted.current){setAllIndex(data);loadedRef.current=true}}).catch(()=>{}).finally(()=>{loadingRef.current=false;if(mounted.current)setLoading(false)});
  };
  const [open,setOpen]=useState(false);
  const root=useRef(null);
  const query=norm(q);
  useEffect(()=>{
    const close=e=>{ if(root.current&&!root.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown',close);
    return()=>document.removeEventListener('pointerdown',close);
  },[]);
  const results=useMemo(()=>rankServices(allIndex||searchIndex,query,lang),[query,searchIndex,allIndex,lang]);
  const show=open&&q.trim().length>0;
  return <div className="hero-service-search" ref={root}>
    <label htmlFor="hero-service-query">{labels.label}</label>
    <div className="hero-search-box">
      <span aria-hidden="true">⌕</span>
      <input id="hero-service-query" value={q} onFocus={()=>{setOpen(true);loadIndex()}} onChange={e=>{setQ(e.target.value);setOpen(true);loadIndex()}} onKeyDown={e=>{if(e.key==='Escape')setOpen(false)}} placeholder={labels.placeholder} autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={show} aria-controls="hero-search-results" />
    </div>
    {show&&<div id="hero-search-results" className="hero-search-results" role="region" aria-live="polite" aria-label={labels.results}>
      {loading&&!results.length?<p role="status">{loadingLabel}</p>:results.length?results.map((s,i)=><Link key={`${s.slug}-${s.lang}-${i}`} href={`/${lang}/services/${s.slug}`} onClick={()=>setOpen(false)}>
        <span className="hero-result-head"><strong>{s.title}</strong><em>{s.languageName}</em></span>
        <small>{s.summary}</small>
      </Link>):<Link className="hero-search-contact" href={`/${lang}/contact`} onClick={()=>setOpen(false)}><strong>{labels.noResultsTitle}</strong><small>{labels.noResultsText}</small></Link>}
    </div>}
  </div>;
}
