'use client';

import styles from './MobileScrollIndicator.module.css';

function label(active: number, complete: boolean) {
  return complete ? 'Scroll to continue' : active === 0 ? 'Scroll to explore' : 'Scroll for next scene';
}

/** A decorative mobile scroll cue; it never intercepts a swipe or acts as a button. */
export function MobileScrollIndicator({ active, complete }: { active: number; complete: boolean }) {
  return <div className={styles.indicator} data-mobile-scroll-indicator aria-hidden="true">
    <span className={styles.line}><span /></span>
    <span>{label(active, complete)}</span>
  </div>;
}

/** The product film mounts its own DOM, using the same passive cue as the home hero. */
export function mountMobileScrollIndicator() {
  const node = document.createElement('div');
  node.className = `${styles.indicator} ${styles.fixed}`;
  node.setAttribute('data-mobile-scroll-indicator', '');
  node.setAttribute('aria-hidden', 'true');
  node.innerHTML = `<span class="${styles.line}"><span></span></span><span data-scroll-label></span>`;
  const text = node.querySelector('[data-scroll-label]')!;
  return {
    node,
    update(active: number, complete: boolean, opacity: number) {
      const next = label(active, complete);
      if (text.textContent !== next) text.textContent = next;
      // Keep movement feedback in CSS so it also applies to the React hero.
      node.style.opacity = opacity < 1 ? String(opacity) : '';
    },
  };
}
