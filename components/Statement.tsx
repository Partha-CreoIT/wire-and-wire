'use client';
import { useMotion } from '@/lib/useMotion';
import { textReveal, reveal } from '@/lib/motion';
import styles from './Statement.module.css';

export function Statement({
  label,
  title,
  body,
  theme = 'light',
}: {
  label: string;
  title: string;
  body: string;
  theme?: 'light' | 'dark';
}) {
  const titleRef = useMotion<HTMLHeadingElement>((el) => textReveal(el));
  const bodyRef = useMotion<HTMLParagraphElement>((el) => reveal(el, { y: 24 }));

  return (
    <section className={`${styles.section} section--${theme}`} data-theme={theme}>
      <div className="layout">
        <div className={`layout-grid ${styles.grid}`}>
          <p className={`mono ${styles.label} has-pin--top-left`}>{label}</p>
          <h2 ref={titleRef} className={`h2 ${styles.title}`}>
            {title}
          </h2>
          <p ref={bodyRef} className={`body ${styles.body}`}>
            {body}
          </p>
        </div>
      </div>
    </section>
  );
}
