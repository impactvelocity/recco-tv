import {debugLog} from './debug';

export type RealtimeConfig =
  | {mode: 'polling'; pollIntervalMs: number}
  | {
      mode: 'appsync-events';
      realtimeUrl: string;
      httpDomain: string;
      apiKey: string;
      channel: string;
      pollIntervalMs: number;
    };

/** Events the server publishes (packages/core ReccoEvent). Cards arrive in API shape plus server fields. */
export type ServerEvent =
  | {type: 'paired'; phoneLast4: string; householdId: string}
  | {type: 'card.pending'; messageId: string; receivedAt: string}
  | {type: 'card.ready'; messageId: string; cards: any[]}
  | {type: 'card.updated'; card: any}
  | {type: 'card.failed'; messageId: string}
  | {type: 'household.deleted'}
  | {type: 'channel.changed'};

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** base64url without padding, for ASCII input (btoa is not available on every RN runtime). */
export function base64Url(ascii: string): string {
  let out = '';
  for (let i = 0; i < ascii.length; i += 3) {
    const a = ascii.charCodeAt(i);
    const b = ascii.charCodeAt(i + 1);
    const c = ascii.charCodeAt(i + 2);
    out += B64[a >> 2];
    out += B64[((a & 3) << 4) | (isNaN(b) ? 0 : b >> 4)];
    if (!isNaN(b)) out += B64[((b & 15) << 2) | (isNaN(c) ? 0 : c >> 6)];
    if (!isNaN(c)) out += B64[c & 63];
  }
  return out;
}

const randomId = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

/**
 * AppSync Events over a plain WebSocket (no Amplify): connection_init, then
 * subscribe to one channel. Reconnects with backoff. `onState` reports whether
 * the subscription is live, so the caller can fall back to polling (R8.4).
 */
export class RealtimeClient {
  private socket: WebSocket | null = null;
  private stopped = false;
  private retryMs = 1000;
  private kaTimer: ReturnType<typeof setTimeout> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly config: Extract<RealtimeConfig, {mode: 'appsync-events'}>,
    private readonly onEvent: (event: ServerEvent) => void,
    private readonly onState: (live: boolean) => void,
  ) {}

  start() {
    this.stopped = false;
    this.connect();
  }

  stop() {
    this.stopped = true;
    if (this.kaTimer) clearTimeout(this.kaTimer);
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.socket?.close();
    this.socket = null;
    this.onState(false);
  }

  private connect() {
    const auth = {host: this.config.httpDomain, 'x-api-key': this.config.apiKey};
    const socket = new WebSocket(this.config.realtimeUrl, ['aws-appsync-event-ws', `header-${base64Url(JSON.stringify(auth))}`]);
    this.socket = socket;

    socket.onopen = () => socket.send(JSON.stringify({type: 'connection_init'}));
    socket.onmessage = (msg) => {
      let data: any;
      try {
        data = JSON.parse(String(msg.data));
      } catch {
        return;
      }
      switch (data.type) {
        case 'connection_ack':
          this.keepAlive(data.connectionTimeoutMs ?? 300000);
          socket.send(JSON.stringify({type: 'subscribe', id: randomId(), channel: this.config.channel, authorization: auth}));
          break;
        case 'subscribe_success':
          this.retryMs = 1000;
          debugLog('realtime', {state: 'live', channel: this.config.channel});
          this.onState(true);
          break;
        case 'ka':
          this.keepAlive(data.connectionTimeoutMs ?? 300000);
          break;
        case 'data':
          try {
            this.onEvent(JSON.parse(data.event) as ServerEvent);
          } catch {}
          break;
        case 'subscribe_error':
        case 'connection_error':
        case 'error':
          debugLog('realtime', {state: 'error', detail: JSON.stringify(data.errors ?? data).slice(0, 200)});
          socket.close();
          break;
      }
    };
    socket.onerror = () => {};
    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.socket = null;
      this.onState(false);
      if (this.stopped) return;
      debugLog('realtime', {state: 'closed', retryMs: this.retryMs});
      this.retryTimer = setTimeout(() => this.connect(), this.retryMs);
      this.retryMs = Math.min(this.retryMs * 2, 30000);
    };
  }

  /** No keepalive within the timeout means the connection is dead: close it and reconnect. */
  private keepAlive(timeoutMs: number) {
    if (this.kaTimer) clearTimeout(this.kaTimer);
    this.kaTimer = setTimeout(() => this.socket?.close(), timeoutMs);
  }
}
