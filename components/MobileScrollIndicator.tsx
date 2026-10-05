'use client';

import styles from './MobileScrollIndicator.module.css';

function label(complete: boolean) {
  return complete ? 'Continue below' : 'One swipe · Next scene';
}

/** A decorative mobile scroll cue; it never intercepts a swipe or acts as a button. */
export function MobileScrollIndicator({ complete }: { active: number; complete: boolean }) {
  return <div className={styles.indicator} data-mobile-scroll-indicator aria-hidden="true">
    <span className={styles.gesture}><span /></span>
    <span className={styles.caption}>
      <span className={styles.direction}>Swipe up</span>
      <span className={styles.detail}>{label(complete)}</span>
    </span>
  </div>;
}

/** The product film mounts its own DOM, using the same passive cue as the home hero. */
export function mountMobileScrollIndicator() {
  const node = document.createElement('div');
  node.className = `${styles.indicator} ${styles.fixed}`;
  node.setAttribute('data-mobile-scroll-indicator', '');
  node.setAttribute('aria-hidden', 'true');
  node.innerHTML = `<span class="${styles.gesture}"><span></span></span><span class="${styles.caption}"><span class="${styles.direction}">Swipe up</span><span class="${styles.detail}" data-scroll-label></span></span>`;
  const text = node.querySelector('[data-scroll-label]')!;
  return {
    node,
    update(_active: number, complete: boolean, opacity: number) {
      const next = label(complete);
      if (text.textContent !== next) text.textContent = next;
      // Keep movement feedback in CSS so it also applies to the React hero.
      node.style.opacity = opacity < 1 ? String(opacity) : '';
    },
  };
}
