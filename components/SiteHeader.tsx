/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import styles from './SiteHeader.module.css';

const navItems = [
  { href: '/', label: 'Story' },
  { href: '/products', label: 'Products' },
  { href: '/projects', label: 'Projects' },
  { href: '/company', label: 'Company' },
  { href: '/investor', label: 'Investor' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
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
            <Link key={item.href} href={item.href}>
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
