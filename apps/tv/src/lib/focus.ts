import {findNodeHandle} from 'react-native';
import {FocusManager} from '@amazon-devices/react-native-kepler';

/**
 * Move focus to a component. Delayed a tick: FocusManager can miss calls made
 * during mount (known Vega issue, per Amazon's focus docs).
 */
export function focusLater(target: unknown, delayMs = 60): void {
  setTimeout(() => {
    const tag = target ? findNodeHandle(target as any) : null;
    if (tag) FocusManager.focus(tag);
  }, delayMs);
}
