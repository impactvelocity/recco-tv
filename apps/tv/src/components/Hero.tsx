import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {formatTrackRecord} from '@recco/core-shared/track-record';
import {metaLine, servicesLine, whoLabel} from '../lib/format';
import type {ApiCard, ApiFriend} from '../lib/types';
import {colors, space, type} from '../theme';

/** The focused card, large: title, who, her note, where to watch. */
export function Hero({card, friends, country}: {card?: ApiCard; friends: ApiFriend[]; country?: string}) {
  if (!card) return <View style={styles.hero} />;
  const friend = card.origin === 'friend' ? friends.find((f) => f.id === card.friendId) : undefined;
  const record = friend ? formatTrackRecord(friend) : null;
  const detail = card.kind === 'unsorted'
    ? 'Not matched to a show yet'
    : card.needsCheck
      ? `${card.candidates.length} possible matches · open it to pick the right one`
      : servicesLine(card.services, country);
  return (
    <View style={styles.hero}>
      <Text style={styles.title} numberOfLines={1}>{card.title}</Text>
      <Text style={styles.meta} numberOfLines={1}>
        {[metaLine(card), whoLabel(card, friends), record].filter(Boolean).join('   ·   ')}
      </Text>
      {card.note ? (
        <Text style={styles.note} numberOfLines={2}>“{card.note}”</Text>
      ) : null}
      <Text style={styles.detail} numberOfLines={1}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {height: 270, justifyContent: 'flex-end', paddingBottom: space.m},
  title: {color: colors.text, fontSize: type.hero, fontWeight: '700'},
  meta: {color: colors.textMuted, fontSize: type.body, marginTop: space.xs},
  note: {color: colors.text, fontSize: type.body, fontStyle: 'italic', marginTop: space.s, maxWidth: 1400},
  detail: {color: colors.accent, fontSize: type.small, marginTop: space.s},
});
