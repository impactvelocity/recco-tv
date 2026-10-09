import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {useInbox} from '../state/InboxContext';
import {colors, type} from '../theme';

/** A small note while the API cannot be reached (R7.9). */
export function OfflineNote() {
  const {offline} = useInbox();
  if (!offline) return null;
  return <Text style={styles.note}>Offline · showing your last list</Text>;
}

const styles = StyleSheet.create({
  note: {color: colors.warn, fontSize: type.small},
});
