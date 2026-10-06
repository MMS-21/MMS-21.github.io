const { Cam, fit, proj, facing, rings, prism, solid, put, rrect, poly, tween, tset, tval, tdone, mk, pointer, register, disposer } = HL;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value, active = -1;
  const C = Cam(45, .5, 1.85);
  fit(C, [[0,0,0],[72,82,0],[0,0,104],[72,82,104]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk('g', {}, svg);
  const body = solid(g), [outer, inner] = rings(0,0,72,48,5,1.6);
  put(body, prism(P,front,outer,inner,8,104));
  const names = ['Data','Analysis','Validation'];
  const rest = [3,8,5];
  const drawers = [];
  for (let i=2;i>=0;i--) {
    const grp = mk('g', {}, g);
    const box = solid(grp);
    const handle = mk('path', {class:'nf lo'}, grp);
    const inset = mk('path', {class:'nf lo'}, grp);
    drawers[i] = {box,handle,inset,t:tween(rest[i]),last:NaN,z:14+i*29};
  }
  function draw(i, extension) {
    const d=drawers[i];
    if (Math.abs(d.last-extension)<.001) return;
    d.last=extension;
    const y=48+extension;
    const [ring,inside]=rings(5,32,67,y,2.5,1);
    put(d.box,prism(P,front,ring,inside,d.z,d.z+23));
    const face = (u,v) => P(u,y,v);
    d.handle.setAttribute('d',poly(rrect(27,d.z+9,45,d.z+14,2,6).map(p=>face(p.u,p.v))));
    d.inset.setAttribute('d',poly(rrect(13,d.z+7,22,d.z+16,1.4,5).map(p=>face(p.u,p.v))));
  }
  drawers.forEach((d,i)=>draw(i,rest[i]));
  drawers[1].box.sil.classList.add('hi');
  const clock=register(stage,(_dt,now)=>{
    let moving=false;
    drawers.forEach((d,i)=>{draw(i,tval(d.t,now)); if(!tdone(d.t,now)) moving=true;});
    return moving;
  });
  bag.add(clock.unregister);
  const centres=drawers.map(d=>P(36,52,d.z+12));
  function hit([x,y]) {
    let choice=-1,best=Infinity;
    centres.forEach((p,i)=>{const distance=Math.abs(y-p[1]); if(Math.abs(x-p[0])<66&&distance<27&&distance<best){best=distance;choice=i;}});
    return choice;
  }
  function choose(next) {
    if(next===active) return;
    const from=next<0?active:next;
    active=next;
    drawers.forEach((d,i)=>{
      const target=next<0?rest[i]:i===next?reach:rest[i]+5/(Math.abs(i-next)+1);
      tset(d.t,target,performance.now(),Math.abs(i-from)*40);
      d.box.sil.classList.toggle('hi',i===(next<0?1:next));
    });
    read.textContent=next<0?'rest':names[next];
    clock.wake();
  }
  bag.add(pointer(stage,{move:p=>choose(hit(p)),down:p=>choose(hit(p)),leave:()=>choose(-1)}));
  bag.add(()=>svg.replaceChildren());
  read.textContent='rest';
  return {set(v){reach=v;const previous=active;active=-2;choose(previous);},destroy:bag.dispose};
}
hairline({name:'analysis-cabinet',means:'A cabinet of working drawers: touch a drawer to bring its contents forward.',rules:[1,2,4,5,7,8,9,10],range:[18,26,34],mount});
