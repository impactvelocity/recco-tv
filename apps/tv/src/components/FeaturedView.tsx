import React, {forwardRef, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  TVFocusGuideView,
  useTVEventHandler,
} from '@amazon-devices/react-native-kepler';
import {debugLog} from '../lib/debug';
import {longMetaLine} from '../lib/format';
import {describeItem, type Item} from '../lib/items';
import type {ApiFriend} from '../lib/types';
import {useColors} from '../state/PrefsContext';
import {radius, shadow, type} from '../theme';
import {AlexaRow, Avatars, Poster, Ratings, WatchedPill} from './CardParts';
import {FocusRing} from './FocusRing';
import {Icon} from './Icon';

interface Props {
  items: Item[];
  index: number;
  onIndex: (index: number) => void;
  friends: ApiFriend[];
  onOpen: (item: Item) => void;
  hasTVPreferredFocus?: boolean;
}

/**
 * One recco at a time, large. Left and Right flip through, wrapping around.
 * The card is the only focusable thing in its row, so the remote's Left/Right
 * have nowhere else to go and are read here instead.
 */
export const FeaturedView = forwardRef<View, Props>(
  ({items, index, onIndex, friends, onOpen, hasTVPreferredFocus}, ref) => {
    const c = useColors();
    const [focused, setFocused] = useState(false);
    const focusedRef = useRef(false);
    const n = items.length;
    const at = n > 0 ? ((index % n) + n) % n : 0;

    useTVEventHandler((evt: {eventType: string; eventKeyAction?: number}) => {
      if (!focusedRef.current || n < 2 || evt.eventKeyAction === 1) {
        return;
      }
      if (evt.eventType === 'left' || evt.eventType === 'right') {
        const next = (at + (evt.eventType === 'left' ? -1 : 1) + n) % n;
        debugLog('featured', {
          index: next,
          title: items[next]?.cards[0]?.title,
        });
        onIndex(next);
      }
    });

    const item = items[at];
    if (!item) {
      return (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, {color: c.text2}]}>
            Featured shows the shows in your inbox, one at a time.
          </Text>
        </View>
      );
    }
    const view = describeItem(item, friends);
    const card = view.primary;

    return (
      <View style={styles.wrap}>
        <View style={styles.row}>
          <Arrow dir="back" />
          <TVFocusGuideView trapFocusLeft trapFocusRight>
            <Pressable
              ref={ref}
              testID="featured"
              aria-label={card.title}
              accessibilityRole="button"
              hasTVPreferredFocus={hasTVPreferredFocus}
              onFocus={() => {
                focusedRef.current = true;
                setFocused(true);
                debugLog('focus', {screen: 'featured', card: card.title});
              }}
              onBlur={() => {
                focusedRef.current = false;
                setFocused(false);
              }}
              onPress={() => onOpen(item)}
              style={[
                styles.card,
                {
                  backgroundColor: focused ? c.surfaceSolid : c.surface,
                  borderColor: c.border,
                },
                shadow.lifted,
              ]}>
              <Poster card={card} width={380} height={570} radius={20} />
              <View style={styles.info}>
                <Text style={[styles.title, {color: c.text}]} numberOfLines={2}>
                  {card.title}
                </Text>
                <Text style={[styles.meta, {color: c.text2}]}>
                  {longMetaLine(card)}
                </Text>
                <View style={styles.ratingsRow}>
                  <Ratings card={card} size={25} />
                  {item.watched ? <WatchedPill /> : null}
                </View>
                {card.plot ? (
                  <Text
                    style={[styles.synopsis, {color: c.text}]}
                    numberOfLines={4}>
                    {card.plot}
                  </Text>
                ) : null}
                <View style={[styles.divider, {backgroundColor: c.border}]} />
                <View style={styles.from}>
                  <Avatars names={view.names} size={40} />
                  <View style={{flexShrink: 1, gap: 6}}>
                    <Text
                      style={[styles.fromLine, {color: c.text2}]}
                      numberOfLines={1}>
                      <Text style={{fontWeight: '600', color: c.textB}}>
                        {view.label}
                      </Text>{' '}
                      · {view.time}
                    </Text>
                    {view.message ? (
                      <Text
                        style={[styles.message, {color: c.textB}]}
                        numberOfLines={2}>
                        {view.message}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.alexa}>
                  <AlexaRow title={card.title} size={26} />
                </View>
              </View>
              {focused ? <FocusRing width={4} radius={radius.panel} /> : null}
            </Pressable>
          </TVFocusGuideView>
          <Arrow dir="forward" />
        </View>
        <View style={styles.dots}>
          {items.map((it, i) => (
            <View
              key={it.key}
              style={[
                styles.dot,
                {backgroundColor: i === at ? c.focus : 'rgba(255,255,255,.7)'},
              ]}
            />
          ))}
        </View>
      </View>
    );
  },
);

/** Not focusable: it shows that Left and Right flip. */
function Arrow({dir}: {dir: 'back' | 'forward'}) {
  const c = useColors();
  return (
    <View
      style={[
        styles.arrow,
        {backgroundColor: c.surface2, borderColor: c.border},
        shadow.poster,
      ]}>
      <Icon name={dir} size={38} color={c.text} strokeWidth={2.5} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  row: {flexDirection: 'row', alignItems: 'center', gap: 40},
  card: {
    width: 1440,
    flexDirection: 'row',
    gap: 56,
    padding: 44,
    borderRadius: radius.panel,
    borderWidth: 1,
    alignItems: 'center',
  },
  info: {flex: 1, minWidth: 0, alignSelf: 'stretch', gap: 22},
  title: {
    fontSize: type.featured,
    fontWeight: '700',
    lineHeight: 68,
    letterSpacing: -1.7,
  },
  meta: {fontSize: 25},
  ratingsRow: {flexDirection: 'row', alignItems: 'center', gap: 22},
  synopsis: {fontSize: type.synopsis, lineHeight: 38},
  divider: {height: 1},
  from: {flexDirection: 'row', alignItems: 'flex-start', gap: 14},
  fromLine: {fontSize: 20},
  message: {fontSize: 25, lineHeight: 34},
  alexa: {marginTop: 'auto', alignSelf: 'flex-start', maxWidth: '100%'},
  arrow: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: {flexDirection: 'row', gap: 14},
  dot: {width: 16, height: 16, borderRadius: 8},
  empty: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {fontSize: type.synopsis},
});
