// Lulu's supplied atlas uses eight 192x208 frames in each of nine state rows.
export function startLulu(){
 const host=document.querySelector<HTMLElement>('[data-lulu]');if(!host)return;
 const stage=host.querySelector<HTMLElement>('.lulu-stage')!;
 const button=host.querySelector<HTMLButtonElement>('.lulu-character')!;
 const close=host.querySelector<HTMLButtonElement>('.lulu-close')!;
 const show=host.querySelector<HTMLButtonElement>('.lulu-show')!;
 const canvas=host.querySelector('canvas')!;
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const rows={idle:0,right:1,left:2,wave:3,jump:4,play:6};
 type State=keyof typeof rows;
 let visible=true,loaded=false,state:State='wave',since=performance.now(),until=since+1200;
 let x=0,destination=0,nextWalk=since+7500,last=0,drawn=-1,raf=0,dragging=false,moved=false,hovered=false,clicks=0;
 let pointerStart=0,dragStart=0,pointerId=-1;
 const image=new Image();
 const maxX=()=>Math.max(0,innerWidth-stage.offsetWidth-32);
 const position=()=>{x=Math.max(0,Math.min(maxX(),x));stage.style.setProperty('--lulu-x',`${x.toFixed(1)}px`)};
 function change(next:State,now:number,duration=0){state=next;since=now;until=duration?now+duration:0;drawn=-1;host.dataset.state=state}
 function paint(now:number){
  if(!loaded)return;
  const frame=reduced.matches?0:Math.floor((now-since)/150)%8;
  const key=rows[state]*8+frame;if(key===drawn)return;drawn=key;
  ctx!.clearRect(0,0,192,208);ctx!.drawImage(image,frame*192,rows[state]*208,192,208,0,0,192,208);
 }
 function tick(now:number){
  raf=0;if(!visible||document.hidden||!loaded)return;
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(reduced.matches){change('idle',now);paint(now);return}
  if(!dragging){
   if(until&&now>=until){change(hovered?'play':'idle',now);nextWalk=now+7000}
   if(state==='right'||state==='left'){
    const distance=destination-x;const step=dt*32;
    if(Math.abs(distance)<=step){x=destination;change('idle',now);nextWalk=now+8500}
    else x+=Math.sign(distance)*step;
    position();
   }else if(state==='idle'&&!hovered&&now>nextWalk){
    // Short strolls along the bottom edge, with long pauses between them.
    destination=Math.max(0,Math.min(maxX(),x+(x<100?100:-100)));
    if(Math.abs(destination-x)>10)change(destination>x?'right':'left',now);
    else nextWalk=now+8500;
   }
  }
  paint(now);raf=requestAnimationFrame(tick);
 }
 function wake(){if(raf)cancelAnimationFrame(raf);raf=0;last=performance.now();if(visible&&!document.hidden&&loaded)raf=requestAnimationFrame(tick)}
 function setVisible(value:boolean){visible=value;stage.hidden=!value;show.hidden=value;wake();try{sessionStorage.setItem('lulu-hidden',value?'0':'1')}catch{}}
 try{if(sessionStorage.getItem('lulu-hidden')==='1')setVisible(false)}catch{}
 close.addEventListener('click',()=>{setVisible(false);show.focus()});
 show.addEventListener('click',()=>{setVisible(true);change('wave',performance.now(),1200);wake();button.focus()});
 host.addEventListener('keydown',event=>{if(event instanceof KeyboardEvent&&event.key==='Escape'){setVisible(false);show.focus()}});
 button.addEventListener('pointerenter',()=>{hovered=true;if(!dragging&&!reduced.matches){change('play',performance.now());wake()}});
 button.addEventListener('pointerleave',()=>{hovered=false;if(!dragging&&state==='play'){change('idle',performance.now());nextWalk=performance.now()+7000}});
 button.addEventListener('pointerdown',event=>{if(event.button!==0)return;dragging=true;moved=false;pointerId=event.pointerId;pointerStart=event.clientX;dragStart=x;button.setPointerCapture(pointerId);change('idle',performance.now())});
 button.addEventListener('pointermove',event=>{if(!dragging||event.pointerId!==pointerId)return;const delta=event.clientX-pointerStart;if(Math.abs(delta)>6)moved=true;if(moved){x=dragStart+delta;position()}});
 const release=()=>{dragging=false;nextWalk=performance.now()+8500};
 button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
 button.addEventListener('click',()=>{if(moved){moved=false;return}clicks++;change(clicks%2?'wave':'jump',performance.now(),1200);wake()});
 addEventListener('resize',()=>{position();destination=Math.min(destination,maxX())});
 document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',()=>{change('idle',performance.now());nextWalk=performance.now()+7500;wake()});
 image.onload=()=>{loaded=true;canvas.dataset.loaded='true';host.dataset.ready='true';paint(performance.now());wake()};
 image.onerror=()=>{host.dataset.ready='fallback'};
 image.src='/pets/lulu.webp';
 host.dataset.state=state;
}
