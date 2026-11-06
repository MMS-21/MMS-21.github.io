import { useState } from 'react';
import TumbleDeckShowcase from './ui/tumble-deck-showcase';
import { projectPapers } from '../data/project-papers';
import './project-tumble-deck.css';

const cards = projectPapers.map(paper => ({ src: paper.image, alt: paper.alt }));

export default function ProjectTumbleDeck() {
  const [active, setActive] = useState(0);
  const project = projectPapers[active];
  return (
    <div className="project-tumble">
      <TumbleDeckShowcase cards={cards} height="auto" aspect={1.45} depth={5} background="transparent" onCardChange={setActive} ariaLabel="Selected projects" />
      <div className="tumble-caption" aria-live="polite" aria-atomic="true">
        <p className="tumble-tools">{project.tools}</p>
        <h3><a href={project.url}>{project.title}</a></h3>
        <a className="tumble-explore" href={project.url}>Explore the project ↗</a>
      </div>
      <div className="tumble-footer">
        <span>Click, drag or use arrow keys to browse</span>
        <button type="button" onClick={() => document.querySelector<HTMLButtonElement>('#collection-open')?.click()}>View all projects ↗</button>
      </div>
      <noscript><p>Browse the <a href="/projects/">full project index</a>.</p></noscript>
    </div>
  );
}
