'use client';

import { useEffect } from 'react';
import { restoreLocaleScroll } from '@/lib/localeSwitch';

export default function LocaleScrollRestore() {
  useEffect(() => {
    restoreLocaleScroll();
  }, []);

  return null;
}
