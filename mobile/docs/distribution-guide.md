# Mobile App Distribution Guide

## Overview
This guide explains how to distribute the Pager System mobile app for testing and production deployment.

## Prerequisites

### For Android Distribution
1. **Google Play Console Account**: Developer account with Google Play Console access
2. **App Signing**: Configure Play App Signing in Google Play Console
3. **Firebase Project**: For push notifications and crash reporting
4. **Keystore**: Generate and secure upload keystore

### For iOS Distribution
1. **Apple Developer Account**: Paid developer account ($99/year)
2. **App Store Connect**: Access to App Store Connect
3. **Certificates & Profiles**: Development and distribution certificates
4. **TestFlight**: Access to TestFlight for beta testing

## Android Distribution Setup

### 1. Google Play Console Setup

#### Create Application
1. Go to [Google Play Console](https://play.google.com/console/)
2. Click "Create app"
3. Fill in app details:
   - App name: "Pager System"
   - Default language: English
   - App type: App (not game)
   - Free or paid: Free

#### Configure App Signing
1. Go to "App integrity" → "App signing"
2. Opt into Play App Signing
3. Download the upload certificate (keep secure!)

#### Create Internal Test Track
1. Go to "Testing" → "Internal testing"
2. Create new release
3. Upload AAB (Android App Bundle) file
4. Add tester emails
5. Publish to internal test

### 2. Firebase Configuration

#### Android Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project or select existing
3. Add Android app with package name: `com.pager.system.mobile`
4. Download `google-services.json`
5. Place in `mobile/android/app/`

#### Push Notifications
1. Enable Firebase Cloud Messaging
2. Get Server Key for backend integration

### 3. Build Configuration

#### Android Build Files
Create/update these files:

**android/app/build.gradle:**
```gradle
android {
    compileSdk 34

    defaultConfig {
        applicationId "com.pager.system.mobile"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }

    signingConfigs {
        release {
            storeFile file('path/to/upload-keystore.jks')
            storePassword System.getenv('KEYSTORE_PASSWORD')
            keyAlias System.getenv('KEY_ALIAS')
            keyPassword System.getenv('KEY_PASSWORD')
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

## iOS Distribution Setup

### 1. Apple Developer Setup

#### Create App ID
1. Go to [Apple Developer](https://developer.apple.com/)
2. Certificates, Identifiers & Profiles → Identifiers
3. Create new App ID:
   - Type: App IDs
   - Description: Pager System Mobile
   - Bundle ID: com.pager.system.mobile
   - Capabilities: Push Notifications

#### Create Provisioning Profiles
1. Create Development profile for testing
2. Create Distribution profile for TestFlight/App Store

### 2. Xcode Configuration

#### iOS Build Settings
Update `ios/Runner.xcodeproj/project.pbxproj`:
- Bundle Identifier: `com.pager.system.mobile`
- Team ID: Your Apple Developer Team ID
- Code Signing Identity: iOS Distribution

#### Info.plist Configuration
```xml
<key>CFBundleDisplayName</key>
<string>Pager System</string>
<key>CFBundleIdentifier</key>
<string>com.pager.system.mobile</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

### 3. Firebase iOS Setup
1. Add iOS app in Firebase Console
2. Download `GoogleService-Info.plist`
3. Add to `ios/Runner/`

## Distribution Methods

### Beta Testing Distribution

#### Android - Google Play Internal Testing
1. Upload AAB to Google Play Console
2. Add internal testers via email
3. Share testing link: `https://play.google.com/apps/testing/com.pager.system.mobile`

#### iOS - TestFlight
1. Upload build to App Store Connect
2. Add beta testers via email or public link
3. Testers download via TestFlight app

### Production Distribution

#### Google Play Store
1. Create production release in Play Console
2. Upload AAB bundle
3. Fill store listing (description, screenshots, etc.)
4. Submit for review

#### Apple App Store
1. Create app in App Store Connect
2. Upload build via Xcode or Transporter
3. Fill app information and screenshots
4. Submit for review

## Testing Distribution

### Internal Testing
- **Scope**: Development team and select users
- **Process**: Quick deployment via CI/CD
- **Feedback**: Direct communication channels

### Beta Testing
- **Scope**: Limited external users (up to 10,000 for TestFlight)
- **Process**: App store beta programs
- **Feedback**: In-app feedback forms, email

### Release Process

#### Pre-Release Checklist
- [ ] All automated tests passing
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Beta testing feedback addressed
- [ ] Store assets prepared (screenshots, descriptions)
- [ ] Version numbers updated

#### Release Steps
1. **Create Release Branch**: `git checkout -b release/v1.0.0`
2. **Update Version**: Bump version numbers in pubspec.yaml and native files
3. **Run Full Test Suite**: All tests and integration tests
4. **Build Release**: CI/CD pipeline creates production builds
5. **Upload to Stores**: Submit to Google Play and App Store
6. **Monitor Release**: Track crash reports and user feedback

## Environment Configuration

### API Endpoints
Update `mobile/lib/utils/constants.dart`:

**Development:**
```dart
static const String apiBaseUrl = 'https://dev-api.pager-system.com';
```

**Staging:**
```dart
static const String apiBaseUrl = 'https://staging-api.pager-system.com';
```

**Production:**
```dart
static const String apiBaseUrl = 'https://api.pager-system.com';
```

### Firebase Environments
- **Development**: Separate Firebase project for dev
- **Production**: Production Firebase project

## Monitoring & Analytics

### Crash Reporting
- **Android**: Firebase Crashlytics
- **iOS**: Firebase Crashlytics

### Analytics
- **Android**: Google Analytics for Firebase
- **iOS**: Google Analytics for Firebase

### Performance Monitoring
- **Android**: Firebase Performance Monitoring
- **iOS**: Firebase Performance Monitoring

## Troubleshooting

### Common Issues

#### Android Build Issues
- **Keystore Problems**: Ensure keystore file and passwords are correct
- **Min SDK Version**: Check device compatibility
- **AAB vs APK**: Use AAB for Play Store, APK for sideloading

#### iOS Build Issues
- **Code Signing**: Verify certificates and provisioning profiles
- **Bundle ID**: Ensure matches App Store Connect
- **TestFlight Limits**: Maximum 10,000 testers

#### Distribution Issues
- **Review Rejections**: Check App Store Review Guidelines
- **Beta Testing Links**: Ensure testers accept invitations
- **Version Conflicts**: Increment version numbers for updates

## Security Considerations

### Code Obfuscation
- **Android**: Enabled in release builds via ProGuard/R8
- **iOS**: Automatic with App Store distribution

### Certificate Pinning
- Implement SSL certificate pinning for API calls
- Use secure storage for sensitive data

### Data Privacy
- Comply with GDPR and CCPA requirements
- Implement data deletion and export features
- Minimize data collection to necessary information

## Support & Maintenance

### Update Process
1. **Plan Updates**: Schedule regular releases (2-4 weeks)
2. **Version Management**: Use semantic versioning
3. **Backward Compatibility**: Ensure API changes don't break existing users
4. **Rollback Plan**: Prepare rollback procedures

### User Support
- **In-App Help**: Include user guides and FAQs
- **Support Channels**: Email, in-app chat, knowledge base
- **Bug Reporting**: Integrated bug reporting system

## Cost Considerations

### Development Costs
- **Apple Developer**: $99/year
- **Google Play**: $25 one-time fee
- **Firebase**: Free tier with paid upgrades
- **CI/CD**: GitHub Actions free for public repos

### Distribution Costs
- **App Stores**: No additional costs for distribution
- **Push Notifications**: Firebase free tier (1M messages/month)
- **Analytics**: Firebase free tier

This guide provides a comprehensive approach to distributing your Pager System mobile app. Start with internal testing, then move to beta testing, and finally production deployment.