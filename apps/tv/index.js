import {AppRegistry, LogBox} from 'react-native';
import {enableFreeze, enableScreens} from '@amazon-devices/react-native-screens';
import {App} from './src/App';
import {name as appName} from './app.json';

// Temporary workaround for problem with nested text not working currently (from the Vega template).
LogBox.ignoreAllLogs();

enableScreens();
enableFreeze();

AppRegistry.registerComponent(appName, () => App);
