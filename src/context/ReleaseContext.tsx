'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';

export type AppRelease = 'v1' | 'v2' | 'v3';

function normalize(raw: string): AppRelease {
  const s = raw.toLowerCase();
  if (s.startsWith('v1')) return 'v1';
  if (s.startsWith('v2')) return 'v2';
  return 'v3';
}

const ReleaseContext = createContext<AppRelease>('v3');

export function ReleaseProvider({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const release = useMemo(() => normalize(value), [value]);
  return (
    <ReleaseContext.Provider value={release}>
      {children}
    </ReleaseContext.Provider>
  );
}

export function useAppRelease(): AppRelease {
  return useContext(ReleaseContext);
}

export function releaseLevel(r: AppRelease): number {
  if (r === 'v1') return 1;
  if (r === 'v2') return 2;
  return 3;
}
