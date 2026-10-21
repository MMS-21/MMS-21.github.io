import { TypeGarden } from './type-garden-engine';

export function startNameGarden(){
 const host=document.querySelector('.name-garden');if(!host)return;
 const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d'),title=host.parentElement.querySelector('h1');if(!ctx||!title)return;
 const engine=new TypeGarden(),B=engine.backend(ctx),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let plants=[],width=0,height=0,start=0,raf=0,last=0,visible=false;
 function measure(){
  const r=host.getBoundingClientRect(),tr=title.getBoundingClientRect();width=r.width;height=r.height;
  const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*d);canvas.height=Math.round(height*d);ctx.setTransform(d,0,0,d,0,0);
  const font=getComputedStyle(title);ctx.font=`${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
  const text=title.textContent.trim(),total=ctx.measureText(text).width,scale=Math.min(72,Math.max(40,parseFloat(font.fontSize)*.58));
  let advance=0;plants=[];
  [...text].forEach((ch,i)=>{const cw=ctx.measureText(ch).width;if(ch!==' '&&i%2===0){
   const random=engine.rng(7919+i*977),params=engine.wordParams(7);params.w=cw/scale;params.roseP=.75;
   const els=[];let id=0;
   engine.grow(random,els,()=>i*100+id++,params,{base:[0,0],dir:-Math.PI/2+(random()-.5)*.7,len:.65+random()*.45,d0:0,tip:i%4===0?'rose':'fan'});
   if(i%4===0)engine.grow(random,els,()=>i*100+id++,params,{base:[0,-.1],dir:Math.PI/2+(random()-.5)*.8,len:.35+random()*.25,d0:180,depth:1,tip:'rose'});
   plants.push({x:tr.left-r.left+(tr.width-total)/2+advance+cw/2,y:tr.top-r.top+tr.height*.65,S:scale,els,delay:plants.length*95});
  }advance+=cw;});
  wake();
 }
 function draw(now){raf=0;if(!visible||document.hidden)return;if(now-last<32){raf=requestAnimationFrame(draw);return}last=now;if(!start)start=now;
  const elapsed=reduced.matches?10000:now-start;ctx.clearRect(0,0,width,height);
  for(const plant of plants){const {x,y,S}=plant,age=elapsed-plant.delay;
   for(const e of plant.els){
    if(e.t==='stem'){const fr=engine.eo((age-e.d0)/e.dur);if(fr<=0)continue;const P=e.pts.map(p=>[x+p[0]*S,y+p[1]*S]);engine.strokeRange(B,P,0,fr,engine.cc.blue,S*.022*(e.w||1));for(const th of e.thorns)if(fr>th.u)engine.thorn(B,P,th.u,th.s,S);}
    else if(e.t==='leaf'){const sc=engine.spr((age-e.d0)/1000,7,15);if(sc>0)engine.leaf(B,x+e.x*S,y+e.y*S,e.a,e.L*S*sc,e.bend);}
    else if(e.t==='rose'&&age>=e.d0)engine.rose(B,x+e.x*S,y+e.y*S,e.R*S,e.rot,e,age-e.d0,null);
   }
  }
  host.dataset.growth=elapsed<500?'starting':elapsed<3500?'growing':'complete';
  if(!reduced.matches&&elapsed<4500)raf=requestAnimationFrame(draw);
 }
 function wake(){if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(draw)}
 new IntersectionObserver(entries=>{const next=entries[0].isIntersecting;if(next&&!visible){start=0;last=0}visible=next;wake()},{threshold:.35}).observe(title);
 new ResizeObserver(measure).observe(title);document.fonts.ready.then(measure);reduced.addEventListener('change',()=>{start=0;wake()});document.addEventListener('visibilitychange',wake);measure();
}
