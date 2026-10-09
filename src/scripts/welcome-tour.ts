export function startWelcomeTour() {
 const card=document.querySelector<HTMLElement>('[data-tour-card]'); if(!card)return;
 const light=document.querySelector<HTMLElement>('[data-tour-spotlight]')!;
 const hint=document.querySelector<HTMLElement>('[data-tour-hint]')!;
 const hints=['Welcome','About me','How I work','Latest projects','My experience','Site menu','Contact me'];
 const dust=document.querySelector<HTMLElement>('[data-tour-dust]')!;
 const soundButton=card.querySelector<HTMLButtonElement>('[data-tour-sound]')!;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let soundOn=true;
 try{soundOn=localStorage.getItem('portfolio-tour-sound')!=='off'}catch{}
 let audio:AudioContext|null=null,burstPending=false,burstTimer=0;
 const tones=new Set<OscillatorNode>();
 function soundLabel(){soundButton.textContent=soundOn?'Sound on':'Sound off';soundButton.setAttribute('aria-pressed',String(soundOn));soundButton.setAttribute('aria-label',soundOn?'Mute tour sound':'Enable tour sound')}
 soundLabel();
 function primeSound(){
  if(!soundOn)return;
  try{audio??=new AudioContext();if(audio.state==='suspended')void audio.resume().catch(()=>{})}catch{}
 }
 function silence(){for(const tone of tones){try{tone.stop()}catch{}}tones.clear()}
 function chime(){
  silence();if(!soundOn||!audio||audio.state!=='running'||document.hidden)return;
  const context=audio,start=context.currentTime;
  [1046.5,1568,2093].forEach((frequency,index)=>{
   const at=start+index*.075;
   [1,2.76].forEach((partial,part)=>{
    const tone=context.createOscillator(),gain=context.createGain();
    tone.type='sine';tone.frequency.value=frequency*partial;
    gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(part?.002:.014,at+.035);gain.gain.exponentialRampToValueAtTime(.0001,at+.85);
    tone.connect(gain);gain.connect(context.destination);tones.add(tone);
    tone.onended=()=>{tones.delete(tone);tone.disconnect();gain.disconnect()};tone.start(at);tone.stop(at+.9);
   });
  });
 }
 soundButton.addEventListener('click',()=>{soundOn=!soundOn;try{localStorage.setItem('portfolio-tour-sound',soundOn?'on':'off')}catch{}soundLabel();if(soundOn){primeSound();chime()}else silence()});
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
  const selector=step===0?(document.querySelector<HTMLElement>('.scroll-hero')?.dataset.animated==='true'?'.opening-welcome .arabic-calligraphy':'.mobile-welcome .arabic-calligraphy'):steps[step].target;
  const target=document.querySelector<HTMLElement>(selector);
  if(!target){light.hidden=true;hint.hidden=true;dust.hidden=true;return}
  // Heading boxes span the column. Point to the actual lettering instead.
  let r=target.getBoundingClientRect();
  let lines=[r];
  if(target.matches('h1,h2,h3,.arabic-calligraphy')){const range=document.createRange();range.selectNodeContents(target);r=range.getBoundingClientRect();lines=Array.from(range.getClientRects()).filter((line,index,all)=>line.width>0&&!all.slice(0,index).some(previous=>Math.abs(previous.top-line.top)<2&&Math.abs(previous.left-line.left)<2));}
  else if(target.matches('.pyramid-toggle')){r=target.querySelector('svg')!.getBoundingClientRect();lines=[r];}
  if(!r.width||r.bottom<8||r.top>innerHeight-60){light.hidden=true;hint.hidden=true;dust.hidden=true;return}
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
  hint.textContent=hints[step];hint.hidden=false;
  const hintX=side==='left'?x-hint.offsetWidth+24:x+32;
  const hintY=horizontal?y+64:side==='above'?y-8:y+64;
  hint.style.left=`${Math.max(12,Math.min(innerWidth-hint.offsetWidth-12,hintX))}px`;
  hint.style.top=`${Math.max(12,Math.min(innerHeight-hint.offsetHeight-12,hintY))}px`;
  // Each line gets its own small dust trail; scrolling only repositions it.
  if(burstPending){
   dust.replaceChildren();
   lines.forEach(line=>{
    const group=document.createElement('div');group.className='dust-line';
    const count=reduced.matches?3:Math.min(18,Math.max(7,Math.round(line.width/19)));
    for(let i=0;i<count;i++){
     const star=document.createElementNS('http://www.w3.org/2000/svg','svg');
     star.classList.add('dust-star');star.setAttribute('viewBox','0 0 16 16');
     star.style.setProperty('--x',`${(i+.5)/count*100}%`);star.style.setProperty('--size',`${i%3===0?15:9}px`);star.style.setProperty('--delay',`${i/count*.9}s`);
     const shape=document.createElementNS('http://www.w3.org/2000/svg','path');
     shape.setAttribute('d',i%3===0?'M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6Z':'M8 4a4 4 0 1 0 0 8a4 4 0 1 0 0-8');shape.setAttribute('fill','currentColor');star.append(shape);group.append(star);
    }
    dust.append(group);
   });
   burstPending=false;chime();
  }
  dust.hidden=false;
  Array.from(dust.children).forEach((group,index)=>{const line=lines[index];if(!line)return;const el=group as HTMLElement;el.style.left=`${line.left}px`;el.style.top=`${line.bottom+4}px`;el.style.width=`${line.width}px`});
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
  if(!active){light.hidden=true;hint.hidden=true;return}
  document.body.classList.add('tour-active');
  document.body.style.setProperty('--tour-space',`${card.offsetHeight+40}px`);
  silence();clearTimeout(burstTimer);dust.hidden=true;dust.replaceChildren();burstPending=false;
  // Let visitors locate the arrow before revealing its dust and synchronized chime.
  burstTimer=window.setTimeout(()=>{if(active&&!document.hidden){burstPending=true;schedule()}},750);
  visit();requestAnimationFrame(()=>{notify(step===5);schedule();next.focus({preventScroll:true})});
 }
 function finish(){
  active=false;clearTimeout(burstTimer);card.hidden=true;light.hidden=true;hint.hidden=true;dust.hidden=true;dust.replaceChildren();burstPending=false;silence();seen();notify();
  document.body.classList.remove('tour-active');document.body.style.removeProperty('--tour-space');
  if(frame)cancelAnimationFrame(frame);frame=0;restore?.focus({preventScroll:true});
 }
 function begin(){
  primeSound();
  clearTimeout(timer);restore=document.activeElement instanceof HTMLElement?document.activeElement:null;
  if(restore?.closest('#portfolio-navigation')||restore?.closest('[data-tour-card]'))restore=paw;
  if(paw.getAttribute('aria-expanded')==='true')paw.click();
  seen();active=true;step=0;render();
 }
 next.addEventListener('click',()=>{primeSound();if(!active)begin();else if(step===steps.length-1)finish();else{step++;render()}});
 back.addEventListener('click',()=>{primeSound();step=Math.max(0,step-1);render()});
 skip.addEventListener('click',finish);
 document.querySelectorAll('[data-tour-replay], [data-tour-start]').forEach(button=>button.addEventListener('click',begin));
 action.addEventListener('click',seen);
 addEventListener('keydown',event=>{if(event.key==='Escape'&&!card.hidden){event.preventDefault();finish()}});
 addEventListener('scroll',schedule,{passive:true});
 document.fonts.ready.then(schedule);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)silence()});
 addEventListener('pagehide',()=>{silence();void audio?.close().catch(()=>{})});
 addEventListener('resize',()=>{if(active){visit();notify(step===5);schedule()}});
 let show=true;try{show=localStorage.getItem(key)!=='1'}catch{}
 if(show)timer=window.setTimeout(()=>{if(document.hidden)return;render()},4000);
}
