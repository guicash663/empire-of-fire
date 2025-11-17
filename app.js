// app.js
// This file wires up the recording studio UI with the audio engine, visualizer, and all recording controls.

let audioEngine = null;
let audioBlob = null;

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
    
    // Setup synthesizer buttons
    const guitarBtn = document.getElementById('guitarBtn');
    const kickBtn = document.getElementById('kickBtn');
    const snareBtn = document.getElementById('snareBtn');
    
    // Recording controls
    if (recordButton) {
        recordButton.addEventListener('click', async () => {
            try {
                console.log('Starting recording...');
                recordButton.disabled = true;
                recordButton.textContent = '🔴 Recording...';
                
                if (!audioEngine) {
                    // Dynamically import and initialize
                    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    audioEngine = new MediaRecorder(stream);
                    audioEngine.chunks = [];
                    
                    audioEngine.ondataavailable = (event) => {
                        audioEngine.chunks.push(event.data);
                    };
                    
                    audioEngine.onstop = () => {
                        audioBlob = new Blob(audioEngine.chunks, { type: 'audio/wav' });
                        console.log('Recording stopped, blob size:', audioBlob.size);
                        playButton.disabled = false;
                        downloadButton.disabled = false;
                    };
                }
                
                audioEngine.chunks = [];
                audioEngine.start();
                stopButton.disabled = false;
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

// Helper function to play a tone
function playTone(frequency, type, duration) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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