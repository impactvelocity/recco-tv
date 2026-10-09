import {config} from '../config';

declare const __DEV__: boolean;

/**
 * Debug builds report events (focus moves, screens) to `pnpm dev:local`, which
 * prints them. The Vega CLI cannot show the app's console, so this is how the
 * remote-only walkthrough (task 2.7) is checked from the host.
 */
export function debugLog(event: string, data: Record<string, unknown> = {}): void {
  if (typeof __DEV__ === 'undefined' || !__DEV__) return;
  fetch(`${config.debugBase}/dev/log`, {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({event, ...data}),
  }).catch(() => {});
}
