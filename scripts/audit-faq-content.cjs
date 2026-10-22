const fs=require('fs');
const path=require('path');
const data=require('../lib/serviceResearch.json');
const problems=[];let pairs=0;const langs=Object.keys(Object.values(data)[0]).filter(k=>Array.isArray(Object.values(data)[0][k]?.faq));
for(const [slug,service] of Object.entries(data)){
 for(const lang of langs){
  const faq=service[lang]?.faq;
  if(!Array.isArray(faq)){problems.push(`${slug}/${lang}: missing FAQ`);continue;}
  const seen=new Set();
  faq.forEach((row,i)=>{
   pairs++;
   if(!row.q?.trim()||!row.a?.trim())problems.push(`${slug}/${lang}/${i}: empty question or answer`);
   const q=(row.q||'').trim().toLocaleLowerCase();
   if(seen.has(q))problems.push(`${slug}/${lang}/${i}: duplicate question`);
   seen.add(q);
   if(lang==='ar'&&/ — /.test(q))problems.push(`${slug}/${lang}/${i}: mixed explanatory fragment in question`);
   if(lang==='ar'&&/(?:\sوا|\sو|\sفي|\sمن)؟$/.test(q))problems.push(`${slug}/${lang}/${i}: suspicious ending`);
  });
 }
}
console.log(`FAQ audit: ${Object.keys(data).length} services, ${langs.length} languages, ${pairs} question-answer pairs`);
if(problems.length){console.error(`${problems.length} issues:\n`+problems.slice(0,100).join('\n'));process.exitCode=1}else console.log('No structural issues detected. This does not certify semantic translation quality.');
