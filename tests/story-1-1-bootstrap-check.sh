#!/usr/bin/env bash
set -euo pipefail
APP_DIR="kid-habit-tracker"

[[ -d "$APP_DIR" ]] || { echo "FAIL: $APP_DIR directory not found"; exit 1; }
[[ -f "$APP_DIR/package.json" ]] || { echo "FAIL: package.json missing"; exit 1; }
[[ -d "$APP_DIR/app" || -d "$APP_DIR/src/app" ]] || { echo "FAIL: router app directory missing (app or src/app)"; exit 1; }
[[ -f "$APP_DIR/tsconfig.json" ]] || { echo "FAIL: tsconfig.json missing"; exit 1; }

node -e '
const pkg = require("./kid-habit-tracker/package.json");
if (!pkg.dependencies || !pkg.dependencies["expo-router"]) {
  console.error("FAIL: expo-router dependency missing");
  process.exit(1);
}
console.log("PASS: expo-router present");
'

echo "PASS: bootstrap structure checks"
