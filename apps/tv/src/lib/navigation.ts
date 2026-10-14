import type {StackScreenProps} from '@amazon-devices/react-navigation__stack';

/** Two screens; the detail drawer, settings and stacks are layers inside Home. */
export type RootStack = {
  Pairing: undefined;
  Home: undefined;
};

export type ScreenProps<K extends keyof RootStack> = StackScreenProps<
  RootStack,
  K
>;
