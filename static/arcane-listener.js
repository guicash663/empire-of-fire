/**
 * arcane-listener.js
 * 
 * Efficient, low-power continuous audio capture with silence detection.
 * Features:
 * - MediaRecorder with timeslice for periodic chunks without restart
 * - Silence detection using AnalyserNode
 * - Minimal DOM updates and power usage
 * - Robust error handling and cleanup
 */

class ArcaneListener {
    constructor(options = {}) {
        this.isArmed = false;
        this.mediaRecorder = null;
        this.mediaStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.lastUploadedFile = null;
        
        // Configuration (with defaults, can be overridden via options)
        this.chunkDuration = options.chunkDuration || 10000; // 10 seconds in milliseconds
        this.silenceThreshold = options.silenceThreshold || 0.01; // Amplitude threshold for silence detection
        this.minChunkSize = options.minChunkSize || 1024; // Minimum bytes to consider non-empty
        this.fileListRefreshInterval = options.fileListRefreshInterval || 3; // Refresh every N uploads
        
        // Counters
        this.uploadCount = 0;
        
        // UI elements
        this.armBtn = null;
        this.disarmBtn = null;
        this.statusText = null;
        this.fileList = null;
    }
    
    init() {
        // Get UI elements
        this.armBtn = document.getElementById('armBtn');
        this.disarmBtn = document.getElementById('disarmBtn');
        this.statusText = document.getElementById('statusText');
        this.fileList = document.getElementById('fileList');
        
        // Setup event listeners
        this.armBtn.addEventListener('click', () => this.arm());
        this.disarmBtn.addEventListener('click', () => this.disarm());
        
        // Cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup());
        
        // Initial state
        this.updateUI();
        this.loadFileList();
        
        this.setStatus('Ready');
    }
    
    async arm() {
        if (this.isArmed) return;
        
        try {
            this.setStatus('Requesting microphone access...');
            
            // Request microphone access
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            
            // Setup audio context for silence detection
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = 0.8;
            source.connect(this.analyser);
            
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
            
            // Setup MediaRecorder with timeslice for efficient chunking
            this.mediaRecorder = new MediaRecorder(this.mediaStream, {
                mimeType: this.getSupportedMimeType()
            });
            
            // Handle data availability - fired every chunkDuration ms
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.handleChunk(event.data);
                }
            };
            
            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                this.setStatus('Recording error: ' + event.error);
            };
            
            // Start recording with timeslice - emits chunks automatically
            this.mediaRecorder.start(this.chunkDuration);
            
            this.isArmed = true;
            this.updateUI();
            this.setStatus('Armed - Recording...');
            
        } catch (error) {
            console.error('Failed to arm:', error);
            this.setStatus('Error: ' + (error.message || 'Microphone access denied'));
            this.cleanup();
        }
    }
    
    disarm() {
        if (!this.isArmed) return;
        
        this.isArmed = false;
        this.cleanup();
        this.updateUI();
        this.setStatus('Disarmed');
    }
    
    cleanup() {
        // Stop media recorder
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        this.mediaRecorder = null;
        
        // Stop all media tracks
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        // Close audio context
        if (this.audioContext && this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
    }
    
    async handleChunk(blob) {
        // Guard: don't process if disarmed mid-chunk
        if (!this.isArmed) {
            return;
        }
        
        // Check for minimum size
        if (blob.size < this.minChunkSize) {
            this.setStatus('Skipped: chunk too small');
            return;
        }
        
        // Check for silence using analyser
        if (this.isSilent()) {
            this.setStatus('Skipped: silent chunk detected');
            return;
        }
        
        // Upload the chunk
        await this.uploadChunk(blob);
    }
    
    isSilent() {
        if (!this.analyser || !this.dataArray) {
            return false;
        }
        
        // Get time domain data
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        // Calculate RMS amplitude
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            const normalized = (this.dataArray[i] - 128) / 128;
            sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / this.dataArray.length);
        
        // Return true if below threshold (silent)
        return rms < this.silenceThreshold;
    }
    
    async uploadChunk(blob) {
        const formData = new FormData();
        const extension = this.getFileExtension();
        const filename = `chunk_${Date.now()}.${extension}`;
        formData.append('audio', blob, filename);
        
        try {
            this.setStatus('Uploading chunk...');
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Store last uploaded filename in case we need to delete it
            this.lastUploadedFile = result.filename;
            
            // Check if uploaded file is too small (might be silence that passed our check)
            if (result.size < this.minChunkSize * 2) {
                // Delete the small file
                await this.deleteFile(result.filename);
                this.setStatus('Uploaded chunk was empty - deleted');
            } else {
                this.setStatus(`Uploaded: ${result.filename} (${this.formatBytes(result.size)})`);
                // Refresh file list every N uploads to save cycles
                this.uploadCount++;
                if (this.uploadCount % this.fileListRefreshInterval === 0) {
                    this.loadFileList();
                }
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            this.setStatus('Upload failed: ' + error.message);
        }
    }
    
    async deleteFile(filename) {
        try {
            const response = await fetch(`/delete/${filename}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                console.log('Deleted empty file:', filename);
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    }
    
    async loadFileList() {
        try {
            const response = await fetch('/files');
            
            if (!response.ok) {
                throw new Error('Failed to load files');
            }
            
            const data = await response.json();
            this.renderFileList(data.files);
            
        } catch (error) {
            console.error('Failed to load file list:', error);
        }
    }
    
    renderFileList(files) {
        if (!this.fileList) return;
        
        if (files.length === 0) {
            this.fileList.innerHTML = '<div class="empty-state">No recordings yet</div>';
            return;
        }
        
        this.fileList.innerHTML = files.map(file => `
            <div class="file-item">
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this.formatBytes(file.size)}</span>
                <a href="/recordings/${file.name}" download class="file-download">↓</a>
            </div>
        `).join('');
    }
    
    updateUI() {
        if (this.isArmed) {
            this.armBtn.disabled = true;
            this.disarmBtn.disabled = false;
            document.body.classList.add('armed');
        } else {
            this.armBtn.disabled = false;
            this.disarmBtn.disabled = true;
            document.body.classList.remove('armed');
        }
    }
    
    setStatus(message) {
        if (this.statusText) {
            this.statusText.textContent = message;
        }
    }
    
    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/ogg'
        ];
        
        for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
                return type;
            }
        }
        
        return ''; // Browser will use default
    }
    
    getFileExtension() {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        if (mimeType.includes('webm')) return 'webm';
        if (mimeType.includes('ogg')) return 'ogg';
        return 'audio';
    }
    
    formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create listener with default options
    // To customize, pass options object:
    // const listener = new ArcaneListener({
    //     chunkDuration: 10000,           // 10 seconds
    //     silenceThreshold: 0.01,         // RMS amplitude threshold
    //     minChunkSize: 1024,             // Minimum bytes
    //     fileListRefreshInterval: 3      // Refresh every 3 uploads
    // });
    const listener = new ArcaneListener();
    listener.init();
});
