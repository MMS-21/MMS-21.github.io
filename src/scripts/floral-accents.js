import { Garden } from './divider-garden.js';
export function startFloralAccents(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let oldY=scrollY,forward=0;
 addEventListener('scroll',()=>{if(scrollY>oldY)forward=performance.now();oldY=scrollY},{passive:true});
 const accents=[];let frame=0,last=0;
 const clamp=n=>Math.max(0,Math.min(1,n));
 document.querySelectorAll('.floral-accent').forEach((host,index)=>{
  const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  const engine=new Garden(),timeline=host.dataset.mode==='timeline',edge=host.dataset.mode==='edge',deskBranch=host.dataset.mode==='desk-branch';let width=0,visible=false,growth=0;
  const rand=n=>{const v=Math.sin(n*127.1+index*31.7)*43758.5453;return v-Math.floor(v)};
  const branches=Array.from({length:edge?6:(timeline||deskBranch)?7:18},(_,i)=>({u:edge?[.02,.09,.16,.84,.91,.98][i]:(i+.5)/((timeline||deskBranch)?7:18),phase:rand(i+4)*6.28,side:edge?1:i%2?1:-1,r:edge?7+rand(i+13)*3:(timeline||deskBranch)?6+rand(i+13)*4:9+rand(i+13)*8}));
  const path=(p,closed)=>{ctx.beginPath();ctx.moveTo(...p[0]);for(let i=1;i<p.length-1;i++){const a=p[i],b=p[i+1];ctx.quadraticCurveTo(...a,(a[0]+b[0])/2,(a[1]+b[1])/2)}ctx.lineTo(...p[p.length-1]);if(closed)ctx.closePath()};
  const B={fill:(p,c)=>{path(p,true);ctx.fillStyle=c;ctx.fill()},stroke:(p,c,w)=>{path(p,false);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.stroke()}};
  const resize=()=>{width=host.clientWidth;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=width*d;canvas.height=200*d;ctx.setTransform(d,0,0,d,0,0)};new ResizeObserver(resize).observe(host);resize();
  function draw(now,dt){
   const rect=host.getBoundingClientRect();
   const raw=deskBranch?Number(getComputedStyle(host.closest('.scroll-hero')).getPropertyValue('--branch-growth')||0):edge?Number(getComputedStyle(host.parentElement).opacity):timeline?Number(host.closest('.milestone').style.getPropertyValue('--garden-progress')||0):clamp((innerHeight*.92-rect.top)/(innerHeight*.4));
   const target=reduced.matches?1:raw;growth+=(target-growth)*(1-Math.exp(-dt/180));host.dataset.growth=growth.toFixed(3);
   ctx.clearRect(0,0,width,200);const t=now/1000;
   branches.forEach((b,i)=>{
    const age=clamp((growth-b.u*.28)/.72)*4300;if(age<1)return;
    const sway=reduced.matches?0:Math.sin(t*.8+b.phase)*(timeline?1.5:3);
    const x=width*b.u,base=(timeline||edge||deskBranch)?100:100+(rand(i+40)-.5)*24,height=b.side*(edge?10+rand(i+50)*10:(timeline||deskBranch)?16+rand(i+50)*12:28+rand(i+50)*35),lean=(rand(i+60)-.5)*30;
    const points=Array.from({length:32},(_,k)=>{const u=k/31;return[x+lean*u+Math.sin(u*5+b.phase)*8*u+sway*u*u,base+height*u]});
    engine.strokeRange(B,points,0,engine.eo(age/1500),engine.cc.blue,1.1);
    [.4,.7].forEach((u,k)=>{const g=engine.spr((age-500-k*230)/1000),p=points[Math.round(u*31)];engine.leaf(B,...p,b.phase+k*2,Math.max(0,g)*((timeline||edge)?9:15),.8)});
    const tip=points[31];engine.rose(B,...tip,b.r,b.phase,{ph1:b.phase,ph2:b.phase+2,turns:1.8},age-1200,null);
    if(age>2800&&!reduced.matches&&(!timeline||now-forward<1400)){for(let k=0;k<2;k++){
     const cycle=(t+k*3.7+b.phase)%(7+k)/(7+k),size=timeline?3:4;
     ctx.save();ctx.globalAlpha=Math.min(1,cycle*12)*Math.min(1,(1-cycle)*4)*.8;ctx.translate(tip[0]+Math.sin(cycle*7+b.phase)*14,tip[1]+cycle*90);ctx.rotate(cycle*7+b.phase);ctx.fillStyle='#91b5cc';ctx.beginPath();ctx.ellipse(0,0,size*.55,size,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }}
   });
  }
  accents.push({draw,get visible(){return visible}});new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;wake()}).observe(host);
 });
 function tick(now){frame=0;if(document.hidden)return;const dt=now-(last||now-33);if(dt>=32){accents.forEach(a=>{if(a.visible)a.draw(now,Math.min(dt,100))});last=now}if(accents.some(a=>a.visible))frame=requestAnimationFrame(tick)}
 function wake(){if(!frame&&!document.hidden)frame=requestAnimationFrame(tick)}document.addEventListener('visibilitychange',wake);
}
