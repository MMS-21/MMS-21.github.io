// The supplied Lulu atlas has eight 192x208 frames in each of nine state rows.
type State='idle'|'right'|'left'|'wave'|'jump'|'play';
type Perch={key:string;left:number;right:number;y:number;floor:boolean};
type Trip={fromX:number;fromY:number;toX:number;toY:number;start:number;duration:number;arc:number;perch:Perch};

export function startLulu(){
 const host=document.querySelector<HTMLElement>('[data-lulu]');if(!host)return;
 const stage=host.querySelector<HTMLElement>('.lulu-stage')!;
 const button=host.querySelector<HTMLButtonElement>('.lulu-character')!;
 const hint=host.querySelector<HTMLElement>('.lulu-hint')!;
 let greeted=false;
 const control=document.querySelector<HTMLButtonElement>('[data-lulu-toggle]')!;
 const canvas=host.querySelector('canvas')!,ctx=canvas.getContext('2d');if(!ctx)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const shell=document.querySelector<HTMLElement>('.navigation-shell');
 const rows:Record<State,number>={idle:0,right:1,left:2,wave:3,jump:4,play:6};
 const image=new Image();
 let visible=true,loaded=false,state:State='wave',since=performance.now();
 let x=16,footY=scrollY+innerHeight-12,raf=0,last=0,drawn=-1,nextAction=since+3600;
 let hovered=false,dragging=false,moved=false,clicks=0,decisions=0,touring=false,tourWasVisible=true;
 let trip:Trip|null=null,walkTo:number|null=null,reactUntil=since+1200;
 let perches:Perch[]=[],current:Perch;
 let pointerId=-1,startPointerX=0,startPointerY=0,startX=0,startY=0,scanTimer=0;
 const ids=new WeakMap<Element,number>();let serial=0;
 const width=()=>stage.offsetWidth||108,height=()=>stage.offsetHeight||117;
 const clampX=(value:number)=>Math.max(8,Math.min(innerWidth-width()-8,value));
 const floor=():Perch=>({key:'floor',left:8,right:innerWidth-8,y:scrollY+innerHeight-12,floor:true});
 current=floor();
 function change(next:State,now:number){if(state!==next){state=next;since=now;drawn=-1}host.dataset.state=state}
 function position(){
  const px=clampX(x),py=footY-scrollY-height()*.96;
  stage.style.setProperty('--lulu-x',`${px.toFixed(1)}px`);stage.style.setProperty('--lulu-y',`${py.toFixed(1)}px`);host.dataset.perch=current.key;
  const intro=document.querySelector('#pre-hero')?.getBoundingClientRect();
  hint.hidden=greeted||touring||dragging||!intro||intro.top < -innerHeight*.35||intro.top>innerHeight*.2||py<65;
  if(!hint.hidden){const center=px+width()/2,offset=Math.max(93,Math.min(innerWidth-93,center))-center;hint.style.setProperty('--hint-offset',`${offset}px`);button.setAttribute('aria-describedby','lulu-intro-hint')}
  else button.removeAttribute('aria-describedby');
 }
 function paint(now:number){
  if(!loaded)return;
  const frame=reduced.matches?0:Math.max(0,Math.floor((now-since)/150))%8,key=rows[state]*8+frame;
  if(key===drawn)return;drawn=key;ctx!.clearRect(0,0,192,208);ctx!.drawImage(image,frame*192,rows[state]*208,192,208,0,0,192,208);
 }
 function land(now:number,perch:Perch){current=perch;footY=perch.y;trip=null;walkTo=null;change(hovered?'play':'idle',now);nextAction=now+2800+decisions%3*700}
 function jumpTo(perch:Perch,toX:number,now:number,small=false){
  const dy=Math.abs(perch.y-footY),dx=Math.abs(toX-x);
  const clearance=Math.max(0,Math.min(footY,perch.y)-scrollY-height()-12);
  trip={fromX:x,fromY:footY,toX:clampX(toX),toY:perch.y,start:now,duration:small?850:Math.min(2100,900+dx*.5+dy*1.1),arc:Math.min(clearance,small?28:Math.min(110,45+dy*.2)),perch};
  walkTo=null;change('jump',now);
 }
 // Text ranges provide real rendered sentence edges, including wrapped lines.
 // Keep only perches with clear space for the cat above the line.
 function scan(){
  scanTimer=0;
  const texts:{el:HTMLElement;rect:DOMRect;index:number}[]=[],obstacles:DOMRect[]=[];
  const styles=new Map<Element,CSSStyleDeclaration>();
  function style(el:Element){let value=styles.get(el);if(!value){value=getComputedStyle(el);styles.set(el,value)}return value}
  function usable(el:HTMLElement){
   for(let node:Element|null=el;node&&node!==document.body;node=node.parentElement){const s=style(node);if(node.hasAttribute('inert')||s.position==='fixed'||s.display==='none'||s.visibility==='hidden'||Number(s.opacity)<.75)return false}
   return true;
  }
  document.querySelectorAll<HTMLElement>('main h2,main h3,main p,main .paper-foot span,main .all-projects,main hr').forEach(el=>{
   if(el.closest('[data-lulu],.navigation-shell')||!usable(el))return;
   const bounds=el.getBoundingClientRect();if(bounds.bottom<80||bounds.top>innerHeight-20)return;
   const range=document.createRange();range.selectNodeContents(el);
   const rects=el.tagName==='HR'?[bounds]:Array.from(range.getClientRects()).filter(r=>r.width>10&&r.height>5);
   rects.forEach((rect,index)=>{obstacles.push(rect);if(rect.width>=width()+18&&rect.top>height()+30&&rect.top<innerHeight-28)texts.push({el,rect,index})});
  });
  document.querySelectorAll<HTMLElement>('main .preview img').forEach(el=>{if(usable(el))obstacles.push(el.getBoundingClientRect())});
  const result:Perch[]=[floor()];
  for(const {el,rect,index} of texts){
   if(!ids.has(el))ids.set(el,++serial);
   const left=Math.max(8,rect.left),right=Math.min(innerWidth-8,rect.right),top=rect.top-3;
   const safe=[left+3,right-width()-3,(left+right-width())/2].filter(px=>{
    if(px<8||px+width()>innerWidth-8)return false;
    const body={left:px+width()*.15,right:px+width()*.85,top:top-height()*.9,bottom:top-9};
    return !obstacles.some(o=>o!==rect&&o.left<body.right&&o.right>body.left&&o.top<body.bottom&&o.bottom>body.top);
   });
   if(safe.length===3)result.push({key:`text-${ids.get(el)}-${index}-line`,left:Math.min(...safe),right:Math.max(...safe)+width(),y:top+scrollY,floor:false});
   else safe.forEach((px,i)=>result.push({key:`text-${ids.get(el)}-${index}-${i}`,left:px,right:px+width(),y:top+scrollY,floor:false}));
  }
  perches=result;host.dataset.perches=String(result.length-1);
  if(!dragging&&!trip&&!touring){
   const found=result.find(p=>p.key===current.key);
   if(found){current=found;footY=found.y;x=Math.max(found.left,Math.min(found.right-width(),x))}
   else{current=floor();footY=current.y;walkTo=null;change('idle',performance.now())}
  }
  position();wake();
 }
 function decide(now:number){
  decisions++;
  const reach=current.floor?Math.max(340,innerHeight*.85):420;
  const candidates=perches.filter(p=>p.key!==current.key&&Math.abs(p.y-footY)<reach&&Math.abs(p.left-x)<Math.min(520,innerWidth*.85)&&p.y-scrollY>height()+20&&p.y-scrollY<innerHeight-20);
  candidates.sort((a,b)=>Number(a.floor)-Number(b.floor)+Math.abs(a.y-footY)/1000-Math.abs(b.y-footY)/1000);
  if(candidates.length&&(current.floor||decisions%2===1)){
   const p=candidates[(decisions-1)%Math.min(candidates.length,4)];
   jumpTo(p,p.floor?clampX(x+(decisions%2?90:-90)):p.left,now);
  }else if(decisions%3===0){change('play',now);reactUntil=now+2400;nextAction=now+5500}
  else{
   const min=current.left,max=current.right-width(),step=decisions%2?95:-95;
   const goal=Math.max(min,Math.min(max,x+step));
   if(Math.abs(goal-x)>12){walkTo=goal;change(goal>x?'right':'left',now)}
   else{change('wave',now);reactUntil=now+1200;nextAction=now+4200}
  }
 }
 function tick(now:number){
  raf=0;if(!visible||document.hidden||!loaded)return;
  const dt=Math.min((now-last)/1000,.05);last=now;
  if(reduced.matches){trip=null;walkTo=null;if(!(touring&&current.key==='tour')){current=floor();footY=current.y}change('idle',now);position();paint(now);return}
  const menuOpen=shell?.dataset.open==='true';
  if(!dragging){
   if(current.floor&&!trip)footY=scrollY+innerHeight-12;
   if(trip){
    const t=Math.min(1,(now-trip.start)/trip.duration),ease=t*t*(3-2*t);
    x=trip.fromX+(trip.toX-trip.fromX)*ease;footY=trip.fromY+(trip.toY-trip.fromY)*ease-Math.sin(Math.PI*t)*trip.arc;
    if(t===1)land(now,trip.perch);
   }else if(walkTo!==null){
    if(hovered||menuOpen){walkTo=null;change(hovered?'play':'idle',now);nextAction=now+3000}
    else{const step=dt*36,delta=walkTo-x;if(Math.abs(delta)<step){x=walkTo;land(now,current)}else x+=Math.sign(delta)*step}
   }else if(reactUntil&&now>=reactUntil){reactUntil=0;change(hovered?'play':'idle',now)}
   else if(now>nextAction&&!hovered&&!menuOpen&&!reactUntil&&!touring)decide(now);
  }
  position();paint(now);raf=requestAnimationFrame(tick);
 }
 function wake(){if(raf)cancelAnimationFrame(raf);raf=0;last=performance.now();if(visible&&!document.hidden&&loaded)raf=requestAnimationFrame(tick)}
 function setVisible(value:boolean){visible=value;host.hidden=!value;control.textContent=value?'Hide Lulu':'Show Lulu';control.setAttribute('aria-pressed',String(value));try{sessionStorage.setItem('lulu-hidden',value?'0':'1')}catch{}if(value)scan();wake()}
 try{visible=sessionStorage.getItem('lulu-hidden')!=='1'}catch{}
 setVisible(visible);
 control.addEventListener('click',()=>setVisible(!visible));
 window.addEventListener('portfolio:tour',((event:CustomEvent<{active:boolean;greet:boolean;footY:number}>)=>{
  const detail=event.detail;
  if(detail.active&&!touring)tourWasVisible=visible;
  touring=detail.active;trip=null;walkTo=null;
  if(detail.greet){setVisible(true);x=innerWidth<=700?24:Math.max(24,innerWidth-520);footY=scrollY+Math.max(height()+24,detail.footY);current={key:'tour',left:x,right:x+width(),y:footY,floor:false};change('wave',performance.now());reactUntil=performance.now()+1200}
  else if(current.key==='tour'){current=floor();footY=current.y;change('idle',performance.now())}
  if(!touring&&!tourWasVisible)setVisible(false);
  nextAction=performance.now()+3600;position();wake();
 }) as EventListener);
 button.addEventListener('pointerenter',()=>{hovered=true;if(!trip&&!dragging&&!reduced.matches){walkTo=null;change('play',performance.now());wake()}});
 button.addEventListener('pointerleave',()=>{hovered=false;if(!trip&&!dragging&&state==='play'){change('idle',performance.now());nextAction=performance.now()+3000}});
 button.addEventListener('pointerdown',event=>{if(event.button!==0)return;dragging=true;moved=false;trip=null;walkTo=null;pointerId=event.pointerId;startPointerX=event.clientX;startPointerY=event.clientY;startX=x;startY=footY;button.setPointerCapture(pointerId);change('idle',performance.now())});
 button.addEventListener('pointermove',event=>{if(!dragging||event.pointerId!==pointerId)return;const dx=event.clientX-startPointerX,dy=event.clientY-startPointerY;if(Math.hypot(dx,dy)>6)moved=true;if(moved){x=clampX(startX+dx);footY=Math.max(scrollY+height(),Math.min(scrollY+innerHeight-12,startY+dy));position()}});
 const release=()=>{
  if(!dragging)return;dragging=false;nextAction=performance.now()+3500;
  if(moved&&!reduced.matches){const nearest=[...perches].sort((a,b)=>(Math.abs(a.y-footY)+Math.abs(a.left-x))-(Math.abs(b.y-footY)+Math.abs(b.left-x)))[0]||floor();jumpTo(nearest,Math.max(nearest.left,Math.min(nearest.right-width(),x)),performance.now())}
  wake();
 };
 button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
 button.addEventListener('click',()=>{if(moved){moved=false;return}greeted=true;position();const now=performance.now();if(trip)return;clicks++;if(clicks%2){change('wave',now);reactUntil=now+1200}else if(!reduced.matches)jumpTo(current,x,now,true);nextAction=now+4000;wake()});
 function scheduleScan(){
  if(scanTimer)clearTimeout(scanTimer);scanTimer=window.setTimeout(scan,150);
  if(trip&&(footY-scrollY<height()||footY-scrollY>innerHeight)){trip=null;current=floor();change('idle',performance.now())}
  if(current.floor&&!trip&&!dragging){footY=scrollY+innerHeight-12;position()}
 }
 addEventListener('scroll',scheduleScan,{passive:true});addEventListener('resize',scheduleScan);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)scan();wake()});
 reduced.addEventListener('change',()=>{trip=null;walkTo=null;current=floor();footY=current.y;change('idle',performance.now());nextAction=performance.now()+3600;wake()});
 image.onload=()=>{loaded=true;canvas.dataset.loaded='true';host.dataset.ready='true';scan();paint(performance.now());wake()};
 image.onerror=()=>{host.dataset.ready='fallback'};image.src='/pets/lulu.webp';
  document.fonts.ready.then(scheduleScan);
  // Revisit surfaces after scroll reveals and timeline transitions have settled.
  window.setInterval(()=>{if(visible&&!document.hidden&&!dragging&&!trip&&!touring)scan()},2400);
}
