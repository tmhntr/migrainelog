#!/usr/bin/env node
/**
 * Postinstall fix for expo-modules-jsi 57.0.4 under Xcode 26.2 / Swift 6.2.
 *
 * Problem: `abs(milliseconds) <= maxJavaScriptDateMilliseconds` in
 * JavaScriptCodable+Date.swift fails to type-check with
 * "type of expression is ambiguous without a type annotation", breaking the
 * ExpoModulesJSI xcframework build (xcodebuild error 65).
 *
 * Fix: Use `Double.magnitude`, which is unambiguously Double, instead of the
 * overloaded free function `abs()`.
 *
 * Remove this script once Expo ships a fix upstream (no release past 57.0.4
 * contains one as of this writing).
 */
const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "expo-modules-jsi",
  "apple",
  "Sources",
  "ExpoModulesJSI",
  "Coding",
  "JavaScriptCodable+Date.swift"
);

if (!fs.existsSync(filePath)) {
  console.log("[fix-expo-modules-jsi-date] Target file not found, skipping patch.");
  process.exit(0);
}

let content = fs.readFileSync(filePath, "utf8");

const oldExpr = "abs(milliseconds) <= maxJavaScriptDateMilliseconds";
const newExpr = "milliseconds.magnitude <= maxJavaScriptDateMilliseconds";

if (content.includes(newExpr)) {
  console.log("[fix-expo-modules-jsi-date] Already patched, skipping.");
  process.exit(0);
}

if (!content.includes(oldExpr)) {
  console.log(
    "[fix-expo-modules-jsi-date] Could not find target expression to patch, skipping."
  );
  process.exit(0);
}

content = content.replace(oldExpr, newExpr);

fs.writeFileSync(filePath, content, "utf8");
console.log(
  "[fix-expo-modules-jsi-date] Patched dateFromMilliseconds() range check for Swift 6.2."
);
