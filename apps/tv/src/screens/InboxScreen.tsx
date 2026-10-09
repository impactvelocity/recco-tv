import React, {useCallback, useMemo, useRef, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@amazon-devices/react-navigation__native';
import {buildRows, type InboxRow} from '@recco/core-shared/rows';
import {formatTrackRecord} from '@recco/core-shared/track-record';
import {FocusButton} from '../components/FocusButton';
import {Hero} from '../components/Hero';
import {OfflineNote} from '../components/OfflineNote';
import {ReccoMark} from '../components/ReccoMark';
import {Row} from '../components/Row';
import {debugLog} from '../lib/debug';
import {focusLater} from '../lib/focus';
import {formatPhone} from '../lib/format';
import type {ScreenProps} from '../lib/navigation';
import type {ApiCard} from '../lib/types';
import {useInbox} from '../state/InboxContext';
import {colors, safe, space, type} from '../theme';

const EXAMPLES = [
  'Severance',
  'King of Queens - Jordan said it was funny',
  'a TikTok link, then "Steph sent this"',
];

export function InboxScreen({navigation}: ScreenProps<'Inbox'>) {
  const {inbox} = useInbox();
  const friends = useMemo(() => inbox?.friends ?? [], [inbox?.friends]);
  const cards = useMemo(() => inbox?.cards ?? [], [inbox?.cards]);
  const pending = useMemo(() => inbox?.pending ?? [], [inbox?.pending]);

  const rows = useMemo(() => {
    const built: InboxRow<ApiCard>[] = buildRows(cards, friends);
    // Placeholders live in New, which may not exist yet.
    if (pending.length > 0 && built[0]?.key !== 'new') built.unshift({key: 'new', label: 'New', cards: []});
    return built;
  }, [cards, friends, pending.length]);

  const labels = useMemo(() => {
    const out: Record<string, string> = {};
    for (const row of rows) {
      const friend = row.friendId ? friends.find((f) => f.id === row.friendId) : undefined;
      const record = friend ? formatTrackRecord(friend) : null;
      out[row.key] = record ? `${row.label}  ·  ${record}` : row.label;
    }
    return out;
  }, [rows, friends]);

  // A card can sit in several rows (New and its friend's). Only the first row claims initial focus.
  const firstRow = rows.find((r) => r.cards.length > 0);
  const firstCardId = firstRow?.cards[0]?.id;
  // Initial focus is claimed once. A card arriving later must not take focus (R8.3).
  const initialFocus = useRef<{rowKey: string; cardId: string} | null>(null);
  if (!initialFocus.current && firstRow && firstCardId) {
    initialFocus.current = {rowKey: firstRow.key, cardId: firstCardId};
  }
  const [heroId, setHeroId] = useState<string | undefined>(undefined);
  const heroCard = cards.find((c) => c.id === (heroId ?? firstCardId));

  const scroll = useRef<ScrollView>(null);
  const rowY = useRef(new Map<string, number>());
  const cardViews = useRef(new Map<string, View>());
  const lastFocus = useRef<{rowKey: string; cardId: string} | null>(null);
  const settingsRef = useRef<View>(null);

  const registerCard = useCallback((rowKey: string, cardId: string, view: View | null) => {
    const key = `${rowKey}/${cardId}`;
    if (view) cardViews.current.set(key, view);
    else cardViews.current.delete(key);
  }, []);

  const onLayoutY = useCallback((rowKey: string, y: number) => {
    rowY.current.set(rowKey, y);
  }, []);

  const onCardFocus = useCallback((rowKey: string, card: ApiCard) => {
    lastFocus.current = {rowKey, cardId: card.id};
    setHeroId(card.id);
    scroll.current?.scrollTo({y: rowY.current.get(rowKey) ?? 0, animated: true});
    debugLog('focus', {screen: 'inbox', row: rowKey, card: card.title});
  }, []);

  const onCardPress = useCallback(
    (card: ApiCard) => {
      debugLog('open', {card: card.title});
      navigation.navigate('Card', {cardId: card.id});
    },
    [navigation],
  );

  // Back from card detail lands on the same card (R7.4). If it moved rows (rated, picked),
  // the same card in its new row; if it was hidden, the first card left in its row.
  useFocusEffect(
    useCallback(() => {
      const last = lastFocus.current;
      if (!last) return;
      const views = [...cardViews.current.entries()];
      const target =
        cardViews.current.get(`${last.rowKey}/${last.cardId}`) ??
        views.find(([key]) => key.endsWith(`/${last.cardId}`))?.[1] ??
        views.find(([key]) => key.startsWith(`${last.rowKey}/`))?.[1] ??
        views[0]?.[1] ??
        // No cards left (e.g. paired to a new, empty household): Settings keeps focus.
        settingsRef.current;
      focusLater(target);
    }, []),
  );

  const isEmpty = cards.filter((c) => c.state !== 'hidden').length === 0 && pending.length === 0;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <ReccoMark />
        <View style={styles.headerRight}>
          <OfflineNote />
          <View style={{width: space.l}} />
          <FocusButton
            ref={settingsRef}
            label="Settings"
            testID="settings"
            hasTVPreferredFocus={isEmpty}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </View>

      {isEmpty ? (
        <EmptyInbox phoneNumber={inbox?.pairing.phoneNumber ?? ''} />
      ) : (
        <>
          <View style={styles.heroWrap}>
            <Hero card={heroCard} friends={friends} country={inbox?.household?.country} />
          </View>
          <ScrollView ref={scroll} style={styles.rows} showsVerticalScrollIndicator={false}>
            {rows.map((row) => (
              <Row
                key={row.key}
                row={row}
                label={labels[row.key] ?? row.label}
                friends={friends}
                pending={row.key === 'new' ? pending : undefined}
                preferredCardId={
                  !lastFocus.current && row.key === initialFocus.current?.rowKey
                    ? initialFocus.current.cardId
                    : undefined
                }
                registerCard={registerCard}
                onCardFocus={onCardFocus}
                onCardPress={onCardPress}
                onLayoutY={onLayoutY}
              />
            ))}
            <View style={{height: 400}} />
          </ScrollView>
        </>
      )}
    </View>
  );
}

function EmptyInbox({phoneNumber}: {phoneNumber: string}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>Nothing to watch yet.</Text>
      <Text style={styles.emptyBody}>
        Text any show to <Text style={styles.number}>{formatPhone(phoneNumber)}</Text> and it shows up here.
      </Text>
      <Text style={styles.emptyHint}>Try one of these:</Text>
      {EXAMPLES.map((e) => (
        <Text key={e} style={styles.example}>
          “{e}”
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg, paddingTop: safe.v},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: safe.h,
  },
  headerRight: {flexDirection: 'row', alignItems: 'center'},
  heroWrap: {paddingHorizontal: safe.h},
  rows: {flex: 1},
  empty: {flex: 1, paddingHorizontal: safe.h, justifyContent: 'center'},
  emptyTitle: {color: colors.text, fontSize: type.hero, fontWeight: '700'},
  emptyBody: {color: colors.textMuted, fontSize: type.title, marginTop: space.m},
  number: {color: colors.accent, fontWeight: '700'},
  emptyHint: {color: colors.textFaint, fontSize: type.body, marginTop: space.xl},
  example: {color: colors.text, fontSize: type.body, marginTop: space.s},
});
