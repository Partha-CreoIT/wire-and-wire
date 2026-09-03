'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './SiteHeader.module.css';

const navItems = [
  { href: '/', label: 'Story' },
  { href: '/products', label: 'Products' },
  { href: '/projects', label: 'Projects' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/* Above the film the header floats bare; once the page content (marked with
   data-site-content) reaches the top it condenses into a pill plate. Pages
   without a film start with their content at the top, so they get the pill
   immediately. */
const SOLID_AT = 72;

export function SiteHeader() {
  const pathname = usePathname();
  const [solid, setSolid] = useState(false);
  const [tone, setTone] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    let marker: Element | null = null;
    let frame = 0;

    const measure = () => {
      frame = 0;
      if (!marker || !marker.isConnected) {
        marker = document.querySelector('[data-site-content]');
      }
      setSolid(
        marker
          ? marker.getBoundingClientRect().top <= SOLID_AT
          : window.scrollY > 24,
      );
      /* The bare header inherits the film's tone: product films are dark
         scenes, the home film is warm paper. */
      setTone(
        document.querySelector('[data-film-tone="dark"]') ? 'dark' : 'light',
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    /* On client navigation the film mounts after this effect and only then
       sizes its scroll track — without this, the header keeps the previous
       page's state until the first scroll. Any body-height change re-measures. */
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <header
      className={styles.header}
      data-solid={solid || undefined}
      data-tone={tone}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Wire & Wire home">
          <img
            src="/world/logo.png"
            alt="Wire & Wire Products (M) Sdn Bhd"
            className={styles.logo}
          />
        </Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a className={styles.cta} href="mailto:info@wireproducts.cc">
          Enquire
        </a>
      </div>
    </header>
  );
}
