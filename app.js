'use strict';
const A=window.Archive, $=s=>document.querySelector(s);
let data=[], state=A.defaults(), limit=24, ready=false;
const viewKey=()=> 'kubo-view:'+A.params(state).toString();
function saveView(){if(ready)A.saveSession(viewKey(),{limit,y:window.scrollY,at:Date.now()});}
function restoreView(){const v=A.readSession(viewKey());if(v&&Date.now()-v.at<21600000){limit=Math.min(data.length,Math.max(24,Number(v.limit)||24));return v;}return null;}
function syncControls(){for(const key of ['source','topic','sort'])$('#'+key).value=state[key];$('#search').value=state.q;}
function saveURL(){const p=A.params(state);history.replaceState(null,'',location.pathname+(p.size?'?'+p:'')+(/^#year-\d{4}$/.test(location.hash)?'#timeline':location.hash));}
function render(){
  const rows=A.rows(data,state), counts={};for(const x of rows)counts[x.date.slice(0,4)]=(counts[x.date.slice(0,4)]||0)+1;
  document.querySelectorAll('.year-button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.year===state.year)));
  $('#result-count').textContent=`${state.year==='all'?'全部年份':state.year+' 年'} · ${rows.length} 篇文章${rows.length>limit?'，顯示前 '+limit+' 篇':''}`;
  $('#topic-note').textContent=state.topic==='all'?'一篇文章可以有多個主題；點選標籤即可篩選。':'目前主題：'+A.topics[state.topic]+' · 標籤依正文整理';
  let last='';
  $('#entries').innerHTML=rows.slice(0,limit).map(x=>{
    const year=x.date.slice(0,4), href=A.escape(A.readerURL(x.id,state));let heading='';
    if(last!==year){heading=`<div class="year-heading"><h3>${year}</h3><span>${counts[year]} 篇紀錄</span></div>`;last=year;}
    return heading+`<article class="entry" id="entry-${x.id}"><time class="entry-date" datetime="${x.date}" aria-label="${x.date}">${x.date.slice(5).replace('-','.')}<small>${year}</small></time><div class="entry-card"><div class="entry-meta"><span class="source-label ${x.source}">${A.labels[x.source]}</span></div><h4 lang="ja"><a class="read-link" href="${href}">${A.escape(x.title)}</a></h4><div class="topic-tags" aria-label="文章主題">${x.tags.map(t=>`<button type="button" class="topic-tag" data-topic="${t}" aria-pressed="${state.topic===t}">${A.topics[t]}</button>`).join('')}</div><div class="entry-links"><a class="read-link" href="${href}" aria-label="閱讀：${A.escape(x.title)}">閱讀文章 <span aria-hidden="true">→</span></a><a href="${A.escape(x.archive)}" target="_blank" rel="noopener noreferrer">原始備份 ↗</a>${x.source==='seventeen'?`<a href="${A.escape(x.url)}" target="_blank" rel="noopener noreferrer">官方原文 ↗</a>`:''}</div></div></article>`;
  }).join('');
  $('#empty').hidden=rows.length>0;$('#more').hidden=rows.length<=limit;$('#end-note').hidden=rows.length===0||rows.length>limit;
}
function update(){limit=24;syncControls();saveURL();render();saveView();}
function reset(){state=A.defaults();$('#filters').reset();update();}
$('#filters').addEventListener('submit',e=>e.preventDefault());$('#search').addEventListener('input',e=>{state.q=e.target.value;update();});
for(const key of ['source','topic','sort'])$('#'+key).addEventListener('change',e=>{state[key]=e.target.value;update();});
$('#reset').addEventListener('click',reset);$('#empty-reset').addEventListener('click',reset);$('#more').addEventListener('click',()=>{limit+=24;render();saveView();});
$('#entries').addEventListener('click',e=>{if(e.target.closest('.read-link'))saveView();const tag=e.target.closest('[data-topic]');if(tag){state.topic=tag.dataset.topic;update();$('#filters').scrollIntoView({block:'start'});$('#topic').focus({preventScroll:true});}});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('#search').focus();}});
window.addEventListener('pagehide',saveView);
window.addEventListener('popstate',()=>{state=A.readState(data);syncControls();const v=restoreView();render();if(v)requestAnimationFrame(()=>window.scrollTo({top:v.y,behavior:'instant'}));});
A.json('data.json').then(rows=>{
  data=rows;$('#total').textContent=data.length;
  for(const [id,label] of Object.entries(A.topics)){const count=data.filter(x=>x.tags.includes(id)).length;if(count){const o=document.createElement('option');o.value=id;o.textContent=label+'（'+count+'）';$('#topic').append(o);}}
  const years=[...new Set(data.map(x=>x.date.slice(0,4)))].sort();$('#year-nav').innerHTML=['all',...years].map(y=>`<button type="button" class="year-button" data-year="${y}" aria-pressed="false"><span>${y==='all'?'全部年份':y}</span><small>${y==='all'?data.length:data.filter(x=>x.date.startsWith(y)).length}</small></button>`).join('');
  $('#year-nav').addEventListener('click',e=>{const b=e.target.closest('button');if(b){state.year=b.dataset.year;update();b.scrollIntoView({block:'nearest',inline:'nearest'});}});
  state=A.readState(data);syncControls();const v=restoreView();render();ready=true;if(v)requestAnimationFrame(()=>window.scrollTo({top:v.y,behavior:'instant'}));else if(location.hash==='#timeline'||/^#year-\d{4}$/.test(location.hash))$('#timeline').scrollIntoView({block:'start'});
}).catch(()=>{$('#result-count').textContent='年表暫時無法讀取，請重新整理。';$('#entries').innerHTML='<p>也可以透過頁面下方的備份目錄閱讀。</p>';});
