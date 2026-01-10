#!/bin/bash

# Run Android Emulator Script
# Launches Android emulator and runs the Flutter app

set -e

echo "📱 Running Pager System on Android Emulator"
echo "==========================================="

# Check if we're in the mobile directory
if [ ! -f "pubspec.yaml" ]; then
    echo "❌ Please run this script from the mobile directory"
    echo "   cd mobile && ./run-android-emulator.sh"
    exit 1
fi

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed. Please install Flutter first."
    exit 1
fi

echo "🔍 Checking available emulators..."
EMULATORS=$(flutter emulators 2>/dev/null | grep -E "^[a-zA-Z0-9_]+" | head -5)

if [ -z "$EMULATORS" ]; then
    echo "❌ No Android emulators found!"
    echo ""
    echo "📋 How to create an Android emulator:"
    echo "   1. Open Android Studio"
    echo "   2. Go to Tools → Device Manager"
    echo "   3. Create a new Virtual Device"
    echo "   4. Select a device (e.g., Pixel 6)"
    echo "   5. Select system image (API 33+)"
    echo "   6. Complete setup and start emulator"
    echo ""
    echo "💡 Alternative: Connect a physical Android device via USB"
    exit 1
fi

echo "📋 Available emulators:"
echo "$EMULATORS"
echo ""

# Try to find a running emulator first
RUNNING_DEVICE=$(flutter devices 2>/dev/null | grep "emulator-" | head -1 | cut -d'•' -f1 | tr -d ' ')

if [ -n "$RUNNING_DEVICE" ]; then
    echo "✅ Found running emulator: $RUNNING_DEVICE"
    echo "🚀 Launching app on running emulator..."
    flutter run -d "$RUNNING_DEVICE"
    exit 0
fi

# No running emulator, try to launch one
echo "🔄 No running emulators. Launching emulator..."

# Get first available emulator
FIRST_EMULATOR=$(echo "$EMULATORS" | head -1 | cut -d'•' -f1 | tr -d ' ')

if [ -n "$FIRST_EMULATOR" ]; then
    echo "🚀 Launching emulator: $FIRST_EMULATOR"
    flutter emulators --launch "$FIRST_EMULATOR"

    # Wait for emulator to boot
    echo "⏳ Waiting for emulator to boot (this may take a few minutes)..."
    sleep 30

    # Try to run the app
    echo "📱 Starting Flutter app..."
    flutter run
else
    echo "❌ Could not launch emulator automatically"
    echo "💡 Please start Android emulator manually from Android Studio"
    exit 1
fi