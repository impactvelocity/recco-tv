import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {card as cardSize, colors, space, type} from '../theme';

/** Shown in New while the agent reads a text (R8.2). Not focusable, so it can vanish without losing focus. */
export function PlaceholderCard() {
  const pulse = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 1, duration: 900, useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 0.45, duration: 900, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View style={[styles.card, {opacity: pulse}]} focusable={false}>
      <Text style={styles.text}>Reading your text…</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: cardSize.width,
    height: cardSize.height,
    marginRight: cardSize.gap,
    borderRadius: 18,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderColor: colors.rule,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    padding: space.m,
  },
  text: {color: colors.textMuted, fontSize: type.body},
});
