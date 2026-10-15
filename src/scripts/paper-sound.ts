let audio:AudioContext|undefined, lastSound=0;
// A quiet, low-passed brush of air, with a rounded attack and no sharp crackle.
export function paperSound(kind:'flip'|'open'|'close' = 'flip') {
 if (localStorage.getItem('workbench-sound') === 'off' || performance.now()-lastSound < 280) return;
 lastSound=performance.now();
 try {
  audio ??= new AudioContext(); void audio.resume();
  const duration=kind==='open'?.32:kind==='close'?.26:.2;
  const buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate);
  const samples=buffer.getChannelData(0);let smooth=0;
  for(let i=0;i<samples.length;i++){const t=i/samples.length;smooth=.92*smooth+.08*(Math.random()*2-1);samples[i]=smooth*Math.sin(Math.PI*t)**2;}
  const source=audio.createBufferSource(), low=audio.createBiquadFilter(),high=audio.createBiquadFilter(),gain=audio.createGain();
  source.buffer=buffer;low.type='lowpass';low.frequency.value=700;low.Q.value=.5;high.type='highpass';high.frequency.value=160;gain.gain.value=.012;
  source.connect(high).connect(low).connect(gain).connect(audio.destination);source.start();source.onended=()=>{source.disconnect();high.disconnect();low.disconnect();gain.disconnect()};
 } catch { /* Sound is optional when the browser has no audio device. */ }
}

let clickInstalled=false,lastClick=0;
let typewriterClick:HTMLAudioElement|undefined;
export function clickSound(){
 if(localStorage.getItem('workbench-sound')==='off'||performance.now()-lastClick<70)return;
 lastClick=performance.now();
 try{
  typewriterClick??=new Audio('/audio/mixkit-hard-typewriter-click-1119.wav');
  typewriterClick.volume=.18;
  typewriterClick.currentTime=0;
  void typewriterClick.play().catch(()=>{});
 }catch{ /* Sound remains optional when playback is unavailable. */ }
}
export function installClickSounds(){if(clickInstalled)return;clickInstalled=true;document.addEventListener('click',event=>{const el=(event.target as Element).closest('a,button');if(el&&!el.hasAttribute('disabled'))clickSound()},{capture:true})}
