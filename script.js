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
const motionSections=qa('main > section:not(.ticker)');
const sectionZoomTargets=qa('.hero-content,.intro-copy,.motion-heading,.system-heading,.capability-intro,.portal-heading,.work-heading,.proof-quote,.process-heading,.faq-heading,.cta-content');
motionSections.forEach(section=>section.classList.add('motion-section'));
sectionZoomTargets.forEach(target=>{
  target.classList.add('section-zoom-target');
  if(!target.hasAttribute('data-reveal'))target.classList.add('visible');
});

const sectionObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>entry.target.classList.toggle('is-inview',entry.isIntersecting));
},{threshold:.025,rootMargin:'-4% 0px -4%'});
motionSections.forEach(section=>sectionObserver.observe(section));

const signatureObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('motion-fired');
    signatureObserver.unobserve(entry.target);
  });
},{threshold:.08,rootMargin:'0px 0px -8%'});
motionSections.forEach(section=>signatureObserver.observe(section));

const signatureTargets=qa('.intro-film,.motion-heading,.system-heading,.capability-grid,.dashboard-wrap,.work-grid,.proof-quote,.proof-numbers,.process-list,.faq-list,.cta-content');
const motionTargetObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('motion-entered');
    motionTargetObserver.unobserve(entry.target);
  });
},{threshold:.12,rootMargin:'0px 0px -8%'});
signatureTargets.forEach(target=>motionTargetObserver.observe(target));

// Anchor jumps and restored tabs can land after the observers' first sample.
// This keeps visible sections from remaining hidden while preserving lazy motion elsewhere.
setTimeout(()=>{
  qa('[data-reveal]').forEach(element=>{
    const rect=element.getBoundingClientRect();
    if(rect.bottom>0&&rect.top<window.innerHeight)element.classList.add('visible');
  });
  motionSections.forEach(section=>{
    const rect=section.getBoundingClientRect();
    if(rect.bottom>0&&rect.top<window.innerHeight)section.classList.add('motion-fired','is-inview');
  });
  signatureTargets.forEach(target=>{
    const rect=target.getBoundingClientRect();
    if(rect.bottom>0&&rect.top<window.innerHeight)target.classList.add('motion-entered');
  });
},900);

qa('.capability-grid article,.metric-grid article,.proof-numbers div,.process-list article,.faq-item').forEach((item,index)=>{
  const group=item.parentElement;
  const siblings=[...group.children];
  item.style.setProperty('--item-index',siblings.indexOf(item));
});
scrollCards.forEach((card,index)=>{
  card.style.setProperty('--stack-top',`${92+index*14}px`);
});

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
    const viewportCenter=window.innerHeight/2;
    motionSections.forEach(section=>{
      const rect=section.getBoundingClientRect();
      const distance=(rect.top+rect.height/2-viewportCenter)/(window.innerHeight*.92);
      const focus=clamp(1-Math.abs(distance));
      const entryFocus=clamp((window.innerHeight-rect.top)/(window.innerHeight*.55));
      const travel=clamp((window.innerHeight-rect.top)/(window.innerHeight+rect.height));
      const drift=(travel-.5)*2;
      section.style.setProperty('--motion-focus',focus.toFixed(3));
      section.style.setProperty('--motion-drift',drift.toFixed(3));
      section.style.setProperty('--motion-offset',`${(1-entryFocus)*25}px`);
      section.style.setProperty('--motion-scale',(0.91+entryFocus*.09).toFixed(3));
      section.style.setProperty('--motion-orb-opacity',(0.18+focus*.64).toFixed(3));
      section.style.setProperty('--motion-orb-y',`${drift*35}px`);
      section.style.setProperty('--motion-orb-scale',(0.78+focus*.25).toFixed(3));
      section.style.setProperty('--media-scale',(1.04+focus*.045).toFixed(3));
    });
    const heroSection=q('.hero');
    if(heroSection)heroSection.style.setProperty('--hero-scale',(1.08+clamp(y/window.innerHeight)*.055).toFixed(3));
    const introSection=q('.intro');
    if(introSection)introSection.style.setProperty('--film-scale',(0.95+Number(introSection.style.getPropertyValue('--motion-focus')||0)*.05).toFixed(3));
    const portalSection=q('.portal-section');
    if(portalSection)portalSection.style.setProperty('--dash-scale',(0.94+Number(portalSection.style.getPropertyValue('--motion-focus')||0)*.06).toFixed(3));
    scrollCards.forEach(card=>{
      const rect=card.getBoundingClientRect();
      const distance=(rect.top+rect.height/2-window.innerHeight/2)/window.innerHeight;
      const active=Math.abs(distance)<1.4;
      if(active){
        const intensity=clamp(Math.abs(distance),0,1);
        card.style.setProperty('--card-y',`${intensity*22}px`);
        card.style.setProperty('--card-rx',`${clamp(distance,-1,1)*-4.5}deg`);
        card.style.setProperty('--stack-scale',(1-intensity*.055).toFixed(3));
        card.style.setProperty('--media-inset',`${intensity*2.8}%`);
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
  qa('a,button,.case,.story-card,.capability-grid article,.motion-card,.process-list article,.faq-item,.proof-numbers div,.metric-grid article,.chart-card,.activity-card').forEach(element=>{
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

qa('.pill,.reel-button,.text-link').forEach(element=>{
  if(reduceMotion)return;
  element.addEventListener('pointermove',event=>{
    if(window.innerWidth<=850)return;
    const rect=element.getBoundingClientRect();
    const x=(event.clientX-rect.left-rect.width/2)*.11;
    const y=(event.clientY-rect.top-rect.height/2)*.16;
    element.style.translate=`${x}px ${y}px`;
  });
  element.addEventListener('pointerleave',()=>element.style.translate='0 0');
});

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
