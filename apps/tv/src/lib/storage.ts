import AsyncStorage from '@amazon-devices/react-native-async-storage__async-storage';
import type {ThemeChoice} from '../theme';
import type {Inbox} from './types';

const TOKEN = 'recco.deviceToken';
const LAST_INBOX = 'recco.lastInbox';
// v2 when Auto became the default theme. The old key saved the default theme
// with every other change, so it cannot tell a real choice from the default.
const PREFS = 'recco.prefs.v2';

/** Viewing choices for this TV. Not household data, so they survive unpairing. */
export interface Prefs {
  theme: ThemeChoice;
  defaultView: 'featured' | 'inbox';
  hideWatched: boolean;
}

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
  /** Household data from another household, or a forgotten one, never survives (R1.10, R11.5). */
  async clearLastInbox(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LAST_INBOX);
    } catch {}
  },
  async setLastInbox(inbox: Inbox): Promise<void> {
    try {
      await AsyncStorage.setItem(LAST_INBOX, JSON.stringify(inbox));
    } catch {}
  },
  async getPrefs(): Promise<Partial<Prefs>> {
    try {
      const raw = await AsyncStorage.getItem(PREFS);
      return raw ? (JSON.parse(raw) as Partial<Prefs>) : {};
    } catch {
      return {};
    }
  },
  async setPrefs(prefs: Prefs): Promise<void> {
    try {
      await AsyncStorage.setItem(PREFS, JSON.stringify(prefs));
    } catch {}
  },
};
