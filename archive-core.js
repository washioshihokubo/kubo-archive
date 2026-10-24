'use strict';
window.Archive = (() => {
  const labels = {official:'乃木坂官方部落格',relay:'3期生接力部落格',seventeen:'Seventeen MODEL’S BLOG'};
  const topics = {hometown:'宮城・故鄉',third:'三期生・夥伴',live:'音樂・演唱會',acting:'舞台・演技',fashion:'雜誌・模特',books:'書籍・寫真',broadcast:'廣播・節目',baseball:'棒球・運動',milestone:'生日・畢業・紀念',everyday:'日常・心情'};
  const escape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = value => String(value).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,' ').trim();
  const defaults = () => ({year:'all',q:'',source:'all',topic:'all',sort:'desc'});
  function readState(data, search=location.search, hash=location.hash) {
    const p = new URLSearchParams(search), state = defaults();
    const year = p.get('year') || (/^#year-(\d{4})$/.exec(hash)||[])[1];
    if (year && data.some(x=>x.date.startsWith(year))) state.year=year;
    if (labels[p.get('source')]) state.source=p.get('source');
    if (topics[p.get('topic')]) state.topic=p.get('topic');
    const oldTypes={'部落格・隨筆':'everyday','時尚・雜誌':'fashion','舞台・演出':'acting','音樂・現場':'live','節點・紀念':'milestone'};
    if (!p.has('topic') && oldTypes[p.get('type')]) state.topic=oldTypes[p.get('type')];
    state.q=p.get('q')||'';state.sort=p.get('sort')==='asc'?'asc':'desc';return state;
  }
  function params(state) {const p=new URLSearchParams();for(const [k,v] of Object.entries(state))if(v&&v!=='all'&&!(k==='sort'&&v==='desc'))p.set(k,v);return p;}
  function rows(data,state) {
    const terms=normalize(state.q).split(' ').filter(Boolean);
    return data.filter(x=>(state.year==='all'||x.date.startsWith(state.year))&&(state.source==='all'||x.source===state.source)&&(state.topic==='all'||x.tags.includes(state.topic))&&terms.every(t=>normalize(`${x.title} ${x.date} ${labels[x.source]} ${x.tags.map(k=>topics[k]).join(' ')}`).includes(t))).sort((a,b)=>(state.sort==='asc'?1:-1)*(a.date.localeCompare(b.date)||a.id.localeCompare(b.id)));
  }
  function readerURL(id,state) {const p=params(state);p.set('article',id);return 'read.html?'+p;}
  function listURL(state) {const p=params(state);return './'+(p.size?'?'+p:'')+'#timeline';}
  function topicURL(topic) {return './?topic='+encodeURIComponent(topic)+'#timeline';}
  async function json(path) {const r=await fetch(path+'?v=reading-20261024');if(!r.ok)throw Error('無法讀取資料');return r.json();}
  function readSession(key) {try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch{return null}}
  function saveSession(key,value) {try{sessionStorage.setItem(key,JSON.stringify(value))}catch{}}
  return {labels,topics,escape,normalize,defaults,readState,params,rows,readerURL,listURL,topicURL,json,readSession,saveSession};
})();
