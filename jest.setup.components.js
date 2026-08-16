// Setup for the "components" (screen/component) jest project.
//
// Screens transitively import the Zustand stores, and the risk store pushes
// updates to the iOS home-screen widget via the `widget-bridge` native module.
// That module calls `requireNativeModule('WidgetBridge')` at import time, which
// throws under jest-expo (no native runtime). Stub it so any screen test can
// render without pulling in the native bridge.
jest.mock('./modules/widget-bridge', () => ({
  setWidgetData: jest.fn(),
}));

// The shared UI primitives (Button, Fab) pull in `@expo/vector-icons`, which
// loads `expo-font` -> `expo-asset` at import time. That chain isn't resolvable
// under jest, and the glyphs carry no assertable behaviour, so stand the icon
// sets up as plain views that record the name they were asked to render.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { View } = require('react-native');

  return new Proxy(
    {},
    {
      get: (_target, iconSet) =>
        function MockIcon(props) {
          return React.createElement(View, {
            ...props,
            testID: props.testID ?? `icon-${String(iconSet)}-${props.name}`,
          });
        },
    },
  );
});
