#!/usr/bin/env bash
# Runs the instrumentation suites on a connected device.
#
# These cannot run in CI or in a container without KVM — there is no usable emulator —
# so they are compiled on every build and executed here, against real hardware.
#
#   ./scripts/verify-on-device.sh          # everything
#   ./scripts/verify-on-device.sh :core:data
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v adb >/dev/null 2>&1; then
  echo "adb not found. Add \$ANDROID_HOME/platform-tools to PATH." >&2
  exit 1
fi

devices=$(adb devices | sed '1d' | grep -c "device$" || true)
if [ "$devices" -eq 0 ]; then
  echo "No device connected. Plug in a phone with USB debugging enabled." >&2
  exit 1
fi

MODULE="${1:-}"
if [ -n "$MODULE" ]; then
  TASK="${MODULE}:connectedDebugAndroidTest"
else
  TASK="connectedDebugAndroidTest"
fi

echo "Running $TASK on $devices device(s)…"
./gradlew "$TASK"

echo
echo "Reports:"
find . -path '*/reports/androidTests/connected/*' -name 'index.html' 2>/dev/null || true
