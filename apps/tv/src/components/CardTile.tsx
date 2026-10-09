import React, {forwardRef, memo, useState} from 'react';
import {Pressable, View} from 'react-native';
import type {ApiCard} from '../lib/types';
import {card as cardSize} from '../theme';
import {TitleCard} from './TitleCard';

interface Props {
  card: ApiCard;
  index: number;
  who?: string;
  hasTVPreferredFocus?: boolean;
  onFocus: (card: ApiCard, index: number) => void;
  onPress: (card: ApiCard) => void;
}

/** A focusable card in a row. "Alexa, select <title>" works through its aria-label. */
export const CardTile = memo(
  forwardRef<View, Props>(({card, index, who, hasTVPreferredFocus, onFocus, onPress}, ref) => {
    const [focused, setFocused] = useState(false);
    return (
      <Pressable
        ref={ref}
        testID={`card-${card.id}`}
        aria-label={card.title}
        accessibilityRole="button"
        hasTVPreferredFocus={hasTVPreferredFocus}
        onFocus={() => {
          setFocused(true);
          onFocus(card, index);
        }}
        onBlur={() => setFocused(false)}
        onPress={() => onPress(card)}
        style={{marginRight: cardSize.gap}}>
        <TitleCard card={card} focused={focused} who={who} />
      </Pressable>
    );
  }),
);
