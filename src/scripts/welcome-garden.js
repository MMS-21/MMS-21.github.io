import { Garden } from './divider-garden.js';
export function startWelcomeGardens(){
 document.querySelectorAll('.welcome-garden').forEach(host=>{
  const canvas=host.querySelector('canvas'),ctx=canvas.getContext('2d');if(!ctx)return;
  const engine=new Garden(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const arabic=host.classList.contains('arabic-intro');
  let fontsReady=!arabic;
  host.dataset.blooming='false';
  if(arabic)document.fonts.load('76px \"DecoType Thuluth\"').then(()=>{fontsReady=true;wake()}).catch(()=>{fontsReady=true;wake()});
  const canvasHeight=arabic?320:190;
  let width=0,start=0,last=0,raf=0,visible=false;
  const rand=n=>{const v=Math.sin(n*127.1)*43758.5453;return v-Math.floor(v)};
  const branches=Array.from({length:15},(_,i)=>({u:.06+i*.062,phase:rand(i+4)*6.28,side:i%3===0?1:-1,r:8+rand(i+13)*8,delay:rand(i+23)*1800}));
  const path=(points,closed)=>{ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length-1;i++){const p=points[i],q=points[i+1];ctx.quadraticCurveTo(...p,(p[0]+q[0])/2,(p[1]+q[1])/2)}ctx.lineTo(...points[points.length-1]);if(closed)ctx.closePath()};
  const B={fill:(p,c)=>{path(p,true);ctx.fillStyle=c;ctx.fill()},stroke:(p,c,w)=>{path(p,false);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.stroke()}};
  const resize=()=>{width=host.clientWidth;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=width*d;canvas.height=canvasHeight*d;ctx.setTransform(d,0,0,d,0,0)};
  new ResizeObserver(resize).observe(host);resize();
  function draw(now){
   raf=0;if(!visible||document.hidden)return;
   const reveal=Number(getComputedStyle(host.parentElement).opacity);
   if(reveal<.25){start=0;host.dataset.blooming='false';ctx.clearRect(0,0,width,canvasHeight);raf=requestAnimationFrame(draw);return;}
   if(!fontsReady){raf=requestAnimationFrame(draw);return;}
   if(!start){start=now;host.dataset.blooming='true'}
   if(now-last<32){raf=requestAnimationFrame(draw);return;}last=now;
   const elapsed=reduced.matches?10000:now-start,t=now/1000;ctx.clearRect(0,0,width,canvasHeight);
   branches.forEach((b,i)=>{
    const age=elapsed-(b.lower?0:arabic?1400:350)-b.delay;if(age<=0)return;
    const sway=reduced.matches?0:Math.sin(t*.8+b.phase)*3;
    const x=width*b.u,base=89+(rand(i+40)-.5)*30;
    const height=b.side*(b.lower?16+rand(i+50)*12:36+rand(i+50)*30),lean=(rand(i+60)-.5)*36;
    const points=Array.from({length:40},(_,k)=>{const u=k/39;return[x+lean*u+Math.sin(u*5+b.phase)*10*u+sway*u*u,base+height*u]});
    const growth=engine.eo(age/1600);engine.strokeRange(B,points,0,growth,engine.cc.blue,1.2);
    [.4,.7].forEach((u,k)=>{const g=engine.spr((age-500-k*230)/1000);const p=points[Math.round(u*39)];engine.leaf(B,p[0],p[1],b.phase+k*2,Math.max(0,g)*(12+rand(i+70)*8),.8)});
    const tip=points[39];engine.rose(B,...tip,b.r,b.phase+(reduced.matches?0:Math.sin(t+b.phase)*.1),{ph1:b.phase,ph2:b.phase+2,turns:1.8},age-1200,null);
    if(age>2500&&!reduced.matches){for(let k=0;k<2;k++){
     const cycle=((age-2500)/1000+k*3.7+b.phase)%(7+k)/(7+k),size=3+rand(i+80)*3;
     ctx.save();ctx.globalAlpha=Math.min(1,cycle*12)*Math.min(1,(1-cycle)*4)*.85;ctx.translate(tip[0]+Math.sin(cycle*7+b.phase)*16,tip[1]+cycle*105);ctx.rotate(cycle*7+b.phase);ctx.fillStyle='#91b5cc';ctx.beginPath();ctx.ellipse(0,0,size*.55,size,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }}
   });
   if(!reduced.matches)raf=requestAnimationFrame(draw);
  }
  const wake=()=>{if(!raf&&visible&&!document.hidden)raf=requestAnimationFrame(draw)};
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;wake()}).observe(host);
  document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',wake);
 });
}
