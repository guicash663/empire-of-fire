# Android Build and Deployment Guide

## Empire of Fire Music Studio - Android Application

This guide will help you build and deploy the Empire of Fire Music Studio as an Android application.

## Prerequisites

Before building the Android application, ensure you have the following installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/

2. **Java Development Kit (JDK)** (v11 or higher)
   - Download from: https://adoptium.net/
   - Set JAVA_HOME environment variable

3. **Android Studio** and Android SDK
   - Download from: https://developer.android.com/studio
   - Install Android SDK Platform 33 (or latest)
   - Set ANDROID_HOME environment variable

4. **Gradle** (usually comes with Android Studio)

## Installation Steps

### 1. Install Project Dependencies

```bash
npm install -g cordova
npm install
```

### 2. Add Android Platform

```bash
cordova platform add android
```

### 3. Install Cordova Plugins

The plugins are automatically installed based on config.xml, but you can manually install them:

```bash
cordova plugin add cordova-plugin-media
cordova plugin add cordova-plugin-media-capture
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-file-transfer
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-splashscreen
```

## Building the Application

### Debug Build (for testing)

```bash
cordova build android
```

Or using npm script:
```bash
npm run android:build
```

The APK will be generated at:
`platforms/android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build (for distribution)

1. Generate a signing key (first time only):
```bash
keytool -genkey -v -keystore empire-of-fire.keystore -alias empire-of-fire -keyalg RSA -keysize 2048 -validity 10000
```

2. Create a `build.json` file in the project root:
```json
{
  "android": {
    "release": {
      "keystore": "empire-of-fire.keystore",
      "storePassword": "your-password",
      "alias": "empire-of-fire",
      "password": "your-password"
    }
  }
}
```

3. Build the release APK:
```bash
cordova build android --release
```

Or using npm script:
```bash
npm run android:release
```

The release APK will be at:
`platforms/android/app/build/outputs/apk/release/app-release.apk`

## Running the Application

### On an Emulator

1. Open Android Studio
2. Create/start an Android Virtual Device (AVD)
3. Run:
```bash
cordova run android
```

Or using npm script:
```bash
npm run android:run
```

### On a Physical Device

1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect your device via USB
4. Run:
```bash
cordova run android --device
```

## Installing the APK

### Method 1: Direct Installation
1. Copy the APK to your Android device
2. Open the APK file on your device
3. Allow installation from unknown sources if prompted
4. Install the app

### Method 2: ADB Installation
```bash
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## Distribution

### Google Play Store

1. Create a Google Play Developer account
2. Build a release APK (signed)
3. Create an app listing in Google Play Console
4. Upload the APK
5. Complete the store listing (description, screenshots, etc.)
6. Submit for review

### Direct Distribution

1. Build a signed release APK
2. Host the APK on your website or file hosting service
3. Share the download link
4. Users must enable "Install from Unknown Sources" on their devices

## App Features

- 🎙️ **Audio Recording**: Record audio using device microphone
- 🎵 **Multi-Track Support**: Manage multiple audio tracks
- 🎛️ **Audio Effects**: Apply reverb, echo, and compression
- 🎸 **Synthesizers**: Built-in guitar and drum synthesizers
- 📊 **Waveform Visualization**: Real-time audio visualization
- 💾 **File Management**: Import and export audio files
- 🎚️ **Auto-Tune**: Enable pitch correction

## Permissions

The app requires the following Android permissions:
- `RECORD_AUDIO` - For recording audio from microphone
- `MODIFY_AUDIO_SETTINGS` - For audio processing
- `WRITE_EXTERNAL_STORAGE` - For saving recordings
- `READ_EXTERNAL_STORAGE` - For loading audio files
- `INTERNET` - For potential future features

## Troubleshooting

### Build Fails

1. Check that all environment variables are set correctly (JAVA_HOME, ANDROID_HOME)
2. Ensure you have the correct Android SDK version installed
3. Run `cordova clean` and try building again

### App Crashes on Start

1. Check device logs: `adb logcat`
2. Ensure the device Android version is 7.0 (API 24) or higher
3. Check that all permissions are granted

### Audio Not Recording

1. Ensure microphone permission is granted
2. Check if device has a microphone
3. Test audio recording in device settings

## Support

For issues or questions:
- GitHub: https://github.com/guicash663/empire-of-fire
- Email: support@empireoffire.com

## License

This project is licensed under the MIT License.
