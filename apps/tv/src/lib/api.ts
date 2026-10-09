import {config} from '../config';
import type {RealtimeConfig} from './realtime';
import type {ApiCard, CardUpdate, Inbox, PairingCode} from './types';

/** The server answered with an error status. */
export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

/** The server could not be reached. */
export class NetworkError extends Error {}

async function request<T>(
  path: string,
  {method = 'GET', token, body}: {method?: string; token?: string; body?: unknown} = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  if (token) headers.authorization = `Bearer ${token}`;
  if (body !== undefined) headers['content-type'] = 'application/json';

  let res: Response;
  try {
    res = await Promise.race([
      fetch(`${config.apiBase}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), config.requestTimeoutMs),
      ),
    ]);
  } catch (err) {
    throw new NetworkError(String(err));
  }
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new ApiError(res.status, json.error ?? `HTTP ${res.status}`);
  return json as T;
}

/** The only server the TV talks to is services/api. */
export const api = {
  createDevice: () =>
    request<{deviceId: string; deviceToken: string; pairing: PairingCode}>('/devices', {
      method: 'POST',
    }),
  newCode: (token: string) =>
    request<{pairing: PairingCode}>('/devices/code', {method: 'POST', token}),
  inbox: (token: string) => request<Inbox>('/inbox', {token}),
  realtime: (token: string) => request<RealtimeConfig>('/realtime', {token}),
  updateCard: (token: string, cardId: string, update: CardUpdate) =>
    request<{card: ApiCard}>(`/cards/${encodeURIComponent(cardId)}`, {
      method: 'PATCH',
      token,
      body: update,
    }),
};
