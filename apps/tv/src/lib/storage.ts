import AsyncStorage from '@amazon-devices/react-native-async-storage__async-storage';
import type {Inbox} from './types';

const TOKEN = 'recco.deviceToken';
const LAST_INBOX = 'recco.lastInbox';

/** Storage failures never break the app; they only lose the offline copy. */
export const storage = {
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN);
    } catch {
      return null;
    }
  },
  async setToken(token: string | null): Promise<void> {
    try {
      if (token) await AsyncStorage.setItem(TOKEN, token);
      else await AsyncStorage.multiRemove([TOKEN, LAST_INBOX]);
    } catch {}
  },
  async getLastInbox(): Promise<Inbox | null> {
    try {
      const raw = await AsyncStorage.getItem(LAST_INBOX);
      return raw ? (JSON.parse(raw) as Inbox) : null;
    } catch {
      return null;
    }
  },
  async setLastInbox(inbox: Inbox): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_INBOX, JSON.stringify(inbox));
    } catch {}
  },
};
