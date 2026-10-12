let audio:AudioContext|undefined, lastSound=0;
export function paperSound(kind:'flip'|'open'|'close' = 'flip') {
 if (localStorage.getItem('workbench-sound') === 'off' || performance.now()-lastSound < 120) return;
 lastSound=performance.now();
 try {
  audio ??= new AudioContext(); void audio.resume();
  const duration=kind==='flip'?.18+Math.random()*.08:kind==='open'?.36:.22;
  const buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate);
  const samples=buffer.getChannelData(0);
  for(let i=0;i<samples.length;i++){const t=i/samples.length;samples[i]=(Math.random()*2-1)*Math.sin(Math.PI*t)**1.5*(.65+.35*Math.sin(t*28));}
  const source=audio.createBufferSource(), filter=audio.createBiquadFilter(), gain=audio.createGain();
  source.buffer=buffer;filter.type='bandpass';filter.frequency.value=(kind==='open'?1200:kind==='close'?950:1600)+Math.random()*600;filter.Q.value=.6;gain.gain.value=.027;
  source.connect(filter).connect(gain).connect(audio.destination);source.start();source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect()};
 } catch { /* Audio is optional when the browser has no audio device. */ }
}
