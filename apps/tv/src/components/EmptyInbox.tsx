import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {formatPhone} from '../lib/format';
import {useColors} from '../state/PrefsContext';
import {layout, radius, type} from '../theme';
import {Bubble} from './CardParts';

const HOW = [
  'A title is enough. Add who said it and we remember.',
  'Send a TikTok, YouTube or Instagram link and we pull out the shows.',
  'Several shows in one text is fine. So are notes to yourself.',
];

const EXAMPLES = [
  {text: 'Severance', hint: 'Just the title'},
  {
    text: 'King of Queens - John said it was funny',
    hint: 'Title + who recommended it',
  },
  {
    text: 'tiktok.com/@filmtok/video/72… Steph sent this',
    hint: 'A link: we find the shows in the video',
  },
  {
    text: 'note to self: watch Dune before Part Three',
    hint: 'Your own reminder',
  },
];

/** Nothing to focus here; Settings in the header takes focus. */
export function EmptyInbox({phoneNumber}: {phoneNumber: string}) {
  const c = useColors();
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Text style={[styles.title, {color: c.text}]}>
          Nothing to watch yet.
        </Text>
        <Text style={[styles.body, {color: c.textB}]}>
          Text any show to{' '}
          <Text style={{color: c.text, fontWeight: '700'}}>
            {formatPhone(phoneNumber)}
          </Text>{' '}
          and it shows up here, with the poster, ratings, and who told you about
          it.
        </Text>
        <View style={styles.how}>
          {HOW.map((line) => (
            <View key={line} style={styles.bullet}>
              <View style={[styles.dot, {backgroundColor: c.accent2}]} />
              <Text style={[styles.howText, {color: c.textB}]}>{line}</Text>
            </View>
          ))}
        </View>
      </View>
      <View
        style={[
          styles.panel,
          {backgroundColor: c.surface, borderColor: c.border},
        ]}>
        <Text style={[styles.panelHeading, {color: c.text2}]}>
          TRY ONE OF THESE
        </Text>
        {EXAMPLES.map((e) => (
          <View key={e.text} style={styles.example}>
            <Bubble
              text={e.text}
              fontSize={26}
              style={{paddingHorizontal: 20}}
            />
            <Text style={[styles.hint, {color: c.text2}]}>{e.hint}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 168,
    left: layout.side,
    right: layout.side,
    bottom: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 80,
  },
  left: {flex: 1, gap: 28},
  title: {
    fontSize: type.empty,
    fontWeight: '700',
    letterSpacing: -2.5,
    lineHeight: 88,
  },
  body: {fontSize: 30, lineHeight: 42},
  how: {gap: 14, marginTop: 18},
  bullet: {flexDirection: 'row', alignItems: 'center', gap: 14},
  dot: {width: 10, height: 10, borderRadius: 5},
  howText: {fontSize: 24, flexShrink: 1},
  panel: {
    width: 720,
    gap: 26,
    borderRadius: radius.panel,
    borderWidth: 1,
    paddingVertical: 36,
    paddingHorizontal: 40,
  },
  panelHeading: {fontSize: 21, fontWeight: '600', letterSpacing: 1.3},
  example: {gap: 8, alignItems: 'flex-start'},
  hint: {fontSize: 21, paddingLeft: 6},
});
