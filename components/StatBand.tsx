'use client';
import { useMotion } from '@/lib/useMotion';
import { countUp } from '@/lib/motion';
import styles from './StatBand.module.css';

export interface Stat {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
}

function StatCell({ stat }: { stat: Stat }) {
  const ref = useMotion<HTMLSpanElement>((el) =>
    countUp(el, stat.value, {
      suffix: stat.suffix ?? '',
      prefix: stat.prefix ?? '',
      decimals: stat.decimals ?? 0,
    }),
  );
  return (
    <div className={`${styles.cell} has-pin--top-left`}>
      {/* SSR renders the real figure so it is correct without JS; countUp
          animates from 0 only after hydration. */}
      <span ref={ref} className={`h3 ${styles.value}`}>
        {stat.prefix ?? ''}
        {stat.value.toLocaleString('en-US')}
        {stat.suffix ?? ''}
      </span>
      <span className={`mono ${styles.label}`}>{stat.label}</span>
    </div>
  );
}

export function StatBand({ stats }: { stats: Stat[] }) {
  return (
    <section className={`${styles.section} section--light`} data-theme="light">
      <div className="layout">
        <div className={styles.row}>
          {stats.map((s) => (
            <StatCell key={s.label} stat={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
