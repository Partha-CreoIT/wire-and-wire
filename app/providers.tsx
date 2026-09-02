'use client';
import { useEffect } from 'react';
import { initSmoothScroll } from '@/lib/motion';

/** Mounts Lenis + ScrollTrigger exactly once for the whole app. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => initSmoothScroll(), []);
  return <>{children}</>;
}
