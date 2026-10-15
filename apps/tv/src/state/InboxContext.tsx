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
  /** Forget me (R11.2): delete the household on the server, then go back to pairing. Throws if the server cannot be reached. */
  forget: () => Promise<void>;
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
  /** Bumped by `channel.changed`: fetch the household's new channel and resubscribe (R1.9). */
  const [channelEpoch, setChannelEpoch] = useState(0);

  const token = useRef<string | null>(null);
  const phaseRef = useRef<Phase>('starting');
  const inboxRef = useRef<Inbox | null>(null);
  const busy = useRef(false);
  /** A refresh was asked for while one was running: run another when it ends. */
  const again = useRef(false);
  const refreshRef = useRef<() => Promise<void>>();
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

  /** Throw away this TV's household: token, saved inbox, and what is on screen. Shows pairing (R11.5). */
  const resetToPairing = useCallback(async () => {
    token.current = null;
    inboxRef.current = null;
    setInbox(null);
    setPairingCode(null);
    await storage.setToken(null); // also removes the saved inbox
    goTo('unpaired');
  }, [goTo]);

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
    if (busy.current) {
      again.current = true;
      return;
    }
    busy.current = true;
    try {
      await ensureDevice();
      const sent = token.current!;
      const next = await api.inbox(sent);
      // Reset or forgotten while this was in flight: the answer is from a household this TV has left.
      if (token.current !== sent) return;
      setOffline(false);

      if (next.pairing.paired) {
        const before = inboxRef.current?.pairing;
        // Paired to another phone's household: nothing of the old one is kept (R1.10).
        const moved = !!before?.paired && before.householdId !== next.pairing.householdId;
        if (moved) {
          debugLog('household-changed');
          await storage.clearLastInbox();
        }
        keepInbox(next);
        if (phaseRef.current === 'unpaired') {
          setConnectedLast4(next.pairing.phoneLast4);
          setPairingCode(null);
          goTo('connected');
          setTimeout(() => goTo('paired'), config.connectedHoldMs);
        } else if (phaseRef.current === 'starting') {
          goTo('paired');
        } else if (moved) {
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
        // The household was forgotten (R11.6), or the server no longer knows this TV
        // (a local server restarts empty). Start over.
        debugLog('token-rejected');
        await resetToPairing();
      } else if (err instanceof NetworkError) {
        setOffline(true);
        if (phaseRef.current === 'starting') goTo(inboxRef.current?.pairing.paired ? 'paired' : 'unpaired');
      } else {
        debugLog('refresh-error', {error: String(err)});
      }
    } finally {
      busy.current = false;
      if (again.current) {
        again.current = false;
        setTimeout(() => refreshRef.current?.(), 0);
      }
    }
  }, [ensureDevice, goTo, keepInbox, requestNewCode, resetToPairing]);
  refreshRef.current = refresh;

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
      if (event.type === 'household.deleted') {
        // Forgotten, or this TV has just moved away from it. Drop the saved copy, then
        // ask: a 401 goes back to pairing (R11.5, R11.6); a moved TV gets its new inbox.
        storage.clearLastInbox();
        refresh();
        return;
      }
      if (event.type === 'channel.changed') {
        // Another TV left. Resubscribe on the new channel; if it was this TV, the
        // refresh finds its new household.
        setChannelEpoch((n) => n + 1);
        refresh();
        return;
      }
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
  // Changes when the TV pairs (device channel → household channel), moves to another phone,
  // or is told its household's channel changed.
  const channelKey = inbox?.pairing.paired ? `paired:${inbox.pairing.householdId}` : 'unpaired';
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
  }, [phase, channelKey, channelEpoch, applyEvent]);

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

  const forget = useCallback(async () => {
    const sent = token.current;
    if (!sent) return;
    try {
      await api.forgetHousehold(sent);
    } catch (err) {
      // 401: already gone (a FORGET ME text, or another TV got there first).
      if (!(err instanceof ApiError && err.status === 401)) throw err;
    }
    debugLog('forgotten');
    // The household.deleted event may have reset this TV already.
    if (token.current === sent) await resetToPairing();
    refresh();
  }, [refresh, resetToPairing]);

  const value = useMemo(
    () => ({phase, inbox, offline, live, pairingCode, connectedLast4, refresh, updateCard, requestNewCode, forget}),
    [phase, inbox, offline, live, pairingCode, connectedLast4, refresh, updateCard, requestNewCode, forget],
  );
  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}
