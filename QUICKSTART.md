# Quick Start Guide - Empire of Fire Music Studio

Welcome to Empire of Fire Music Studio! This guide will help you get started with the app quickly.

## 📥 Installation

### Option 1: Download Pre-built APK (Recommended for Users)

1. Go to the [Releases](https://github.com/guicash663/empire-of-fire/releases) page
2. Download the latest `empire-of-fire-music-studio.apk` file
3. On your Android device, open the downloaded APK file
4. If prompted, enable "Install from Unknown Sources" in your device settings
5. Follow the installation prompts
6. Once installed, find "Empire of Fire Music Studio" in your app drawer

### Option 2: Build from Source (For Developers)

If you want to build the app yourself:

```bash
# 1. Install Cordova globally
npm install -g cordova

# 2. Clone the repository
git clone https://github.com/guicash663/empire-of-fire.git
cd empire-of-fire

# 3. Install dependencies
npm install

# 4. Add Android platform
cordova platform add android

# 5. Build the APK
cordova build android

# The APK will be at:
# platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## 🎵 First Time Setup

### Grant Permissions

When you first open the app, you'll need to grant the following permissions:

1. **Microphone Access** - Required for recording audio
2. **Storage Access** - Required for saving and loading audio files

Without these permissions, the app won't be able to record or save your music.

## 🎤 Using the App

### Recording Your First Track

1. **Tap the 🔴 Record button** to start recording
2. **Speak or play your instrument** near the device's microphone
3. **Tap the ⏹️ Stop button** when you're done
4. **Tap ▶️ Play** to hear your recording

### Applying Effects

1. Record or upload an audio track
2. Select an effect from the dropdown (Reverb, Echo, or Compressor)
3. Tap "✨ Apply Effect"
4. Your audio will be processed with the selected effect

### Using Synthesizers

Try the built-in synthesizers:
- **🎸 Guitar** - Tap to play a guitar tone
- **🥁 Kick** - Tap to play a kick drum
- **🥁 Snare** - Tap to play a snare drum

### Saving Your Work

1. Record or create your audio
2. Tap the **💾 Download** button
3. Your recording will be saved to your device's Downloads folder
4. The file will be named with a timestamp (e.g., `recording-1234567890.wav`)

### Loading Audio Files

1. Tap the file selector under "File Upload/Download"
2. Choose an audio file from your device
3. Tap **📤 Upload**
4. You can now play, edit, or apply effects to the loaded file

## ✨ Features

### Recording Controls
- **Record** - Start recording audio
- **Stop** - Stop the current recording
- **Play** - Play back your recording

### Audio Effects
- **Reverb** - Add room ambiance and echo
- **Echo** - Create repeating delay effects
- **Compressor** - Balance audio levels
- **Auto-Tune** - Enable pitch correction (toggle checkbox)

### Visualizer
- Watch your audio in real-time with the waveform visualizer
- The visualizer shows the audio signal as you record

### Multi-Track (Coming Soon)
- Multiple tracks for complex compositions
- Mix different audio sources together

## 💡 Tips & Tricks

1. **Use headphones** while recording to prevent feedback
2. **Keep your device close** to the sound source for better quality
3. **Record in a quiet environment** for cleaner audio
4. **Experiment with effects** to find your unique sound
5. **Save frequently** to avoid losing your work

## 🔧 Troubleshooting

### App Won't Record
- Make sure you've granted microphone permission
- Check that another app isn't using the microphone
- Restart the app and try again

### No Sound During Playback
- Check your device's volume settings
- Make sure the device isn't on silent mode
- Verify that you have a recording to play

### Can't Save Files
- Grant storage permission in device settings
- Check that you have enough storage space
- Ensure the app has write access to external storage

### App Crashes
- Make sure you're running Android 7.0 or higher
- Try clearing the app cache in device settings
- Reinstall the app

## 📱 System Requirements

- **Android Version**: 7.0 (Nougat) or higher
- **Storage**: At least 50 MB of free space
- **Microphone**: Required for recording
- **Internet**: Not required (works offline)

## 🆘 Getting Help

If you encounter issues:

1. Check this guide for common solutions
2. Visit the [GitHub Issues](https://github.com/guicash663/empire-of-fire/issues) page
3. Email support at: support@empireoffire.com

## 🎉 Start Creating!

You're all set! Start recording, apply effects, and create amazing music with Empire of Fire Music Studio.

Happy recording! 🎵

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Platform**: Android 7.0+
