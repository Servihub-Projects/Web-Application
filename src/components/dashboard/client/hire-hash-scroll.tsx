'use client';

import { useEffect } from 'react';

/** Smooth-scroll to #hire when the user lands with that hash (e.g. from Discover “Hire”). */
export function HireHashScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#hire') return;
    const el = document.getElementById('hire');
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    return () => window.clearTimeout(t);
  }, []);

  return null;
}
