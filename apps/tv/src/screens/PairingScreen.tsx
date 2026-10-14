import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Image, StyleSheet, Text, View} from 'react-native';
import {Background} from '../components/Background';
import {Icon} from '../components/Icon';
import {formatPhone} from '../lib/format';
import {useInbox} from '../state/InboxContext';
import {useColors} from '../state/PrefsContext';
import {shadow, type} from '../theme';

const LOGO = require('../../assets/recco-logo.png');
const logo = (height: number) => ({height, width: height * 3});

/**
 * Onboarding: getting a code, the code, then "Connected". Nothing takes focus;
 * the TV moves on by itself once she texts the code (R1.1–R1.4).
 */
export function PairingScreen() {
  const c = useColors();
  const {phase, pairingCode, connectedLast4, offline} = useInbox();

  let body: React.ReactNode;
  if (phase === 'connected') {
    body = (
      <>
        <View style={styles.connectedRow}>
          <View style={[styles.checkCircle, {backgroundColor: c.accent2}]}>
            <Icon name="check" size={64} color={c.onAccent} strokeWidth={3} />
          </View>
          <Text style={[styles.connected, {color: c.text}]}>Connected</Text>
        </View>
        <Text style={[styles.sub34, {color: c.text2}]}>
          to the phone ending{' '}
          <Text style={{color: c.text, fontWeight: '600'}}>
            {connectedLast4}
          </Text>
        </Text>
      </>
    );
  } else if (pairingCode) {
    body = (
      <>
        <Image
          source={LOGO}
          style={logo(84)}
          resizeMode="contain"
          accessibilityLabel="Recco"
        />
        <Text style={[styles.lead, {color: c.text2}]}>On your phone, text</Text>
        <View style={styles.digits}>
          {pairingCode.code.split('').map((d, i) => (
            <View
              key={i}
              style={[
                styles.digit,
                {backgroundColor: c.surface2, borderColor: c.border},
                shadow.poster,
              ]}>
              <Text style={[styles.digitText, {color: c.text}]}>{d}</Text>
            </View>
          ))}
        </View>
        <Text style={[styles.to, {color: c.text2}]}>
          to{' '}
          <Text style={{color: c.text, fontWeight: '700'}}>
            {formatPhone(pairingCode.phoneNumber)}
          </Text>
        </Text>
        <Text style={[styles.explain, {color: c.text2}]}>
          That connects this TV to your phone. After that, text Recco any show
          you hear about and it shows up here.
        </Text>
        <View
          style={[
            styles.waiting,
            {backgroundColor: c.surface2, borderColor: c.border},
          ]}>
          <Spinner size={30} ring={4} />
          <Text style={[styles.waitingText, {color: c.text}]}>
            {offline ? 'Waiting for the network…' : 'Waiting for your text…'}
          </Text>
        </View>
      </>
    );
  } else {
    body = (
      <>
        <Image
          source={LOGO}
          style={logo(120)}
          resizeMode="contain"
          accessibilityLabel="Recco"
        />
        <Text style={[styles.getting, {color: c.text2}]}>
          {offline ? 'Waiting for the network…' : 'Getting a code…'}
        </Text>
        <Spinner size={96} ring={7} />
      </>
    );
  }

  return (
    <View style={styles.screen}>
      <Background dim={0.4} />
      <View style={styles.center}>{body}</View>
    </View>
  );
}

function Spinner({size, ring}: {size: number; ring: number}) {
  const c = useColors();
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: ring,
        borderColor: 'rgba(255,255,255,.18)',
        borderTopColor: c.accent2,
        transform: [{rotate}],
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1},
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 200,
  },
  getting: {fontSize: 32, marginTop: 12},
  lead: {fontSize: 30, marginTop: 20},
  digits: {flexDirection: 'row', gap: 20},
  digit: {
    width: 170,
    height: 210,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {fontSize: type.pairingDigit, fontWeight: '700', lineHeight: 160},
  to: {fontSize: 44},
  explain: {fontSize: 28, lineHeight: 40, maxWidth: 900, textAlign: 'center'},
  waiting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 14,
    paddingLeft: 18,
    paddingRight: 28,
  },
  waitingText: {fontSize: 25, fontWeight: '600'},
  connectedRow: {flexDirection: 'row', alignItems: 'center', gap: 40},
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connected: {
    fontSize: type.onboarding,
    fontWeight: '700',
    letterSpacing: -3.8,
    lineHeight: 132,
  },
  sub34: {fontSize: 34},
});
