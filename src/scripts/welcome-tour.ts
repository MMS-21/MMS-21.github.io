export function startWelcomeTour(){
 const card=document.querySelector<HTMLElement>('[data-tour-card]');if(!card)return;
 const light=document.querySelector<HTMLElement>('[data-tour-spotlight]')!;
 const title=card.querySelector('h2')!,description=card.querySelector('p')!;
 const next=card.querySelector<HTMLButtonElement>('[data-tour-next]')!;
 const skip=card.querySelector<HTMLButtonElement>('[data-tour-skip]')!;
 const back=card.querySelector<HTMLButtonElement>('[data-tour-back]')!;
 const progress=card.querySelector<HTMLElement>('[data-tour-progress]')!;
 const paw=document.querySelector<HTMLButtonElement>('.pyramid-toggle')!;
 const replay=document.querySelector<HTMLButtonElement>('[data-tour-replay]')!;
 const key='portfolio-welcome-seen-v1';
 const steps=[
  {title:'Welcome to my little corner.',text:'A few quick pointers, and a little hello to Lulu.',target:''},
  {title:'Find your way.',text:'Projects, writing, and a little control for Lulu live in the paw menu.',target:'.pyramid-toggle'},
  {title:'Say hi to Lulu.',text:'Tap Lulu for a hello. Drag her somewhere new, or watch her explore. You can hide her in the paw menu.',target:'.lulu-character'},
  {title:'Start exploring.',text:'Pick a case study to see how I approach a business question.',target:'#featured-heading'}
 ];
 let step=0,active=false,frame=0,invitationTimer=0,restore:HTMLElement|null=null;
 const notify=(greet=false)=>window.dispatchEvent(new CustomEvent('portfolio:tour',{detail:{active,greet,footY:card.getBoundingClientRect().top-24}}));
 function seen(){try{localStorage.setItem(key,'1')}catch{}}
 function spotlight(){
  frame=0;if(card.hidden||!active||!step)return;
  const target=document.querySelector<HTMLElement>(steps[step].target),r=target?.getBoundingClientRect();
  if(r&&r.width&&r.height){light.hidden=false;light.style.left=`${Math.max(2,r.left-8)}px`;light.style.top=`${Math.max(2,r.top-8)}px`;light.style.width=`${Math.min(innerWidth-4,r.width+16)}px`;light.style.height=`${r.height+16}px`}
  else light.hidden=true;
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(spotlight)}
 function render(){
  card.hidden=false;card.dataset.step=String(step);title.textContent=steps[step].title;description.textContent=steps[step].text;
  next.textContent=step===0?'Show me around':step===3?'Explore projects':'Next';
  skip.textContent=step===0?'I’ll explore':'Skip';back.hidden=step<2;progress.textContent=`${step+1} of 4`;
  if(step===0){light.hidden=true;return}
  document.querySelector<HTMLElement>('#featured-work')!.scrollIntoView({block:'start',behavior:'instant'});
  requestAnimationFrame(()=>{notify(step===2);schedule()});next.focus({preventScroll:true});
 }
 function finish(explore=false){
  const wasActive=active;active=false;card.hidden=true;light.hidden=true;seen();notify();
  if(frame)cancelAnimationFrame(frame);frame=0;
  if(explore){const link=document.querySelector<HTMLAnchorElement>('#featured-work .paper-foot a');link?.focus({preventScroll:true})}
  else if(wasActive)restore?.focus({preventScroll:true});
 }
 function begin(){
  clearTimeout(invitationTimer);restore=document.activeElement instanceof HTMLElement?document.activeElement:null;
  if(restore?.closest('#portfolio-navigation')||restore?.closest('[data-tour-card]'))restore=paw;
  if(paw.getAttribute('aria-expanded')==='true')paw.click();
  seen();active=true;step=1;notify();render();
 }
 next.addEventListener('click',()=>{if(!active)begin();else if(step===3)finish(true);else{step++;render()}});
 back.addEventListener('click',()=>{step=Math.max(1,step-1);render()});
 skip.addEventListener('click',()=>finish());
 replay.addEventListener('click',begin);
 addEventListener('keydown',event=>{if(event.key==='Escape'&&!card.hidden){event.preventDefault();finish()}});
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{if(active){notify(step===2);schedule()}});
 document.querySelector('.lulu-character')?.addEventListener('click',()=>{if(active&&step===2){description.textContent='Lulu says hello! She waves, jumps, and finds little places to perch. Keep exploring whenever you’re ready.';schedule()}});
 let show=true;try{show=localStorage.getItem(key)!=='1'}catch{}
 if(show)invitationTimer=window.setTimeout(()=>{if(document.hidden)return;step=0;render();seen()},3000);
}
