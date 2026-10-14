import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {applyCardUpdate} from '@recco/core-shared/states';
import {config} from '../config';
import {api, ApiError, NetworkError} from '../lib/api';
import {debugLog} from '../lib/debug';
import {RealtimeClient, type ServerEvent} from '../lib/realtime';
import {storage} from '../lib/storage';
import type {ApiCard, CardUpdate, Inbox, PairingCode} from '../lib/types';

/**
 * starting   – reading storage, first contact with the API
 * unpaired   – showing a pairing code
 * connected  – just paired; "Connected" is on screen briefly (R1.4)
 * paired     – the inbox
 */
export type Phase = 'starting' | 'unpaired' | 'connected' | 'paired';

interface InboxContextValue {
  phase: Phase;
  inbox: Inbox | null;
  /** The last request could not reach the API. The last inbox stays on screen (R7.9). */
  offline: boolean;
  /** Live updates are arriving over the WebSocket. When false, the app polls every five seconds. */
  live: boolean;
  /** The code currently shown: for first pairing, or "Pair another phone". */
  pairingCode: PairingCode | null;
  connectedLast4: string | null;
  refresh: () => Promise<void>;
  updateCard: (cardId: string, update: CardUpdate) => Promise<void>;
  requestNewCode: () => Promise<void>;
}

const InboxContext = createContext<InboxContextValue | null>(null);

export function useInbox(): InboxContextValue {
  const value = useContext(InboxContext);
  if (!value) throw new Error('useInbox outside InboxProvider');
  return value;
}

const isExpired = (code: PairingCode | null) => !code || Date.parse(code.expiresAt) <= Date.now();

export function InboxProvider({children}: {children: React.ReactNode}) {
  const [phase, setPhase] = useState<Phase>('starting');
  const [inbox, setInbox] = useState<Inbox | null>(null);
  const [offline, setOffline] = useState(false);
  const [pairingCode, setPairingCode] = useState<PairingCode | null>(null);
  const [connectedLast4, setConnectedLast4] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  const token = useRef<string | null>(null);
  const phaseRef = useRef<Phase>('starting');
  const inboxRef = useRef<Inbox | null>(null);
  const busy = useRef(false);
  const pairingCodeRef = useRef<PairingCode | null>(null);
  pairingCodeRef.current = pairingCode;

  const goTo = useCallback((next: Phase) => {
    if (phaseRef.current !== next) debugLog('phase', {from: phaseRef.current, to: next});
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const keepInbox = useCallback((next: Inbox) => {
    inboxRef.current = next;
    setInbox(next);
    if (next.pairing.paired) storage.setLastInbox(next);
  }, []);

  const ensureDevice = useCallback(async () => {
    if (token.current) return;
    const created = await api.createDevice();
    token.current = created.deviceToken;
    await storage.setToken(created.deviceToken);
    setPairingCode(created.pairing);
  }, []);

  const requestNewCode = useCallback(async () => {
    if (!token.current) return;
    try {
      const {pairing} = await api.newCode(token.current);
      setPairingCode(pairing);
      setOffline(false);
    } catch (err) {
      if (err instanceof NetworkError) setOffline(true);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      await ensureDevice();
      const next = await api.inbox(token.current!);
      setOffline(false);

      if (next.pairing.paired) {
        const wasPaired = inboxRef.current?.pairing.paired;
        const previousLast4 = wasPaired && inboxRef.current?.pairing.paired ? inboxRef.current.pairing.phoneLast4 : null;
        keepInbox(next);
        if (phaseRef.current === 'unpaired') {
          setConnectedLast4(next.pairing.phoneLast4);
          setPairingCode(null);
          goTo('connected');
          setTimeout(() => goTo('paired'), config.connectedHoldMs);
        } else if (phaseRef.current === 'starting') {
          goTo('paired');
        } else if (previousLast4 && previousLast4 !== next.pairing.phoneLast4) {
          // "Pair another phone" from settings succeeded.
          setPairingCode(null);
        }
        return;
      }

      keepInbox(next);
      goTo('unpaired');
      if (next.pairing.code && next.pairing.expiresAt) {
        setPairingCode({code: next.pairing.code, expiresAt: next.pairing.expiresAt, phoneNumber: next.pairing.phoneNumber});
      } else {
        await requestNewCode();
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        // The server no longer knows this TV (a local server restarts empty). Start over.
        debugLog('token-rejected');
        token.current = null;
        inboxRef.current = null;
        await storage.setToken(null);
        setInbox(null);
        goTo('unpaired');
      } else if (err instanceof NetworkError) {
        setOffline(true);
        if (phaseRef.current === 'starting') goTo(inboxRef.current?.pairing.paired ? 'paired' : 'unpaired');
      } else {
        debugLog('refresh-error', {error: String(err)});
      }
    } finally {
      busy.current = false;
    }
  }, [ensureDevice, goTo, keepInbox, requestNewCode]);

  // Start: saved token and last inbox first, so a TV with no network still shows the list.
  useEffect(() => {
    (async () => {
      token.current = await storage.getToken();
      const last = await storage.getLastInbox();
      if (token.current && last?.pairing.paired) {
        inboxRef.current = last;
        setInbox(last);
        goTo('paired');
      }
      await refresh();
    })();
  }, [goTo, refresh]);

  // Apply a live event to the inbox in place (R8.2, R8.3). Focus is never moved here.
  const applyEvent = useCallback(
    (event: ServerEvent) => {
      debugLog('event', {type: event.type});
      const current = inboxRef.current;
      if (event.type === 'paired' || !current) {
        refresh();
        return;
      }
      if (event.type === 'card.pending') {
        if (current.pending.some((p) => p.messageId === event.messageId)) return;
        keepInbox({...current, pending: [...current.pending, {messageId: event.messageId, receivedAt: event.receivedAt}]});
      } else if (event.type === 'card.ready') {
        const ids = new Set(event.cards.map((c: ApiCard) => c.id));
        keepInbox({
          ...current,
          pending: current.pending.filter((p) => p.messageId !== event.messageId),
          cards: [...current.cards.filter((c) => !ids.has(c.id)), ...event.cards],
        });
        // A new friend may have been created; fetch friends and track records.
        refresh();
      } else if (event.type === 'card.updated') {
        const exists = current.cards.some((c) => c.id === event.card.id);
        keepInbox({
          ...current,
          cards: exists ? current.cards.map((c) => (c.id === event.card.id ? event.card : c)) : [...current.cards, event.card],
        });
      } else if (event.type === 'card.failed') {
        keepInbox({...current, pending: current.pending.filter((p) => p.messageId !== event.messageId)});
      }
    },
    [keepInbox, refresh],
  );

  // Live updates over AppSync Events. Resubscribes when the TV moves to a household channel.
  // Changes when the TV pairs (device channel → household channel) or moves to another phone.
  const channelKey = inbox?.pairing.paired ? `paired:${inbox.pairing.phoneLast4}` : 'unpaired';
  useEffect(() => {
    if (phase === 'starting' || phase === 'connected' || !token.current) return;
    let client: RealtimeClient | null = null;
    let cancelled = false;
    api
      .realtime(token.current)
      .then((rt) => {
        if (cancelled || rt.mode !== 'appsync-events') return;
        client = new RealtimeClient(rt, applyEvent, setLive);
        client.start();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      client?.stop();
    };
  }, [phase, channelKey, applyEvent]);

  // Poll: fast while pairing, every five seconds without a live socket (R8.4), and a slow
  // safety net while live.
  useEffect(() => {
    if (phase === 'starting') return;
    const every = phase === 'unpaired' ? config.pairingPollMs : live ? config.livePollIntervalMs : config.pollIntervalMs;
    const timer = setInterval(() => {
      if (phaseRef.current === 'unpaired' && isExpired(pairingCodeRef.current)) requestNewCode();
      refresh();
    }, every);
    return () => clearInterval(timer);
  }, [phase, live, refresh, requestNewCode]);

  const updateCard = useCallback(
    async (cardId: string, update: CardUpdate) => {
      const current = inboxRef.current;
      const card = current?.cards.find((c) => c.id === cardId);
      if (!current || !card || !token.current) return;

      const replace = (base: Inbox, next: ApiCard): Inbox => ({
        ...base,
        cards: base.cards.map((c) => (c.id === cardId ? next : c)),
      });

      const local = update.friendId && !update.origin ? {...update, origin: 'friend' as const} : update;
      keepInbox(replace(current, applyCardUpdate(card, local)));
      try {
        const {card: saved} = await api.updateCard(token.current, cardId, update);
        if (inboxRef.current) keepInbox(replace(inboxRef.current, saved));
        setOffline(false);
      } catch (err) {
        if (inboxRef.current) keepInbox(replace(inboxRef.current, card));
        if (err instanceof NetworkError) setOffline(true);
        debugLog('update-failed', {cardId, error: String(err)});
      }
    },
    [keepInbox],
  );

  const value = useMemo(
    () => ({phase, inbox, offline, live, pairingCode, connectedLast4, refresh, updateCard, requestNewCode}),
    [phase, inbox, offline, live, pairingCode, connectedLast4, refresh, updateCard, requestNewCode],
  );
  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}
