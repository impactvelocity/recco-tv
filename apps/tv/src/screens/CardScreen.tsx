import React, {useEffect, useRef} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {formatTrackRecord} from '@recco/core-shared/track-record';
import {FocusButton} from '../components/FocusButton';
import {OfflineNote} from '../components/OfflineNote';
import {TitleCard} from '../components/TitleCard';
import {debugLog} from '../lib/debug';
import {focusLater} from '../lib/focus';
import {alexaLine, metaLine, servicesLine, whoLabel} from '../lib/format';
import type {ScreenProps} from '../lib/navigation';
import type {Candidate} from '../lib/types';
import {useCard, useInbox} from '../state/InboxContext';
import {colors, focusRing, safe, space, type} from '../theme';

/**
 * Card detail: title, who, her note, services, and the line to say to Alexa
 * (R7.5, R9.1). Recco never opens another app (R9.2).
 */
export function CardScreen({route, navigation}: ScreenProps<'Card'>) {
  const {inbox, updateCard} = useInbox();
  const card = useCard(route.params.cardId);
  const starRef = useRef<View>(null);
  const wasChecking = useRef(card?.needsCheck ?? false);

  // After picking a candidate the list disappears; put focus on Star (R7.3).
  useEffect(() => {
    if (wasChecking.current && card && !card.needsCheck) focusLater(starRef.current);
    wasChecking.current = card?.needsCheck ?? false;
  }, [card]);

  useEffect(() => {
    if (!card) navigation.goBack();
  }, [card, navigation]);
  if (!card || !inbox) return <View style={styles.screen} />;

  const friend = card.origin === 'friend' ? inbox.friends.find((f) => f.id === card.friendId) : undefined;
  const record = friend ? formatTrackRecord(friend) : null;
  const log = (action: string) => debugLog('action', {card: card.title, action});

  const hide = () => {
    log('hide');
    updateCard(card.id, {state: 'hidden'});
    navigation.goBack();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <TitleCard card={card} large />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{card.title}</Text>
          <Text style={styles.meta}>
            {[metaLine(card), whoLabel(card, inbox.friends), record].filter(Boolean).join('   ·   ')}
          </Text>
          {card.note ? <Text style={styles.note} numberOfLines={3}>“{card.note}”</Text> : null}
          {card.kind === 'title' && !card.needsCheck ? (
            <>
              {card.plot ? <Text style={styles.plot} numberOfLines={2}>{card.plot}</Text> : null}
              <Text style={styles.services}>{servicesLine(card.services, inbox.household?.country)}</Text>
            </>
          ) : null}
          {card.kind === 'unsorted' ? (
            <Text style={styles.plot}>
              Recco couldn't match this to a show. {card.sourceUrl ? `Link: ${card.sourceUrl}` : ''}
            </Text>
          ) : null}
        </View>
      </View>

      {card.needsCheck ? (
        <View style={styles.bottom}>
          <Text style={styles.ask}>Which one did you mean?</Text>
          <View style={styles.actions}>
            {card.candidates.map((c, i) => (
              <CandidateButton
                key={c.titleId}
                candidate={c}
                hasTVPreferredFocus={i === 0}
                onPress={() => {
                  log(`pick ${c.titleId}`);
                  updateCard(card.id, {candidateTitleId: c.titleId});
                }}
              />
            ))}
            <FocusButton label="Hide" onPress={hide} />
          </View>
        </View>
      ) : (
        <View style={styles.bottom}>
          {card.kind === 'title' ? (
            <View style={styles.alexa}>
              <Text style={styles.alexaText}>{alexaLine(card.title)}</Text>
            </View>
          ) : null}
          <View style={styles.actions}>
            {card.kind === 'title' ? (
              <>
                <FocusButton
                  ref={starRef}
                  label={card.state === 'starred' ? 'Starred' : 'Star'}
                  selected={card.state === 'starred'}
                  hasTVPreferredFocus
                  onPress={() => {
                    log('star');
                    updateCard(card.id, {state: card.state === 'starred' ? 'new' : 'starred'});
                  }}
                />
                <FocusButton label="Hide" onPress={hide} />
                <FocusButton
                  label="Thumbs up"
                  tone="up"
                  selected={card.rating === 'up'}
                  onPress={() => {
                    log('up');
                    updateCard(card.id, {rating: 'up'});
                  }}
                />
                <FocusButton
                  label="Thumbs down"
                  tone="down"
                  selected={card.rating === 'down'}
                  onPress={() => {
                    log('down');
                    updateCard(card.id, {rating: 'down'});
                  }}
                />
              </>
            ) : (
              <FocusButton label="Hide" hasTVPreferredFocus onPress={hide} />
            )}
          </View>
        </View>
      )}
      <View style={styles.footer}>
        <OfflineNote />
      </View>
    </View>
  );
}

function CandidateButton({
  candidate,
  hasTVPreferredFocus,
  onPress,
}: {
  candidate: Candidate;
  hasTVPreferredFocus?: boolean;
  onPress: () => void;
}) {
  const [focused, setFocused] = React.useState(false);
  return (
    <Pressable
      aria-label={`${candidate.title} ${candidate.year ?? ''}`}
      accessibilityRole="button"
      hasTVPreferredFocus={hasTVPreferredFocus}
      onFocus={() => {
        setFocused(true);
        debugLog('focus', {candidate: `${candidate.title} (${candidate.year ?? '?'})`});
      }}
      onBlur={() => setFocused(false)}
      onPress={onPress}
      style={[styles.candidate, focused && styles.candidateFocused]}>
      <Text style={styles.candidateTitle} numberOfLines={1}>{candidate.title}</Text>
      <Text style={styles.candidateMeta}>{metaLine(candidate)}</Text>
      {candidate.plot ? <Text style={styles.candidatePlot} numberOfLines={2}>{candidate.plot}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg, paddingHorizontal: safe.h, paddingVertical: safe.v + space.l},
  top: {flexDirection: 'row'},
  info: {flex: 1, marginLeft: space.xl},
  title: {color: colors.text, fontSize: type.hero, fontWeight: '700'},
  meta: {color: colors.textMuted, fontSize: type.body, marginTop: space.s},
  note: {color: colors.text, fontSize: type.title, fontStyle: 'italic', marginTop: space.l},
  plot: {color: colors.textMuted, fontSize: type.body, marginTop: space.m},
  services: {color: colors.accent, fontSize: type.body, marginTop: space.m, fontWeight: '600'},
  bottom: {marginTop: space.xl},
  alexa: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderLeftWidth: 8,
    borderLeftColor: colors.accent,
    paddingVertical: space.m,
    paddingHorizontal: space.l,
    borderRadius: 12,
    marginBottom: space.l,
  },
  alexaText: {color: colors.text, fontSize: type.title},
  ask: {color: colors.text, fontSize: type.title, fontWeight: '600', marginBottom: space.m},
  actions: {flexDirection: 'row', alignItems: 'center', paddingVertical: space.s},
  candidate: {
    width: 520,
    padding: space.m,
    marginRight: space.m,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: focusRing.borderWidth,
    borderColor: 'transparent',
  },
  candidateFocused: {borderColor: colors.focus, backgroundColor: colors.surfaceRaised, transform: [{scale: 1.04}]},
  candidateTitle: {color: colors.text, fontSize: type.heading, fontWeight: '700'},
  candidateMeta: {color: colors.accent, fontSize: type.small, marginTop: space.xs},
  candidatePlot: {color: colors.textMuted, fontSize: type.small, marginTop: space.xs},
  footer: {position: 'absolute', right: safe.h, bottom: safe.v},
});
