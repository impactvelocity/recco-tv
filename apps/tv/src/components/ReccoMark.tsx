import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {BRAND} from '@recco/core-shared/brand';
import {colors, type} from '../theme';

/** The Recco wordmark: the name with a small notebook-tab dot. Original artwork, no third-party marks. */
export function ReccoMark({size = type.heading}: {size?: number}) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, {width: size * 0.42, height: size * 0.42, borderRadius: size}]} />
      <Text style={[styles.name, {fontSize: size}]}>{BRAND.name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center'},
  dot: {backgroundColor: colors.accent, marginRight: 14},
  name: {color: colors.text, fontWeight: '700', letterSpacing: 1},
});
