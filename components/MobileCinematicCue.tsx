'use client';

import { advanceCinematicScene } from '@/lib/cinematic-scroll';
import styles from './MobileCinematicCue.module.css';

type CueProps = { active: number; total: number; complete: boolean; onAdvance: () => void };

function label(active: number, complete: boolean) {
  return complete ? 'Swipe up to continue' : active === 0 ? 'Swipe up to explore' : 'Swipe up for next scene';
}

function accessibleLabel(active: number, total: number, complete: boolean) {
  return `${complete ? 'Continue to page content' : total === 1 ? 'Explore scene' : 'Next scene'}. Scene ${active + 1} of ${total}.`;
}

const arrow = <svg className={styles.arrow} viewBox="0 0 20 28" fill="none" aria-hidden="true"><path d="M10 23V5m-6 6 6-6 6 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export function MobileCinematicCue({ active, total, complete, onAdvance }: CueProps) {
  return <div className={styles.cue} data-mobile-cinematic-cue>
    <button type="button" className={styles.button} onClick={onAdvance} aria-label={accessibleLabel(active, total, complete)}>
      <span className={styles.action}>{arrow}<span className={styles.copy}><span>{label(active, complete)}</span><small>or tap here</small></span></span>
      <span className={styles.position} aria-hidden="true"><span>{active + 1} / {total}</span><span className={styles.steps}>{Array.from({ length: total }, (_, index) => <i key={index} data-active={index === active || undefined} />)}</span></span>
    </button>
  </div>;
}

/** The product film owns its DOM; share the home cue's copy, styles and action. */
export function mountMobileCinematicCue(track: HTMLElement, total: number) {
  const node = document.createElement('div');
  node.className = `${styles.cue} ${styles.fixed}`;
  node.setAttribute('data-mobile-cinematic-cue', '');
  node.innerHTML = `<button type="button" class="${styles.button}">
    <span class="${styles.action}"><svg class="${styles.arrow}" viewBox="0 0 20 28" fill="none" aria-hidden="true"><path d="M10 23V5m-6 6 6-6 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" /></svg><span class="${styles.copy}"><span data-cue-label></span><small>or tap here</small></span></span>
    <span class="${styles.position}" aria-hidden="true"><span data-cue-position></span><span class="${styles.steps}">${Array.from({ length: total }, () => '<i></i>').join('')}</span></span>
  </button>`;
  const button = node.querySelector('button')!;
  const text = node.querySelector('[data-cue-label]')!;
  const position = node.querySelector('[data-cue-position]')!;
  const steps = node.querySelectorAll('i');
  const advance = () => advanceCinematicScene(track);
  button.addEventListener('click', advance);
  let last = '';
  return {
    node,
    update(active: number, complete: boolean, opacity: number) {
      const next = `${active}:${complete}`;
      if (next !== last) {
        last = next;
        text.textContent = label(active, complete);
        position.textContent = `${active + 1} / ${total}`;
        button.setAttribute('aria-label', accessibleLabel(active, total, complete));
        steps.forEach((step, index) => step.toggleAttribute('data-active', index === active));
      }
      node.style.opacity = String(opacity);
      node.inert = opacity < 0.5;
      node.setAttribute('aria-hidden', String(opacity < 0.01));
    },
    dispose() { button.removeEventListener('click', advance); node.remove(); },
  };
}
