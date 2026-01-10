#!/bin/bash

# Flutter Setup Script for Windows
# This script installs Flutter and sets up Android development

set -e

echo "🔧 Setting up Flutter for Android Development"
echo "=============================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Flutter is already installed
if command_exists flutter; then
    echo "✅ Flutter is already installed"
    flutter --version
    exit 0
fi

echo "📥 Installing Flutter..."

# Download Flutter SDK (Windows)
FLUTTER_VERSION="3.16.0"
FLUTTER_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_${FLUTTER_VERSION}-stable.zip"

echo "Downloading Flutter ${FLUTTER_VERSION}..."
curl -L -o flutter.zip "${FLUTTER_URL}"

echo "Extracting Flutter..."
unzip -q flutter.zip
rm flutter.zip

# Move to a standard location
FLUTTER_DIR="/c/Flutter"
if [ -d "$FLUTTER_DIR" ]; then
    rm -rf "$FLUTTER_DIR"
fi

mv flutter "$FLUTTER_DIR"

# Add Flutter to PATH (temporary for this session)
export PATH="$FLUTTER_DIR/bin:$PATH"

echo "✅ Flutter installed successfully"

# Run Flutter doctor
echo "🔍 Running Flutter doctor..."
flutter doctor

# Check Android Studio/SDK
echo ""
echo "📱 Android Development Setup"
echo "============================"

if command_exists adb; then
    echo "✅ Android SDK tools found"
else
    echo "⚠️  Android SDK not found. Please install Android Studio:"
    echo "   1. Download from: https://developer.android.com/studio"
    echo "   2. Install Android Studio"
    echo "   3. Install Android SDK"
    echo "   4. Install Android Virtual Device (AVD)"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Add Flutter to your system PATH:"
echo "   setx PATH \"%PATH%;${FLUTTER_DIR//\\//}\\\\bin\""
echo "2. Install Android Studio if not already installed"
echo "3. Run: flutter doctor --android-licenses"
echo "4. Create Android Virtual Device (AVD) in Android Studio"
echo "5. Run: flutter pub get (in the mobile directory)"
echo "6. Run: flutter run (to test on emulator)"