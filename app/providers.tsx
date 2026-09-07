'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { getLenis, initSmoothScroll } from '@/lib/motion';

/** Mounts Lenis + ScrollTrigger exactly once for the whole app. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const historyDestination = useRef<string | null>(null);
  const homePosition = useRef(0);

  useEffect(() => initSmoothScroll(), []);

  useEffect(() => {
    const onPopState = () => {
      historyDestination.current = window.location.pathname !== previousPath.current
        ? window.location.href
        : null;
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const restoringHistory = historyDestination.current === window.location.href;
    historyDestination.current = null;

    // Discard the previous page's animation without unlocking an open menu.
    const lenis = getLenis();
    if (lenis) {
      const wasStopped = lenis.isStopped;
      lenis.stop();
      lenis.resize();
      if (!wasStopped) lenis.start();
    }
    if (restoringHistory || window.location.hash) return;

    const top = pathname === '/' ? homePosition.current : 0;
    const restore = () => {
      window.scrollTo({ top, left: 0, behavior: 'instant' });
      lenis?.resize();
    };
    if (pathname === '/') {
      // Home expands its track in a layout effect. Wait for that state commit
      // so the browser cannot clamp the saved position to its shorter layout.
      const frame = requestAnimationFrame(restore);
      return () => cancelAnimationFrame(frame);
    }
    restore();
  }, [pathname]);

  useEffect(() => {
    if (pathname !== '/') return;
    const rememberHome = () => {
      if (window.location.pathname === '/') homePosition.current = window.scrollY;
    };
    window.addEventListener('scroll', rememberHome, { passive: true });
    // Capture the actual position before a link lets the router move the page.
    document.addEventListener('click', rememberHome, true);
    return () => {
      window.removeEventListener('scroll', rememberHome);
      document.removeEventListener('click', rememberHome, true);
    };
  }, [pathname]);

  return <>{children}</>;
}
