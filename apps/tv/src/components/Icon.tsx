import React from 'react';
import Svg, {Circle, Path, Rect} from '@amazon-devices/react-native-svg';

export type IconName =
  | 'gear'
  | 'mic'
  | 'check'
  | 'checkCircle'
  | 'trash'
  | 'back'
  | 'forward'
  | 'stack';

/** The handoff's 24 px stroke icons: 2 px stroke, round caps. */
export function Icon({
  name,
  size = 24,
  color,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  const stroke = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'gear' ? (
        <>
          <Circle cx="12" cy="12" r="3" {...stroke} />
          <Path
            {...stroke}
            d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
          />
        </>
      ) : null}
      {name === 'mic' ? (
        <>
          <Rect x="9" y="3" width="6" height="11" rx="3" {...stroke} />
          <Path d="M5 11a7 7 0 0 0 14 0" {...stroke} />
          <Path d="M12 18v3" {...stroke} />
        </>
      ) : null}
      {name === 'check' ? <Path d="m5 12 5 5 9-10" {...stroke} /> : null}
      {name === 'checkCircle' ? (
        <>
          <Circle cx="12" cy="12" r="9" {...stroke} />
          <Path d="m8.5 12 2.5 2.5 4.5-5" {...stroke} />
        </>
      ) : null}
      {name === 'trash' ? (
        <>
          <Path d="M4 7h16" {...stroke} />
          <Path d="M9 7V4h6v3" {...stroke} />
          <Path d="M6 7l1 13h10l1-13" {...stroke} />
        </>
      ) : null}
      {name === 'back' ? <Path d="m15 6-6 6 6 6" {...stroke} /> : null}
      {name === 'forward' ? <Path d="m9 6 6 6-6 6" {...stroke} /> : null}
      {name === 'stack' ? (
        <>
          <Rect x="3" y="4" width="18" height="6" rx="2" {...stroke} />
          <Rect x="3" y="14" width="18" height="6" rx="2" {...stroke} />
        </>
      ) : null}
    </Svg>
  );
}
