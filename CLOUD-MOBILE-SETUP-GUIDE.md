# Complete Setup Guide: Cloud Deployment + Mobile Apps

## 📋 Overview

This guide will help you:
1. ✅ Deploy backend to cloud (Railway)
2. 📱 Build Android app
3. 📱 Build iOS app (macOS required)
4. 🖥️ Run Android app in emulator

## 🚀 Phase 1: Backend Cloud Deployment

### Step 1: Deploy to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy Your Backend**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli

   # Login to Railway
   railway login

   # Navigate to backend directory
   cd packages/backend

   # Initialize Railway project
   railway init

   # Deploy
   railway up
   ```

3. **Configure Environment Variables**
   In Railway dashboard, add these variables:

   **Required:**
   ```
   JWT_SECRET=your-super-secure-jwt-secret-here-minimum-32-chars
   JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here-minimum-32-chars
   ```

   **Optional (for full features):**
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   FCM_SERVER_KEY=your-fcm-server-key
   ```

4. **Get Your API URL**
   - Railway will provide a URL like: `https://pager-backend-production.up.railway.app`
   - Copy this URL for the mobile app configuration

### Step 2: Update Mobile App API Endpoint

Edit `mobile/lib/utils/constants.dart`:
```dart
static const String apiBaseUrl = 'https://your-railway-url.up.railway.app';
```

## 📱 Phase 2: Android App Development

### Prerequisites

1. **Install Flutter** (3.10.0+)
   ```bash
   # Download from: https://flutter.dev/docs/get-started/install
   # Or use this PowerShell script:
   .\setup-flutter.ps1
   ```

2. **Install Android Studio**
   - Download: https://developer.android.com/studio
   - Install Android SDK (API 33+)
   - Install Android Virtual Device (AVD)

3. **Accept Android Licenses**
   ```bash
   flutter doctor --android-licenses
   ```

### Build Android APK

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
flutter pub get

# Build APK for release
flutter build apk --release

# The APK will be at: build/app/outputs/flutter-apk/app-release.apk
```

### Run in Android Emulator

```bash
# List available devices
flutter devices

# List available emulators
flutter emulators

# Launch emulator (replace with your emulator name)
flutter emulators --launch Pixel_6_API_33

# Run app on emulator
flutter run

# Or run on specific device
flutter run -d emulator-5554
```

## 🍎 Phase 3: iOS App Development (macOS Required)

### Prerequisites (macOS only)

1. **Xcode** (14.0+)
   - Install from App Store

2. **iOS Simulator**
   - Included with Xcode

3. **Apple Developer Account** (for distribution)
   - https://developer.apple.com

### Build iOS App

```bash
# Install CocoaPods (iOS dependencies)
sudo gem install cocoapods

# Navigate to mobile directory
cd mobile

# Install Flutter dependencies
flutter pub get

# Install iOS dependencies
cd ios
pod install
cd ..

# Build for iOS
flutter build ios --release

# For TestFlight/App Store
flutter build ipa --release
```

### Run in iOS Simulator

```bash
# List available devices
flutter devices

# Run on iOS simulator
flutter run -d iPhone
```

## 🔧 Development Workflow

### Local Development
```bash
# Backend (local)
cd packages/backend
npm run start:dev

# Mobile (connect to local backend)
# Update constants.dart to: static const String apiBaseUrl = 'http://localhost:3000';
flutter run
```

### Production Development
```bash
# Backend (cloud)
# Already deployed to Railway

# Mobile (connect to cloud backend)
# Update constants.dart with Railway URL
flutter run
```

## 🐛 Troubleshooting

### Flutter Issues
```bash
# Clean and rebuild
flutter clean
flutter pub get

# Check Flutter setup
flutter doctor

# Update Flutter
flutter upgrade
```

### Android Issues
```bash
# Clear Android build cache
cd android
./gradlew clean
cd ..

# Accept licenses
flutter doctor --android-licenses
```

### iOS Issues
```bash
# Clean iOS build
flutter clean
cd ios
rm -rf Pods
rm Podfile.lock
pod install
cd ..
```

### Network Issues
- Ensure API URL is correct in `constants.dart`
- Check CORS settings in backend
- Verify Railway deployment is healthy

## 📦 Distribution

### Android (Google Play)
1. Build App Bundle: `flutter build appbundle --release`
2. Upload to Google Play Console
3. Configure signing keys

### iOS (App Store)
1. Build IPA: `flutter build ipa --release`
2. Upload to App Store Connect via Xcode
3. Configure provisioning profiles

## 🎯 Quick Start Commands

```bash
# 1. Deploy backend
cd packages/backend
railway up

# 2. Setup Flutter (run PowerShell script)
.\setup-flutter.ps1

# 3. Build Android APK
cd ../mobile
flutter pub get
flutter build apk --release

# 4. Run in emulator
flutter emulators --launch Pixel_6_API_33
flutter run
```

## 📞 Support

- **Flutter Docs**: https://flutter.dev/docs
- **Railway Docs**: https://docs.railway.app
- **Android Studio**: https://developer.android.com/studio
- **Xcode**: https://developer.apple.com/xcode

Your Pager System is now ready for cloud deployment and mobile distribution! 🚀