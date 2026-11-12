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
      <p className="tumble-instruction">Tap a report, or use the arrow keys to turn the pages.</p>
      <div className="tumble-caption" aria-live="polite" aria-atomic="true">
        <p className="tumble-tools">{project.tools}</p>
        <h3><a href={project.url}>{project.title}</a></h3>
        <p className="tumble-summary">{project.summary}</p>
        <a className="tumble-explore" href={project.url}>Explore the project ↗</a>
      </div>
      <noscript><p>Browse the <a href="/projects/">full project index</a>.</p></noscript>
    </div>
  );
}
