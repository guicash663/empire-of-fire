# Empire of Fire

A web-based recording studio application with audio recording, editing, sample cutting, and soundboard features. Built with the Web Audio API for high-quality audio processing.

## 🎵 Features

- **Audio Recording & Playback**: Record audio directly from your microphone
- **Sample Cutter**: Load songs and cut specific sections into samples
- **Soundboard**: Create a custom soundboard with your samples
- **Waveform Visualization**: See your audio in real-time
- **Multi-Track Display**: Organize and manage multiple audio tracks
- **Audio Effects**: Apply reverb, echo, and compression effects
- **Auto-Tune Interface**: Pitch correction capabilities
- **File Management**: Upload and download audio files

## 🚀 Quick Start

### Desktop/Laptop Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/guicash663/empire-of-fire.git
   ```

2. Navigate into the project directory:
   ```bash
   cd empire-of-fire
   ```

3. Start the server:
   ```bash
   node server.js
   ```
   Or using npm:
   ```bash
   npm start
   ```

4. Open your browser and go to `http://localhost:3000`

### 📱 Termux (Android) Setup

Run Empire of Fire on your Android device using Termux!

**Quick Install:**
```bash
pkg update && pkg install -y nodejs git
git clone https://github.com/guicash663/empire-of-fire.git
cd empire-of-fire
node server.js
```

Then open `http://localhost:3000` in your mobile browser.

**For detailed Termux instructions, see [TERMUX_SETUP.md](TERMUX_SETUP.md)**

## 📖 Usage

1. **Load a Song**: Click "Load Song" and select an audio file
2. **Cut Samples**: Set start and end times, then click "Add to Soundboard"
3. **Play Samples**: Click on soundboard pads to play your samples
4. **Apply Effects**: Select effects and apply them to your audio
5. **Record**: Use the recording controls to capture new audio

## 🛠 Configuration

### Change Server Port
```bash
PORT=8080 node server.js
```

### Change Host Binding
```bash
HOST=127.0.0.1 node server.js
```

## 💻 Browser Compatibility

- ✅ Google Chrome (Recommended)
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari (Limited support)

**Note**: Web Audio API requires a modern browser with full audio API support.

## 📋 Requirements

- Node.js 12.0.0 or higher
- Modern web browser with Web Audio API support
- Microphone access (for recording features)

## 🔧 Technical Details

This application uses:
- **Web Audio API** for audio processing
- **Canvas API** for waveform visualization
- **MediaRecorder API** for audio recording
- **Pure JavaScript** (ES6 modules)
- **Node.js HTTP server** (no external dependencies)

## License
This project is licensed under the MIT License. See the LICENSE file for details.