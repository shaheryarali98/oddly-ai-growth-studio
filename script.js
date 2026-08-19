const q=(selector,context=document)=>context.querySelector(selector);
const qa=(selector,context=document)=>[...context.querySelectorAll(selector)];
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}
  });
},{threshold:.12,rootMargin:'0px 0px -40px'});
qa('[data-reveal]').forEach(element=>revealObserver.observe(element));

const header=q('.site-header');
const progress=q('.scroll-progress i');
const parallaxItems=qa('[data-parallax]');
const motionLab=q('#motionLab');
const motionTrack=q('.motion-track');
const scrollCards=qa('[data-scroll-card]');
let ticking=false;
const clamp=(value,min=0,max=1)=>Math.min(max,Math.max(min,value));
function updateScrollMotion(y){
  if(motionLab&&motionTrack&&window.innerWidth>850&&!reduceMotion){
    const travel=Math.max(1,motionLab.offsetHeight-window.innerHeight);
    const sectionProgress=clamp((y-motionLab.offsetTop)/travel);
    const maxShift=Math.max(0,motionTrack.scrollWidth-window.innerWidth+window.innerWidth*.055);
    motionTrack.style.setProperty('--lab-x',`${-sectionProgress*maxShift}px`);
    motionLab.style.setProperty('--lab-progress',sectionProgress.toFixed(3));
  }
  if(!reduceMotion&&window.innerWidth>850){
    scrollCards.forEach(card=>{
      const rect=card.getBoundingClientRect();
      const distance=(rect.top+rect.height/2-window.innerHeight/2)/window.innerHeight;
      const active=Math.abs(distance)<1.4;
      if(active){
        card.style.setProperty('--card-y',`${Math.abs(distance)*13}px`);
        card.style.setProperty('--card-rx',`${clamp(distance,-1,1)*-2.2}deg`);
        card.style.setProperty('--media-inset',`${Math.abs(distance)*1.2}%`);
      }
    });
  }
}
function updateScroll(){
  const y=window.scrollY;
  const max=document.documentElement.scrollHeight-window.innerHeight;
  progress.style.height=(max>0?y/max*100:0)+'%';
  header.classList.toggle('sticky',y>90);
  if(!reduceMotion)parallaxItems.forEach(item=>item.style.transform=`translate3d(0,${y*Number(item.dataset.parallax)}px,0)`);
  updateScrollMotion(y);
  ticking=false;
}
window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateScroll);ticking=true}},{passive:true});
window.addEventListener('resize',updateScroll,{passive:true});
updateScroll();

const cursor=q('.cursor');
if(cursor){
  window.addEventListener('pointermove',event=>{cursor.style.left=event.clientX+'px';cursor.style.top=event.clientY+'px'});
  qa('a,button,.case,.story-card,.capability-grid article').forEach(element=>{
    element.addEventListener('mouseenter',()=>cursor.classList.add('active'));
    element.addEventListener('mouseleave',()=>cursor.classList.remove('active'));
  });
}

const videoObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    const video=entry.target;
    if(entry.isIntersecting&&!reduceMotion){const attempt=video.play();if(attempt)attempt.catch(()=>{})}
    else video.pause();
  });
},{threshold:.08,rootMargin:'150px'});
qa('video').forEach(video=>videoObserver.observe(video));

qa('.story-card,.case,.capability-grid article,.motion-card').forEach(element=>{
  element.classList.add('spotlight');
  element.addEventListener('pointermove',event=>{
    const rect=element.getBoundingClientRect();
    element.style.setProperty('--spot-x',`${event.clientX-rect.left}px`);
    element.style.setProperty('--spot-y',`${event.clientY-rect.top}px`);
  });
});

function addTilt(element,limit,prefix){
  if(!element||reduceMotion)return;
  element.addEventListener('pointermove',event=>{
    if(window.innerWidth<=850)return;
    const rect=element.getBoundingClientRect();
    const x=(event.clientX-rect.left)/rect.width-.5;
    const y=(event.clientY-rect.top)/rect.height-.5;
    element.style.setProperty(`--${prefix}-ry`,`${x*limit}deg`);
    element.style.setProperty(`--${prefix}-rx`,`${y*limit*-1}deg`);
  });
  element.addEventListener('pointerleave',()=>{
    element.style.setProperty(`--${prefix}-ry`,'0deg');
    element.style.setProperty(`--${prefix}-rx`,'0deg');
  });
}
addTilt(q('.dashboard-wrap'),1.5,'dash');
addTilt(q('.intro-film'),3,'film');

const hero=q('.hero');
const liveCard=q('.live-card');
if(hero&&liveCard&&!reduceMotion){
  hero.addEventListener('pointermove',event=>{
    if(window.innerWidth<=850)return;
    const x=event.clientX/window.innerWidth-.5;
    const y=event.clientY/window.innerHeight-.5;
    liveCard.style.translate=`${x*10}px ${y*8}px`;
  });
  hero.addEventListener('pointerleave',()=>liveCard.style.translate='0 0');
}

const countObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  const element=entry.target;
  const match=element.textContent.trim().match(/^([\d.]+)(.*)$/);
  if(!match)return;
  const target=Number(match[1]);
  const suffix=match[2];
  const decimal=match[1].includes('.')?1:0;
  const start=performance.now();
  element.classList.add('counting');
  const tick=now=>{
    const amount=clamp((now-start)/1100);
    const eased=1-Math.pow(1-amount,3);
    element.textContent=(target*eased).toFixed(decimal)+suffix;
    if(amount<1)requestAnimationFrame(tick);else element.classList.remove('counting');
  };
  requestAnimationFrame(tick);
  countObserver.unobserve(element);
}),{threshold:.65});
qa('.proof-numbers strong').forEach(number=>countObserver.observe(number));

qa('.dash-nav button').forEach(button=>button.addEventListener('click',()=>{
  qa('.dash-nav button').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  qa('.tab-panel').forEach(panel=>panel.classList.remove('active'));
  q('#'+button.dataset.tab).classList.add('active');
  const headings={overview:'Morning, Alex 👋',seo:'SEO & Search',calls:'Calls & Leads',calendar:'Campaign calendar',profile:'Profile & Tags'};
  q('#dashboardTitle').textContent=headings[button.dataset.tab];
}));

const modal=q('#portalModal');
function setModal(open){
  modal.classList.toggle('open',open);
  modal.setAttribute('aria-hidden',String(!open));
  document.body.classList.toggle('modal-open',open);
  if(open)setTimeout(()=>q('#loginEmail').focus(),120);
}
qa('.portal-open').forEach(button=>button.addEventListener('click',()=>setModal(true)));
q('.modal-close').addEventListener('click',()=>setModal(false));
q('.modal-backdrop').addEventListener('click',()=>setModal(false));
document.addEventListener('keydown',event=>{if(event.key==='Escape')setModal(false)});
q('.show-pass').addEventListener('click',event=>{
  const input=event.currentTarget.previousElementSibling;
  input.type=input.type==='password'?'text':'password';
  event.currentTarget.textContent=input.type==='password'?'Show':'Hide';
});
q('.login-submit').addEventListener('click',()=>{
  setModal(false);q('#portal').scrollIntoView({behavior:'smooth'});
  const toast=q('#toast');toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),3000);
});

q('#playReel').addEventListener('click',()=>q('#system').scrollIntoView({behavior:'smooth'}));
q('.menu-button').addEventListener('click',()=>header.classList.toggle('menu-open'));
qa('.desktop-nav a').forEach(link=>link.addEventListener('click',()=>header.classList.remove('menu-open')));

qa('.faq-item button').forEach(button=>button.addEventListener('click',()=>{
  const current=button.closest('.faq-item');
  const wasOpen=current.classList.contains('open');
  qa('.faq-item').forEach(item=>{item.classList.remove('open');q('button i',item).textContent='+'});
  if(!wasOpen){current.classList.add('open');q('i',button).textContent='−'}
}));
