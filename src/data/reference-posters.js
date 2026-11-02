  const escape = text => String(text ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const line = (x1,y1,x2,y2,color='#a1a6ae',width=.65,extra='') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" ${extra}/>`;
  const circle = (x,y,r,fill,extra='') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`;
  const path = (d,color,width=1,extra='') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" ${extra}/>`;
  const grid = () => Array.from({length:5},(_,i)=> line(16,90+i*17,164,90+i*17,'#343c43',.55)).join('') + Array.from({length:7},(_,i)=>line(16+i*24,85,16+i*24,160,'#263039',.55)).join('');
  const poly = (vals, offset=0) => vals.map((v,i) => `${i===0?'M':'L'}${(16+i*148/(vals.length-1)).toFixed(1)} ${(154-(v+offset)*58).toFixed(1)}`).join(' ');
  function illustration(kind, accent) {
    const a = accent;
    if(kind === 'wave') {
      const f = (phase, amp, level) => Array.from({length:59},(_,i) => [16+i*2.55, level + Math.sin(i*.34+phase)*amp + Math.sin(i*.11+phase)*amp*.48]);
      const pp = pts => pts.map(([x,y],i)=>`${i?'L':'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
      return grid()+path(pp(f(0,15,123)),a,2.4)+path(pp(f(1.8,9,119)),'#f2f3e9',.9,'opacity=".48"')+Array.from({length:10},(_,i)=>circle(20+i*14,145+Math.sin(i)*5,1.35,a,'opacity=".55"')).join('');
    }
    if(kind === 'routes') {
      const routePaths=['M25 143 Q53 92 87 124 T155 93','M17 109 Q59 145 101 98 T162 131','M22 151 L45 119 L66 134 L93 100 L124 110 L162 88'];
      return Array.from({length:7},(_,i)=>line(23+i*21,87,23+i*21,159,'#343b42',.45)).join('')+
       Array.from({length:5},(_,i)=>line(17,94+i*15,160,94+i*15,'#343b42',.45)).join('')+
       routePaths.map((d,i)=>path(d,i===2?a:'#d0d4ce',i===2?2.7:1.2,`opacity="${i===2?'.9':'.42'}"`)).join('')+
       [[45,119],[93,100],[124,110],[162,88]].map(([x,y],i)=>circle(x,y,i===1?4:2.6,a,`stroke="#162122" stroke-width="1.4"`)).join('');
    }
    if(kind==='bars') {
      const values=[[29,25,21,17,12],[34,26,24,20,16],[38,30,22,18,14],[43,35,27,20,13],[47,36,29,24,15],[51,41,32,24,18]];
      let res=grid();
      values.forEach((col,i) => {let base=158; col.forEach((v,j) => {const h=v*.47; res+=`<rect x="${20+i*24}" y="${(base-h).toFixed(1)}" width="13" height="${h.toFixed(1)}" rx="1" fill="${j===0?a:['#8e95a5','#626c79','#47525e','#313c46'][j-1]}" opacity="${j===0?'1':'.85'}"/>`; base-=h+.6; });});
      return res;
    }
    if(kind==='rings') {
      const circ = [20,31,42,53,64].map((r,i)=>`<circle cx="91" cy="124" r="${r}" fill="none" stroke="${i%2?a:'#93c4c3'}" stroke-width="${i===1?3.8:1.2}" stroke-dasharray="${i===1?'55 18':i===4?'4 8':'2 4'}" opacity="${1-i*.12}"/>`).join('');
      return circ + path('M24 151 Q57 136 78 112 T162 96','#f9fbf2',1.5,'opacity=".6"')+circle(92,124,5,a);
    }
    if(kind==='heat') {
      let r=''; for(let y=0;y<7;y++)for(let x=0;x<11;x++){const h=(x*23+y*13+x*y*7)%100;const op=.15+.8*(h/100);r+=`<rect x="${19+x*13.2}" y="${89+y*11}" width="10.6" height="8.8" rx=".9" fill="${h>57?a:'#a5b0b4'}" opacity="${op.toFixed(2)}"/>`;}
      return r + `<rect x="56" y="99" width="77" height="48" fill="none" stroke="#f6f4ec" stroke-width="1.3" stroke-dasharray="3 3" opacity=".75"/>`;
    }
    if(kind==='scatter') {
      let dots='';for(let i=0;i<81;i++){const cluster=i%3, cx=[52,106,139][cluster],cy=[132,102,140][cluster];const x=cx+Math.sin(i*1.8)*22*(.22+(i%7)/7),y=cy+Math.cos(i*2.7)*18*(.22+(i%11)/12);dots+=circle(x.toFixed(1),y.toFixed(1),(i%4===0?2:1.2),cluster===1?a:cluster===0?'#faf0e0':'#8c98a3',`opacity="${i%4===0?'.94':'.57'}"`);}
      return grid()+dots+path('M18 150 Q60 149 87 126 T163 92',a,1.3,'stroke-dasharray="4 4" opacity=".75"');
    }
    if(kind==='flow') {
      const paths=['M19 122 C58 122 50 90 91 96 S131 120 158 92','M19 122 C58 122 65 144 94 147 S133 133 159 140','M19 122 C59 121 63 106 96 118 S132 152 158 161'];
      return paths.map((p,i)=>path(p,i?a:'#f1f1e8',i?1.3:2.5,`opacity="${i?'.65':'1'}"`)).join('')+
        [[19,122],[91,96],[94,147],[96,118],[158,92],[159,140],[158,161]].map(([x,y],i)=>`<rect x="${x-3}" y="${y-3}" width="6" height="6" fill="${i<3?a:'#e5e4db'}" stroke="#14191d" stroke-width=".8"/>`).join('');
    }
    if(kind==='network') {
      const nodes = Array.from({length:24},(_,i)=>({x:91+Math.sin(i*2.399)*Math.sqrt(i+2)*14,y:124+Math.cos(i*2.399)*Math.sqrt(i+2)*9}));
      let r=''; nodes.forEach((v,i)=>[i+1,i+3,i+7].forEach(j=>{if(j<nodes.length&&Math.hypot(nodes[j].x-v.x,nodes[j].y-v.y)<74)r+=line(v.x.toFixed(1),v.y.toFixed(1),nodes[j].x.toFixed(1),nodes[j].y.toFixed(1),'#7e929e',.8,'opacity=".48"');}));
      nodes.forEach((n,i)=>r+=circle(n.x.toFixed(1),n.y.toFixed(1),i%7===0?4:1.9,i%7===0?a:'#e7e6de'));
      return r;
    }
    if(kind==='sine') {
      let r='';for(let j=0;j<11;j++){const x=26+j*10,y=100-j*2;r+=`<polygon points="${x},${y+56} ${x+30},${y+39} ${x+30},${y-9} ${x},${y+8}" fill="none" stroke="${j%3===0?a:'#d9d8e9'}" stroke-width="${j%3===0?1.8:.8}" opacity="${1-j*.05}"/>`;}
      return r;
    }
    if(kind==='ascii') {
      let r='';const char=['.',':','+','#','@'];for(let row=0;row<11;row++)for(let col=0;col<18;col++){const v=Math.hypot((col-8.7)/9,(row-5)/5.6);if(v<1){const c=char[Math.min(4,Math.floor((1-v)*5))];r+=`<text x="${22+col*7.5}" y="${94+row*6.6}" font-family="monospace" font-size="8.7" fill="${c==='@'?a:'#d3f5e7'}" opacity="${1-v*.5}">${c}</text>`;}}
      return r;
    }
    return grid();
  }
  export function inner(project, index){
    const a=escape(project.accent||'#c1ed7f'),title=project.posterTitle||[project.title],titleA=escape(title[0]||''),titleB=escape(title[1]||'');
    const isConcept=project.placeholder!==false;
    return `
      <rect x="4" y="4" width="174" height="202" rx="2" fill="#11171b" stroke="#697277" stroke-width=".7"/>
      <rect x="4" y="4" width="174" height="3.5" fill="${a}"/>
      <text x="15" y="19" font-size="6.4" letter-spacing="1.1" font-family="monospace" fill="#dae0d8">FORM/STUDIES</text>
      <text x="166" y="19" text-anchor="end" font-size="6.4" font-family="monospace" fill="${a}">${String(index+1).padStart(2,'0')} / 08</text>
      <line x1="15" y1="25" x2="166" y2="25" stroke="#5f6972" stroke-width=".5"/>
      <text x="14" y="47" font-size="19.5" letter-spacing="-.85" font-weight="700" font-family="Arial,Helvetica,sans-serif" fill="#f5f5ef">${titleA}</text>
      <text x="14" y="67" font-size="19.5" letter-spacing="-.85" font-weight="700" font-family="Arial,Helvetica,sans-serif" fill="#f5f5ef">${titleB}</text>
      <g>${illustration(project.art, a)}</g>
      <line x1="15" y1="173" x2="166" y2="173" stroke="#56626a" stroke-width=".65"/>
      <text x="15" y="184" font-size="6.1" letter-spacing=".75" font-family="monospace" fill="${a}">${isConcept?'RESEARCH CONCEPT':'SELECTED WORK'}</text>
      <text x="15" y="195" font-size="5.65" letter-spacing=".4" font-family="monospace" fill="#acb8ba">${isConcept?'ILLUSTRATIVE DATA / 2026':'INTERACTIVE ARCHIVE / 2026'}</text>
      <text x="168" y="195" font-size="9.2" text-anchor="end" font-family="monospace" fill="${a}">↗</text>
    `;
  }
  function posterSvg(project,index){return `<svg xmlns="http://www.w3.org/2000/svg" width="364" height="420" viewBox="0 0 182 210" role="img" aria-label="${escape(project.title)} project poster">${inner(project,index)}</svg>`;}
