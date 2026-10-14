import React, {forwardRef, memo, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from '@amazon-devices/react-linear-gradient';
import {metaLine, platformOf} from '../lib/format';
import type {Item, ItemView} from '../lib/items';
import {useColors} from '../state/PrefsContext';
import {layout, radius, shadow, type} from '../theme';
import {
  Bubble,
  Chip,
  Poster,
  Ratings,
  SenderLine,
  WatchedPill,
} from './CardParts';
import {FocusRing} from './FocusRing';

interface Props {
  item: Item;
  view: ItemView;
  hasTVPreferredFocus?: boolean;
  onFocus: (item: Item) => void;
  onPress: (item: Item) => void;
}

/**
 * One inbox tile, 557×414. Focus "lifts" it: scale 1.06, a 4 px ring, the
 * solid surface and a deep shadow. "Alexa, select <title>" works through its aria-label.
 */
export const InboxTile = memo(
  forwardRef<View, Props>(
    ({item, view, hasTVPreferredFocus, onFocus, onPress}, ref) => {
      const c = useColors();
      const [focused, setFocused] = useState(false);
      const card = view.primary;
      const stack = item.kind === 'stack';
      return (
        <Pressable
          ref={ref}
          testID={`tile-${item.key}`}
          aria-label={
            stack ? `${item.cards.length} shows, ${view.label}` : card.title
          }
          accessibilityRole="button"
          hasTVPreferredFocus={hasTVPreferredFocus}
          onFocus={() => {
            setFocused(true);
            onFocus(item);
          }}
          onBlur={() => setFocused(false)}
          onPress={() => onPress(item)}
          style={[
            styles.tile,
            {backgroundColor: c.surface, borderColor: c.border},
            focused && [
              styles.lifted,
              {backgroundColor: c.surfaceSolid},
              shadow.lifted,
            ],
          ]}>
          <View style={styles.left}>
            <Text style={[styles.title, {color: c.text}]} numberOfLines={2}>
              {stack ? stackHeading(item) : card.title}
            </Text>
            <View style={styles.metaRow}>
              {stack ? (
                <>
                  <Chip icon="stack" label={`${item.cards.length} shows`} />
                  <Text style={[styles.meta, {color: c.text2}]}>
                    {platformOf(card.sourceUrl) ?? 'Text'}
                  </Text>
                </>
              ) : (
                <>
                  {metaLine(card) ? (
                    <Text style={[styles.meta, {color: c.text2}]}>
                      {metaLine(card)}
                    </Text>
                  ) : null}
                  {card.needsCheck ? <Chip label="Which one?" /> : null}
                  {card.kind === 'unsorted' ? (
                    <Chip label="Not matched" />
                  ) : null}
                  {item.watched ? <WatchedPill /> : null}
                </>
              )}
            </View>
            {stack ? null : <Ratings card={card} />}
            <View style={styles.bubbleArea}>
              {view.message ? (
                <Bubble text={view.message} numberOfLines={stack ? 6 : 5} />
              ) : null}
            </View>
            <SenderLine
              names={view.names}
              label={view.label}
              time={view.time}
            />
          </View>
          {stack ? (
            <Fan item={item} />
          ) : (
            <Poster
              card={card}
              width={252}
              height={378}
              radius={radius.poster}
            />
          )}
          {focused ? <FocusRing width={4} radius={radius.card} /> : null}
        </Pressable>
      );
    },
  ),
);

/** A stack is titled by the name the agent gave it, or else by the shows in it. */
function stackHeading(item: Item): string {
  const named = item.cards[0]?.groupTitle;
  if (named) {
    return named;
  }
  return (
    item.cards
      .map((c) => c.title)
      .slice(0, 3)
      .join(', ') + (item.cards.length > 3 ? '…' : '')
  );
}

/** Three posters fanned at 0°, −7° and 10°, front to back. */
function Fan({item}: {item: Item}) {
  const [a, b, c] = item.cards;
  return (
    <View style={styles.fan}>
      {c ? (
        <Poster
          card={c}
          width={200}
          height={300}
          radius={14}
          style={[
            styles.fanCard,
            {left: 44, top: 48, transform: [{rotate: '10deg'}]},
          ]}
        />
      ) : null}
      {b ? (
        <Poster
          card={b}
          width={200}
          height={300}
          radius={14}
          style={[
            styles.fanCard,
            {left: 8, top: 40, transform: [{rotate: '-7deg'}]},
          ]}
        />
      ) : null}
      {a ? (
        <Poster
          card={a}
          width={200}
          height={300}
          radius={14}
          style={[styles.fanCard, {left: 26, top: 30}]}
        />
      ) : null}
    </View>
  );
}

/** What the agent is up to, roughly in step with a real run (about 10 to 17 s with the burst wait). */
const STEPS = [
  'Reading your text…',
  'Working out which show…',
  'Looking it up…',
  'Finding the poster…',
  'Almost there…',
];
const STEP_MS = 3500;

/**
 * Shown while the agent reads a text (R8.2): a "typing" bubble, a status line
 * that steps through what the agent is doing, and a light sweeping across the
 * poster slot. Not focusable, so it can vanish without losing focus.
 */
export function PlaceholderTile() {
  const c = useColors();
  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setInterval(
      () => setStep((s) => Math.min(s + 1, STEPS.length - 1)),
      STEP_MS,
    );
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [step, fade]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sweep, {
        toValue: 1,
        duration: 1600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  return (
    <View
      style={[
        styles.tile,
        styles.placeholder,
        {backgroundColor: c.surface, borderColor: c.border},
      ]}>
      <View style={styles.left}>
        <View style={[styles.bar, {width: '70%', height: 30}]} />
        <View style={[styles.bar, {width: '40%', height: 19}]} />
        <View style={styles.bubbleArea}>
          <Bubble>
            <TypingDots color={c.textBubble} />
          </Bubble>
          <Animated.Text
            style={[styles.status, {color: c.text2, opacity: fade}]}
            numberOfLines={1}>
            {STEPS[step]}
          </Animated.Text>
        </View>
      </View>
      <View style={[styles.bar, styles.posterSlot]}>
        <Animated.View
          style={[
            styles.sweep,
            {
              transform: [
                {
                  translateX: sweep.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-SWEEP_WIDTH, 252],
                  }),
                },
              ],
            },
          ]}>
          <LinearGradient
            colors={[
              'rgba(255,255,255,0)',
              'rgba(255,255,255,.14)',
              'rgba(255,255,255,0)',
            ]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

/** Three dots that hop in turn, like a phone's "typing" bubble. */
function TypingDots({color}: {color: string}) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);
  return (
    <View style={styles.dots}>
      {[0, 1, 2].map((i) => {
        const s = 0.01 + i * 0.18;
        const inputRange = [0, s, s + 0.15, s + 0.3, 1];
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: color,
                opacity: t.interpolate({
                  inputRange,
                  outputRange: [0.4, 0.4, 1, 0.4, 0.4],
                }),
                transform: [
                  {
                    translateY: t.interpolate({
                      inputRange,
                      outputRange: [0, 0, -7, 0, 0],
                    }),
                  },
                ],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const SWEEP_WIDTH = 140;

const styles = StyleSheet.create({
  tile: {
    width: layout.cardWidth,
    height: layout.cardHeight,
    flexDirection: 'row',
    gap: 20,
    padding: layout.cardPad,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  lifted: {transform: [{scale: 1.06}], zIndex: 5},
  left: {flex: 1, minWidth: 0, gap: 8},
  title: {
    fontSize: type.card,
    fontWeight: '700',
    lineHeight: 33,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  meta: {fontSize: type.meta},
  bubbleArea: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'flex-end',
    marginTop: 4,
    overflow: 'hidden',
  },
  fan: {width: 252, height: 378},
  fanCard: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.12)',
  },
  placeholder: {borderStyle: 'dashed'},
  bar: {backgroundColor: 'rgba(255,255,255,.12)', borderRadius: 8},
  posterSlot: {
    width: 252,
    height: 378,
    borderRadius: radius.poster,
    overflow: 'hidden',
  },
  sweep: {position: 'absolute', top: 0, bottom: 0, width: SWEEP_WIDTH},
  status: {fontSize: type.meta, marginTop: 12},
  dots: {flexDirection: 'row', gap: 8, paddingVertical: 8},
  dot: {width: 12, height: 12, borderRadius: 6},
});
