# Pager System Mobile App

A Flutter mobile application for the Pager incident management system.

## Features

- 🔐 **Authentication**: Secure login and registration
- 🚨 **Incident Management**: Create, view, and manage incidents
- 📱 **Push Notifications**: Real-time incident alerts
- 👥 **On-call Management**: View schedules and rotations
- 🌙 **Dark Mode**: Automatic theme switching
- 🔄 **Offline Support**: Basic offline functionality

## Getting Started

### Prerequisites

1. **Flutter**: Install Flutter SDK (3.10.0 or later)
   ```bash
   flutter --version
   ```

2. **Development Environment**:
   - Android Studio for Android development
   - Xcode for iOS development (macOS only)

3. **Firebase Project**: Set up Firebase for push notifications

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/pager-system.git
   cd pager-system/mobile
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure Firebase**
   - Add `google-services.json` (Android) to `android/app/`
   - Add `GoogleService-Info.plist` (iOS) to `ios/Runner/`

4. **Configure API endpoint**
   - Update `lib/utils/constants.dart` with your API URL

5. **Run the app**
   ```bash
   flutter run
   ```

## Development

### Project Structure

```
mobile/
├── lib/
│   ├── models/          # Data models
│   ├── providers/       # State management
│   ├── services/        # API and external services
│   ├── screens/         # UI screens
│   ├── widgets/         # Reusable components
│   └── utils/           # Utilities and constants
├── android/             # Android native code
├── ios/                 # iOS native code
├── test/                # Unit tests
└── integration_test/    # Integration tests
```

### Testing

**Run unit tests:**
```bash
flutter test
```

**Run integration tests:**
```bash
flutter test integration_test/
```

**Run on specific device:**
```bash
flutter run -d <device-id>
```

### Building for Production

**Android APK:**
```bash
flutter build apk --release
```

**Android App Bundle:**
```bash
flutter build appbundle --release
```

**iOS (macOS only):**
```bash
flutter build ios --release
```

## Distribution

See [Distribution Guide](docs/distribution-guide.md) for detailed instructions on:

- Google Play Store deployment
- Apple App Store deployment
- Beta testing setup (TestFlight, Internal Testing)
- CI/CD pipeline configuration

## API Integration

The app communicates with the Pager System backend API. Key endpoints:

- `POST /auth/login` - User authentication
- `GET /incidents` - List incidents
- `POST /incidents` - Create incident
- `PUT /incidents/{id}` - Update incident
- `GET /on-call/current` - Current on-call schedule

## Push Notifications

Firebase Cloud Messaging (FCM) is used for push notifications:

- **Foreground**: Local notifications when app is open
- **Background**: System notifications
- **Topics**: Subscribe to incident updates

## Security

- **Secure Storage**: Sensitive data stored securely
- **Certificate Pinning**: SSL certificate validation
- **Token Management**: JWT tokens with automatic refresh
- **Biometric Auth**: Optional biometric authentication

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

Follow Flutter's style guide:
```bash
flutter analyze
flutter format .
```

## Troubleshooting

### Common Issues

**Build failures:**
- Clean and rebuild: `flutter clean && flutter pub get`
- Check Flutter version compatibility

**iOS build issues:**
- Ensure Xcode is updated
- Check code signing certificates

**Android build issues:**
- Verify Android SDK versions
- Check keystore configuration

### Debug Mode

Enable debug logging:
```dart
import 'dart:developer';
log('Debug message');
```

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/pager-system/issues)
- **Documentation**: [Wiki](https://github.com/your-org/pager-system/wiki)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/pager-system/discussions)

## License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.