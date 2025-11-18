// app.js
// This file wires up the recording studio UI with the audio engine, visualizer, and all recording controls.

let audioEngine = null;
let audioBlob = null;
let audioContext = null;
let analyser = null;
let mediaStream = null;
let animationFrameId = null;
let monitorGainNode = null;

function init() {
    console.log('Initializing Empire of Fire Music Studio...');
    
    // Wait for Cordova to be ready
    document.addEventListener('deviceready', onDeviceReady, false);
    
    // For web testing, also initialize on load
    if (!window.cordova) {
        console.log('Running in web mode');
        onDeviceReady();
    }
}

function onDeviceReady() {
    console.log('Device/Browser ready');
    
    // Initialize audio engine (using Web Audio API)
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            console.error('Web Audio API not supported');
            alert('Your device does not support audio recording');
            return;
        }
        audioContext = new AudioContext();
    } catch (e) {
        console.error('Error checking audio support:', e);
    }
    
    // Setup recording controls
    const recordButton = document.getElementById('recordBtn');
    const stopButton = document.getElementById('stopBtn');
    const playButton = document.getElementById('playBtn');
    const downloadButton = document.getElementById('downloadBtn');
    const uploadButton = document.getElementById('uploadBtn');
    const fileUpload = document.getElementById('fileUpload');
    const applyEffectBtn = document.getElementById('applyEffectBtn');
    const monitorToggle = document.getElementById('monitorToggle');
    
    // Setup synthesizer buttons
    const guitarBtn = document.getElementById('guitarBtn');
    const kickBtn = document.getElementById('kickBtn');
    const snareBtn = document.getElementById('snareBtn');
    
    // Initialize live feedback visualizer
    initLiveFeedback();
    
    // Recording controls
    if (recordButton) {
        recordButton.addEventListener('click', async () => {
            try {
                console.log('Starting recording...');
                recordButton.disabled = true;
                recordButton.textContent = '🔴 Recording...';
                
                if (!mediaStream) {
                    // Get microphone access
                    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    
                    // Setup audio context and analyser for live feedback
                    const source = audioContext.createMediaStreamSource(mediaStream);
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = 2048;
                    source.connect(analyser);
                    
                    // Setup monitoring (live playback) if enabled
                    monitorGainNode = audioContext.createGain();
                    monitorGainNode.gain.value = monitorToggle && monitorToggle.checked ? 1.0 : 0.0;
                    source.connect(monitorGainNode);
                    monitorGainNode.connect(audioContext.destination);
                    
                    // Create MediaRecorder
                    audioEngine = new MediaRecorder(mediaStream);
                    audioEngine.chunks = [];
                    
                    audioEngine.ondataavailable = (event) => {
                        audioEngine.chunks.push(event.data);
                    };
                    
                    audioEngine.onstop = () => {
                        audioBlob = new Blob(audioEngine.chunks, { type: 'audio/wav' });
                        console.log('Recording stopped, blob size:', audioBlob.size);
                        playButton.disabled = false;
                        downloadButton.disabled = false;
                        stopLiveFeedback();
                    };
                }
                
                // Start recording
                audioEngine.chunks = [];
                audioEngine.start();
                stopButton.disabled = false;
                
                // Start live feedback visualization
                startLiveFeedback();
                
            } catch (error) {
                console.error('Error starting recording:', error);
                alert('Failed to start recording: ' + error.message);
                recordButton.disabled = false;
                recordButton.textContent = '🔴 Record';
            }
        });
    }
    
    if (stopButton) {
        stopButton.addEventListener('click', () => {
            console.log('Stopping recording...');
            if (audioEngine && audioEngine.state === 'recording') {
                audioEngine.stop();
                recordButton.disabled = false;
                recordButton.textContent = '🔴 Record';
                stopButton.disabled = true;
            }
        });
        stopButton.disabled = true;
    }
    
    // Monitor toggle control
    if (monitorToggle) {
        monitorToggle.addEventListener('change', () => {
            if (monitorGainNode) {
                monitorGainNode.gain.value = monitorToggle.checked ? 1.0 : 0.0;
            }
        });
    }
    
    if (playButton) {
        playButton.addEventListener('click', async () => {
            if (audioBlob) {
                console.log('Playing audio...');
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                await audio.play();
            } else {
                alert('No recording to play');
            }
        });
        playButton.disabled = true;
    }
    
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            if (audioBlob) {
                console.log('Downloading audio...');
                const url = URL.createObjectURL(audioBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'recording-' + Date.now() + '.wav';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert('No recording to download');
            }
        });
        downloadButton.disabled = true;
    }
    
    if (uploadButton && fileUpload) {
        uploadButton.addEventListener('click', () => {
            const file = fileUpload.files[0];
            if (file) {
                console.log('Uploading file:', file.name);
                audioBlob = file;
                playButton.disabled = false;
                downloadButton.disabled = false;
            } else {
                alert('Please select a file first');
            }
        });
    }
    
    if (applyEffectBtn) {
        applyEffectBtn.addEventListener('click', () => {
            const effect = document.getElementById('effects').value;
            console.log('Applying effect:', effect);
            alert('Effect "' + effect + '" applied! (This is a placeholder)');
        });
    }
    
    // Synthesizer controls
    if (guitarBtn) {
        guitarBtn.addEventListener('click', () => {
            console.log('Playing guitar synth...');
            playTone(440, 'sine', 1.0);
        });
    }
    
    if (kickBtn) {
        kickBtn.addEventListener('click', () => {
            console.log('Playing kick drum...');
            playTone(150, 'sine', 0.2);
        });
    }
    
    if (snareBtn) {
        snareBtn.addEventListener('click', () => {
            console.log('Playing snare drum...');
            playNoise(0.1);
        });
    }
    
    console.log('Application initialized successfully');
}

// Live feedback functions
function initLiveFeedback() {
    const canvas = document.getElementById('waveform');
    const levelMeter = document.getElementById('levelMeter');
    const levelBar = document.getElementById('levelBar');
    
    if (!canvas || !levelMeter) {
        console.warn('Live feedback elements not found');
    }
}

function startLiveFeedback() {
    const canvas = document.getElementById('waveform');
    const canvasContext = canvas ? canvas.getContext('2d') : null;
    const levelBar = document.getElementById('levelBar');
    
    if (!canvasContext || !analyser) {
        console.warn('Cannot start live feedback: missing canvas or analyser');
        return;
    }
    
    function drawWaveform() {
        animationFrameId = requestAnimationFrame(drawWaveform);
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
        
        // Draw waveform
        canvasContext.fillStyle = '#2a2a2a';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        
        canvasContext.lineWidth = 2;
        canvasContext.strokeStyle = '#1DB954';
        canvasContext.beginPath();
        
        const sliceWidth = canvas.width / bufferLength;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * canvas.height) / 2;
            
            if (i === 0) {
                canvasContext.moveTo(x, y);
            } else {
                canvasContext.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        canvasContext.lineTo(canvas.width, canvas.height / 2);
        canvasContext.stroke();
        
        // Update level meter
        if (levelBar) {
            // Calculate average level
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                const normalized = (dataArray[i] - 128) / 128.0;
                sum += normalized * normalized;
            }
            const rms = Math.sqrt(sum / bufferLength);
            const level = Math.min(100, rms * 200); // Scale to percentage
            levelBar.style.width = level + '%';
            
            // Color code the level meter
            if (level > 90) {
                levelBar.style.backgroundColor = '#ff4444'; // Red for clipping
            } else if (level > 70) {
                levelBar.style.backgroundColor = '#ffaa00'; // Orange for hot
            } else {
                levelBar.style.backgroundColor = '#1DB954'; // Green for good
            }
        }
    }
    
    drawWaveform();
}

function stopLiveFeedback() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // Clear the canvas
    const canvas = document.getElementById('waveform');
    if (canvas) {
        const canvasContext = canvas.getContext('2d');
        canvasContext.fillStyle = '#2a2a2a';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Reset level meter
    const levelBar = document.getElementById('levelBar');
    if (levelBar) {
        levelBar.style.width = '0%';
    }
}

// Helper function to play a tone
function playTone(frequency, type, duration) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Helper function to play noise (for snare)
function playNoise(duration) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.connect(audioContext.destination);
    noise.start();
}

// Run the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}