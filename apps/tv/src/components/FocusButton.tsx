import React, {forwardRef, useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {debugLog} from '../lib/debug';
import {colors, focusRing, space, type} from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
  /** Shows the button as currently on (e.g. Starred, Thumbs up given). */
  selected?: boolean;
  tone?: 'default' | 'up' | 'down';
  onFocus?: () => void;
  testID?: string;
}

/** A remote-friendly button. Focus grows it and draws an outline (not just a colour change). */
export const FocusButton = forwardRef<View, Props>(
  ({label, onPress, hasTVPreferredFocus, selected, tone = 'default', onFocus, testID}, ref) => {
    const [focused, setFocused] = useState(false);
    const toneColor = tone === 'up' ? colors.up : tone === 'down' ? colors.down : colors.accent;
    return (
      <Pressable
        ref={ref}
        testID={testID}
        aria-label={label}
        accessibilityRole="button"
        accessibilityState={{selected}}
        hasTVPreferredFocus={hasTVPreferredFocus}
        onFocus={() => {
          setFocused(true);
          debugLog('focus', {button: label});
          onFocus?.();
        }}
        onBlur={() => setFocused(false)}
        onPress={onPress}
        style={[
          styles.button,
          selected && {backgroundColor: colors.surfaceRaised, borderColor: toneColor},
          focused && styles.focused,
        ]}>
        <Text style={[styles.label, selected && {color: toneColor}, focused && styles.labelFocused]}>
          {label}
        </Text>
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    paddingVertical: space.s,
    paddingHorizontal: space.l,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: focusRing.borderWidth,
    borderColor: 'transparent',
    marginRight: space.m,
  },
  focused: {
    borderColor: colors.focus,
    backgroundColor: colors.text,
    transform: [{scale: focusRing.scale}],
  },
  label: {color: colors.text, fontSize: type.body, fontWeight: '600'},
  labelFocused: {color: colors.bg},
});
