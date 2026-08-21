/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  icon: "../../assets/icon.png",
  frameworks: ["SwiftUI", "WidgetKit"],
  entitlements: {
    "com.apple.security.application-groups": [
      "group.dev.tmhntr.migrainelog",
    ],
  },
});
