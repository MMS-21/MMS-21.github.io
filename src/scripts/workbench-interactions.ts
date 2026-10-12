const papers = [...document.querySelectorAll<HTMLElement>('.project-paper')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mod = (n:number) => (n + papers.length) % papers.length;
let front = 0, busy = false, suppressClick = false;
let sound = localStorage.getItem('workbench-sound') !== 'off', audio:AudioContext|undefined, lastSound = 0;
function rustle(kind:'flip'|'open'|'close' = 'flip') {
 if (!sound || performance.now()-lastSound < 120) return;
 lastSound=performance.now();
 try {
  audio ??= new AudioContext(); void audio.resume();
  const duration=kind==='flip'?.18+Math.random()*.08:kind==='open'?.36:.22;
  const buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate);
  const samples=buffer.getChannelData(0);
  for(let i=0;i<samples.length;i++){const t=i/samples.length;samples[i]=(Math.random()*2-1)*Math.sin(Math.PI*t)**1.5*(.65+.35*Math.sin(t*28));}
  const source=audio.createBufferSource(), filter=audio.createBiquadFilter(), gain=audio.createGain();
  source.buffer=buffer;filter.type='bandpass';filter.frequency.value=(kind==='open'?1200:kind==='close'?950:1600)+Math.random()*600;filter.Q.value=.6;gain.gain.value=.027;
  source.connect(filter).connect(gain).connect(audio.destination);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};
 } catch { /* Audio is optional when the browser has no audio device. */ }
}
// Integrate a damped spring at bounded steps, independent of display refresh rate.
function spring(from:number[],to:number[],draw:(v:number[])=>void,k=180,d=22) {
 return new Promise<void>(resolve=>{
  if(reduced.matches){draw(to);resolve();return}
  const x=[...from],v=from.map(()=>0);let previous=performance.now(),start=previous;
  function frame(now:number){let remaining=Math.min((now-previous)/1000,.04);previous=now;
   while(remaining>0){const dt=Math.min(remaining,1/120);remaining-=dt;for(let i=0;i<x.length;i++){v[i]+=(k*(to[i]-x[i])-d*v[i])*dt;x[i]+=v[i]*dt;}}
   draw(x);
   if(now-start>1800||x.every((n,i)=>Math.abs(n-to[i])<.12&&Math.abs(v[i])<.2)){draw(to);resolve()}else requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
 });
}
const positions=papers.map(()=>[0,0,0]);
const slots=[[0,0,-5],[24,16,4],[-22,30,-3],[-38,43,5]];
function paint(i:number,p:number[]){positions[i]=[...p];papers[i].style.transform=`translate(calc(-50% + ${p[0]}px),${p[1]}px) rotate(${p[2]}deg)`;}
function update(){papers.forEach((p,i)=>{const rank=mod(i-front);p.dataset.front=String(rank===0);p.inert=rank!==0;p.setAttribute('aria-hidden',String(rank!==0));p.style.zIndex=String(10-rank);p.style.setProperty('--shade',String(rank*.035));});document.querySelector('.count')!.textContent=`${front+1} / ${papers.length}`;}
async function shuffle(direction:number){if(busy)return;busy=true;rustle();const old=front;front=mod(front+direction);
 const width=papers[old].offsetWidth;
 const others=papers.map((_,i)=>i).filter(i=>i!==old).map(i=>spring(positions[i],slots[mod(i-front)],p=>paint(i,p)));
 await spring(positions[old],[direction*width*.55,-24,direction*17],p=>paint(old,p),190,24);
 update();await Promise.all([...others,spring(positions[old],slots[mod(old-front)],p=>paint(old,p))]);busy=false;
}
papers.forEach((_,i)=>paint(i,slots[i]));update();
document.querySelectorAll('.switch-paper').forEach((b,i)=>b.addEventListener('click',()=>void shuffle(i===0?-1:1)));
const stack=document.querySelector<HTMLElement>('.stack')!;
stack.tabIndex=0;stack.setAttribute('aria-label','Project papers. Use left and right arrow keys to switch, or select a paper to enlarge.');
stack.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();void shuffle(e.key==='ArrowRight'?1:-1)}});
papers.forEach((paper,i)=>{
 const image=paper.querySelector<HTMLButtonElement>('.project-image')!;
 image.setAttribute('aria-label',`Enlarge ${paper.querySelector('h2')!.textContent}`);
 let pointer=-1,startX=0,startY=0,lastX=0,lastTime=0,velocity=0,dx=0,dy=0,drag=false;
 image.addEventListener('pointerdown',e=>{if(busy||i!==front||e.button!==0)return;pointer=e.pointerId;startX=lastX=e.clientX;startY=e.clientY;lastTime=performance.now();dx=dy=velocity=0;drag=false;image.setPointerCapture(pointer)});
 image.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;dx=e.clientX-startX;dy=e.clientY-startY;const now=performance.now();velocity=(e.clientX-lastX)/Math.max(1,now-lastTime)*1000;lastX=e.clientX;lastTime=now;if(Math.abs(dx)>38)drag=true;if(drag){paper.classList.add('dragging');paint(i,[dx,dy*.2,-5+Math.max(-20,Math.min(20,dx*.04))]);}});
 const release=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;pointer=-1;paper.classList.remove('dragging');if(!drag)return;suppressClick=true;setTimeout(()=>suppressClick=false,0);if(e.type!=='pointercancel'&&Math.abs(dx+velocity*.16)>paper.offsetWidth*.42)void shuffle(dx>0?1:-1);else{busy=true;void spring(positions[i],slots[0],p=>paint(i,p)).then(()=>busy=false)}};
 image.addEventListener('pointerup',release);image.addEventListener('pointercancel',release);
 image.addEventListener('click',()=>{if(!suppressClick&&!busy)void openCase(i,image)});
});
const soundButton=document.querySelector<HTMLButtonElement>('#sound')!;
function soundLabel(){soundButton.textContent=sound?'Sound on':'Sound off';soundButton.setAttribute('aria-pressed',String(sound))}soundLabel();
soundButton.addEventListener('click',()=>{sound=!sound;localStorage.setItem('workbench-sound',sound?'on':'off');soundLabel();if(sound)rustle()});
const drawer=document.querySelector<HTMLDialogElement>('#case-drawer')!,resume=document.querySelector<HTMLDialogElement>('#resume-sheet')!,collection=document.querySelector<HTMLDialogElement>('#works-collection')!;
function lock(){document.body.classList.toggle('sheet-open',[drawer,resume,collection].some(d=>d.open))}
let request=0,caseTrigger:HTMLElement|undefined;
async function openCase(index:number,trigger:HTMLElement){if(drawer.open)return;caseTrigger=trigger;const token=++request,paper=papers[index],link=paper.querySelector<HTMLAnchorElement>('h2 a')!,image=paper.querySelector<HTMLImageElement>('img')!;
 const origin=trigger.querySelector('img')?.getBoundingClientRect()??image.getBoundingClientRect();
 document.querySelector('#drawer-title')!.textContent=link.textContent;document.querySelector<HTMLAnchorElement>('#drawer-link')!.href=link.href;
 const chart=document.querySelector<HTMLImageElement>('#drawer-chart')!;chart.src=image.src;chart.alt=image.alt;
 const content=document.querySelector<HTMLElement>('#drawer-content')!;content.textContent='Loading the case study…';drawer.showModal();drawer.scrollTop=0;lock();rustle('open');
 if(!reduced.matches){const target=chart.getBoundingClientRect();chart.animate([{transformOrigin:'0 0',transform:`translate(${origin.left-target.left}px,${origin.top-target.top}px) scale(${origin.width/target.width},${origin.height/target.height})`},{transformOrigin:'0 0',transform:'none'}],{duration:600,easing:'cubic-bezier(.16,1,.3,1)'});}
 try{const response=await fetch(link.href);if(!response.ok)throw Error();const doc=new DOMParser().parseFromString(await response.text(),'text/html'),main=doc.querySelector('main');if(token!==request||!drawer.open)return;content.replaceChildren();if(main){const article=main.querySelector('article')||main;article.querySelectorAll('script,header,.back').forEach(el=>el.remove());content.append(article)}else content.textContent='Use the full case study link to continue.'}catch{if(token===request)content.textContent='The preview could not load. Open the full case study above.'}
}
document.querySelector<HTMLElement>('#expand-study')!.addEventListener('click',e=>void openCase(front,e.currentTarget as HTMLElement));
let collectionY=0,collectionBusy=false;
function slide(y:number){collectionY=y;collection.style.transform=`translateY(${y}px)`;}
const collectionTrigger=document.querySelector<HTMLButtonElement>('#collection-open')!;
collectionTrigger.addEventListener('click',async()=>{if(collection.open)return;collection.showModal();collection.scrollTop=0;lock();rustle('open');collectionTrigger.setAttribute('aria-expanded','true');collectionBusy=true;slide(innerHeight);await spring([innerHeight],[0],v=>slide(v[0]),240,26);collectionBusy=false;});
async function closeCollection(){if(collectionBusy||!collection.open)return;collectionBusy=true;rustle('close');await spring([collectionY],[innerHeight],v=>slide(v[0]),240,28);collection.close();collectionBusy=false;collectionTrigger.setAttribute('aria-expanded','false');collectionTrigger.focus();}
collection.querySelectorAll<HTMLElement>('[data-collection-paper]').forEach(button=>button.addEventListener('click',()=>void openCase(Number(button.dataset.collectionPaper),button)));
let dragStart:number|undefined,dragLast=0,dragAt=0,dragVelocity=0;
const handle=collection.querySelector<HTMLElement>('.collection-handle')!;
handle.addEventListener('pointerdown',e=>{if(collectionBusy||(e.target as HTMLElement).closest('button'))return;dragStart=e.clientY;dragLast=e.clientY;dragAt=performance.now();dragVelocity=0;handle.setPointerCapture(e.pointerId)});
handle.addEventListener('pointermove',e=>{if(dragStart===undefined)return;const now=performance.now();dragVelocity=(e.clientY-dragLast)/Math.max(1,now-dragAt)*1000;dragAt=now;dragLast=e.clientY;slide(Math.max(0,e.clientY-dragStart))});
handle.addEventListener('pointerup',()=>{if(dragStart===undefined)return;dragStart=undefined;if(collectionY>innerHeight*.5||dragVelocity>500)void closeCollection();else{collectionBusy=true;void spring([collectionY],[0],v=>slide(v[0]),240,26).then(()=>collectionBusy=false)}});
handle.addEventListener('pointercancel',()=>{dragStart=undefined;void spring([collectionY],[0],v=>slide(v[0]),240,26)});
collection.addEventListener('wheel',e=>{if(collection.scrollTop===0&&e.deltaY < -45&&!collectionBusy){e.preventDefault();void closeCollection()}},{passive:false});
const resumeTrigger=document.querySelector<HTMLButtonElement>('#resume-open')!;
resumeTrigger.setAttribute('aria-haspopup','dialog');resumeTrigger.setAttribute('aria-controls','resume-sheet');
resumeTrigger.addEventListener('click',()=>{resume.classList.remove('closing');resume.showModal();lock();resumeTrigger.setAttribute('aria-expanded','true');rustle('open')});
let closingResume=false;
function closeResume(){if(closingResume||!resume.open)return;closingResume=true;resume.classList.add('closing');rustle('close');setTimeout(()=>{resume.close();resume.classList.remove('closing');closingResume=false;resumeTrigger.setAttribute('aria-expanded','false');resumeTrigger.focus()},reduced.matches?0:480)}
let closingCase=false;
async function closeCase(){if(closingCase||!drawer.open)return;closingCase=true;++request;rustle('close');if(!reduced.matches)await drawer.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(70px)',opacity:0}],{duration:220,easing:'ease-in'}).finished;drawer.close();closingCase=false;caseTrigger?.focus();}
for(const sheet of [drawer,resume,collection]){const close=()=>sheet===resume?closeResume():sheet===collection?void closeCollection():void closeCase();sheet.querySelector('.close-sheet')!.addEventListener('click',close);sheet.addEventListener('cancel',e=>{e.preventDefault();close()});sheet.addEventListener('close',lock);sheet.addEventListener('click',e=>{if(e.target===sheet){const r=sheet.getBoundingClientRect();if(sheet===resume||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}})}
