import type {StackScreenProps} from '@amazon-devices/react-navigation__stack';

export type RootStack = {
  Pairing: undefined;
  Inbox: undefined;
  Card: {cardId: string};
  Settings: undefined;
};

export type ScreenProps<K extends keyof RootStack> = StackScreenProps<RootStack, K>;
