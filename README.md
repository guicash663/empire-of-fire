# Empire of Fire Music Studio

A professional music recording studio application for Android devices with multi-track recording, audio effects, and synthesis capabilities.

## 🎵 Features

- **🎙️ Audio Recording**: Record high-quality audio using your device's microphone
- **🔊 Live Feedback System**: Real-time monitoring while recording
  - Live audio monitoring (hear yourself as you record)
  - Real-time waveform visualization
  - Input level meter with color-coded feedback (green/orange/red)
- **🎛️ Multi-Track Support**: Manage and mix multiple audio tracks
- **✨ Audio Effects**: Apply professional effects including:
  - Reverb
  - Echo
  - Compressor
  - Auto-Tune
- **🎸 Synthesizers**: Built-in synthesizers for:
  - Guitar sounds
  - Drum beats (Kick & Snare)
- **📊 Waveform Visualizer**: Real-time audio visualization during recording
- **💾 File Management**: Import and export audio files
- **📱 Mobile-Optimized**: Responsive design for Android devices

## 🚀 Quick Start (Android)

### For End Users

1. Download the APK file from the [Releases](https://github.com/guicash663/empire-of-fire/releases) page
2. Install the APK on your Android device
3. Grant necessary permissions (microphone, storage)
4. Start recording music!

### For Developers

See the comprehensive [Android Build Guide](BUILD_ANDROID.md) for detailed instructions on building the application.

**Quick Build:**
```bash
# Install dependencies
npm install -g cordova
npm install

# Add Android platform
cordova platform add android

# Build the app
cordova build android
```

The APK will be generated at: `platforms/android/app/build/outputs/apk/debug/app-debug.apk`

## 🛠️ Development Setup

### Prerequisites

- Node.js (v14 or higher)
- Java Development Kit (JDK 11+)
- Android Studio with Android SDK
- Gradle

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/guicash663/empire-of-fire.git
   cd empire-of-fire
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate app assets (icons and splash screens):
   ```bash
   python3 -c "from PIL import Image, ImageDraw; print('Assets already generated')"
   ```

4. Build for Android:
   ```bash
   npm run android:build
   ```

## 📱 Running the App

### On Android Emulator
```bash
cordova run android
```

### On Physical Device
```bash
cordova run android --device
```

## 🎨 Customization

### App Icons and Splash Screens

App assets are located in the `res/` directory:
- Icons: `res/icon/android/`
- Splash screens: `res/screen/android/`

To regenerate assets, run:
```bash
./generate-assets.sh
```

### Configuration

Edit `config.xml` to customize:
- App name and description
- App ID and version
- Permissions
- Plugin configurations
- Platform-specific settings

## 📝 Build Scripts

Available npm scripts:
- `npm run android:build` - Build debug APK
- `npm run android:run` - Run on device/emulator
- `npm run android:release` - Build release APK (requires signing)
- `npm run prepare` - Prepare Cordova project
- `npm run clean` - Clean build artifacts

## 🔒 Permissions

The app requires the following Android permissions:
- **RECORD_AUDIO**: For recording audio from the microphone
- **MODIFY_AUDIO_SETTINGS**: For audio processing
- **WRITE_EXTERNAL_STORAGE**: For saving recordings
- **READ_EXTERNAL_STORAGE**: For loading audio files
- **INTERNET**: For future features (optional)

## 📦 Distribution

### Google Play Store
See [BUILD_ANDROID.md](BUILD_ANDROID.md) for instructions on creating a signed release APK and publishing to Google Play Store.

### Direct Distribution
1. Build a signed release APK
2. Share the APK file with users
3. Users must enable "Install from Unknown Sources" in their device settings

## 🏗️ Project Structure

```
empire-of-fire/
├── index.html          # Main HTML file
├── app.js             # Application logic
├── audio-engine.js    # Audio recording/playback engine
├── effects.js         # Audio effects processors
├── synths.js          # Synthesizer modules
├── visualizer.js      # Waveform visualization
├── styles.css         # Application styles
├── config.xml         # Cordova configuration
├── package.json       # Node dependencies
├── BUILD_ANDROID.md   # Detailed build guide
├── generate-assets.sh # Asset generation script
└── res/               # App resources (icons, splash screens)
```

## 🧪 Testing

The application uses Web Audio API which works on:
- Android 7.0 (API 24) and higher
- Modern web browsers (Chrome, Firefox, Safari)

## 🐛 Troubleshooting

### Build Issues
- Ensure all environment variables are set (JAVA_HOME, ANDROID_HOME)
- Run `cordova clean` before rebuilding
- Check that you have the correct Android SDK version installed

### Runtime Issues
- Ensure all permissions are granted in device settings
- Check device compatibility (Android 7.0+)
- View logs with `adb logcat`

See [BUILD_ANDROID.md](BUILD_ANDROID.md) for more troubleshooting tips.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Support

For issues or questions:
- GitHub Issues: https://github.com/guicash663/empire-of-fire/issues
- Email: support@empireoffire.com

## 🎉 Acknowledgments

Built with:
- Apache Cordova for hybrid app development
- Web Audio API for audio processing
- Modern web technologies (HTML5, CSS3, JavaScript)

---

**Made with ♪ by the Empire of Fire Team**