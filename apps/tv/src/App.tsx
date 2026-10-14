import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {
  NavigationContainer,
  DarkTheme,
} from '@amazon-devices/react-navigation__native';
import {createStackNavigator} from '@amazon-devices/react-navigation__stack';
import {Background} from './components/Background';
import type {RootStack} from './lib/navigation';
import {HomeScreen} from './screens/HomeScreen';
import {PairingScreen} from './screens/PairingScreen';
import {InboxProvider, useInbox} from './state/InboxContext';
import {PrefsProvider, usePrefs} from './state/PrefsContext';

const Stack = createStackNavigator<RootStack>();

const LOGO = require('../assets/recco-logo.png');

function Root() {
  const {phase} = useInbox();
  const {colors, loaded} = usePrefs();
  if (phase === 'starting' || !loaded) {
    return (
      <View style={styles.splash}>
        {loaded ? <Background motion={false} /> : null}
        <Image
          source={LOGO}
          style={styles.logo}
          resizeMode="contain"
          accessibilityLabel="Recco"
        />
      </View>
    );
  }
  const paired = phase === 'paired';
  const navTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: colors.canvas,
      card: colors.canvas,
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: false,
          cardStyle: {backgroundColor: colors.canvas},
        }}>
        {paired ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <Stack.Screen name="Pairing" component={PairingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export const App = () => (
  <PrefsProvider>
    <InboxProvider>
      <Root />
    </InboxProvider>
  </PrefsProvider>
);

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0E1218',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {height: 120, width: 360},
});
