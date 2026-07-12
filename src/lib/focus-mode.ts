'use client';

import { useSyncExternalStore } from 'react';

// A tiny cross-component store (not React Context) because the app Sidebar lives in
// the (app) layout — a Server Component — while the toggle lives deep inside the
// Article page's client tree. A module-level store lets both sides react without
// threading a provider through the server layout.
let focusMode = false;
const listeners = new Set<() => void>();

export function getFocusMode() {
  return focusMode;
}

export function setFocusMode(value: boolean) {
  if (focusMode === value) return;
  focusMode = value;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useFocusMode() {
  return useSyncExternalStore(subscribe, getFocusMode, () => false);
}
