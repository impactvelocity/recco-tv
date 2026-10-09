const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

// Product rules are shared with the server from packages/core. Only its
// platform-neutral files (types, states, rows, track-record) are imported here.
const coreSrc = path.resolve(__dirname, '../../packages/core/src');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  watchFolders: [coreSrc],
  resolver: {
    extraNodeModules: {'@recco/core-shared': coreSrc},
    // Shared files sit outside this app, so resolve their imports (e.g. Babel
    // helpers) from the app's own node_modules.
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
