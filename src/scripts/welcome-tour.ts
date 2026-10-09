export function startWelcomeTour() {
 const card=document.querySelector<HTMLElement>('[data-tour-card]'); if(!card)return;
 const light=document.querySelector<HTMLElement>('[data-tour-spotlight]')!;
 const title=card.querySelector('h2')!, description=card.querySelector('p')!;
 const next=card.querySelector<HTMLButtonElement>('[data-tour-next]')!;
 const skip=card.querySelector<HTMLButtonElement>('[data-tour-skip]')!;
 const back=card.querySelector<HTMLButtonElement>('[data-tour-back]')!;
 const progress=card.querySelector<HTMLElement>('[data-tour-progress]')!;
 const action=card.querySelector<HTMLAnchorElement>('[data-tour-action]')!;
 const paw=document.querySelector<HTMLButtonElement>('.pyramid-toggle')!;
 const key='portfolio-welcome-seen-v1';
 const steps=[
  {title:'Welcome to my little corner.',text:'A short walk through my work, the story behind it, and a little hello to Lulu. Move at your own pace.',section:'pre-hero',target:'.mobile-welcome',href:'',label:''},
  {title:'First, a little introduction.',text:'Here’s what I do in business analytics and operations. The AI tools link opens a closer look at the tools I build and use.',section:'hero-story',target:'#hero-introduction-title',href:'/about/',label:'More about me'},
  {title:'How I approach the work.',text:'Follow the three papers: check the records, understand the gaps, and make the next step clear. My tools sit just below them.',section:'work-routine',target:'#desk-introduction-title',href:'/projects/analytics-agent/',label:'Explore Analytics Agent'},
  {title:'See the questions behind the projects.',text:'Customer retention, employee attrition, and practical tools. Open a case study for the evidence and decisions behind the result.',section:'featured-work',target:'#featured-heading',href:'/projects/',label:'Browse all projects'},
  {title:'Follow the path so far.',text:'This timeline connects my studies, experience, and recent work. Use its milestone buttons or arrows to explore each chapter.',section:'about',target:'#about-heading',href:'/about/',label:'Read my story'},
  {title:'Keep exploring, with Lulu.',text:'The paw menu opens Projects, Writing, About, and Contact. It also lets you hide Lulu or replay this tour. Tap Lulu to say hello.',section:'about',target:'.pyramid-toggle',href:'/writing/',label:'Open the working notebook'},
  {title:'Leave a note on my desk.',text:'A role, a project, or a little hello: the contact page is where to reach me. You can keep exploring from here or revisit any stop.',section:'connect',target:'#contact-heading',href:'/contact/',label:'Get in touch'},
 ];
 let step=0,active=false,frame=0,timer=0,restore:HTMLElement|null=null;
 const notify=(greet=false)=>window.dispatchEvent(new CustomEvent('portfolio:tour',{detail:{active,greet,footY:card.getBoundingClientRect().top-24}}));
 function seen(){try{localStorage.setItem(key,'1')}catch{}}
 function spotlight(){
  frame=0; if(card.hidden||!active)return;
  const selector=step===0&&document.querySelector<HTMLElement>('.scroll-hero')?.dataset.animated==='true'?'.opening-welcome':steps[step].target;
  const target=document.querySelector<HTMLElement>(selector);
  if(!target){light.hidden=true;return}
  // Heading boxes span the column. Point to the actual lettering instead.
  let r=target.getBoundingClientRect();
  if(target.matches('h1,h2,h3')){const range=document.createRange();range.selectNodeContents(target);r=range.getBoundingClientRect();}
  else if(target.matches('.pyramid-toggle'))r=target.querySelector('svg')!.getBoundingClientRect();
  if(!r.width||r.bottom<8||r.top>innerHeight-60){light.hidden=true;return}
  const side=r.right+74<innerWidth?'right':r.left>74?'left':r.top>74?'above':'below';
  const path=light.querySelector('path')!;
  const horizontal=side==='right'||side==='left';
  path.setAttribute('d',horizontal?'M58 8C42 0 28 33 4 32M13 25l-9 7 10 6':side==='above'?'M52 4Q28 4 32 56M24 46l8 10 8-10':'M52 60Q28 60 32 8M24 18l8-10 8 10');
  light.dataset.side=side;
  // The arrow tip lands six pixels outside the target edge, in every orientation.
  const x=side==='right'?r.right+2:side==='left'?r.left-66:r.left+r.width/2-32;
  const y=horizontal?r.top+r.height/2-32:side==='above'?r.top-62:r.bottom-2;
  light.style.left=`${x}px`;light.style.top=`${y}px`;
  light.hidden=false;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(spotlight)}
 function visit(){
  const id=steps[step].section,el=document.getElementById(id)!;
  const hero=document.querySelector<HTMLElement>('.scroll-hero')!;
  let top=el.getBoundingClientRect().top+scrollY;
  if(id==='pre-hero')top=0;
  else if((id==='hero-story'||id==='work-routine')&&hero.dataset.animated==='true')top=hero.offsetTop+(hero.offsetHeight-innerHeight)*(id==='hero-story'?.30:.82);
  else if(id==='featured-work'&&el.dataset.animated==='true'&&innerWidth>700)top+=(el.offsetHeight-innerHeight)*.66;
  else if(id==='hero-story')top=document.querySelector<HTMLElement>('.hero-introduction')!.getBoundingClientRect().top+scrollY;
  scrollTo({top:Math.max(0,top),behavior:'instant'});
 }
 function render(){
  card.hidden=false;card.dataset.step=String(step);title.textContent=steps[step].title;description.textContent=steps[step].text;
  next.textContent=!active?'Show me around':step===steps.length-1?'Finish tour':'Next';
  skip.textContent=active?'End tour':'I’ll explore';back.hidden=!active||step===0;
  progress.textContent=active?`${step+1} of ${steps.length}`:'A walk through the site';
  action.hidden=!active||!steps[step].href;action.href=steps[step].href;action.textContent=steps[step].label;
  if(!active){light.hidden=true;return}
  document.body.classList.add('tour-active');
  document.body.style.setProperty('--tour-space',`${card.offsetHeight+40}px`);
  visit();requestAnimationFrame(()=>{notify(step===5);schedule();next.focus({preventScroll:true})});
 }
 function finish(){
  active=false;card.hidden=true;light.hidden=true;seen();notify();
  document.body.classList.remove('tour-active');document.body.style.removeProperty('--tour-space');
  if(frame)cancelAnimationFrame(frame);frame=0;restore?.focus({preventScroll:true});
 }
 function begin(){
  clearTimeout(timer);restore=document.activeElement instanceof HTMLElement?document.activeElement:null;
  if(restore?.closest('#portfolio-navigation')||restore?.closest('[data-tour-card]'))restore=paw;
  if(paw.getAttribute('aria-expanded')==='true')paw.click();
  seen();active=true;step=0;render();
 }
 next.addEventListener('click',()=>{if(!active)begin();else if(step===steps.length-1)finish();else{step++;render()}});
 back.addEventListener('click',()=>{step=Math.max(0,step-1);render()});
 skip.addEventListener('click',finish);
 document.querySelectorAll('[data-tour-replay], [data-tour-start]').forEach(button=>button.addEventListener('click',begin));
 action.addEventListener('click',seen);
 addEventListener('keydown',event=>{if(event.key==='Escape'&&!card.hidden){event.preventDefault();finish()}});
 addEventListener('scroll',schedule,{passive:true});
 addEventListener('resize',()=>{if(active){visit();notify(step===5);schedule()}});
 let show=true;try{show=localStorage.getItem(key)!=='1'}catch{}
 if(show)timer=window.setTimeout(()=>{if(document.hidden)return;render()},4000);
}
