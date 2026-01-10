#!/bin/bash

# Build Android APK Script
# Assumes Flutter is installed and configured

set -e

echo "📱 Building Android APK for Pager System"
echo "========================================"

# Check if we're in the mobile directory
if [ ! -f "pubspec.yaml" ]; then
    echo "❌ Please run this script from the mobile directory"
    echo "   cd mobile && ./build-android.sh"
    exit 1
fi

# Check if Flutter is installed
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed. Please install Flutter first."
    echo "   Run: .\setup-flutter.ps1 (PowerShell script)"
    exit 1
fi

echo "✅ Flutter found: $(flutter --version | head -1)"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
flutter clean

# Get dependencies
echo "📦 Installing dependencies..."
flutter pub get

# Check for Android setup
echo "🔍 Checking Android setup..."
flutter doctor --android-licenses > /dev/null 2>&1 || {
    echo "⚠️  Android licenses not accepted. Run:"
    echo "   flutter doctor --android-licenses"
}

# Build APK
echo "🔨 Building release APK..."
flutter build apk --release

# Check if build was successful
APK_PATH="build/app/outputs/flutter-apk/app-release.apk"
if [ -f "$APK_PATH" ]; then
    APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
    echo "✅ APK built successfully!"
    echo "   📁 Location: $APK_PATH"
    echo "   📏 Size: $APK_SIZE"
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Install APK on Android device"
    echo "   2. Or run: flutter install"
    echo "   3. Test the app functionality"
else
    echo "❌ APK build failed"
    exit 1
fi

echo ""
echo "🚀 Your Android app is ready for distribution!"