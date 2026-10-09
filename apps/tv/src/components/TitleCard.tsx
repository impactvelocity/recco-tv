import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {config} from '../config';
import {metaLine} from '../lib/format';
import type {ApiCard} from '../lib/types';
import {card as cardSize, colors, focusRing, space, type} from '../theme';

interface Props {
  card: ApiCard;
  focused?: boolean;
  /** "From Jordan", shown under the title. */
  who?: string;
  large?: boolean;
}

/**
 * One show. A text-only title card unless posters are on and the title has one
 * (R7.10): every card must look right with no artwork.
 */
export function TitleCard({card, focused, who, large}: Props) {
  const showPoster = config.posters && !!card.posterUrl;
  const size = large ? styles.large : styles.normal;
  const tag = cardTag(card);
  return (
    <View style={[styles.card, size, focused && styles.focused]}>
      {showPoster ? (
        <Image source={{uri: card.posterUrl}} style={StyleSheet.absoluteFill} resizeMode="cover" />
      ) : (
        <View style={[styles.rule, card.kind === 'unsorted' && {backgroundColor: colors.textFaint}]} />
      )}
      <View style={[styles.body, showPoster && styles.bodyOverPoster]}>
        <Text style={[styles.title, large && styles.titleLarge]} numberOfLines={large ? 3 : 2}>
          {card.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {[metaLine(card), who].filter(Boolean).join('  ·  ')}
        </Text>
      </View>
      {tag ? <Text style={[styles.tag, {color: tag.color}]}>{tag.label}</Text> : null}
    </View>
  );
}

function cardTag(card: ApiCard): {label: string; color: string} | null {
  if (card.kind === 'unsorted') return {label: 'Not found', color: colors.textFaint};
  if (card.needsCheck) return {label: 'Which one?', color: colors.warn};
  if (card.rating === 'up') return {label: 'Liked', color: colors.up};
  if (card.rating === 'down') return {label: 'Not for me', color: colors.down};
  if (card.state === 'starred') return {label: 'Starred', color: colors.accent};
  return null;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: focusRing.borderWidth,
    borderColor: 'transparent',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  normal: {width: cardSize.width, height: cardSize.height},
  large: {width: 560, height: 315},
  focused: {borderColor: colors.focus, transform: [{scale: focusRing.scale}], backgroundColor: colors.surfaceRaised},
  rule: {position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, backgroundColor: colors.accent},
  body: {padding: space.m, paddingLeft: space.m + 10},
  bodyOverPoster: {backgroundColor: 'rgba(20,18,15,0.78)'},
  title: {color: colors.text, fontSize: type.heading, fontWeight: '700', lineHeight: 42},
  titleLarge: {fontSize: type.hero, lineHeight: 72},
  meta: {color: colors.textMuted, fontSize: type.small, marginTop: space.xs},
  tag: {position: 'absolute', top: space.s, right: space.m, fontSize: type.small, fontWeight: '700'},
});
