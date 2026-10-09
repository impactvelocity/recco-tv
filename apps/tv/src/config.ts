import {ENV} from './env.generated';

export const config = {
  /** `pnpm dev:local` on the host, as the Vega Virtual Device sees it. */
  apiBase: ENV.apiBase,
  /** POSTERS=off renders every card as a text-only title card (R7.10). */
  posters: ENV.posters,
  /** Where debug builds send focus and event logs. */
  debugBase: ENV.debugBase,
  pollIntervalMs: 5000,
  /** Safety-net poll while the WebSocket is live. */
  livePollIntervalMs: 30000,
  pairingPollMs: 2000,
  requestTimeoutMs: 8000,
  /** How long "Connected" stays on screen before the inbox opens. */
  connectedHoldMs: 2500,
  appVersion: '0.1.0',
};
