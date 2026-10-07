// Rose contours, leaf geometry and spring easing adapted from Type Garden
// by Akshat Agarwal: https://type-garden.vercel.app/ (public Copy code source).
class Garden {
  cc = {blue:'#70836a', vein:'#e9eedf', red:'#cbdce6', line:'#537288'};
  spr(t,k=7,w=16){return t<=0?0:1-Math.exp(-t*k)*Math.cos(t*w)}
  eo(t){return t<=0?0:t>=1?1:1-Math.pow(1-t,3)}
  strokeRange(B, P, a, b, col, w) {
    const n = P.length - 1, ia = a * n, ib = b * n;
    const lerp = t => { const i = Math.min(n - 1, Math.floor(t)), f = t - i; return [P[i][0] + (P[i+1][0] - P[i][0]) * f, P[i][1] + (P[i+1][1] - P[i][1]) * f]; };
    const pts = [lerp(ia)];
    for (let i = Math.floor(ia) + 1; i < ib; i++) pts.push(P[i]);
    pts.push(lerp(ib));
    if (pts.length >= 2) B.stroke(pts, col, w);
  }
  thorn(B, P, u, s, S) {
    const [p, a] = this.at(P, u), d = a + s * 2.3, L = S * 0.045;
    B.stroke([p, [p[0] + Math.cos(d) * L, p[1] + Math.sin(d) * L]], this.cc.blue, S * 0.022);
  }
  leaf(B, bx, by, a, L, bend) {
    if (L < 0.5) return;
    const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
    const ax = u => { const b = Math.sin(Math.PI * u) * bend * 0.15 * L; return [bx + ca * u * L + px * b, by + sa * u * L + py * b]; };
    const hw = u => L * 0.18 * Math.sin(Math.PI * Math.pow(u, 0.8));
    const N = 12, s1 = [], s2 = [];
    for (let i = 0; i <= N; i++) { const u = i / N, c = ax(u), w = hw(u); s1.push([c[0] + px * w, c[1] + py * w]); s2.push([c[0] - px * w, c[1] - py * w]); }
    const tip = ax(1), base = ax(0);
    B.fill([base, ...s1.slice(1, N), tip, tip, ...s2.slice(1, N).reverse(), base], this.cc.blue);
    if (L > 6) { const v = []; for (let i = 0; i <= 8; i++) v.push(ax(0.08 + 0.72 * i / 8)); B.stroke(v, this.cc.vein, Math.max(0.8, L * 0.03)); }
  }
  rose(B, cx, cy, R, rot, e, a, tl) {
    const cr = Math.cos(rot), sr = Math.sin(rot);
    const tm = tl ? Math.hypot(tl[0], tl[1]) : 0, ux = tm ? tl[0] / tm : 0, uy = tm ? tl[1] / tm : 0, sq = -0.28 * tm;
    const T = (x, y, z = 0) => {
      let dx = x * cr - y * sr, dy = x * sr + y * cr;
      if (tm) { const k = (dx * ux + dy * uy) * sq; dx += k * ux + tl[0] * R * z; dy += k * uy + tl[1] * R * z; }
      return [cx + dx, cy + dy];
    };
    // petals, back to front: [cx, cy, rx, ry, angle, depth, edge]
    const P = [
      [0, -0.36, 0.56, 0.54, 0, 0, 0],
      [-0.5, -0.06, 0.6, 0.6, -0.35, 0, 0],
      [0.52, -0.06, 0.6, 0.6, 0.35, 0, 0],
      [-0.42, 0.3, 0.62, 0.48, 0.2, 0.12, 1],
      [0.47, 0.3, 0.62, 0.48, -0.2, 0.12, 1],
      [0.05, 0.42, 0.56, 0.38, 0, 0.14, 0]
    ];
    const ax0 = 0, ay0 = 0.5, lw = Math.max(0.8, R * 0.045), st = 85;
    P.forEach((q, i) => {
      const s = this.spr((a - i * st) / 1000, 8, 14); if (s <= 0.001) return;
      const open = (1 - Math.min(1, s)) * (q[0] < 0 ? 0.5 : -0.5), ang = q[4] + open, ca = Math.cos(ang), sa = Math.sin(ang);
      const pt = (th, j) => {
        const rr = 1 + 0.08 * Math.sin(3 * th + e.ph1 + i) + 0.04 * Math.sin(5 * th + e.ph2);
        const lx = Math.cos(th) * q[2] * rr, ly = Math.sin(th) * q[3] * rr;
        const px = q[0] + lx * ca - ly * sa, py = q[1] + lx * sa + ly * ca;
        return T((ax0 + (px - ax0) * s) * R, (ay0 + (py - ay0) * s) * R, q[5]);
      };
      const pts = []; for (let k = 0; k < 26; k++) pts.push(pt(k / 26 * Math.PI * 2));
      B.fill(pts, this.cc.red);
      if (q[6] && R >= 12 && s > 0.4) {
        const arc = []; for (let k = 0; k <= 14; k++) arc.push(pt(Math.PI * (1.18 + 0.64 * k / 14)));
        this.strokeRange(B, arc, 0, Math.min(1, (s - 0.4) / 0.5), this.cc.line, lw * 0.8);
      }
    });
    const fr = this.eo((a - P.length * st - 80) / 520);
    if (fr > 0 && R > 3) {
      const sp = [], scl = [];
      const turns = R < 20 ? Math.min(e.turns, 1.3) : R < 32 ? e.turns * 0.8 : e.turns;
      for (let i = 0; i <= 70; i++) { const u = i / 70, th = e.ph1 + u * turns * Math.PI * 2, rr = R * (0.08 + 0.57 * u); sp.push(T(Math.cos(th) * rr * 1.05, Math.sin(th) * rr * 0.72 - 0.12 * R, 0.34 - 0.24 * u)); }
      this.strokeRange(B, sp, 0, fr, this.cc.line, lw);
      if (R >= 14) {
        for (let i = 0; i <= 36; i++) { const u = i / 36; scl.push(T((-0.72 + 1.5 * u) * R, 0.36 * R + 0.16 * R * Math.abs(Math.sin(u * Math.PI * 3)), 0.18)); }
        this.strokeRange(B, scl, 0, fr, this.cc.line, lw);
      }
    }
  }


}
export function startGardens(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const gardens=[];
 document.querySelectorAll('.flower-divider').forEach((host,index)=>{
  const canvas=host.querySelector('canvas'), ctx=canvas.getContext('2d');
  if(!ctx)return;
  const engine=new Garden(); let width=0, start=0, visible=false;
  const path=(points,closed)=>{ctx.beginPath();ctx.moveTo(...points[0]);for(let i=1;i<points.length-1;i++){const p=points[i],q=points[i+1];ctx.quadraticCurveTo(...p,(p[0]+q[0])/2,(p[1]+q[1])/2)}ctx.lineTo(...points[points.length-1]);if(closed)ctx.closePath()};
  const B={fill:(p,c)=>{path(p,true);ctx.fillStyle=c;ctx.fill()},stroke:(p,c,w)=>{path(p,false);ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';ctx.stroke()}};
  const resize=()=>{width=host.clientWidth;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(width*d);canvas.height=160*d;ctx.setTransform(d,0,0,d,0,0)};
  new ResizeObserver(resize).observe(host);resize();
  function draw(now){
   if(!start)start=now;
   const age=reduced.matches?10000:now-start,t=age/1000;
   ctx.clearRect(0,0,width,160);
   const positions=width<500?[.06,.54]:index%2?[.24,.78]:[.13,.68];
   positions.forEach((pos,j)=>{
    const phase=index*1.7+j*2, x=width*pos, base=80;
    const sway=reduced.matches?0:Math.sin(t*1.05+phase)*5;
    const grow=engine.eo((age-j*380)/2100);
    const length=width<500?73:110, height=width<500?38:47;
    const points=Array.from({length:45},(_,k)=>{const u=k/44;return[x+length*u,base-height*Math.sin(u*Math.PI*.68)+sway*u*u]});
    if(grow>0)engine.strokeRange(B,points,0,grow,engine.cc.blue,1.6);
    [0.3,0.59,0.8].forEach((u,k)=>{const p=points[Math.round(u*44)];const g=engine.spr((age-600-k*240-j*380)/1000);engine.leaf(B,p[0],p[1],k%2?-.5:-2.3,19*g,.7)});
    const tip=points[44];
    engine.rose(B,tip[0],tip[1],width<500?13:18,Math.sin(t*.8+phase)*.12,{ph1:phase,ph2:phase+2,turns:1.9},age-1300-j*380,null);
    // A few detached petals drift through each divider's own gutter.
    if(age>3400&&!reduced.matches)for(let k=0;k<3;k++){
     const cycle=((t-3.4+k*2.8+phase)%8+8)%8,u=cycle/8;
     ctx.save();ctx.globalAlpha=Math.sin(Math.PI*u)*.7;
     ctx.translate(tip[0]+u*55+Math.sin(cycle*2+k)*12,tip[1]+u*100);ctx.rotate(cycle*.9+k);
     ctx.fillStyle=engine.cc.red;ctx.beginPath();ctx.ellipse(0,0,4,7,0,0,Math.PI*2);ctx.fill();ctx.restore();
    }
   });
  }
  gardens.push({draw,get active(){return visible}});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){draw(performance.now());wake()}},{rootMargin:'40px'}).observe(host);
 });
 let raf=0,last=0;
 function frame(now){raf=0;if(document.hidden)return;if(now-last>32){gardens.forEach(g=>{if(g.active)g.draw(now)});last=now}if(!reduced.matches&&gardens.some(g=>g.active))raf=requestAnimationFrame(frame)}
 function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame)}
 document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',()=>{gardens.forEach(g=>{if(g.active)g.draw(performance.now())});wake()});
}
