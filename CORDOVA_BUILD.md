# Cordova Android Build Guide

## Overview
This project has been configured to build as a Cordova mobile application for Android devices.

## Prerequisites

### Required Software
1. **Node.js and npm** - For running Cordova CLI
2. **Cordova CLI** - Install globally with: `npm install -g cordova`
3. **Java Development Kit (JDK)** - Version 11 or higher
4. **Android Studio** - Includes Android SDK and build tools
5. **Gradle** - Build automation tool (included with Android Studio)

### Environment Variables
Set the following environment variables:
```bash
export ANDROID_HOME=/path/to/android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

## Build Instructions

### 1. Install Cordova
```bash
npm install -g cordova
```

### 2. Add Android Platform
If not already added, run:
```bash
cordova platform add android
```

To verify the platform is installed:
```bash
cordova platform ls
```

### 3. Build the Android APK
```bash
cordova build android
```

For a release build:
```bash
cordova build android --release
```

### 4. Locate the APK
The built APK will be located at:
```
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

For release builds:
```
platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk
```

## Running on Device/Emulator

### Run on Connected Device
```bash
cordova run android
```

### Run on Emulator
```bash
cordova emulate android
```

## Troubleshooting

### Check Requirements
```bash
cordova requirements
```

This will verify that all necessary tools are installed.

### Common Issues

1. **Gradle build fails**
   - Ensure you have internet connectivity (Gradle downloads dependencies)
   - Check that ANDROID_HOME is set correctly
   - Try cleaning the build: `cordova clean android`

2. **Android SDK not found**
   - Install Android Studio
   - Set ANDROID_HOME environment variable
   - Install required SDK platforms and build tools

3. **Java version issues**
   - Ensure JDK 11 or higher is installed
   - Set JAVA_HOME environment variable

## Project Structure

```
empire-of-fire/
├── config.xml          # Cordova configuration
├── www/                # Web application source files
│   ├── index.html
│   ├── app.js
│   ├── styles.css
│   └── ...
├── platforms/          # Generated platform-specific code (not in git)
└── plugins/            # Cordova plugins (not in git)
```

## Configuration

The Cordova configuration is defined in `config.xml`. Key settings:

- **App ID**: com.empireoffire.recordingstudio
- **App Name**: Empire of Fire
- **Min SDK Version**: 24 (Android 7.0)
- **Target SDK Version**: 33 (Android 13)

## Additional Resources

- [Cordova Documentation](https://cordova.apache.org/docs/en/latest/)
- [Android Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html)
- [Cordova CLI Reference](https://cordova.apache.org/docs/en/latest/reference/cordova-cli/)
