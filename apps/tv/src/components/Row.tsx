import React, {memo, useCallback, useRef} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {TVFocusGuideView} from '@amazon-devices/react-native-kepler';
import type {InboxRow} from '@recco/core-shared/rows';
import {whoLabel} from '../lib/format';
import type {ApiCard, ApiFriend, PendingText} from '../lib/types';
import {card as cardSize, colors, safe, space, type} from '../theme';
import {CardTile} from './CardTile';
import {PlaceholderCard} from './PlaceholderCard';

interface Props {
  row: InboxRow<ApiCard>;
  label: string;
  friends: ApiFriend[];
  /** Placeholders for texts the agent is still reading. New row only. */
  pending?: PendingText[];
  preferredCardId?: string;
  registerCard: (rowKey: string, cardId: string, view: View | null) => void;
  onCardFocus: (rowKey: string, card: ApiCard) => void;
  onCardPress: (card: ApiCard) => void;
  onLayoutY: (rowKey: string, y: number) => void;
}

const STEP = cardSize.width + cardSize.gap;

/**
 * One labelled row. The focus guide remembers the last focused card, so
 * coming back into the row lands where you left it.
 */
export const Row = memo(function Row({
  row,
  label,
  friends,
  pending = [],
  preferredCardId,
  registerCard,
  onCardFocus,
  onCardPress,
  onLayoutY,
}: Props) {
  const scroll = useRef<ScrollView>(null);
  const showWho = row.key === 'new' || row.key === 'starred' || row.key === 'check';

  const handleFocus = useCallback(
    (card: ApiCard, index: number) => {
      const slot = index + pending.length;
      scroll.current?.scrollTo({x: Math.max(0, (slot - 1) * STEP), animated: true});
      onCardFocus(row.key, card);
    },
    [onCardFocus, pending.length, row.key],
  );

  return (
    <View style={styles.row} onLayout={(e) => onLayoutY(row.key, e.nativeEvent.layout.y)}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView
        ref={scroll}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.track}>
        <TVFocusGuideView autoFocus style={styles.guide}>
          {pending.map((p) => (
            <PlaceholderCard key={p.messageId} />
          ))}
          {row.cards.map((card, index) => (
            <CardTile
              key={card.id}
              ref={(view) => registerCard(row.key, card.id, view)}
              card={card}
              index={index}
              who={showWho ? whoLabel(card, friends) : undefined}
              hasTVPreferredFocus={card.id === preferredCardId}
              onFocus={handleFocus}
              onPress={onCardPress}
            />
          ))}
        </TVFocusGuideView>
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {marginBottom: space.m},
  label: {color: colors.textMuted, fontSize: type.body, fontWeight: '600', marginLeft: safe.h, marginBottom: space.xs},
  // Room around cards for the focus scale-up.
  track: {paddingHorizontal: safe.h - 4, paddingVertical: space.s},
  guide: {flexDirection: 'row'},
});
