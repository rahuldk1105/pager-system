# Flutter Setup Script for Windows PowerShell
# Run this script in PowerShell as Administrator

Write-Host "🔧 Setting up Flutter for Android Development" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Check if Flutter is already installed
if (Get-Command flutter -ErrorAction SilentlyContinue) {
    Write-Host "✅ Flutter is already installed" -ForegroundColor Green
    flutter --version
    exit 0
}

Write-Host "📥 Installing Flutter..." -ForegroundColor Yellow

# Download Flutter SDK
$FLUTTER_VERSION = "3.16.0"
$FLUTTER_URL = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_$FLUTTER_VERSION-stable.zip"
$DOWNLOAD_PATH = "$env:TEMP\flutter.zip"
$EXTRACT_PATH = "C:\Flutter"

Write-Host "Downloading Flutter $FLUTTER_VERSION..."
Invoke-WebRequest -Uri $FLUTTER_URL -OutFile $DOWNLOAD_PATH

Write-Host "Extracting Flutter..."
Expand-Archive -Path $DOWNLOAD_PATH -DestinationPath "C:\" -Force

# Clean up
Remove-Item $DOWNLOAD_PATH

# Add Flutter to PATH permanently
$flutterPath = "C:\Flutter\bin"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if ($currentPath -notlike "*$flutterPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$flutterPath", "Machine")
    Write-Host "✅ Added Flutter to system PATH" -ForegroundColor Green
}

# Add to current session PATH
$env:Path += ";$flutterPath"

Write-Host "✅ Flutter installed successfully" -ForegroundColor Green

# Run Flutter doctor
Write-Host "🔍 Running Flutter doctor..." -ForegroundColor Yellow
flutter doctor

# Check Android Studio/SDK
Write-Host ""
Write-Host "📱 Android Development Setup" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

if (Get-Command adb -ErrorAction SilentlyContinue) {
    Write-Host "✅ Android SDK tools found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Android SDK not found. Please install Android Studio:" -ForegroundColor Yellow
    Write-Host "   1. Download from: https://developer.android.com/studio" -ForegroundColor White
    Write-Host "   2. Install Android Studio" -ForegroundColor White
    Write-Host "   3. Install Android SDK (API 33+ recommended)" -ForegroundColor White
    Write-Host "   4. Install Android Virtual Device (AVD)" -ForegroundColor White
    Write-Host "   5. Accept Android SDK licenses: flutter doctor --android-licenses" -ForegroundColor White
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Green
Write-Host "1. Restart PowerShell/Command Prompt to use Flutter" -ForegroundColor White
Write-Host "2. Run: flutter doctor --android-licenses" -ForegroundColor White
Write-Host "3. Create Android Virtual Device (AVD) in Android Studio" -ForegroundColor White
Write-Host "4. Navigate to mobile directory: cd pager-system\mobile" -ForegroundColor White
Write-Host "5. Run: flutter pub get" -ForegroundColor White
Write-Host "6. Run: flutter run (to test on emulator)" -ForegroundColor White

Write-Host ""
Write-Host "📚 Useful Commands:" -ForegroundColor Cyan
Write-Host "• flutter devices          # List connected devices" -ForegroundColor White
Write-Host "• flutter emulators        # List available emulators" -ForegroundColor White
Write-Host "• flutter emulator --launch <emulator-name>  # Start emulator" -ForegroundColor White