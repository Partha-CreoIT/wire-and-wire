'use client';

import { createElement, type ReactNode } from 'react';
import { reveal } from '@/lib/motion';
import { useMotion } from '@/lib/useMotion';

type RevealTag = 'div' | 'ul' | 'ol' | 'section';

export function RevealGroup({
  as = 'div',
  children,
  className,
  childSelector = ':scope > *',
  y = 28,
}: {
  as?: RevealTag;
  children: ReactNode;
  className?: string;
  childSelector?: string;
  y?: number;
}) {
  const ref = useMotion<HTMLElement>((el) =>
    reveal(el, { y, children: childSelector, start: 'top 88%' }),
  );

  return createElement(as, { ref, className }, children);
}
