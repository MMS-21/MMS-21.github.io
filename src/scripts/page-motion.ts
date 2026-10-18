// Content stays visible without scripting or when reduced motion is requested.
if(document.body.classList.contains('has-portfolio-header') && !matchMedia('(prefers-reduced-motion: reduce)').matches){
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   const element=entry.target as HTMLElement;
   element.animate([{opacity:.65,translate:'0 22px'},{opacity:1,translate:'0 0'}],{duration:700,easing:'cubic-bezier(.16,1,.3,1)',delay:Number(element.dataset.pageDelay || 0)});
   observer.unobserve(element);
  });
 },{threshold:.08});
 document.querySelectorAll<HTMLElement>('main > div > header,main > div > section,main .article-row,main .work-notes article,main .letter-paper').forEach((element,index)=>{
  element.dataset.pageDelay=String(index%3*70);observer.observe(element);
 });
}
