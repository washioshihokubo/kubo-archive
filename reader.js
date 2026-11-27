'use strict';
const A=window.Archive,$=s=>document.querySelector(s);
const t=A.t;
if (A.japanese) {
  document.documentElement.lang = 'ja';
  document.querySelectorAll('[data-ja]').forEach(node => node.textContent = node.dataset.ja);
  document.querySelectorAll('[data-ja-label]').forEach(node => node.setAttribute('aria-label', node.dataset.jaLabel));
  $('meta[name="description"]').content = '久保史緒里のブログアーカイブ。各記事の本文・写真と投稿日を掲載しています。';
  $('.brand').href = 'index-ja.html';
}
const languageSwitch = $('.reader-languages');
for (const link of languageSwitch.querySelectorAll('a')) {
  const url = new URL(location.href);
  if (link.lang === 'ja') url.searchParams.set('lang','ja');
  else url.searchParams.delete('lang');
  link.href = url.href;
  if (link.lang === document.documentElement.lang) link.setAttribute('aria-current','page');
  else link.removeAttribute('aria-current');
}
languageSwitch.hidden = false;

function setReturnLinks(state) {
  const back = A.listURL(state);
  for (const id of ['#top-return','#bottom-return','#error-back']) $(id).href = back;
}
// Keep the return path usable even if loading the index fails.
setReturnLinks(A.readState([]));
let photos=[],photoIndex=0,photoTrigger=null;
let fontSize=18;
try{const saved=Number(localStorage.getItem('kubo-reading-size'));if([16,18,20,22,24].includes(saved))fontSize=saved;}catch{}
function setSize(value){fontSize=Math.max(16,Math.min(24,value));document.body.style.setProperty('--reading-size',fontSize+'px');$('#font-size').textContent=fontSize;$('#font-down').disabled=fontSize===16;$('#font-up').disabled=fontSize===24;try{localStorage.setItem('kubo-reading-size',String(fontSize));}catch{}}
setSize(fontSize);$('#font-down').addEventListener('click',()=>setSize(fontSize-2));$('#font-up').addEventListener('click',()=>setSize(fontSize+2));
function showPhoto(index){photoIndex=index;const source=photos[index];$('#photo-large').src=source.src;$('#photo-large').alt=source.alt;$('#photo-position').textContent=`${index+1} / ${photos.length}`;$('#photo-caption').textContent=source.alt;$('#photo-prev').disabled=index===0;$('#photo-next').disabled=index===photos.length-1;}
function closePhoto(){$('#photo-viewer').close();}
$('#photo-close').addEventListener('click',closePhoto);
$('#photo-prev').addEventListener('click',()=>{if(photoIndex>0)showPhoto(photoIndex-1);});
$('#photo-next').addEventListener('click',()=>{if(photoIndex<photos.length-1)showPhoto(photoIndex+1);});
$('#photo-viewer').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'&&photoIndex>0){e.preventDefault();showPhoto(photoIndex-1);}if(e.key==='ArrowRight'&&photoIndex<photos.length-1){e.preventDefault();showPhoto(photoIndex+1);}});
$('#photo-viewer').addEventListener('close',()=>{document.body.style.overflow='';photoTrigger?.focus({preventScroll:true});});
$('#photo-viewer').addEventListener('click',e=>{if(e.target===$('#photo-viewer')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closePhoto();}});
function setupImages(){
  photos=[...$('#article-body').querySelectorAll('img')];
  photos.forEach((img,index)=>{
    const numberedAlt = /^文章照片，第 (\d+) 張$/.exec(img.alt);
    if (A.japanese && numberedAlt) img.alt = `記事の写真（${numberedAlt[1]}枚目）`;
    const button=document.createElement('button');button.type='button';button.className='photo-button';button.setAttribute('aria-label',t(`放大第 ${index+1} 張照片`,`${index+1}枚目の写真を拡大`));img.before(button);button.append(img);
    button.addEventListener('click',()=>{photoTrigger=button;showPhoto(index);$('#photo-viewer').showModal();document.body.style.overflow='hidden';});
    const failed=()=>{if(button.querySelector('.image-fallback'))return;const note=document.createElement('span');note.className='image-fallback';note.textContent=t('照片暫時無法載入，可由文末開啟原始備份。','写真を読み込めませんでした。記事の末尾から保存版を開けます。');button.append(note);};
    img.addEventListener('error',failed);if(img.complete&&img.naturalWidth===0)failed();
  });
}
async function loadArticle(){
  let item=null;
  try{
    const data=await A.json('data.json'),id=new URLSearchParams(location.search).get('article');item=data.find(x=>x.id===id);
    const state=A.readState(data);
    setReturnLinks(state);
    if(!item){$('#error-message').textContent=t('找不到這篇文章，請返回年表重新選擇。','記事が見つかりません。年表に戻って記事を選んでください。');throw Error('unknown article');}
    document.title=item.title+t('｜久保史緒里・時光手帖','｜久保史緒里・時の手帖');
    const content=await A.json('content-'+item.source+'.json');if(typeof content[item.id]!=='string')throw Error('missing content');
    $('#article-source').textContent=A.labels[item.source];$('#article-source').classList.add(item.source);$('#article-date').textContent=item.date.replaceAll('-','.');$('#article-date').dateTime=item.date;$('#article-title').textContent=item.title;
    $('#article-tags').innerHTML=item.tags.map(t=>`<a class="topic-tag" href="${A.topicURL(t)}">${A.topics[t]}</a>`).join('');
    $('#article-body').innerHTML=content[item.id];setupImages();
    $('#article-links').innerHTML=`<a href="${A.escape(item.archive)}" target="_blank" rel="noopener noreferrer">${t('閱讀原始備份','保存版を読む')} ↗</a>${item.source==='seventeen'?`<a href="${A.escape(item.url)}" target="_blank" rel="noopener noreferrer">${t('Seventeen 官方原文','Seventeen公式サイトで読む')} ↗</a>`:''}`;
    let rows=A.rows(data,state),pos=rows.findIndex(x=>x.id===item.id),filtered=true;
    if(pos<0){rows=A.rows(data,A.defaults());pos=rows.findIndex(x=>x.id===item.id);filtered=false;}
    function card(entry,next){return entry?`<a class="${next?'next':'previous'}" href="${A.escape(A.readerURL(entry.id,filtered?state:A.defaults()))}"><small>${next?t('下一篇 →','次の記事 →'):t('← 上一篇','← 前の記事')}</small><strong lang="ja">${A.escape(entry.title)}</strong><time datetime="${entry.date}">${entry.date.replaceAll('-','.')}</time></a>`:'';}
    $('#article-nav').innerHTML=card(rows[pos-1],false)+card(rows[pos+1],true);
    const narrowed = filtered && (state.year!=='all' || state.source!=='all' || state.topic!=='all' || state.q);
    const scope = narrowed ? t('目前篩選結果','絞り込み結果') : t('全部文章','すべての記事');
    const order = filtered && state.sort==='asc' ? t('由舊到新','古い順') : t('由新到舊','新しい順');
    const position = t(`第 ${pos+1} / ${rows.length} 篇`, `全${rows.length}件中${pos+1}件目`);
    $('#sequence-note').textContent = `${scope} · ${position} · ${order}`;
    $('#loading').hidden=true;$('#reading-article').hidden=false;
  }catch(error){
    $('#loading').hidden=true;$('#reader-error').hidden=false;
    if(item){$('#error-archive').href=item.archive;$('#error-archive').target='_blank';$('#error-archive').rel='noopener noreferrer';$('#error-archive').hidden=false;}
  }
}
loadArticle();
