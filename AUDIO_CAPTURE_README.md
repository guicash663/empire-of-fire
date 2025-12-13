# Golem Shell - Audio Capture System

An efficient, low-power continuous audio capture system with intelligent silence detection.

## Features

### Efficient Continuous Capture
- Uses `MediaRecorder.start(timeslice)` for periodic chunk emission without recorder restart
- Single start/stop cycle per arming session
- Minimal CPU and power usage
- 10-second chunk duration

### Intelligent Silence Detection
- Real-time amplitude analysis using Web Audio API AnalyserNode
- Automatic skip of silent chunks to save bandwidth and storage
- Configurable silence threshold
- Automatic deletion of empty uploaded files

### Robust Error Handling
- Clear status messages for mic access, upload failures, and skipped chunks
- Proper cleanup on disarm and page unload
- Guards against processing chunks after disarm
- Fetch error handling with response validation

### Minimal Design
- Monochrome terminal-inspired UI
- Static interface with updates only on state changes
- Low overhead, optimized for efficiency

## Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run the server:
```bash
python server.py
```

For development with debug mode (not recommended for production):
```bash
FLASK_DEBUG=true python server.py
```

3. Open your browser to `http://localhost:5000`

## Usage

1. Click **ARM** to start continuous audio capture
2. The system will automatically:
   - Capture 10-second audio chunks
   - Analyze each chunk for silence
   - Upload only non-silent chunks
   - Delete any empty files
3. Click **DISARM** to stop recording
4. View and download recordings from the Archive section

## File Structure

- `server.py` - Flask backend with upload and file management endpoints
- `templates/golem-shell.html` - Main UI template
- `static/arcane-listener.js` - Optimized audio capture logic
- `recordings/` - Directory for stored audio chunks (not committed to git)

## Technical Details

### Backend Endpoints

- `GET /` - Serves the main HTML interface
- `POST /upload` - Handles audio chunk uploads
- `GET /files` - Lists all recorded files
- `GET /recordings/<filename>` - Serves audio files for download
- `DELETE /delete/<filename>` - Deletes a specific recording

### Frontend Architecture

The `ArcaneListener` class implements:
- Single-instance MediaRecorder with timeslice-based chunking
- AudioContext + AnalyserNode for real-time silence detection
- Minimal DOM manipulation to reduce overhead
- Automatic resource cleanup

### Silence Detection

Uses RMS (Root Mean Square) amplitude calculation:
1. Analyser captures time-domain audio data
2. Calculate RMS from normalized samples
3. Compare against threshold (default: 0.01)
4. Skip upload if below threshold

## Configuration

You can configure the audio capture behavior by passing options when initializing:

```javascript
const listener = new ArcaneListener({
    chunkDuration: 10000,           // Chunk duration in ms (default: 10000)
    silenceThreshold: 0.01,         // RMS amplitude threshold (default: 0.01)
    minChunkSize: 1024,             // Minimum bytes for valid chunk (default: 1024)
    fileListRefreshInterval: 3      // Refresh UI every N uploads (default: 3)
});
```

### Configuration Options

- **chunkDuration**: Time in milliseconds for each audio chunk (default: 10000 = 10 seconds)
- **silenceThreshold**: RMS amplitude below this value is considered silence (default: 0.01)
  - Lower values = stricter silence detection (more sensitive)
  - Higher values = more lenient (allows quieter audio through)
- **minChunkSize**: Minimum file size in bytes to keep (default: 1024)
- **fileListRefreshInterval**: UI refreshes every N successful uploads to save CPU (default: 3)

## Legacy Configuration (deprecated)

Edit `arcane-listener.js` to adjust (use constructor options instead):

```javascript
this.chunkDuration = 10000;      // Chunk duration in ms
this.silenceThreshold = 0.01;    // RMS amplitude threshold
this.minChunkSize = 1024;        // Minimum bytes for valid chunk
```

## Browser Compatibility

Requires modern browser with:
- MediaRecorder API
- Web Audio API
- getUserMedia support

Tested on Chrome, Firefox, and Edge.

## License

MIT License - See LICENSE file for details.
