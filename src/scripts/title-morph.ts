// Preserve links and heading semantics; never split connected Arabic lettering.
const prepareTitles=()=>{
 document.querySelectorAll<HTMLElement>('h1,h2,h3').forEach(title=>{
  if((title.dataset.morphReady && title.querySelector('.morph-letter')) || title.closest('.hero-identity') || /[\u0600-\u06ff]/.test(title.textContent || ''))return;
  if(!title.hasAttribute('aria-label'))title.setAttribute('aria-label',(title.textContent || '').trim());
  title.querySelectorAll('a').forEach(link=>{if(!link.hasAttribute('aria-label'))link.setAttribute('aria-label',(link.textContent || '').trim());});
  title.dataset.morphReady='true';
  title.classList.add('morph-title');
  const walker=document.createTreeWalker(title,NodeFilter.SHOW_TEXT);
  const nodes:Text[]=[];
  while(walker.nextNode()){
   const node=walker.currentNode as Text;
   if(node.textContent?.trim() && !node.parentElement?.closest('svg,script,style'))nodes.push(node);
  }
  let index=0;
  nodes.forEach(node=>{
   const fragment=document.createDocumentFragment();
   (node.textContent || '').split(/(\s+)/).forEach(word=>{
    if(!word.trim()){fragment.append(document.createTextNode(word));return;}
    const group=document.createElement('span');group.className='morph-word';
    Array.from(word).forEach(character=>{
     const letter=document.createElement('span');letter.className='morph-letter';letter.textContent=character;
     const phase=index++%6;
     letter.style.setProperty('--letter-order',String(phase));
     letter.style.setProperty('--letter-width',String([.86,1.12,.94,1.08,.9,1.14][phase]));
     letter.style.setProperty('--letter-height',String([1.08,.96,1.04,.98,1.07,.95][phase]));
     letter.style.setProperty('--letter-slant',`${[-7,-3,5,7,3,-5][phase]}deg`);
     group.append(letter);
    });
    fragment.append(group);
   });
   node.replaceWith(fragment);
  });
 });
};
prepareTitles();
new MutationObserver(prepareTitles).observe(document.body,{childList:true,subtree:true});
