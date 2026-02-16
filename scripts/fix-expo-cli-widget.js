#!/usr/bin/env node
/**
 * Postinstall fix for expo run:ios with @bacons/apple-targets widget extension.
 *
 * Problem: Expo's matchEstimatedBinaryPath() regex matches ".app" inside
 * ".appex" paths (e.g., widget.appex -> widget.app), then picks the shortest
 * match -- which is the widget, not the main app. This causes an ENOENT crash.
 *
 * Fix: Add a lookahead so ".app" only matches at a path boundary.
 */
const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo",
  "node_modules",
  "@expo",
  "cli",
  "build",
  "src",
  "run",
  "ios",
  "XcodeBuild.js"
);

if (!fs.existsSync(filePath)) {
  console.log("[fix-expo-cli-widget] Target file not found, skipping patch.");
  process.exit(0);
}

let content = fs.readFileSync(filePath, "utf8");

const patchMarker = "(?=[\\s/]|$)";

if (content.includes(patchMarker)) {
  console.log("[fix-expo-cli-widget] Already patched, skipping.");
  process.exit(0);
}

// The original regex in matchEstimatedBinaryPath ends with \.app)/)
// We add a lookahead (?=[\s/]|$) after the capture group to prevent
// matching .appex substrings (e.g., widget.appex matched as widget.app)
const oldPattern = "\\.app)/);";
const newPattern = "\\.app)(?=[\\s/]|$)/);";

if (!content.includes(oldPattern)) {
  console.log(
    "[fix-expo-cli-widget] Could not find target regex to patch, skipping."
  );
  process.exit(0);
}

// Replace only the first occurrence (in matchEstimatedBinaryPath)
content = content.replace(oldPattern, newPattern);

fs.writeFileSync(filePath, content, "utf8");
console.log(
  "[fix-expo-cli-widget] Patched matchEstimatedBinaryPath regex to exclude .appex paths."
);
