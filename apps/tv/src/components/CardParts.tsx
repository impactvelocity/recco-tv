import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import LinearGradient from '@amazon-devices/react-linear-gradient';
import {config} from '../config';
import {alexaLine, initials, posterAt600} from '../lib/format';
import type {ApiCard} from '../lib/types';
import {useColors} from '../state/PrefsContext';
import {bubbleCorners, POSTER_TINTS, shadow, type} from '../theme';
import {Icon} from './Icon';

/** IMDb chip and score, then the Rotten Tomatoes tomato and %. Nothing when neither is known. */
export function Ratings({
  card,
  size = type.meta,
}: {
  card: Pick<ApiCard, 'imdbRating' | 'rtRating'>;
  size?: number;
}) {
  const c = useColors();
  if (!card.imdbRating && !card.rtRating) {
    return null;
  }
  const k = size / type.meta;
  const value = {fontSize: size, fontWeight: '600' as const, color: c.textB};
  return (
    <View style={[styles.row, {gap: 18 * k}]}>
      {card.imdbRating ? (
        <View style={[styles.row, {gap: 7 * k}]}>
          <View
            style={[
              styles.imdb,
              {paddingHorizontal: 5 * k, paddingVertical: 3 * k},
            ]}>
            <Text style={[styles.imdbText, {fontSize: 11 * k}]}>IMDb</Text>
          </View>
          <Text style={value}>{card.imdbRating}</Text>
        </View>
      ) : null}
      {card.rtRating ? (
        <View style={[styles.row, {gap: 7 * k}]}>
          <View
            style={{
              width: 16 * k,
              height: 16 * k,
              borderRadius: 8 * k,
              backgroundColor: '#FA320A',
            }}>
            <View
              style={{
                position: 'absolute',
                top: -3 * k,
                left: 5 * k,
                width: 6 * k,
                height: 6 * k,
                borderRadius: 3 * k,
                backgroundColor: '#1DB954',
              }}
            />
          </View>
          <Text style={value}>{card.rtRating}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** The accent2 "Watched" pill. */
export function WatchedPill() {
  const c = useColors();
  return (
    <View style={[styles.row, styles.pill, {backgroundColor: c.accent2}]}>
      <Icon name="check" size={13} color={c.onAccent} strokeWidth={3.5} />
      <Text style={[styles.pillText, {color: c.onAccent}]}>Watched</Text>
    </View>
  );
}

/** A small chip on the card's meta line ("3 shows", "Which one?"). */
export function Chip({label, icon}: {label: string; icon?: 'stack'}) {
  const c = useColors();
  return (
    <View style={[styles.row, styles.chip]}>
      {icon ? <Icon name={icon} size={13} color={c.textB} /> : null}
      <Text style={[styles.chipText, {color: c.textB}]}>{label}</Text>
    </View>
  );
}

const tintFor = (title: string) => {
  let h = 0;
  for (const ch of title) {
    h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  }
  return POSTER_TINTS[h % POSTER_TINTS.length]!;
};

/**
 * The poster, or a title card when there is no artwork or POSTERS=off. Every
 * card has to look right without one (R7.10).
 */
export function Poster({
  card,
  width,
  height,
  radius,
  style,
}: {
  card: Pick<ApiCard, 'title' | 'posterUrl'>;
  width: number;
  height: number;
  radius: number;
  style?: StyleProp<ViewStyle>;
}) {
  const showPoster = config.posters && !!card.posterUrl;
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: tintFor(card.title),
        },
        shadow.poster,
        style,
      ]}>
      {showPoster ? (
        <Image
          source={{uri: posterAt600(card.posterUrl!)}}
          style={[StyleSheet.absoluteFill, {borderRadius: radius}]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.titlePoster, {padding: Math.round(width * 0.08)}]}>
          <Text
            style={[
              styles.titlePosterText,
              {fontSize: Math.round(width * 0.11)},
            ]}
            numberOfLines={4}>
            {card.title}
          </Text>
        </View>
      )}
    </View>
  );
}

/** A message bubble in the theme's tint, tail at bottom left. Children replace the text. */
export function Bubble({
  text,
  fontSize = type.bubble,
  numberOfLines,
  style,
  children,
}: {
  text?: string;
  fontSize?: number;
  numberOfLines?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const c = useColors();
  return (
    <View style={[bubbleCorners, styles.bubble, style]}>
      <LinearGradient
        colors={c.tint}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={StyleSheet.absoluteFill}
      />
      {children ?? (
        <Text
          style={{
            fontSize,
            lineHeight: Math.round(fontSize * 1.3),
            color: c.textBubble,
          }}
          numberOfLines={numberOfLines}
          ellipsizeMode="tail">
          {text}
        </Text>
      )}
    </View>
  );
}

/** One round initial, or several overlapping with a canvas ring. */
export function Avatars({names, size = 24}: {names: string[]; size?: number}) {
  const c = useColors();
  return (
    <View style={styles.row}>
      {names.map((name, i) => (
        <View
          key={`${name}-${i}`}
          style={[
            styles.avatar,
            {width: size, height: size, borderRadius: size / 2},
            // Later avatars overlap, each with a ring in the canvas colour.
            i > 0 && {
              marginLeft: -7,
              backgroundColor: c.surface2Solid,
              borderWidth: 2,
              borderColor: c.canvas,
            },
          ]}>
          <Text
            style={{
              fontSize: Math.round(size / 2),
              fontWeight: '600',
              color: c.textB,
            }}>
            {initials(name)}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** "(S)(D) Steph & Dad · 2h ago" */
export function SenderLine({
  names,
  label,
  time,
}: {
  names: string[];
  label: string;
  time: string;
}) {
  const c = useColors();
  return (
    <View style={[styles.row, {gap: 8, paddingLeft: 4}]}>
      <Avatars names={names} />
      <Text
        style={[
          styles.meta,
          {color: c.textB, fontWeight: '600', flexShrink: 1},
        ]}
        numberOfLines={1}>
        {label}
      </Text>
      <Text style={[styles.meta, {color: c.text2}]}>· {time}</Text>
    </View>
  );
}

/** "To watch, say “Alexa, watch …”". Recco never opens another app (R9.2). */
export function AlexaRow({title, size = 25}: {title: string; size?: number}) {
  const c = useColors();
  return (
    <View style={[styles.row, styles.alexa]}>
      <View style={styles.mic}>
        <Icon name="mic" size={22} color={c.textB} />
      </View>
      <View style={{flexShrink: 1}}>
        <Text style={[styles.meta, {color: c.text2}]}>To watch, say</Text>
        <Text
          style={{
            fontSize: size,
            fontWeight: '500',
            lineHeight: Math.round(size * 1.2),
            color: c.text,
          }}
          numberOfLines={1}>
          {alexaLine(title)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  meta: {fontSize: type.meta},
  imdb: {backgroundColor: '#F5C518', borderRadius: 4},
  imdbText: {color: '#111', fontWeight: '800', letterSpacing: 0.2},
  pill: {gap: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999},
  pillText: {fontSize: type.chip, fontWeight: '700', letterSpacing: 0.3},
  chip: {
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.08)',
  },
  chipText: {fontSize: 16, fontWeight: '600'},
  titlePoster: {flex: 1, justifyContent: 'flex-end'},
  titlePosterText: {
    color: 'rgba(255,255,255,.92)',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  bubble: {
    overflow: 'hidden',
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.08)',
  },
  alexa: {
    gap: 18,
    backgroundColor: 'rgba(255,255,255,.06)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
  mic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.08)',
  },
});
