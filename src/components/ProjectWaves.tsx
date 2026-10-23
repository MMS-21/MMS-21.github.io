import { useEffect, useMemo, useRef, useState } from 'react';
import { Waves } from '@paper-design/shaders-react';

const palettes=[['#e7eddb','#78966c'],['#eaded5','#b87667'],['#e4def0','#8b79ac'],['#e9dfc8','#b09562'],['#dbe9ed','#6d98a4'],['#e8dfdb','#a47868'],['#e1e6df','#78918c'],['#eee6ce','#b7a16a']];
export default function ProjectWaves({seed}:{seed:number}){
 const host=useRef<HTMLSpanElement>(null),[visible,setVisible]=useState(false),[phase,setPhase]=useState(0),[reduced,setReduced]=useState(false);
 const params=useMemo(()=>{let n=seed*7919;const r=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};const range=(a:number,b:number)=>a+r()*(b-a);const colors=palettes[(seed-1)%palettes.length];return {colorBack:colors[0],colorFront:colors[1],shape:range(0,3),frequency:range(.2,.6),amplitude:range(.25,1),spacing:range(1,1.5),proportion:range(.15,.7),softness:0,rotation:Math.floor(range(0,180)),scale:range(.5,2.2)}},[seed]);
 useEffect(()=>{const motion=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(motion.matches);update();motion.addEventListener('change',update);const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:.01});if(host.current)observer.observe(host.current);return()=>{observer.disconnect();motion.removeEventListener('change',update)}},[]);
 useEffect(()=>{if(!visible||reduced)return;let raf=0,last=0;function tick(now:number){if(now-last>50){setPhase(p=>p+.002);last=now}raf=requestAnimationFrame(tick)}raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[visible,reduced]);
 return <span ref={host} className="project-waves" aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',background:params.colorBack,zIndex:-1}}>{visible&&<Waves {...params} offsetX={Math.sin(phase)*.16} rotation={params.rotation+Math.sin(phase*.6)*9} speed={0} frame={(seed%997)*37} minPixelRatio={1} maxPixelCount={700000} style={{width:'100%',height:'100%'}}/>}</span>;
}
