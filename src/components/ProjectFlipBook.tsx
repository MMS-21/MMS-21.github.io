import PageFlip from './kokonutui/page-flip';
import { projectPapers } from '../data/project-papers';
import { paperSound } from '../scripts/paper-sound';
import '../styles/page-flip-utilities.css';
import '../styles/project-flip-book.css';

export default function ProjectFlipBook(){
 const pages=[<div className="project-book-cover" key="cover"><small>Moaaz Magdy / Project collection</small><h2>Selected<br/>work.</h2><p>Questions explored through data.<br/>Tools built to make work easier.</p><span>8 projects · Turn the corner ↗</span></div>];
 projectPapers.forEach((paper,index)=>{
  const preview=(event:React.MouseEvent<HTMLButtonElement>)=>{document.dispatchEvent(new CustomEvent('project-preview',{detail:{index,trigger:event.currentTarget}}))};
  pages.push(<div className="project-book-art" key={`${index}-art`}><small>Project {String(index+1).padStart(2,'0')} / Artwork</small><button onPointerDown={e=>e.stopPropagation()} onClick={preview} aria-label={`Enlarge ${paper.title}`}><img src={paper.image} alt={paper.alt} loading="lazy" decoding="async"/></button><span>Click the artwork to enlarge ↗</span></div>);
  pages.push(<div className="project-book-copy" key={`${index}-copy`}><small>Project {String(index+1).padStart(2,'0')} / {projectPapers.length}</small><h3>{paper.title}</h3><div className="project-book-tools">{paper.tools}</div><p>{paper.summary}</p><a href={paper.url} onPointerDown={e=>e.stopPropagation()}>Read the case study ↗</a><span className="project-book-signature">Moaaz Magdy</span></div>);
 });
 return <section className="project-flip-book" aria-label="Project book"><PageFlip pages={pages} onSpreadChange={()=>paperSound('flip')}/><p className="project-book-help">Drag a corner, click a page edge, or use the arrows below. Arrow keys work when the book is focused.</p></section>;
}
