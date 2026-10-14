import React, {forwardRef, useEffect, useRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  TVFocusGuideView,
  useTVEventHandler,
} from '@amazon-devices/react-native-kepler';
import {FocusButton} from '../components/FocusButton';
import {FocusRing} from '../components/FocusRing';
import {config} from '../config';
import {debugLog} from '../lib/debug';
import {focusLater} from '../lib/focus';
import {formatPhone} from '../lib/format';
import {useInbox} from '../state/InboxContext';
import {useColors, usePrefs} from '../state/PrefsContext';
import {radius, shadow, type} from '../theme';

const SETTLE_MS = 200;

/** Settings, as a panel from the right like the drawer. Back, or Left, closes it. */
export function SettingsPanel({onClose}: {onClose: () => void}) {
  const c = useColors();
  const prefs = usePrefs();
  const {inbox, pairingCode, requestNewCode} = useInbox();
  const [asked, setAsked] = useState(false);
  const first = useRef<View>(null);
  const focusedSince = useRef<number | null>(null);
  const paired = inbox?.pairing.paired ? inbox.pairing : null;
  const number = inbox?.pairing.phoneNumber ?? '';

  useEffect(() => {
    focusLater(first.current);
  }, []);

  // Once the other phone texts the code, the context clears it.
  useEffect(() => {
    if (!pairingCode) {
      setAsked(false);
    }
  }, [pairingCode]);

  useTVEventHandler((evt) => {
    if (evt.eventType !== 'left' || evt.eventKeyAction === 1) {
      return;
    }
    const since = focusedSince.current;
    if (since !== null && Date.now() - since > SETTLE_MS) {
      onClose();
    }
  });
  const settle = {
    onFocus: () => (focusedSince.current = Date.now()),
    onBlur: () => (focusedSince.current = null),
  };

  const showCode = asked && pairingCode;
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
        <Text style={[styles.heading, {color: c.text}]}>Settings</Text>
        <Row
          ref={first}
          label="Theme"
          sub="Day, night & seasonal looks"
          value={prefs.theme === 'auto' ? `Auto · ${c.label}` : c.label}
          {...settle}
          onPress={prefs.nextTheme}
        />
        <Row
          label="Default view"
          sub="What opens first"
          value={prefs.defaultView === 'featured' ? 'Featured' : 'Inbox'}
          {...settle}
          onPress={() =>
            prefs.setPrefs({
              defaultView:
                prefs.defaultView === 'featured' ? 'inbox' : 'featured',
            })
          }
        />
        <Row
          label="Hide watched"
          sub="Keep the list to what's left"
          value={prefs.hideWatched ? 'On' : 'Off'}
          {...settle}
          onPress={() => prefs.setPrefs({hideWatched: !prefs.hideWatched})}
        />
        <Row
          label="Text reccos to"
          sub="Your Recco number. Send shows, links or notes"
          value={formatPhone(number)}
          {...settle}
        />
        <Row
          label="Pair another phone"
          sub={
            showCode
              ? `From the other phone, text ${
                  pairingCode.code
                } to ${formatPhone(
                  pairingCode.phoneNumber,
                )}. It lasts ten minutes.`
              : 'Connect a different phone to this TV'
          }
          value={showCode ? pairingCode.code : ''}
          {...settle}
          onPress={() => {
            setAsked(true);
            requestNewCode();
          }}
        />
        <Row
          label="Signed in as"
          sub="Phone number on file"
          value={paired ? `Ending ${paired.phoneLast4}` : '—'}
          {...settle}
        />
        <View style={styles.bottom}>
          <FocusButton
            label="Back"
            muted
            pill={false}
            onPress={onClose}
            {...settle}
            style={styles.back}
          />
          <Text style={[styles.version, {color: c.text2}]}>
            Recco {config.appVersion}
          </Text>
        </View>
      </TVFocusGuideView>
    </View>
  );
}

interface RowProps {
  label: string;
  sub: string;
  value: string;
  onPress?: () => void;
  onFocus: () => void;
  onBlur: () => void;
}

const Row = forwardRef<View, RowProps>(
  ({label, sub, value, onPress, onFocus, onBlur}, ref) => {
    const c = useColors();
    const [focused, setFocused] = useState(false);
    return (
      <Pressable
        ref={ref}
        aria-label={`${label}, ${value}`}
        accessibilityRole="button"
        onFocus={() => {
          setFocused(true);
          onFocus();
          debugLog('focus', {setting: label});
        }}
        onBlur={() => {
          setFocused(false);
          onBlur();
        }}
        onPress={onPress}
        style={[
          styles.row,
          {
            backgroundColor: focused
              ? c.surface2Solid
              : 'rgba(255,255,255,.06)',
          },
        ]}>
        <View style={{flexShrink: 1}}>
          <Text style={[styles.rowLabel, {color: c.text}]}>{label}</Text>
          <Text style={[styles.rowSub, {color: c.text2}]}>{sub}</Text>
        </View>
        <Text style={[styles.rowValue, {color: c.text2}]}>{value}</Text>
        {focused ? <FocusRing width={3} radius={16} /> : null}
      </Pressable>
    );
  },
);

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
    width: 640,
    borderRadius: radius.panel,
    borderWidth: 1,
    paddingVertical: 48,
    paddingHorizontal: 52,
    gap: 12,
  },
  heading: {
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: -0.9,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderRadius: 16,
  },
  rowLabel: {fontSize: 26, fontWeight: '600'},
  rowSub: {fontSize: 21, marginTop: 2},
  rowValue: {fontSize: 24},
  bottom: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {borderRadius: 16, paddingVertical: 18, paddingHorizontal: 26},
  version: {fontSize: type.meta},
});
