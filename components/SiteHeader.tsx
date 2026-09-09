'use client';

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getLenis } from '@/lib/motion';
import { useHomeStart } from '@/app/providers';
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
  const restartHome = useHomeStart();
  const [solid, setSolid] = useState(false);
  const [tone, setTone] = useState<'light' | 'dark'>('light');
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const active = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

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

  /* Navigation closes the menu; while it is open the page must not scroll. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 761px)');
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        burgerRef.current?.focus();
      }
      if (event.key !== 'Tab') return;
      const links = Array.from(headerRef.current?.querySelectorAll<HTMLElement>('a[href], button') || [])
        .filter(element => element.getClientRects().length > 0 && !element.closest('[inert]'));
      const first = links[0];
      const last = links[links.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', closeOnDesktop);
    closeOnDesktop();
    return () => {
      document.body.style.overflow = previous;
      lenis?.start();
      document.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      role={open ? 'dialog' : undefined}
      aria-modal={open || undefined}
      aria-label={open ? 'Site menu' : undefined}
      className={styles.header}
      data-solid={solid || undefined}
      data-tone={tone}
      data-open={open || undefined}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Wire & Wire home" onNavigate={(event) => {
          setOpen(false);
          restartHome();
          if (pathname === '/' && !window.location.search && !window.location.hash) event.preventDefault();
        }}>
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
              aria-current={active(item.href) ? 'page' : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a className={styles.cta} href="mailto:info@wireproducts.cc">
          Enquire
        </a>
        <button
          ref={burgerRef}
          type="button"
          className={styles.burger}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-menu" className={styles.menu} data-open={open || undefined} inert={!open} data-lenis-prevent>
        <nav aria-label="Mobile navigation">
          <ol className={styles.menuList}>
            {navItems.map((item, i) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active(item.href) ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  <span className={`mono-sm ${styles.menuNum}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <div className={styles.menuFoot}>
          <a className={styles.menuCta} href="mailto:info@wireproducts.cc">
            Enquire now
          </a>
          <p className={`mono-sm ${styles.menuContact}`}>
            <a href="tel:+60364196995">+603 6419 6995</a>
            <br />
            <a href="mailto:info@wireproducts.cc">info@wireproducts.cc</a>
          </p>
        </div>
      </div>
    </header>
  );
}
