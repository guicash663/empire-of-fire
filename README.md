# Empire of Fire

A web-based recording studio application featuring audio sample management, waveform visualization, soundboard functionality, and real-time audio effects.

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/guicash663/empire-of-fire.git
   ```

2. Navigate into the project directory:
   ```bash
   cd empire-of-fire
   ```

3. Install required dependencies:
   ```bash
   npm install
   ```

## Usage Guide

### Starting the Application

To start the application, run:
```bash
npm start
```

The application will start on `http://localhost:3000`. Open your browser and navigate to this URL to access the recording studio.

For development with auto-open in browser:
```bash
npm run dev
```

## Features Overview

- **Audio Sample Management**: Load audio files and extract custom samples with precise time controls
- **Waveform Visualization**: Visual representation of loaded audio with interactive waveform display
- **Soundboard**: Create and manage up to 12 custom sound pads with configurable delays
- **Multi-Track Recording**: Record, stop, and playback audio with professional controls
- **Sample Editor**: Cut and preview samples from loaded songs with adjustable start/end times
- **Effects Processing**: Apply reverb, echo, and compression effects to audio
- **Auto-Tune Interface**: Enable pitch correction with a simple toggle

## Technical Details

### Architecture
- **Frontend**: Pure JavaScript ES6 modules with Web Audio API
- **Audio Engine**: Custom audio processing using Web Audio API
- **Module Structure**:
  - `app.js` - Main application logic and UI wiring
  - `sample-manager.js` - Audio sample management and processing
  - `audio-engine.js` - Core recording and playback functionality
  - `effects.js` - Audio effects processing
  - `synths.js` - Guitar and drum synthesis modules
  - `visualizer.js` - Waveform visualization

### Browser Compatibility
Requires a modern browser with Web Audio API support:
- Chrome/Edge (recommended)
- Firefox
- Safari

## License
This project is licensed under the MIT License. See the LICENSE file for details.