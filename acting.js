'use strict';
(() => {
  const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dialog=$('#acting-dialog'), list=$('#acting-list'); let works=[], view={year:'all',q:'',mode:'all',category:'all',status:'all',sort:'desc'}, opener, limit=6;
  const {japanese,t} = window.Archive;
  const japaneseLabels = {
    "電影": "映画",
    "日劇": "テレビドラマ",
    "舞台劇": "舞台",
    "音樂劇": "ミュージカル",
    "串流作品": "配信作品",
    "廣播劇": "ラジオドラマ",
    "已上映／播畢／演出": "公開・放送・配信・上演済み",
    "播出中": "放送中",
    "即將上映／播出": "公開・放送・配信・上演予定",
    "狀態待確認": "未確認",
    "已演出": "上演終了",
    "已上映": "公開済み",
    "已播出": "放送済み",
    "官方演員照片": "公式キャスト写真",
    "角色照": "キャラクター写真",
    "宣傳圖": "告知ビジュアル",
    "舞台劇照": "舞台写真",
    "使用者提供的影像商品封面": "映像商品のジャケット（提供画像）",
    "劇照": "場面写真",
    "演出陣容宣傳圖": "キャストビジュアル",
    "作品標誌": "作品ロゴ",
    "使用者提供的宣傳圖": "告知ビジュアル（提供画像）",
    "ジョバンニ／カムパネルラ等（公演輪替）": "ジョバンニ／カムパネルラほか（配役は公演ごとに決定）",
    "汐寝（旁白）": "汐寝（ナレーション）",
    "カノン（主唱）": "カノン（ボーカル）",
    "特別出演（ANN主持人）": "特別出演（ANNパーソナリティ）",
    "多個短劇角色": "複数の役を担当",
    "尚未公布": "未発表",
    "片頭旁白（聲音出演）": "冒頭のナレーション（声の出演）",
    "酢乙女あい（25歲）": "酢乙女あい（25歳）",
    "ノミネート（提名）": "ノミネート",
    "品牌官方第3集公告": "ブランド公式 第3話のお知らせ",
    "作品官方資料": "作品公式情報",
    "NHK官方第23集介紹": "NHK 第23回の紹介",
    "BS富士節目官方網站": "BSフジ 番組公式サイト",
    "主辦日本放送：演出名單": "ニッポン放送 出演者一覧",
    "NHK官方第1集介紹": "NHK 第1回の紹介",
    "富士電視台媒體：カノン角色介紹": "フジテレビ カノンの役柄紹介",
    "品牌官方作品網站": "ブランド公式 作品ページ",
    "品牌官方第5集公告": "ブランド公式 第5話のお知らせ",
    "製作方官方作品網站": "制作元の公式サイト",
    "日本放送：本人談旁白出演": "ニッポン放送 ナレーション出演についての本人コメント",
    "富士電視台公演官方資訊": "フジテレビ 公式公演情報",
    "電視台第7集資訊": "放送局の第7話紹介",
    "報知新聞社：第51回報知映画賞新人賞候選名單": "報知新聞社 第51回報知映画賞新人賞候補",
    "乃木坂46官方新聞公告": "乃木坂46公式ニュース",
    "久保史緒里官方作品表（角色名）": "久保史緒里公式 出演作品・役名",
    "舞台製作方官方網站": "舞台公式サイト",
    "目前未取得可核對的官方圖片，請參閱下方作品來源。": "公式画像は未掲載です。作品については下記の出典をご覧ください。",
    "官方尚未公布此角色劇照。": "この役の場面写真はまだ公表されていません。",
    "音聲演出作品，沒有劇中影像。": "声のみの出演のため、出演場面の写真はありません。",
    "圖片由使用者提供；作品圖片權利屬原權利人。": "画像は利用者提供。権利は各権利者に帰属します。",
    "圖片出處：作品官方網站／官方公告；權利歸各作品權利人所有。": "画像出典：作品公式サイト・公式発表。権利は各権利者に帰属します。",
    "保留個人官網完整角色名，另註電影官網的名稱與職務標示。": "役名は久保史緒里の公式サイトに従い、映画公式サイトでの表記と役職を併記しています。",
    "官方資料": "公式情報"
};
  const label = value => japanese ? japaneseLabels[value] ?? value : value;
  const statusNames={completed:'已上映／播畢／演出',ongoing:'播出中',upcoming:'即將上映／播出',unknown:'狀態待確認'};
  const milestones = [
    {
      year: '2016', title: '以三期生身分加入乃木坂46',
      ja: {"title": "乃木坂46に3期生として加入", "text": "2016年9月4日、15歳で乃木坂46の3期生オーディションに合格。12人の3期生のひとりとして乃木坂46に加入した。", "sourceLabel": "3期生加入のお知らせ"},
      text: '2016 年 9 月 4 日，15 歲的久保史緒里通過最終甄選，成為乃木坂46三期生的 12 位新成員之一。',
      source: 'https://www.nogizaka46.com/s/n46/news/detail/34235', sourceLabel: '三期生加入公告',
    },
    {year:'2017',title:'第一次走上舞台',
      ja: {"title": "『3人のプリンシパル』で初舞台", "text": "3期生公演『3人のプリンシパル』で初めて舞台に立った。この公演で表現する楽しさを知り、演技に興味を持ったと後に語っている。", "sourceLabel": "公式公演レポート"},
      text:'《3人のプリンシパル》是她初次登台的作品；她曾談到從中感受到表演的樂趣。',source:'https://www.nogizaka46.com/s/n46/diary/detail/36765?cd=MEMBER&ima=4459',sourceLabel:'官方公演日報',interview:'https://voisjp.me/news/230257/#:~:text=%E5%88%9D%E3%82%81%E3%81%A6%E3%81%AE%E8%88%9E%E5%8F%B0%E3%80%8E3%E4%BA%BA%E3%81%AE%E3%83%97%E3%83%AA%E3%83%B3%E3%82%B7%E3%83%91%E3%83%AB%E3%80%8F%E3%82%92%E3%82%84%E3%82%89%E3%81%9B%E3%81%A6%E3%81%84%E3%81%9F%E3%81%A0%E3%81%84%E3%81%9F%E6%99%82%E3%81%AB'},
    {
      year: '2017', title: '成為《Seventeen》專屬模特兒',
      ja: {"title": "『Seventeen』専属モデルに", "text": "2017年7月30日に起用が発表され、8月1日発売の9月号に初登場。2024年3月1日発売の春号で卒業するまで、6年7か月にわたって専属モデルを務めた。", "sourceLabel": "専属モデル起用のお知らせ", "relatedLabel": "『Seventeen』卒業のお知らせ"},
      text: '2017 年 7 月 30 日宣布成為《Seventeen》專屬模特兒，直到 2024 年 3 月 1 日發行的春號畢業，為期 6 年 7 個月。',
      source: 'https://www.nogizaka46.com/s/n46/news/detail/40059', sourceLabel: '專屬模特兒公告',
      related: {url: 'https://seventeen-web.jp/lifestyle/l-news/14921/', label: '《Seventeen》畢業特輯'},
    },
    {year:'2020',title:'第一次挑戰廣播劇',
      ja: {"title": "ラジオドラマに初挑戦", "text": "NHK-FMの青春アドベンチャー『阪堺電車177号の追憶』で美弥子と奈津子の二役を演じ、関西弁の演技にも初めて挑んだ。"},
      text:'《阪堺電車177号の追憶》分飾美弥子與奈津子，首次挑戰廣播劇與關西腔。',source:'https://www.nogizaka46.com/s/n46/news/detail/55133'},
    {
      year: '2022', title: '接任《乃木坂46のオールナイトニッポン》第二代主持人',
      ja: {"title": "『乃木坂46のオールナイトニッポン』2代目パーソナリティに", "text": "新内眞衣から番組を引き継ぎ、2022年2月16日深夜の放送からパーソナリティを務めた。2025年1月25日には、横浜アリーナで開かれた番組イベント「久保史緒里の青春文化祭」に約1万2千人のリスナーが集まった。", "sourceLabel": "ニッポン放送による就任発表", "relatedLabel": "青春文化祭 公式レポート"},
      text: '2022 年 2 月 17 日迎來接任後的首播（日本時間 2 月 16 日深夜）。2025 年 1 月 25 日，首場節目活動《久保史緒里の青春文化祭》在橫濱 Arena 舉行，約有 12,000 名聽眾到場。',
      source: 'https://news.1242.com/article/341264', sourceLabel: '日本放送就任公告',
      related: {url: 'https://news.1242.com/article/522095', label: '青春文化祭官方報導'},
    },
    {year:'2022',title:'團體外首次單獨主演',
      ja: {"title": "舞台『桜文』でグループ外初の単独主演", "text": "明治の吉原を舞台にした『桜文』で、決して笑顔を見せない花魁・桜雅（おうが）を演じた。"},
      text:'舞台劇《桜文》挑戰花魁桜雅，成為她在團體外首次單獨主演的作品。',source:'https://www.nogizaka46.com/s/n46/news/detail/65603'},
    {
      year: '2022', title: '首次電影出演即擔任主演',
      ja: {"title": "『左様なら今晩は』で映画初出演・初主演", "text": "2022年11月11日公開。会社員の陽平の部屋に現れ、彼と暮らすことになる幽霊・愛助（あいすけ）を演じた。", "sourceLabel": "映画主演のお知らせ"},
      text: '2022 年 11 月 11 日，《左様なら今晩は》上映。久保史緒里首度出演電影，便以幽靈「愛助」一角擔任主演。',
      source: 'https://www.nogizaka46.com/s/n46/news/detail/65645', sourceLabel: '電影主演公告',
    },
    {year:'2023',title:'首次擔任表題曲 Center',
      ja: {"title": "「人は夢を二度見る」で初の表題曲センター", "text": "2023年3月29日発売の32枚目のシングルで、同期の山下美月とともに表題曲のWセンターを務めた。", "sourceLabel": "表題曲の公式MV・公開のお知らせ"},
      text:'2023 年 3 月 29 日發行的乃木坂46第32張單曲〈人は夢を二度見る〉，由她與山下美月共同擔任雙 Center。',source:'https://www.nogizaka46.com/s/n46/news/detail/66292',sourceLabel:'官方公告與 MV'},
    {year:'2023',title:'乃木坂46首位在籍期間單獨出演大河劇',
      ja: {"title": "乃木坂46の現役メンバーとして初めて大河ドラマに単独出演", "text": "NHK大河ドラマ『どうする家康』で織田信長の娘・五徳を演じた。初登場は2023年5月7日放送の第17回「三方ヶ原合戦」。", "sourceLabel": "NHK 第17回"},
      text:'2023 年 5 月 7 日在 NHK 大河劇《どうする家康》第17集〈三方ヶ原合戦〉首次登場，飾演織田信長之女五徳。',source:'https://www.nhk-ondemand.jp/goods/G2023127719SA000/',sourceLabel:'NHK 第17集',interview:'https://www.tokion.jp/2023/09/06/interview-shiori-kubo/'},
    {
      year: '2025', title: '畢業，走向新的篇章',
      ja: {"title": "横浜アリーナで卒業コンサート", "text": "2025年11月25日にソロ曲「夢の匂い」のMVが公開された。翌26日から2日間にわたり、横浜アリーナで卒業コンサートを開催。乃木坂46卒業後も俳優として活動するなど、活躍の場を広げている。", "sourceLabel": "卒業コンサート特設サイト", "relatedLabel": "「夢の匂い」公式MV"},
      text: '2025 年 11 月 25 日公開個人曲〈夢の匂い〉MV，11 月 26、27 日在橫濱 Arena 舉行畢業演唱會。從乃木坂46畢業後，她繼續以演員等不同身分展開活動。',
      source: 'https://www.nogizaka46.com/s/n46/page/kubo_graduation', sourceLabel: '畢業演唱會特設網站',
      related: {url: 'https://youtu.be/7bqePXphj2g', label: '〈夢の匂い〉官方 MV'},
    },
    {year:'2026',title:'報知映画賞・新人賞入圍',
      ja: {"title": "報知映画賞の新人賞にノミネート", "text": "2026年11月10日、第51回報知映画賞の候補者が発表された。久保史緒里は映画『ほどなく、お別れです』の長野玲奈役で新人賞にノミネートされた。"},
      text:'電影《ほどなく、お別れです》（長野玲奈役）獲第51回報知映画賞新人賞提名，2026年11月10日正式公布。目前仍為候選名單，尚未公布得獎結果。',source:'https://prtimes.jp/main/html/rd/p/000001049.000071317.html'},
  ];
  function actualStatus(w){const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());if(w.status==='upcoming'&&w.start&&today>=w.start)return 'unknown';return w.status||'unknown';}
  function statusLabel(w){
    const status=actualStatus(w);
    if(japanese && w.category==='串流作品') {
      if(status==='completed')return '配信済み';
      if(status==='upcoming')return '配信予定';
      if(status==='ongoing')return '配信中';
    }
    if(status!=='completed')return statusNames[status];return ['舞台劇','音樂劇'].includes(w.category)?'已演出':w.category==='電影'?'已上映':'已播出';}
  function render(){
    const category=$('#acting-category'), status=$('#acting-status'); category.value=[...category.options].some(o=>o.value===view.category)?view.category:'all';status.value=view.status;
    const terms=window.Archive.normalize(view.q).split(' ').filter(Boolean);
    let shown=works.filter(w=>(view.year==='all'||view.year===w.year)&&(category.value==='all'||w.category===category.value)&&(status.value==='all'||actualStatus(w)===status.value)&&terms.every(t=>window.Archive.normalize([w.title,w.role,w.description,w.year,w.category,label(w.category),label(w.role)].join(' ')).includes(t)));
    shown.sort((a,b)=>(view.sort==='asc'?1:-1)*((a.sortDate||a.year).localeCompare(b.sortDate||b.year)||a.id-b.id));
    $('#acting-count').textContent=japanese
      ? `${view.year==='all'?'すべての年':view.year+'年'} · 作品${shown.length}件${shown.length>limit?'（'+limit+'件を表示）':''}`
      : `${view.year==='all'?'全部年份':view.year+' 年'} · ${shown.length} 筆作品${shown.length>limit?'，顯示前 '+limit+' 筆':''}`;
    list.innerHTML=shown.slice(0,limit).map(w=>`<article class="acting-card">${w.image?`<img class="work-thumb" src="${esc(w.image)}" alt="${esc(w.title)}・${esc(label(w.imageType))}" loading="lazy" decoding="async">`:`<div class="work-thumb work-thumb-empty" aria-hidden="true">${esc(label(w.category))}</div>`}<div class="acting-card-meta">${esc(w.year)} <span>${esc(label(w.category))}</span></div><h4 lang="ja">${esc(w.title)}</h4><p>${esc(label(w.role))}<br><span class="work-status">${esc(label(statusLabel(w)))}</span>${w.awards?.length?`<br><span class="award-nomination">${esc(w.awards[0].award)}・${esc(w.awards[0].category)}${t('提名','ノミネート')}</span>`:''}</p><button type="button" data-work="${w.id}" aria-label="${t('查看作品','作品の詳細')}：${esc(w.title)}">${t('查看作品','作品の詳細')} <span aria-hidden="true">↗</span></button></article>`).join('')||t('<p>這個篩選條件下沒有作品。</p>','<p>条件に合う作品はありません。</p>');
    $('#acting-more').hidden=shown.length<=limit;
    const relevant = milestones.filter(m => view.year === 'all' || m.year === view.year);
    const milestoneList = $('#milestones');
    milestoneList.hidden = view.mode === 'text' || !relevant.length;
    milestoneList.innerHTML = relevant.map(m => {
      const copy = japanese && m.ja ? m.ja : m;
      return `<article class="milestone">
      <span>${m.year} · ${t('生涯里程碑','主な節目')}</span>
      <h3>${esc(copy.title)}</h3>
      <p>${esc(copy.text)} <a href="${esc(m.source)}" target="_blank" rel="noopener noreferrer">${esc(copy.sourceLabel || t('來源','出典'))} ↗</a>${m.interview ? ` · <a href="${esc(m.interview)}" target="_blank" rel="noopener noreferrer">${t('久保本人訪談','本人インタビュー')} ↗</a>` : ''}${m.related ? ` · <a href="${esc(m.related.url)}" target="_blank" rel="noopener noreferrer">${esc(copy.relatedLabel || m.related.label)} ↗</a>` : ''}</p>
    </article>`;
    }).join('');
  }
  window.addEventListener('archive-view-change',e=>{view=e.detail;limit=6;render();});
  $('#acting-more').addEventListener('click',()=>{limit+=6;render();});
  for(const [id,key] of [['acting-category','category'],['acting-status','status']]) $('#'+id).addEventListener('change',e=>window.setArchiveExtra(key,e.target.value));
  list.addEventListener('click',e=>{const button=e.target.closest('[data-work]');if(!button)return;const w=works.find(x=>String(x.id)===button.dataset.work);if(!w)return;opener=button;
    $('#acting-detail').innerHTML=`<p class="eyebrow">${esc(w.year)} · ${esc(label(w.category))} · ${esc(label(statusLabel(w)))}</p><h2 id="acting-dialog-title" lang="ja">${esc(w.title)}</h2><p class="work-lead-role">${esc(label(w.role))}</p>${w.image?`<figure class="acting-photo"><a href="${esc(w.image)}" target="_blank" rel="noopener noreferrer" aria-label="${t('放大','拡大：')}${esc(label(w.imageType))}"><img src="${esc(w.image)}" alt="${esc(w.title)}・${esc(label(w.imageType))}"></a><figcaption>${esc(label(w.imageType))} · ${esc(label(w.imageCredit))}</figcaption></figure>`:`<p class="image-unavailable">${esc(label(w.imageMissingReason))}</p>`}<dl><dt>${t('演出日期','公開・放送・上演日')}</dt><dd lang="zh-Hant">${esc(w.date)}</dd><dt>${t('角色簡介','役柄')}</dt><dd lang="zh-Hant">${esc(w.roleDescription)}</dd><dt>${t('作品介紹','作品紹介')}</dt><dd lang="zh-Hant">${esc(w.description)}</dd></dl>${w.awards?.length?`<section class="acting-awards" aria-label="${t('獎項提名','ノミネート歴')}"><h3>${t('獎項提名','ノミネート歴')}</h3>${w.awards.map(a=>`<p><strong>${esc(a.award)}・${esc(a.category)}</strong> — ${esc(label(a.status))}<br><time>${esc(a.announcedAt)}</time> · <a href="${esc(a.source)}" target="_blank" rel="noopener noreferrer">${t('報知新聞社正式公告','報知新聞社の発表')} ↗</a></p>`).join('')}</section>`:''}${w.roleNote?`<p class="role-note">${t('名稱核對：','役名について：')}${esc(label(w.roleNote))}</p>`:''}<nav class="work-sources" aria-label="${t('作品來源','出典')}">${(w.sources||[{label:'官方資料',url:w.source}]).map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(label(x.label))} ↗</a>`).join('')}</nav><p class="acting-source-note">${t('資料核對：','確認日：')}${esc(w.verifiedAt)} · ${t('預定日期與播出狀態依官方後續公告更新。','日程・放送状況は公式発表に基づき更新します。')}</p>`;
    dialog.showModal();$('#acting-close').focus();});
  $('#acting-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>opener?.focus());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
  fetch('acting-data.json?v=20261110-hochi-nomination').then(r=>{if(!r.ok)throw Error('load');return r.json()}).then(data=>{works=data;for(const value of ['電影','日劇','舞台劇','音樂劇','串流作品','廣播劇']){const option=document.createElement('option');option.value=value;option.textContent=label(value);$('#acting-category').append(option);}const counts={};for(const w of data)counts[w.year]=(counts[w.year]||0)+1;window.registerActingYears(Object.keys(counts),counts);render();}).catch(()=>{$('#acting-count').textContent=t('作品資料暫時無法讀取，請重新整理。','作品情報を読み込めませんでした。ページを再読み込みしてください。');});
})();
