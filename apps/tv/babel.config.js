// W3C media needs the automatic JSX runtime, or Vega throws
// "Property 'React' doesn't exist" at runtime (Vega media player docs).
module.exports = {
  presets: [
    [
      'module:metro-react-native-babel-preset',
      {useTransformReactJSXExperimental: true},
    ],
  ],
  plugins: [['@babel/plugin-transform-react-jsx', {runtime: 'automatic'}]],
};
