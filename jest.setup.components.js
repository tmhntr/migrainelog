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
