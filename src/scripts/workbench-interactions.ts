import { projectPapers } from '../data/project-papers';
import { paperSound, installClickSounds } from './paper-sound';
installClickSounds();
const papers = [...document.querySelectorAll<HTMLElement>('.project-paper')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mod = (n:number) => (n + papers.length) % papers.length;
let front = 0, busy = false, suppressClick = false;
let sound = localStorage.getItem('workbench-sound') !== 'off';
function rustle(kind:'flip'|'open'|'close' = 'flip'){paperSound(kind)}
// Integrate a damped spring at bounded steps, independent of display refresh rate.
function spring(from:number[],to:number[],draw:(v:number[])=>void,k=180,d=22,epsilon=.12) {
 return new Promise<void>(resolve=>{
  if(reduced.matches){draw(to);resolve();return}
  const x=[...from],v=from.map(()=>0);let previous=performance.now(),start=previous;
  function frame(now:number){let remaining=Math.min((now-previous)/1000,.04);previous=now;
   while(remaining>0){const dt=Math.min(remaining,1/120);remaining-=dt;for(let i=0;i<x.length;i++){v[i]+=(k*(to[i]-x[i])-d*v[i])*dt;x[i]+=v[i]*dt;}}
   draw(x);
   if(now-start>1800||x.every((n,i)=>Math.abs(n-to[i])<epsilon&&Math.abs(v[i])<epsilon*2)){draw(to);resolve()}else requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
 });
}
const positions=papers.map(()=>[0,0,0]);
const slots=papers.map((_,i)=>i===0?[0,0,-5]:[Math.max(-58,24-i*16),Math.min(70,16+i*13),i%2?4:-3]);
function paint(i:number,p:number[]){positions[i]=[...p];papers[i].style.transform=`translate(calc(-50% + ${p[0]}px),${p[1]}px) rotate(${p[2]}deg)`;}
function update(){papers.forEach((p,i)=>{const rank=mod(i-front);p.dataset.front=String(rank===0);p.inert=rank!==0;p.setAttribute('aria-hidden',String(rank!==0));p.style.zIndex=String(10-rank);p.style.setProperty('--shade',String(rank*.035));});document.querySelector('.count')!.textContent=`${front+1} / ${papers.length}`;}
async function shuffle(direction:number){if(busy)return;busy=true;rustle();const old=front,next=mod(front+direction),start=positions.map(p=>[...p]);
 const width=papers[old].offsetWidth;let handed=false;
 // One continuous arc: no pause at the apex or abrupt restart on the return.
 await spring([0],[1],values=>{const t=Math.max(0,Math.min(1,values[0]));
  papers.forEach((_,i)=>{const target=slots[mod(i-next)],p=start[i].map((n,j)=>n+(target[j]-n)*t);if(i===old){const arc=Math.sin(Math.PI*t);p[0]+=direction*width*.66*arc;p[1]-=28*arc;p[2]+=direction*12*arc;}paint(i,p)});
  if(t>.5&&!handed){front=next;update();handed=true;}
 },160,26,.001);
 if(!handed){front=next;update()}busy=false;
}
papers.forEach((_,i)=>paint(i,slots[i]));update();
const workbench=document.querySelector<HTMLElement>('.workbench')!;
document.querySelectorAll<HTMLButtonElement>('[data-project-view]').forEach(button=>button.addEventListener('click',()=>{
 const index=button.dataset.projectView==='index';workbench.dataset.view=index?'index':'slide';
 document.querySelectorAll('[data-project-view]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
 if(index)papers.forEach(p=>{p.inert=false;p.setAttribute('aria-hidden','false')});else update();
}));
document.querySelectorAll<HTMLButtonElement>('[data-project-columns]').forEach(button=>button.addEventListener('click',()=>{
 workbench.style.setProperty('--project-columns',button.dataset.projectColumns!);
 document.querySelectorAll('[data-project-columns]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));
 document.querySelector<HTMLButtonElement>('[data-project-view="index"]')!.click();
}));
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
const soundButton=document.querySelector<HTMLButtonElement>('#sound');
function soundLabel(){if(!soundButton)return;soundButton.textContent=sound?'Sound on':'Sound off';soundButton.setAttribute('aria-pressed',String(sound))}soundLabel();
soundButton?.addEventListener('click',()=>{sound=!sound;localStorage.setItem('workbench-sound',sound?'on':'off');soundLabel();if(sound)rustle()});
const drawer=document.querySelector<HTMLDialogElement>('#case-drawer')!,resume=document.querySelector<HTMLDialogElement>('#resume-sheet')!,collection=document.querySelector<HTMLDialogElement>('#works-collection')!;
function lock(){document.body.classList.toggle('sheet-open',[drawer,resume,collection].some(d=>d.open))}
let request=0,caseTrigger:HTMLElement|undefined;
async function openCase(index:number,trigger:HTMLElement){if(drawer.open)return;caseTrigger=trigger;const token=++request,paper=papers[index],link=paper.querySelector<HTMLAnchorElement>('h2 a')!,image=paper.querySelector<HTMLImageElement>('img')!;
 const origin=trigger.querySelector('img')?.getBoundingClientRect()??image.getBoundingClientRect();
 const titleLink=document.querySelector<HTMLAnchorElement>('#drawer-link')!;titleLink.textContent=link.textContent;titleLink.href=link.href;
 drawer.classList.toggle('poster-preview',paper.classList.contains('poster-paper'));
 const chart=document.querySelector<HTMLImageElement>('#drawer-chart')!;chart.src=image.src;chart.alt=image.alt;
 const content=document.querySelector<HTMLElement>('#drawer-content')!;content.replaceChildren();const summary=document.createElement('p');summary.textContent=projectPapers[index].summary;content.append(summary);drawer.showModal();drawer.scrollTop=0;lock();rustle('open');
 if(!reduced.matches){const target=chart.getBoundingClientRect();chart.animate([{transformOrigin:'0 0',transform:`translate(${origin.left-target.left}px,${origin.top-target.top}px) scale(${origin.width/target.width},${origin.height/target.height})`},{transformOrigin:'0 0',transform:'none'}],{duration:600,easing:'cubic-bezier(.16,1,.3,1)'});}

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
if(!document.querySelector('.profile-controls')){resumeTrigger.setAttribute('aria-haspopup','dialog');resumeTrigger.setAttribute('aria-controls','resume-sheet');
resumeTrigger.addEventListener('click',()=>{resume.classList.remove('closing');resume.showModal();lock();resumeTrigger.setAttribute('aria-expanded','true');rustle('open')});}
let closingResume=false;
function closeResume(){if(closingResume||!resume.open)return;closingResume=true;resume.classList.add('closing');rustle('close');setTimeout(()=>{resume.close();resume.classList.remove('closing');closingResume=false;resumeTrigger.setAttribute('aria-expanded','false');resumeTrigger.focus()},reduced.matches?0:480)}
let closingCase=false;
async function closeCase(){if(closingCase||!drawer.open)return;closingCase=true;++request;rustle('close');if(!reduced.matches)await drawer.animate([{transform:'translateY(0)',opacity:1},{transform:'translateY(70px)',opacity:0}],{duration:220,easing:'ease-in'}).finished;drawer.close();closingCase=false;caseTrigger?.focus();}
for(const sheet of [drawer,...(document.querySelector('.profile-controls')?[]:[resume]),collection]){const close=()=>sheet===resume?closeResume():sheet===collection?void closeCollection():void closeCase();sheet.querySelector('.close-sheet')!.addEventListener('click',close);sheet.addEventListener('cancel',e=>{e.preventDefault();close()});sheet.addEventListener('close',lock);sheet.addEventListener('click',e=>{if(e.target===sheet){const r=sheet.getBoundingClientRect();if(sheet===resume||e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close()}})}
