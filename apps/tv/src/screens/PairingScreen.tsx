import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {OfflineNote} from '../components/OfflineNote';
import {ReccoMark} from '../components/ReccoMark';
import {formatPhone} from '../lib/format';
import {useInbox} from '../state/InboxContext';
import {colors, safe, space, type} from '../theme';

/** "Text 48213 to (604) 555-0142". Nothing to focus; it waits for the text (R1.1–R1.4). */
export function PairingScreen() {
  const {phase, pairingCode, connectedLast4} = useInbox();

  if (phase === 'connected') {
    return (
      <View style={styles.screen}>
        <ReccoMark size={type.title} />
        <Text style={styles.connected}>Connected</Text>
        <Text style={styles.sub}>to the phone ending {connectedLast4}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ReccoMark size={type.title} />
      {pairingCode ? (
        <>
          <Text style={styles.lead}>Text</Text>
          <Text style={styles.code}>{pairingCode.code}</Text>
          <Text style={styles.lead}>
            to <Text style={styles.number}>{formatPhone(pairingCode.phoneNumber)}</Text>
          </Text>
          <Text style={styles.sub}>
            That connects this TV to your phone. After that, text Recco any show you hear about.
          </Text>
        </>
      ) : (
        <Text style={styles.sub}>Getting a code…</Text>
      )}
      <ActivityIndicator size="large" color={colors.accent} style={styles.spinner} />
      <OfflineNote />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: safe.h,
    paddingVertical: safe.v,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lead: {color: colors.textMuted, fontSize: type.title, marginTop: space.l},
  code: {color: colors.text, fontSize: 180, fontWeight: '700', letterSpacing: 24, marginTop: space.s},
  number: {color: colors.accent, fontWeight: '700'},
  sub: {color: colors.textMuted, fontSize: type.body, marginTop: space.xl, textAlign: 'center', maxWidth: 1200},
  connected: {color: colors.text, fontSize: 140, fontWeight: '700', marginTop: space.xl},
  spinner: {marginTop: space.xl},
});
