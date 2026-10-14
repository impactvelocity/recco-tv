import React, {useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  TVFocusGuideView,
  useTVEventHandler,
} from '@amazon-devices/react-native-kepler';
import {AlexaRow, Avatars, Poster, Ratings} from '../components/CardParts';
import {FocusButton} from '../components/FocusButton';
import {FocusRing} from '../components/FocusRing';
import {debugLog} from '../lib/debug';
import {focusLater} from '../lib/focus';
import {longMetaLine, metaLine} from '../lib/format';
import {describeItem, type Item} from '../lib/items';
import type {ApiFriend, Candidate} from '../lib/types';
import {useColors} from '../state/PrefsContext';
import {radius, shadow, type} from '../theme';

interface Props {
  item: Item;
  friends: ApiFriend[];
  onClose: () => void;
  onToggleWatched: (item: Item) => void;
  onRemove: (item: Item) => void;
  onPick: (cardId: string, titleId: string) => void;
}

/** Left on the leftmost control closes the drawer, but only once focus has settled there. */
const SETTLE_MS = 200;

/**
 * The detail drawer, from the right. Synopsis first, then everyone who sent it,
 * then the line to say to Alexa (R7.5, R9.1). Focus starts on Mark Watched and
 * cannot leave the drawer; Back, or Left from the leftmost control, closes it.
 */
export function DetailPanel({
  item,
  friends,
  onClose,
  onToggleWatched,
  onRemove,
  onPick,
}: Props) {
  const c = useColors();
  const view = describeItem(item, friends);
  const card = view.primary;
  const checking = card.needsCheck && card.candidates.length > 0;
  /** A matched show: it has a line to say and can be marked watched. */
  const ready = card.kind === 'title' && !card.needsCheck;
  const first = useRef<View>(null);
  const leftmostSince = useRef<number | null>(null);

  useEffect(() => {
    focusLater(first.current);
  }, [checking]);

  useTVEventHandler((evt) => {
    if (evt.eventType !== 'left' || evt.eventKeyAction === 1) {
      return;
    }
    const since = leftmostSince.current;
    if (since !== null && Date.now() - since > SETTLE_MS) {
      onClose();
    }
  });
  const leftmost = {
    onFocus: () => (leftmostSince.current = Date.now()),
    onBlur: () => (leftmostSince.current = null),
  };

  const watchedLabel = item.watched ? 'Watched' : 'Mark Watched';
  return (
    <View style={styles.scrim}>
      <TVFocusGuideView
        trapFocusLeft
        trapFocusRight
        trapFocusUp
        trapFocusDown
        style={[
          styles.panel,
          {backgroundColor: c.surface2, borderColor: c.border},
          shadow.panel,
        ]}>
        <View style={styles.top}>
          <Poster card={card} width={200} height={300} radius={16} />
          <View style={styles.topInfo}>
            <Text style={[styles.title, {color: c.text}]} numberOfLines={3}>
              {card.title}
            </Text>
            {longMetaLine(card) ? (
              <Text style={[styles.meta, {color: c.text2}]}>
                {longMetaLine(card)}
              </Text>
            ) : null}
            <Ratings card={card} size={23} />
            {item.watched ? (
              <Text style={[styles.watched, {color: c.accent2}]}>Watched</Text>
            ) : null}
          </View>
        </View>

        {checking ? (
          <View style={{gap: 14}}>
            <Text style={[styles.ask, {color: c.text}]}>
              Which one did you mean?
            </Text>
            {card.candidates.map((candidate, i) => (
              <CandidateRow
                key={candidate.titleId}
                ref={i === 0 ? first : undefined}
                candidate={candidate}
                {...leftmost}
                onPress={() => {
                  debugLog('action', {
                    card: card.title,
                    action: `pick ${candidate.titleId}`,
                  });
                  onPick(card.id, candidate.titleId);
                }}
              />
            ))}
          </View>
        ) : card.kind === 'unsorted' ? (
          <Text style={[styles.synopsis, {color: c.text}]}>
            Recco couldn't match this to a show.
            {card.sourceUrl ? ` Link: ${card.sourceUrl}` : ''}
          </Text>
        ) : card.plot ? (
          <Text style={[styles.synopsis, {color: c.text}]} numberOfLines={6}>
            {card.plot}
          </Text>
        ) : null}

        <View style={{gap: 30}}>
          <View style={[styles.divider, {backgroundColor: c.border}]} />
          <View style={{gap: 22}}>
            {view.recommendations.slice(0, 3).map((r, i) => (
              <View key={i} style={styles.message}>
                <Avatars names={[r.name]} size={40} />
                <View style={{flexShrink: 1, gap: 6}}>
                  <Text style={[styles.messageMeta, {color: c.text2}]}>
                    <Text style={{fontWeight: '600', color: c.textB}}>
                      {r.name}
                    </Text>{' '}
                    · {r.time}
                  </Text>
                  {r.message ? (
                    <Text
                      style={[styles.messageText, {color: c.textB}]}
                      numberOfLines={3}>
                      {r.message}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottom}>
          {ready ? <AlexaRow title={card.title} /> : null}
          <View style={styles.actions}>
            {ready ? (
              <FocusButton
                ref={first}
                icon="checkCircle"
                label={watchedLabel}
                style={styles.grow}
                {...leftmost}
                onPress={() => {
                  debugLog('action', {
                    card: card.title,
                    action: item.watched ? 'unwatch' : 'watched',
                  });
                  onToggleWatched(item);
                }}
              />
            ) : null}
            <FocusButton
              ref={checking || ready ? undefined : first}
              icon="trash"
              label="Remove"
              style={styles.grow}
              {...(ready ? {} : leftmost)}
              onPress={() => {
                debugLog('action', {card: card.title, action: 'remove'});
                onRemove(item);
              }}
            />
            <FocusButton icon="back" label="Back" muted onPress={onClose} />
          </View>
        </View>
      </TVFocusGuideView>
    </View>
  );
}

const CandidateRow = React.forwardRef<
  View,
  {
    candidate: Candidate;
    onPress: () => void;
    onFocus: () => void;
    onBlur: () => void;
  }
>(({candidate, onPress, onFocus, onBlur}, ref) => {
  const c = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      ref={ref}
      aria-label={`${candidate.title} ${candidate.year ?? ''}`}
      accessibilityRole="button"
      onFocus={() => {
        setFocused(true);
        onFocus();
        debugLog('focus', {
          candidate: `${candidate.title} (${candidate.year ?? '?'})`,
        });
      }}
      onBlur={() => {
        setFocused(false);
        onBlur();
      }}
      onPress={onPress}
      style={[
        styles.candidate,
        {backgroundColor: focused ? c.surface2Solid : 'rgba(255,255,255,.06)'},
      ]}>
      <Text style={[styles.candidateTitle, {color: c.text}]} numberOfLines={1}>
        {candidate.title}
      </Text>
      <Text style={[styles.meta, {color: c.text2}]}>{metaLine(candidate)}</Text>
      {candidate.plot ? (
        <Text
          style={[styles.candidatePlot, {color: c.textB}]}
          numberOfLines={2}>
          {candidate.plot}
        </Text>
      ) : null}
      {focused ? <FocusRing width={3} radius={16} /> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: 'rgba(0,0,0,.45)',
  },
  panel: {
    position: 'absolute',
    top: 24,
    right: 24,
    bottom: 24,
    width: 760,
    borderRadius: radius.panel,
    borderWidth: 1,
    paddingVertical: 48,
    paddingHorizontal: 52,
    gap: 34,
    overflow: 'hidden',
  },
  top: {flexDirection: 'row', gap: 28, alignItems: 'flex-start'},
  topInfo: {flex: 1, minWidth: 0, gap: 14, paddingTop: 6},
  title: {
    fontSize: type.drawer,
    fontWeight: '700',
    lineHeight: 48,
    letterSpacing: -0.9,
  },
  meta: {fontSize: type.button},
  watched: {fontSize: 21, fontWeight: '600'},
  synopsis: {fontSize: type.synopsis, lineHeight: 39},
  ask: {fontSize: type.synopsis, fontWeight: '600'},
  divider: {height: 1},
  message: {flexDirection: 'row', gap: 14, alignItems: 'flex-start'},
  messageMeta: {fontSize: type.meta},
  messageText: {fontSize: 22, lineHeight: 30},
  bottom: {marginTop: 'auto', gap: 18},
  actions: {flexDirection: 'row', gap: 12},
  grow: {flex: 1},
  candidate: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 22,
    gap: 4,
  },
  candidateTitle: {fontSize: 26, fontWeight: '700'},
  candidatePlot: {fontSize: 21, lineHeight: 28, marginTop: 4},
});
