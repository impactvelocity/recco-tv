import React, {forwardRef, useState} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {debugLog} from '../lib/debug';
import {useColors} from '../state/PrefsContext';
import {radius as radii, type} from '../theme';
import {FocusRing} from './FocusRing';
import {Icon, type IconName} from './Icon';

interface Props {
  label?: string;
  icon?: IconName;
  onPress: () => void;
  /**
   * outlined: transparent with a hairline (drawer actions)
   * surface:  the translucent surface (gear, back, Unstack)
   * subtle:   a faint white fill (settings rows)
   */
  look?: 'outlined' | 'surface' | 'subtle';
  /** Icon-only circle of this diameter. */
  round?: number;
  pill?: boolean;
  /** Secondary label colour (Back). */
  muted?: boolean;
  /** Spoken label when there is no visible text. */
  a11yLabel?: string;
  hasTVPreferredFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  testID?: string;
}

/**
 * The "solid" focus treatment: a 3 px ring in the theme's focus colour and the
 * panel colour at full strength. No scale.
 */
export const FocusButton = forwardRef<View, Props>(
  (
    {
      label,
      icon,
      onPress,
      look = 'outlined',
      round,
      pill,
      muted,
      a11yLabel,
      hasTVPreferredFocus,
      onFocus,
      onBlur,
      style,
      children,
      testID,
    },
    ref,
  ) => {
    const c = useColors();
    const [focused, setFocused] = useState(false);
    const r = round ? round / 2 : pill ? radii.pill : radii.button;
    const fill =
      look === 'surface'
        ? c.surface
        : look === 'subtle'
        ? 'rgba(255,255,255,.06)'
        : 'transparent';
    const border = look === 'subtle' ? 'transparent' : c.border;
    const fg = muted ? c.text2 : c.text;
    return (
      <Pressable
        ref={ref}
        testID={testID}
        aria-label={label ?? a11yLabel}
        accessibilityRole="button"
        hasTVPreferredFocus={hasTVPreferredFocus}
        onFocus={() => {
          setFocused(true);
          debugLog('focus', {button: label ?? a11yLabel});
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onPress={onPress}
        style={[
          styles.base,
          round
            ? {
                width: round,
                height: round,
                paddingHorizontal: 0,
                paddingVertical: 0,
              }
            : null,
          {
            borderRadius: r,
            backgroundColor: focused ? c.surface2Solid : fill,
            borderColor: border,
          },
          style,
        ]}>
        {children ?? (
          <>
            {icon ? (
              <Icon
                name={icon}
                size={round ? Math.round(round * 0.44) : 22}
                color={fg}
              />
            ) : null}
            {label ? (
              <Text style={[styles.label, {color: fg}]}>{label}</Text>
            ) : null}
          </>
        )}
        {focused ? <FocusRing width={3} radius={r} /> : null}
      </Pressable>
    );
  },
);

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  label: {fontSize: type.button, fontWeight: '600'},
});
