# Empire of Fire

## Setup Instructions
1. Clone the repository using the command:
   ```
   git clone https://github.com/guicash663/empire-of-fire.git
   ```
2. Navigate into the project directory:
   ```
   cd empire-of-fire
   ```

## Web Application
The Empire of Fire recording studio can be run as a web application:

1. Open `www/index.html` directly in a web browser, or
2. Use a local web server:
   ```
   npx http-server www -p 8080
   ```
3. Access the app at `http://localhost:8080`

## Cordova Mobile Application

This project is configured as a Cordova application for building native mobile apps.

### Prerequisites
- Node.js and npm installed
- Cordova CLI: `npm install -g cordova`
- For Android builds:
  - Java JDK 11 or higher
  - Android SDK (Android Studio recommended)
  - Gradle

### Building for Android
1. Install Cordova globally:
   ```
   npm install -g cordova
   ```
2. Add Android platform (if not already added):
   ```
   cordova platform add android
   ```
3. Build the Android APK:
   ```
   cordova build android
   ```
4. The APK will be generated in `platforms/android/app/build/outputs/apk/`

### Running on Android Device/Emulator
```
cordova run android
```

## Features Overview
- **Feature 1**: Description of feature 1.
- **Feature 2**: Description of feature 2.
- **Feature 3**: Description of feature 3.

## Technical Documentation
- This section includes detailed technical documentation which explains the architecture, APIs, and other advanced configurations.
- You can find the technical details in the `docs` directory.

## License
This project is licensed under the MIT License. See the LICENSE file for details.