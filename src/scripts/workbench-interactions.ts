import { projectPapers } from '../data/project-papers';
import { paperSound, installClickSounds } from './paper-sound';
installClickSounds();
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
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
const soundButton=document.querySelector<HTMLButtonElement>('#sound');
function soundLabel(){if(!soundButton)return;soundButton.textContent=sound?'Sound on':'Sound off';soundButton.setAttribute('aria-pressed',String(sound))}soundLabel();
soundButton?.addEventListener('click',()=>{sound=!sound;localStorage.setItem('workbench-sound',sound?'on':'off');soundLabel();if(sound)rustle()});
const drawer=document.querySelector<HTMLDialogElement>('#case-drawer')!,resume=document.querySelector<HTMLDialogElement>('#resume-sheet')!,collection=document.querySelector<HTMLDialogElement>('#works-collection')!;
function lock(){document.body.classList.toggle('sheet-open',[drawer,resume,collection].some(d=>d.open))}
let request=0,caseTrigger:HTMLElement|undefined;
async function openCase(index:number,trigger:HTMLElement){if(drawer.open)return;caseTrigger=trigger;const token=++request,paper=projectPapers[index];
 const origin=trigger.querySelector('img')?.getBoundingClientRect()??trigger.getBoundingClientRect(); const titleLink=document.querySelector<HTMLAnchorElement>('#drawer-link')!;titleLink.textContent=paper.title;titleLink.href=paper.url;
 drawer.classList.add('poster-preview');
 const chart=document.querySelector<HTMLImageElement>('#drawer-chart')!;chart.src=paper.image;chart.alt=paper.alt;
 const content=document.querySelector<HTMLElement>('#drawer-content')!;content.replaceChildren();const summary=document.createElement('p');summary.textContent=projectPapers[index].summary;content.append(summary);drawer.showModal();drawer.scrollTop=0;lock();rustle('open');
 if(!reduced.matches){const target=chart.getBoundingClientRect();chart.animate([{transformOrigin:'0 0',transform:`translate(${origin.left-target.left}px,${origin.top-target.top}px) scale(${origin.width/target.width},${origin.height/target.height})`},{transformOrigin:'0 0',transform:'none'}],{duration:600,easing:'cubic-bezier(.16,1,.3,1)'});}

}
document.addEventListener('project-preview',event=>{const {index,trigger}=(event as CustomEvent<{index:number;trigger:HTMLElement}>).detail;void openCase(index,trigger)});let collectionY=0,collectionBusy=false;
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
