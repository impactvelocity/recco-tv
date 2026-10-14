import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {BackHandler, StyleSheet, Text, View} from 'react-native';
import {countBursts} from '@recco/core-shared/burst';
import {buildInbox, featuredItems} from '@recco/core-shared/inbox';
import {Background} from '../components/Background';
import {EmptyInbox} from '../components/EmptyInbox';
import {FeaturedView} from '../components/FeaturedView';
import {FocusButton} from '../components/FocusButton';
import {Header, type HomeView} from '../components/Header';
import {InboxGrid} from '../components/InboxGrid';
import {debugLog} from '../lib/debug';
import {focusLater} from '../lib/focus';
import {describeItem, type Item} from '../lib/items';
import {stackTitle} from '../lib/format';
import type {ApiCard} from '../lib/types';
import {useInbox} from '../state/InboxContext';
import {useColors, usePrefs} from '../state/PrefsContext';
import {layout} from '../theme';
import {DetailPanel} from './DetailPanel';
import {SettingsPanel} from './SettingsPanel';

const GRID_TOP = 140;
const STACK_GRID_TOP = 236;

/** Where focus goes next: a tile by key (null for the first one), or a fixed control. */
type FocusTarget = {tile: string | null} | 'featured' | 'settings' | 'back';

const single = (card: ApiCard): Item => ({
  kind: 'single',
  key: `card:${card.id}`,
  cards: [card],
  watched: card.state === 'watched',
});

/**
 * The app once paired: Featured or Inbox under a fixed header, with the detail
 * drawer, settings and an opened stack drawn on top. Back closes whatever is on
 * top; with nothing open it leaves the app.
 */
export function HomeScreen() {
  const c = useColors();
  const prefs = usePrefs();
  const {inbox, updateCard} = useInbox();
  const friends = useMemo(() => inbox?.friends ?? [], [inbox?.friends]);
  const cards = useMemo(() => inbox?.cards ?? [], [inbox?.cards]);
  // Texts sent back to back are read as one, so they wait under one placeholder.
  const pending = useMemo(
    () => countBursts(inbox?.pending ?? []),
    [inbox?.pending],
  );

  const [view, setView] = useState<HomeView>(prefs.defaultView);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [stackKey, setStackKey] = useState<string | null>(null);
  /** The drawer follows a card, not an item: picking a candidate can merge it into another item. */
  const [detailCardId, setDetailCardId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const items = useMemo(
    () => buildInbox(cards, {hideWatched: prefs.hideWatched}),
    [cards, prefs.hideWatched],
  );
  const featured = useMemo(() => featuredItems(items), [items]);
  const stack = stackKey
    ? items.find((i) => i.key === stackKey && i.kind === 'stack')
    : undefined;
  const shown = useMemo(
    () =>
      stack
        ? stack.cards
            .filter((card) => !(prefs.hideWatched && card.state === 'watched'))
            .map(single)
        : items,
    [stack, items, prefs.hideWatched],
  );
  const detail = detailCardId
    ? (stack ? shown : items).find((i) =>
        i.cards.some((card) => card.id === detailCardId),
      )
    : undefined;

  const tiles = useRef(new Map<string, View>());
  const featuredRef = useRef<View>(null);
  const settingsRef = useRef<View>(null);
  const backRef = useRef<View>(null);
  const lastFocused = useRef<string | null>(null);

  const registerTile = useCallback((key: string, v: View | null) => {
    if (v) {
      tiles.current.set(key, v);
    } else {
      tiles.current.delete(key);
    }
  }, []);

  /**
   * Focus moves are queued and made after the next render, because the target
   * (the stack bar, or the inbox's tiles after a stack closes) may not exist yet.
   * A tile that is gone falls back to the first tile, then to Settings.
   */
  const wantFocus = useRef<FocusTarget | null>(null);
  const [, setFocusTick] = useState(0);
  const requestFocus = useCallback((target: FocusTarget) => {
    wantFocus.current = target;
    setFocusTick((n) => n + 1);
  }, []);
  useEffect(() => {
    const want = wantFocus.current;
    if (!want) {
      return;
    }
    wantFocus.current = null;
    const fallback = tiles.current.values().next().value ?? settingsRef.current;
    focusLater(
      want === 'featured'
        ? featuredRef.current
        : want === 'settings'
        ? settingsRef.current
        : want === 'back'
        ? backRef.current
        : (want.tile && tiles.current.get(want.tile)) || fallback,
    );
  });

  // First focus: the first card, or Settings when there is nothing (the empty inbox).
  const started = useRef(false);
  useEffect(() => {
    if (started.current || !inbox) {
      return;
    }
    started.current = true;
    if (view === 'featured' && featured.length > 0) {
      requestFocus('featured');
    } else if (items.length > 0) {
      requestFocus({tile: items[0]!.key});
    } else {
      requestFocus('settings');
    }
  }, [inbox, view, featured.length, items, requestFocus]);

  // An open stack or drawer whose cards are gone (removed, unstacked) closes itself.
  useEffect(() => {
    if (stackKey && !stack) {
      setStackKey(null);
    }
  }, [stackKey, stack]);
  useEffect(() => {
    if (detailCardId && !detail) {
      setDetailCardId(null);
      requestFocus({tile: lastFocused.current});
    }
  }, [detailCardId, detail, requestFocus]);

  const closeDetail = useCallback(() => {
    setDetailCardId(null);
    requestFocus(
      view === 'featured' && !stack ? 'featured' : {tile: lastFocused.current},
    );
  }, [view, stack, requestFocus]);

  const closeSettings = useCallback(() => {
    setSettingsOpen(false);
    requestFocus('settings');
  }, [requestFocus]);

  const closeStack = useCallback(() => {
    const key = stackKey;
    setStackKey(null);
    lastFocused.current = key;
    requestFocus({tile: key});
  }, [stackKey, requestFocus]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (detailCardId) {
        closeDetail();
      } else if (settingsOpen) {
        closeSettings();
      } else if (stackKey) {
        closeStack();
      } else {
        return false;
      }
      return true;
    });
    return () => sub.remove();
  }, [
    detailCardId,
    settingsOpen,
    stackKey,
    closeDetail,
    closeSettings,
    closeStack,
  ]);

  const open = useCallback(
    (item: Item) => {
      debugLog('open', {item: item.key, title: item.cards[0]?.title});
      if (item.kind === 'stack') {
        setStackKey(item.key);
        requestFocus('back');
        return;
      }
      setDetailCardId(item.cards[0]!.id);
    },
    [requestFocus],
  );

  const onFocusItem = useCallback((item: Item) => {
    lastFocused.current = item.key;
  }, []);

  const changeView = useCallback((next: HomeView) => {
    setStackKey(null);
    setView(next);
  }, []);

  const toggleWatched = (item: Item) => {
    const state = item.watched ? 'new' : 'watched';
    item.cards.forEach((card) => updateCard(card.id, {state}));
  };

  const remove = (item: Item) => {
    const list = stack ? shown : items;
    const at = list.findIndex((i) => i.key === item.key);
    lastFocused.current = list[at + 1]?.key ?? list[at - 1]?.key ?? null;
    item.cards.forEach((card) => updateCard(card.id, {state: 'hidden'}));
    setDetailCardId(null);
    requestFocus(
      view === 'featured' && !stack ? 'featured' : {tile: lastFocused.current},
    );
  };

  const unstack = () => {
    if (!stack) {
      return;
    }
    debugLog('action', {stack: stack.key, action: 'unstack'});
    stack.cards.forEach((card) => updateCard(card.id, {ungroup: true}));
    setStackKey(null);
    lastFocused.current = null;
    requestFocus({tile: `card:${stack.cards[0]!.id}`});
  };

  const isEmpty = items.length === 0 && pending === 0;
  const stackView = stack ? describeItem(stack, friends) : null;

  return (
    <View style={styles.screen}>
      <Background />
      <Header
        ref={settingsRef}
        view={view}
        onView={changeView}
        onSettings={() => setSettingsOpen(true)}
      />

      {view === 'featured' ? (
        <FeaturedView
          ref={featuredRef}
          items={featured}
          index={featuredIndex}
          onIndex={setFeaturedIndex}
          friends={friends}
          onOpen={open}
        />
      ) : isEmpty ? (
        <EmptyInbox phoneNumber={inbox?.pairing.phoneNumber ?? ''} />
      ) : (
        <>
          {stack && stackView ? (
            <View style={styles.stackBar}>
              <FocusButton
                ref={backRef}
                look="surface"
                round={64}
                icon="back"
                a11yLabel="Back to the inbox"
                onPress={closeStack}
              />
              <View style={styles.stackTitle}>
                <Text
                  style={[styles.stackHeading, {color: c.text}]}
                  numberOfLines={1}>
                  {stack.cards[0]!.groupTitle ?? stackTitle(stack.cards[0]!)}
                </Text>
                <Text
                  style={[styles.stackSub, {color: c.text2}]}
                  numberOfLines={1}>
                  {stackView.label}
                </Text>
              </View>
              <FocusButton
                look="surface"
                pill
                icon="stack"
                label="Unstack into Inbox"
                onPress={unstack}
                style={styles.unstack}
              />
            </View>
          ) : null}
          <InboxGrid
            key={stack ? stack.key : 'inbox'}
            items={shown}
            pending={stack ? 0 : pending}
            friends={friends}
            top={stack ? STACK_GRID_TOP : GRID_TOP}
            registerTile={registerTile}
            onFocusItem={onFocusItem}
            onOpen={open}
          />
        </>
      )}

      {detail ? (
        <DetailPanel
          item={detail}
          friends={friends}
          onClose={closeDetail}
          onToggleWatched={toggleWatched}
          onRemove={remove}
          onPick={(cardId, titleId) =>
            updateCard(cardId, {candidateTitleId: titleId})
          }
        />
      ) : null}
      {settingsOpen ? <SettingsPanel onClose={closeSettings} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  stackBar: {
    position: 'absolute',
    top: 150,
    left: layout.side,
    right: layout.side,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  stackTitle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 16,
    flexShrink: 1,
  },
  stackHeading: {fontSize: 32, fontWeight: '700', letterSpacing: -0.6},
  stackSub: {fontSize: 23},
  unstack: {marginLeft: 'auto', paddingHorizontal: 26},
});
