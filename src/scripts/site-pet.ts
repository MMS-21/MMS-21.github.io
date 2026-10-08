export function setupPet() {
 const host=document.querySelector<HTMLElement>('[data-pet]');
 if(!host)return;
 const toggle=host.querySelector<HTMLButtonElement>('.pet-toggle')!;
 const stage=host.querySelector<HTMLElement>('.pet-stage')!;
 const button=host.querySelector<HTMLButtonElement>('.pet-character')!;
 const status=host.querySelector<HTMLElement>('.pet-status')!;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let open=false,loading=false,ready=false,failed=false;
 let wake=()=>{};
 const close=()=>{open=false;stage.hidden=true;toggle.hidden=false;toggle.setAttribute('aria-expanded','false');wake();toggle.focus()};
 host.querySelector('.pet-close')!.addEventListener('click',close);
 host.addEventListener('keydown',event=>{if(event instanceof KeyboardEvent&&event.key==='Escape'&&open)close()});
 toggle.addEventListener('click',async()=>{
  open=true;stage.hidden=false;toggle.hidden=true;toggle.setAttribute('aria-expanded','true');
  button.focus();
  if(ready){wake();return}if(loading)return;
  loading=true;failed=false;status.textContent='Waking upâ€¦';
  let renderer:any;
  try{
   // Load the renderer and model only when a visitor invites Rem onto the page.
   const [T,{GLTFLoader}]=await Promise.all([import('three'),import('three/addons/loaders/GLTFLoader.js')]);
   renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
   renderer.outputColorSpace=T.SRGBColorSpace;
   const scene=new T.Scene();
   const camera=new T.PerspectiveCamera(30,1,.01,100);
   const light=new T.HemisphereLight(0xfffaf0,0x718b7a,2.2);scene.add(light);
   const key=new T.DirectionalLight(0xfff4dc,3);key.position.set(-3,4,5);scene.add(key);
   const rim=new T.DirectionalLight(0xb8d6e8,1.6);rim.position.set(3,2,-3);scene.add(rim);
   const gltf=await new GLTFLoader().loadAsync('/pets/rem.glb');
   const model=gltf.scene;
   const bounds=new T.Box3().setFromObject(model);const size=bounds.getSize(new T.Vector3());const center=bounds.getCenter(new T.Vector3());
   const scale=1.65/size.y;model.scale.multiplyScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
   const pet=new T.Group();pet.add(model);scene.add(pet);
   camera.position.set(0,.88,4.8);camera.lookAt(0,.85,0);
   const head=model.getObjectByName('head');const headBase=head?.quaternion.clone();
   let targetX=0,targetY=0,yaw=0,pitch=0,frame=0,last=0,reaction=-10000;
   const tilt=new T.Quaternion();
   const resize=()=>{const rect=button.getBoundingClientRect();if(!rect.width||!rect.height)return;renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/rect.height;camera.updateProjectionMatrix()};
   new ResizeObserver(()=>{resize();wake()}).observe(button);
   function draw(now:number){
    frame=0;if(!open||document.hidden)return;
    if(now-last<1000/30&&!reduced.matches){frame=requestAnimationFrame(draw);return}last=now;
    yaw+=(targetX-yaw)*.09;pitch+=(targetY-pitch)*.09;
    const time=now/1000;const age=(now-reaction)/900;const hop=age>=0&&age<1?Math.sin(age*Math.PI):0;
    pet.position.y=reduced.matches?0:Math.sin(time*1.5)*.008+hop*.14;
    pet.rotation.y=reduced.matches?0:yaw*.28;
    pet.rotation.z=reduced.matches?0:hop*.07;
    if(head&&headBase){tilt.setFromEuler(new T.Euler(reduced.matches?0:pitch*.1,reduced.matches?0:yaw*.16,0));head.quaternion.copy(headBase).multiply(tilt)}
    renderer.render(scene,camera);
    if(!reduced.matches)frame=requestAnimationFrame(draw);
   }
   wake=()=>{if(frame){cancelAnimationFrame(frame);frame=0}if(open&&!document.hidden)frame=requestAnimationFrame(draw)};
   document.addEventListener('pointermove',event=>{const r=button.getBoundingClientRect();targetX=T.MathUtils.clamp((event.clientX-r.left-r.width/2)/300,-1,1);targetY=T.MathUtils.clamp((event.clientY-r.top-r.height/2)/300,-1,1);if(reduced.matches)wake()},{passive:true});
   document.addEventListener('pointerleave',()=>{targetX=0;targetY=0});
   button.addEventListener('click',()=>{reaction=performance.now();host.dataset.reaction='hello';button.setAttribute('aria-label','Pet Rem again');wake()});
   document.addEventListener('visibilitychange',wake);reduced.addEventListener('change',wake);
   renderer.domElement.setAttribute('aria-hidden','true');button.append(renderer.domElement);status.hidden=true;
   ready=true;host.dataset.ready='true';resize();wake();
  }catch(error){renderer?.dispose();failed=true;status.hidden=false;status.textContent='Rem could not wake up. Close and try again.';console.error('Unable to load Rem',error)}
  finally{loading=false;if(failed)toggle.textContent='Try Rem again'}
 });
}
