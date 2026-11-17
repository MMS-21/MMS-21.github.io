// Cursor tracking adapted from page-mascot, MIT licensed.
// See page-mascot.LICENSE for the original copyright and license.
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

const directions = '/mascots/moaaz-head-directions.webp';
const reactions = '/mascots/moaaz-head-reactions.webp';
const hoodie = '/mascots/moaaz-hoodie-body.svg';
const center = 4;
const clockwise = [5, 8, 7, 6, 3, 0, 1, 2];
const sectorSize = (Math.PI * 2) / clockwise.length;
const deadZone = 70;
const hysteresis = 0.12;

const surprised = 4;
const dizzy = 9;
// Indexes into the 4-by-4 art, starting with the familiar playful reactions.
const reactionCycle = [3, 5, 15, 1, 2, 6, 7, 8, 10, 11, 12, 13, 14, 0, 4, 9];
function sprite(url: string, index: number, grid: number, visible: boolean): CSSProperties {
  const step = 100 / (grid - 1);
  return {
    position: 'absolute',
    inset: 0,
    backgroundImage: `url(${url})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${grid * 100}% ${grid * 100}%`,
    backgroundPosition: `${(index % grid) * step}% ${Math.floor(index / grid) * step}%`,
    opacity: visible ? 1 : 0,
  };
}

export function MoaazMascot({ size = 140, label = 'Moaaz avatar' }: {
  size?: number;
  label?: string;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const timers = useRef<number[]>([]);
  const boops = useRef({ count: 0, at: 0, next: 0 });
  const [direction, setDirection] = useState(center);
  const [reaction, setReaction] = useState<number | null>(null);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let sector = -1;
    let pointer: { x: number; y: number } | null = null;
    const aim = () => {
      if (!button.current || !pointer) return;
      const box = button.current.getBoundingClientRect();
      const dx = pointer.x - (box.left + box.width / 2);
      const dy = pointer.y - (box.top + box.height / 2);
      if (Math.hypot(dx, dy) < deadZone) {
        sector = -1;
        setDirection(center);
        return;
      }
      const angle = Math.atan2(dy, dx);
      const difference = angle - sector * sectorSize;
      const wrapped = Math.atan2(Math.sin(difference), Math.cos(difference));
      if (sector >= 0 && Math.abs(wrapped) < sectorSize / 2 + hysteresis) return;
      sector = (Math.round(angle / sectorSize) + clockwise.length) % clockwise.length;
      setDirection(clockwise[sector]);
    };
    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      aim();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', aim, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', aim);
    };
  }, []);

  useEffect(() => () => {
    timers.current.forEach((id) => window.clearTimeout(id));
  }, []);

  const boop = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    const later = (ms: number, next: number | null) => {
      timers.current.push(window.setTimeout(() => setReaction(next), ms));
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const state = boops.current;
    const now = Date.now();
    state.count = now - state.at < 520 ? state.count + 1 : 1;
    state.at = now;
    if (state.count >= 4) {
      state.count = 0;
      setReaction(dizzy);
      later(1100, null);
    } else {
      const next = reactionCycle[state.next];
      state.next = (state.next + 1) % reactionCycle.length;
      if (reduced || next === surprised) {
        setReaction(next);
      } else {
        setReaction(surprised);
        later(120, next);
      }
      later(720, null);
    }
  };

  return (
    <button ref={button} type="button" onClick={boop} aria-label={`Boop the ${label}`}
      style={{ position: 'relative', display: 'block', flexShrink: 0, width: size, height: size,
        padding: 0, border: 0, background: 'transparent', appearance: 'none',
        cursor: 'pointer', userSelect: 'none' }}>
      <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <span data-mascot-clothing style={{ position: 'absolute', inset: 0,
          background: `url(${hoodie}) center / 100% 100% no-repeat` }} />
        <span style={sprite(directions, direction, 3, reaction === null)} />
        <span style={sprite(reactions, reaction ?? 0, 4, reaction !== null)} />
      </span>
    </button>
  );
}
