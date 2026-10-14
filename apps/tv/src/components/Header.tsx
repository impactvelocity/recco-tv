import React, {forwardRef, useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {debugLog} from '../lib/debug';
import {useInbox} from '../state/InboxContext';
import {useColors} from '../state/PrefsContext';
import {layout, type} from '../theme';
import {FocusButton} from './FocusButton';
import {FocusRing} from './FocusRing';
import {Icon} from './Icon';

export type HomeView = 'featured' | 'inbox';

const LOGO = require('../../assets/recco-logo.png');
/** recco-logo.png is 384×128; shown 64 px tall. */
const LOGO_SIZE = {width: 192, height: 64};

interface Props {
  view: HomeView;
  /** Focusing a tab switches the view. */
  onView: (view: HomeView) => void;
  onSettings: () => void;
  settingsFocused?: boolean;
}

/** Logo, the Featured / Inbox tabs, and the settings gear. Always on screen. */
export const Header = forwardRef<View, Props>(
  ({view, onView, onSettings, settingsFocused}, settingsRef) => {
    const c = useColors();
    const {offline} = useInbox();
    return (
      <>
        <View style={styles.logo} pointerEvents="none">
          <Image
            source={LOGO}
            style={LOGO_SIZE}
            resizeMode="contain"
            accessibilityLabel="Recco"
          />
        </View>
        <View style={styles.tabsWrap}>
          <View
            style={[
              styles.track,
              {backgroundColor: c.surface, borderColor: c.border},
            ]}>
            <Tab
              label="Featured"
              selected={view === 'featured'}
              onFocus={() => onView('featured')}
            />
            <Tab
              label="Inbox"
              selected={view === 'inbox'}
              onFocus={() => onView('inbox')}
            />
          </View>
        </View>
        <View style={styles.right}>
          {offline ? (
            <Text style={[styles.offline, {color: c.text2}]}>
              Offline · showing your last list
            </Text>
          ) : null}
          <FocusButton
            ref={settingsRef}
            testID="settings"
            a11yLabel="Settings"
            look="surface"
            round={60}
            hasTVPreferredFocus={settingsFocused}
            onPress={onSettings}
            style={{borderWidth: 1}}>
            <Icon name="gear" size={30} color={c.accent2} />
          </FocusButton>
        </View>
      </>
    );
  },
);

/** A tab segment. Its focus is a 4 px ring, 6 px out. */
function Tab({
  label,
  selected,
  onFocus,
}: {
  label: string;
  selected: boolean;
  onFocus: () => void;
}) {
  const c = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      aria-label={label}
      accessibilityRole="tab"
      accessibilityState={{selected}}
      onFocus={() => {
        setFocused(true);
        debugLog('focus', {tab: label});
        onFocus();
      }}
      onBlur={() => setFocused(false)}
      onPress={onFocus}
      style={[styles.tab, selected && {backgroundColor: c.segOn}]}>
      <Text style={[styles.tabText, {color: selected ? c.segOnFg : c.segOff}]}>
        {label}
      </Text>
      {focused ? <FocusRing width={4} radius={999} offset={6} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logo: {
    position: 'absolute',
    top: 50,
    left: layout.side,
    height: 72,
    justifyContent: 'center',
  },
  tabsWrap: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  track: {
    flexDirection: 'row',
    gap: 4,
    padding: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  tab: {paddingVertical: 14, paddingHorizontal: 40, borderRadius: 999},
  tabText: {fontSize: type.tab, fontWeight: '600', letterSpacing: -0.3},
  right: {
    position: 'absolute',
    top: 56,
    right: layout.side,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  offline: {fontSize: type.meta},
});
