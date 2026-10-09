import React from 'react';
import {StyleSheet, View} from 'react-native';
import {NavigationContainer, DarkTheme} from '@amazon-devices/react-navigation__native';
import {createStackNavigator} from '@amazon-devices/react-navigation__stack';
import {ReccoMark} from './components/ReccoMark';
import type {RootStack} from './lib/navigation';
import {CardScreen} from './screens/CardScreen';
import {InboxScreen} from './screens/InboxScreen';
import {PairingScreen} from './screens/PairingScreen';
import {SettingsScreen} from './screens/SettingsScreen';
import {InboxProvider, useInbox} from './state/InboxContext';
import {colors, type} from './theme';

const Stack = createStackNavigator<RootStack>();

const navTheme = {...DarkTheme, colors: {...DarkTheme.colors, background: colors.bg, card: colors.bg}};

function Root() {
  const {phase} = useInbox();
  if (phase === 'starting') {
    return (
      <View style={styles.splash}>
        <ReccoMark size={type.hero} />
      </View>
    );
  }
  const paired = phase === 'paired';
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false, cardStyle: {backgroundColor: colors.bg}}}>
      {paired ? (
        <>
          <Stack.Screen name="Inbox" component={InboxScreen} />
          <Stack.Screen name="Card" component={CardScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </>
      ) : (
        <Stack.Screen name="Pairing" component={PairingScreen} />
      )}
    </Stack.Navigator>
  );
}

export const App = () => (
  <InboxProvider>
    <NavigationContainer theme={navTheme}>
      <Root />
    </NavigationContainer>
  </InboxProvider>
);

const styles = StyleSheet.create({
  splash: {flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center'},
});
