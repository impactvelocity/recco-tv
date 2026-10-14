import React, {useCallback, useMemo, useRef} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {debugLog} from '../lib/debug';
import {describeItem, type Item} from '../lib/items';
import type {ApiFriend} from '../lib/types';
import {layout} from '../theme';
import {InboxTile, PlaceholderTile} from './InboxTile';

const COLS = 3;
const ROW = layout.cardHeight + layout.gridGap;
/** Room kept around the focused card so its lift and shadow are never clipped. */
const EDGE = 28;

interface Props {
  items: Item[];
  /** Texts the agent is still reading; shown first, not focusable. */
  pending?: number;
  friends: ApiFriend[];
  /** Screen y where the grid starts. */
  top: number;
  preferredKey?: string;
  registerTile: (key: string, view: View | null) => void;
  onFocusItem: (item: Item) => void;
  onOpen: (item: Item) => void;
}

/** The 3-column inbox grid. Scrolls so the focused row stays in view. */
export function InboxGrid({
  items,
  pending = 0,
  friends,
  top,
  preferredKey,
  registerTile,
  onFocusItem,
  onOpen,
}: Props) {
  const scroll = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const viewport = 1080 - top;
  const now = useMemo(() => new Date(), [items]); // eslint-disable-line react-hooks/exhaustive-deps
  const views = useMemo(
    () => items.map((item) => describeItem(item, friends, now)),
    [items, friends, now],
  );

  const handleFocus = useCallback(
    (item: Item) => {
      const slot = pending + items.findIndex((i) => i.key === item.key);
      const rowTop = Math.floor(slot / COLS) * ROW + EDGE;
      const rowBottom = rowTop + layout.cardHeight;
      let y = scrollY.current;
      if (rowTop - EDGE < y) {
        y = Math.max(0, rowTop - EDGE);
      } else if (rowBottom + EDGE > y + viewport) {
        y = rowBottom + EDGE - viewport;
      }
      if (y !== scrollY.current) {
        scrollY.current = y;
        scroll.current?.scrollTo({y, animated: true});
      }
      debugLog('focus', {
        screen: 'inbox',
        item: item.key,
        title: item.cards[0]?.title,
      });
      onFocusItem(item);
    },
    [items, pending, viewport, onFocusItem],
  );

  return (
    <ScrollView
      ref={scroll}
      style={[styles.scroll, {top}]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      {Array.from({length: pending}, (_, i) => (
        <PlaceholderTile key={`pending-${i}`} />
      ))}
      {items.map((item, i) => (
        <InboxTile
          key={item.key}
          ref={(v) => registerTile(item.key, v)}
          item={item}
          view={views[i]!}
          hasTVPreferredFocus={item.key === preferredKey}
          onFocus={handleFocus}
          onPress={onOpen}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    position: 'absolute',
    left: 48,
    right: 48,
    bottom: 0,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.gridGap,
    paddingTop: EDGE,
    paddingHorizontal: 48,
    paddingBottom: 400,
  },
});
