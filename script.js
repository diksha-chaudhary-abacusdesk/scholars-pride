const triggers=[...document.querySelectorAll('.desktop-nav [data-menu]')];
const megaWrap=document.querySelector('.mega-wrap');
const panels=[...document.querySelectorAll('.mega')];
const menuButton=document.querySelector('.menu-btn');
const drawer=document.querySelector('.mobile-drawer');
const drawerClose=document.querySelector('.drawer-close');

function openMega(name){
  triggers.forEach(button=>button.classList.toggle('active',button.dataset.menu===name));
  panels.forEach(panel=>panel.classList.toggle('active',panel.id===`mega-${name}`));
  megaWrap.classList.add('open');
  megaWrap.setAttribute('aria-hidden','false');
}
function closeMega(){
  triggers.forEach(button=>button.classList.remove('active'));
  panels.forEach(panel=>panel.classList.remove('active'));
  megaWrap.classList.remove('open');
  megaWrap.setAttribute('aria-hidden','true');
}
triggers.forEach(button=>button.addEventListener('click',event=>{
  event.stopPropagation();
  button.classList.contains('active')?closeMega():openMega(button.dataset.menu);
}));
let megaCloseTimer;
triggers.forEach(button=>button.addEventListener('mouseenter',()=>{
  clearTimeout(megaCloseTimer);
  openMega(button.dataset.menu);
}));
megaWrap?.addEventListener('mouseenter',()=>clearTimeout(megaCloseTimer));
megaWrap?.addEventListener('mouseleave',()=>{
  megaCloseTimer=setTimeout(closeMega,180);
});
document.addEventListener('click',event=>{if(!event.target.closest('.mega-wrap')&&!event.target.closest('.desktop-nav'))closeMega()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeMega();closeDrawer()}});

function openDrawer(){drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');menuButton.setAttribute('aria-expanded','true');document.body.classList.add('menu-open')}
function closeDrawer(){drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');menuButton.setAttribute('aria-expanded','false');document.body.classList.remove('menu-open')}
menuButton.addEventListener('click',()=>drawer.classList.contains('open')?closeDrawer():openDrawer());
drawerClose.addEventListener('click',closeDrawer);
document.querySelector('.quick-menu').addEventListener('click',openDrawer);
drawer.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeDrawer));

function wireScroller(trackSelector,previousSelector,nextSelector,cardSelector){
  const track=document.querySelector(trackSelector);
  if(!track)return;
  const move=direction=>{
    const cards=[...track.querySelectorAll(cardSelector)];
    if(cards.length<2)return;
    const gap=parseFloat(getComputedStyle(track).columnGap)||0;
    const cardWidth=cards[0].getBoundingClientRect().width;
    const step=cardWidth+gap;
    const visible=Math.max(1,Math.floor((track.clientWidth+gap)/step));
    const lastIndex=Math.max(0,cards.length-visible);
    const current=Math.min(lastIndex,Math.max(0,Math.round(track.scrollLeft/step)));
    const target=current+direction<0?lastIndex:current+direction>lastIndex?0:current+direction;
    const origin=cards[0].offsetLeft;
    track.scrollTo({left:cards[target].offsetLeft-origin,behavior:'smooth'});
  };
  document.querySelector(previousSelector)?.addEventListener('click',()=>move(-1));
  document.querySelector(nextSelector)?.addEventListener('click',()=>move(1));
}
wireScroller('.notice-scroller','.notice-prev','.notice-next','article');
wireScroller('.institution-track','.institution-prev','.institution-next','.institution-card');
wireScroller('.research-track','.research-prev','.research-next','a');
const achievers=document.querySelector('.achievers');
if(achievers){[...achievers.children].forEach(card=>achievers.append(card.cloneNode(true)))}
wireScroller('.achievers','.placement-prev','.placement-next','article');

const headerSearch=document.querySelector('.search');
const finderInput=document.querySelector('.finder input[type="search"]');
headerSearch?.addEventListener('click',()=>{
  document.querySelector('#program-search')?.scrollIntoView({behavior:'smooth',block:'center'});
  window.setTimeout(()=>finderInput?.focus(),450);
});
document.querySelector('.finder')?.addEventListener('submit',event=>{
  event.preventDefault();
  const query=finderInput?.value.trim();
  if(!query){finderInput?.focus();return}
  const resultLabel=document.querySelector('.finder-result')||document.createElement('p');
  resultLabel.className='finder-result';
  resultLabel.textContent=`Showing programme pathways related to “${query}”.`;
  if(!resultLabel.parentElement)event.currentTarget.append(resultLabel);
});
document.querySelectorAll('.path-chips button').forEach(button=>button.addEventListener('click',()=>{
  document.querySelector('.finder input').value=button.textContent;
  document.querySelector('.finder input').focus();
}));

document.querySelectorAll('.academic-card').forEach(card=>card.addEventListener('click',event=>{
  const isTouchLike=window.matchMedia('(hover: none)').matches;
  if(isTouchLike||event.target.closest('span')){
    event.preventDefault();
    const willOpen=!card.classList.contains('is-open');
    document.querySelectorAll('.academic-card.is-open').forEach(item=>item.classList.remove('is-open'));
    card.classList.toggle('is-open',willOpen);
  }
}));

const knowledgeTrack=document.querySelector('[data-logo-library="all"]');
if(knowledgeTrack){knowledgeTrack.innerHTML='<span>Integrity</span><span>Perseverance</span><span>Respect</span><span>Empathy</span><span>Responsibility</span><span>Care</span>';}
const corporateTrack=document.querySelector('.logo-row');
if(corporateTrack){corporateTrack.innerHTML+=corporateTrack.innerHTML;corporateTrack.classList.add('logo-loop')}

const counters=document.querySelectorAll('[data-count]');
const counterObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting||entry.target.dataset.counted)return;
  const element=entry.target; element.dataset.counted='true';
  const target=Number(element.dataset.count); const prefix=element.dataset.prefix||''; const suffix=element.dataset.suffix||'';
  const started=performance.now(); const duration=1200;
  const draw=now=>{const progress=Math.min((now-started)/duration,1);const value=Math.round(target*(1-Math.pow(1-progress,3)));element.textContent=prefix+value.toLocaleString('en-IN')+suffix;if(progress<1)requestAnimationFrame(draw)};
  requestAnimationFrame(draw);
}),{threshold:.45});
counters.forEach(counter=>counterObserver.observe(counter));

// Progressive section reveals: enabled only when motion is welcome and JS is active.
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion&&'IntersectionObserver' in window){
  document.documentElement.classList.add('reveal-ready');
  const revealGroups=[
    '.notice-scroller article',
    '.academic-showcase .academic-card',
    '.institution-track .institution-card',
    '.admissions-cards a',
    '.research-track>a',
    '.sports-mosaic>*',
    '.placement-stats>div',
    '.achievers>article',
    '.about-impact-stats>div',
    '.happening-layout article',
    '.footer-grid>div'
  ];
  const revealElements=new Set([
    ...document.querySelectorAll('main .section>.shell, main .section>.about-impact, main .section>.knowledge'),
    ...revealGroups.flatMap(selector=>[...document.querySelectorAll(selector)])
  ]);
  revealGroups.forEach(selector=>{
    document.querySelectorAll(selector).forEach((element,index)=>{
      element.style.setProperty('--reveal-delay',`${Math.min(index%6,5)*70}ms`);
    });
  });
  revealElements.forEach(element=>element.classList.add('scroll-reveal'));
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('is-revealed');
    revealObserver.unobserve(entry.target);
  }),{rootMargin:'0px 0px -9% 0px',threshold:.08});
  revealElements.forEach(element=>revealObserver.observe(element));
}

// Notice filters
document.querySelectorAll('.notice-filters button').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.notice-filters button').forEach(item=>item.classList.toggle('active',item===button));const filter=button.dataset.filter;document.querySelectorAll('.notice-list-v1 article').forEach(item=>item.classList.toggle('is-hidden',filter!=='all'&&item.dataset.category!==filter));}));

// Automatic vertical notice loop. It pauses while the visitor is reading or using filters.
const noticeFeed=document.querySelector('.notice-list-v1');
if(noticeFeed){
  let noticeTimer;
  const startNoticeLoop=()=>{
    clearInterval(noticeTimer);
    noticeTimer=setInterval(()=>{
      const visible=[...noticeFeed.querySelectorAll('article:not(.is-hidden)')];
      if(visible.length<2)return;
      const current=visible.findIndex(item=>item.offsetTop>=noticeFeed.scrollTop-2);
      const next=visible[(current+1)%visible.length];
      noticeFeed.scrollTo({top:next===visible[0]?0:next.offsetTop-10,behavior:'smooth'});
    },2600);
  };
  noticeFeed.addEventListener('mouseenter',()=>clearInterval(noticeTimer));
  noticeFeed.addEventListener('mouseleave',startNoticeLoop);
  noticeFeed.addEventListener('focusin',()=>clearInterval(noticeTimer));
  noticeFeed.addEventListener('focusout',startNoticeLoop);
  document.querySelectorAll('.notice-filters button').forEach(button=>button.addEventListener('click',()=>{noticeFeed.scrollTop=0;startNoticeLoop()}));
  startNoticeLoop();
}

// Local hero gallery: avoids third-party video loading delays and rotates campus imagery.
const heroSlides=[...document.querySelectorAll('.hero-slider img')];
if(heroSlides.length>1&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
  let slideIndex=0;
  setInterval(()=>{
    heroSlides[slideIndex].classList.remove('is-active');
    slideIndex=(slideIndex+1)%heroSlides.length;
    heroSlides[slideIndex].classList.add('is-active');
  },5200);
}
