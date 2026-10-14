import React from 'react';
import {View} from 'react-native';
import {useColors} from '../state/PrefsContext';

/**
 * The focus outline, drawn as an overlay so it never shifts layout.
 * `offset` is the gap between the element and the ring (CSS outline-offset).
 */
export function FocusRing({
  width,
  radius,
  offset = 0,
}: {
  width: number;
  radius: number;
  offset?: number;
}) {
  const c = useColors();
  const out = -(offset + width);
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: out,
        left: out,
        right: out,
        bottom: out,
        borderWidth: width,
        borderColor: c.focus,
        borderRadius: radius + offset + width,
      }}
    />
  );
}
