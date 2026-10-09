import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {FocusButton} from '../components/FocusButton';
import {OfflineNote} from '../components/OfflineNote';
import {ReccoMark} from '../components/ReccoMark';
import {config} from '../config';
import {formatPhone} from '../lib/format';
import type {ScreenProps} from '../lib/navigation';
import {useInbox} from '../state/InboxContext';
import {colors, safe, space, type} from '../theme';

export function SettingsScreen({navigation}: ScreenProps<'Settings'>) {
  const {inbox, pairingCode, requestNewCode} = useInbox();
  const [asked, setAsked] = useState(false);
  const last4 = inbox?.pairing.paired ? inbox.pairing.phoneLast4 : '····';

  // Once the other phone texts the code, the context clears it.
  useEffect(() => {
    if (!pairingCode) setAsked(false);
  }, [pairingCode]);

  return (
    <View style={styles.screen}>
      <ReccoMark />
      <Text style={styles.heading}>Settings</Text>
      <Text style={styles.line}>Connected to the phone ending {last4}</Text>

      {asked && pairingCode ? (
        <View style={styles.codeBox}>
          <Text style={styles.line}>From the other phone, text</Text>
          <Text style={styles.code}>{pairingCode.code}</Text>
          <Text style={styles.line}>to {formatPhone(pairingCode.phoneNumber)}. The code lasts ten minutes.</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <FocusButton
          label="Pair another phone"
          hasTVPreferredFocus
          onPress={() => {
            setAsked(true);
            requestNewCode();
          }}
        />
        <FocusButton label="Back to the list" onPress={() => navigation.goBack()} />
      </View>

      <Text style={styles.small}>
        Recco {config.appVersion}   ·   {config.apiBase}
      </Text>
      <OfflineNote />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.bg, paddingHorizontal: safe.h, paddingVertical: safe.v + space.l},
  heading: {color: colors.text, fontSize: type.hero, fontWeight: '700', marginTop: space.xl},
  line: {color: colors.textMuted, fontSize: type.body, marginTop: space.m},
  codeBox: {marginTop: space.l},
  code: {color: colors.accent, fontSize: type.display, fontWeight: '700', letterSpacing: 12, marginTop: space.s},
  actions: {flexDirection: 'row', marginTop: space.xl, paddingVertical: space.s},
  small: {color: colors.textFaint, fontSize: type.small, marginTop: space.xl},
});
