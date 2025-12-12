// app.js

// This file wires up the recording studio UI with the audio engine, visualizer, soundboard, and all recording controls.

import SampleManager from './sample-manager.js';

// Global state
let audioContext;
let sampleManager;
let loadedAudioBuffer = null;
let liveMonitorActive = false;
let liveMonitorStream = null;
let liveMonitorAnalyser = null;
let liveMonitorAnimationId = null;
let autoTuneEnabled = false;
let autoTuneParams = {};

function init() {
    // Initialize audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Initialize sample manager
    sampleManager = new SampleManager(audioContext);
    
    // Setup event listeners
    setupSongLoader();
    setupSampleEditor();
    setupSoundboard();
    setupLiveMonitor();
    setupAutoTune();
    
    console.log('Application initialized');
}

// Song Loader functionality
function setupSongLoader() {
    const songUpload = document.getElementById('songUpload');
    const loadSongBtn = document.getElementById('loadSongBtn');
    const songInfo = document.getElementById('songInfo');
    
    loadSongBtn.addEventListener('click', async () => {
        const file = songUpload.files[0];
        if (!file) {
            alert('Please select an audio file');
            return;
        }
        
        try {
            loadedAudioBuffer = await sampleManager.loadAudioFile(file);
            const duration = loadedAudioBuffer.duration;
            songInfo.textContent = `Loaded: ${file.name} (Duration: ${duration.toFixed(2)}s)`;
            
            // Update end time to duration
            document.getElementById('endTime').value = Math.min(1, duration).toFixed(2);
            document.getElementById('endTime').max = duration;
            document.getElementById('startTime').max = duration;
            
            // Draw waveform
            drawWaveform(loadedAudioBuffer);
        } catch (error) {
            alert('Error loading audio file: ' + error.message);
            console.error(error);
        }
    });
}

// Sample Editor functionality
function setupSampleEditor() {
    const previewBtn = document.getElementById('previewSampleBtn');
    const addToSoundboardBtn = document.getElementById('addToSoundboardBtn');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const sampleNameInput = document.getElementById('sampleName');
    
    previewBtn.addEventListener('click', () => {
        if (!loadedAudioBuffer) {
            alert('Please load a song first');
            return;
        }
        
        const startTime = parseFloat(startTimeInput.value);
        const endTime = parseFloat(endTimeInput.value);
        
        if (startTime >= endTime) {
            alert('Start time must be less than end time');
            return;
        }
        
        try {
            const sample = sampleManager.extractSample(startTime, endTime, 'Preview');
            // Play preview immediately
            const source = audioContext.createBufferSource();
            source.buffer = sample.buffer;
            source.connect(audioContext.destination);
            source.start(0);
        } catch (error) {
            alert('Error previewing sample: ' + error.message);
            console.error(error);
        }
    });
    
    addToSoundboardBtn.addEventListener('click', () => {
        if (!loadedAudioBuffer) {
            alert('Please load a song first');
            return;
        }
        
        const startTime = parseFloat(startTimeInput.value);
        const endTime = parseFloat(endTimeInput.value);
        const name = sampleNameInput.value || `Sample ${sampleManager.getSamples().length + 1}`;
        
        if (startTime >= endTime) {
            alert('Start time must be less than end time');
            return;
        }
        
        try {
            const sample = sampleManager.extractSample(startTime, endTime, name);
            const addedSample = sampleManager.addSample(sample);
            renderSoundboard();
            
            // Clear inputs for next sample
            sampleNameInput.value = '';
            alert(`Sample "${name}" added to soundboard!`);
        } catch (error) {
            alert('Error adding sample: ' + error.message);
            console.error(error);
        }
    });
}

// Soundboard functionality
function setupSoundboard() {
    renderSoundboard();
}

function renderSoundboard() {
    const soundboardPads = document.getElementById('soundboardPads');
    soundboardPads.innerHTML = '';
    
    const samples = sampleManager.getSamples();
    
    if (samples.length === 0) {
        soundboardPads.innerHTML = '<p style="color: #888; padding: 20px;">No samples yet. Load a song and cut some samples!</p>';
        return;
    }
    
    samples.forEach(sample => {
        const pad = createSoundboardPad(sample);
        soundboardPads.appendChild(pad);
    });
}

function createSoundboardPad(sample) {
    const pad = document.createElement('div');
    pad.className = 'soundboard-pad';
    
    pad.innerHTML = `
        <h3>${sample.name}</h3>
        <div class="delay-info">Duration: ${sample.duration.toFixed(2)}s</div>
        <div class="controls">
            <label style="font-size: 10px; color: #ddd;">
                Delay 1 (s):
                <input type="number" class="delay1-input" min="0" step="0.1" value="${sample.delay1}">
            </label>
            <label style="font-size: 10px; color: #ddd;">
                Delay 2 (s):
                <input type="number" class="delay2-input" min="0" step="0.1" value="${sample.delay2}">
            </label>
            <button class="play-btn">Play</button>
            <button class="remove-btn">Remove</button>
        </div>
    `;
    
    // Play button handler
    const playBtn = pad.querySelector('.play-btn');
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sampleManager.playSample(sample.id);
    });
    
    // Remove button handler
    const removeBtn = pad.querySelector('.remove-btn');
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Remove "${sample.name}"?`)) {
            sampleManager.removeSample(sample.id);
            renderSoundboard();
        }
    });
    
    // Delay input handlers
    const delay1Input = pad.querySelector('.delay1-input');
    const delay2Input = pad.querySelector('.delay2-input');
    
    delay1Input.addEventListener('change', () => {
        const delay1 = parseFloat(delay1Input.value) || 0;
        const delay2 = parseFloat(delay2Input.value) || 0;
        sampleManager.updateSampleDelays(sample.id, delay1, delay2);
    });
    
    delay2Input.addEventListener('change', () => {
        const delay1 = parseFloat(delay1Input.value) || 0;
        const delay2 = parseFloat(delay2Input.value) || 0;
        sampleManager.updateSampleDelays(sample.id, delay1, delay2);
    });
    
    // Click on pad to play
    pad.addEventListener('click', () => {
        sampleManager.playSample(sample.id);
    });
    
    return pad;
}

// Draw waveform visualization
function drawWaveform(audioBuffer) {
    const canvas = document.getElementById('waveformCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Get audio data (use first channel)
    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;
    
    // Draw waveform
    ctx.strokeStyle = '#1DB954';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let i = 0; i < width; i++) {
        const min = Math.min(...data.slice(i * step, (i + 1) * step));
        const max = Math.max(...data.slice(i * step, (i + 1) * step));
        
        ctx.moveTo(i, (1 + min) * amp);
        ctx.lineTo(i, (1 + max) * amp);
    }
    
    ctx.stroke();
    
    // Draw center line
    ctx.strokeStyle = '#444';
    ctx.beginPath();
    ctx.moveTo(0, amp);
    ctx.lineTo(width, amp);
    ctx.stroke();
}

// Live Monitor Setup
function setupLiveMonitor() {
    const liveMonitorToggle = document.getElementById('liveMonitorToggle');
    const startMonitorBtn = document.getElementById('startMonitorBtn');
    const stopMonitorBtn = document.getElementById('stopMonitorBtn');
    
    startMonitorBtn.addEventListener('click', async () => {
        try {
            await startLiveMonitor();
            liveMonitorToggle.checked = true;
            startMonitorBtn.disabled = true;
            stopMonitorBtn.disabled = false;
        } catch (error) {
            alert('Error starting live monitor: ' + error.message);
            console.error(error);
        }
    });
    
    stopMonitorBtn.addEventListener('click', () => {
        stopLiveMonitor();
        liveMonitorToggle.checked = false;
        startMonitorBtn.disabled = false;
        stopMonitorBtn.disabled = true;
    });
    
    liveMonitorToggle.addEventListener('change', async (e) => {
        if (e.target.checked) {
            try {
                await startLiveMonitor();
                startMonitorBtn.disabled = true;
                stopMonitorBtn.disabled = false;
            } catch (error) {
                alert('Error starting live monitor: ' + error.message);
                console.error(error);
                e.target.checked = false;
            }
        } else {
            stopLiveMonitor();
            startMonitorBtn.disabled = false;
            stopMonitorBtn.disabled = true;
        }
    });
    
    // Initialize button states
    stopMonitorBtn.disabled = true;
}

async function startLiveMonitor() {
    if (liveMonitorActive) {
        return;
    }
    
    // Request microphone access
    liveMonitorStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Create analyser node
    liveMonitorAnalyser = audioContext.createAnalyser();
    liveMonitorAnalyser.fftSize = 2048;
    
    // Connect stream to analyser
    const source = audioContext.createMediaStreamSource(liveMonitorStream);
    source.connect(liveMonitorAnalyser);
    
    liveMonitorActive = true;
    
    // Start drawing
    drawLiveMonitor();
    
    console.log('Live monitor started');
}

function stopLiveMonitor() {
    if (!liveMonitorActive) {
        return;
    }
    
    // Stop animation
    if (liveMonitorAnimationId) {
        cancelAnimationFrame(liveMonitorAnimationId);
        liveMonitorAnimationId = null;
    }
    
    // Stop media stream
    if (liveMonitorStream) {
        liveMonitorStream.getTracks().forEach(track => track.stop());
        liveMonitorStream = null;
    }
    
    liveMonitorAnalyser = null;
    liveMonitorActive = false;
    
    // Clear canvas
    const canvas = document.getElementById('liveMonitorCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    console.log('Live monitor stopped');
}

function drawLiveMonitor() {
    if (!liveMonitorActive || !liveMonitorAnalyser) {
        return;
    }
    
    const canvas = document.getElementById('liveMonitorCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const bufferLength = liveMonitorAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    liveMonitorAnimationId = requestAnimationFrame(drawLiveMonitor);
    
    liveMonitorAnalyser.getByteTimeDomainData(dataArray);
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw waveform
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1DB954';
    ctx.beginPath();
    
    const sliceWidth = width / bufferLength;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
    }
    
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    
    // Draw center line
    ctx.strokeStyle = '#333';
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
}

// Auto-Tune Setup
function setupAutoTune() {
    const autoTuneToggle = document.getElementById('autoTuneToggle');
    const autoTuneControls = document.getElementById('autoTuneControls');
    
    // Define 24 auto-tune parameters
    const parameters = [
        { id: 'pitchCorrection', name: 'Pitch Correction', min: 0, max: 100, default: 50, unit: '%', step: 1, precision: 0 },
        { id: 'retune', name: 'Retune Speed', min: 0, max: 400, default: 50, unit: 'ms', step: 1, precision: 0 },
        { id: 'humanize', name: 'Humanize', min: 0, max: 100, default: 0, unit: '%', step: 1, precision: 0 },
        { id: 'naturalVibrato', name: 'Natural Vibrato', min: 0, max: 100, default: 50, unit: '%', step: 1, precision: 0 },
        { id: 'targetPitchA', name: 'Target Note A', min: 0, max: 100, default: 100, unit: '%', step: 1, precision: 0 },
        { id: 'targetPitchB', name: 'Target Note B', min: 0, max: 100, default: 100, unit: '%', step: 1, precision: 0 },
        { id: 'targetPitchC', name: 'Target Note C', min: 0, max: 100, default: 100, unit: '%', step: 1, precision: 0 },
        { id: 'targetPitchD', name: 'Target Note D', min: 0, max: 100, default: 100, unit: '%', step: 1, precision: 0 },
        { id: 'targetPitchE', name: 'Target Note E', min: 0, max: 100, default: 100, unit: '%', step: 1, precision: 0 },
        { id: 'targetPitchF', name: 'Target Note F', min: 0, max: 100, default: 100, unit: '%', step: 1, precision: 0 },
        { id: 'targetPitchG', name: 'Target Note G', min: 0, max: 100, default: 100, unit: '%', step: 1, precision: 0 },
        { id: 'formantShift', name: 'Formant Shift', min: -12, max: 12, default: 0, unit: 'st', step: 0.1, precision: 1 },
        { id: 'throatLength', name: 'Throat Length', min: 50, max: 150, default: 100, unit: '%', step: 1, precision: 0 },
        { id: 'breathiness', name: 'Breathiness', min: 0, max: 100, default: 0, unit: '%', step: 1, precision: 0 },
        { id: 'vibrato', name: 'Vibrato', min: 0, max: 100, default: 0, unit: '%', step: 1, precision: 0 },
        { id: 'vibratoRate', name: 'Vibrato Rate', min: 1, max: 10, default: 5, unit: 'Hz', step: 0.1, precision: 1 },
        { id: 'vibratoDepth', name: 'Vibrato Depth', min: 0, max: 100, default: 20, unit: 'cents', step: 1, precision: 0 },
        { id: 'pitchShift', name: 'Pitch Shift', min: -12, max: 12, default: 0, unit: 'st', step: 0.1, precision: 1 },
        { id: 'mixDryWet', name: 'Mix (Dry/Wet)', min: 0, max: 100, default: 100, unit: '%', step: 1, precision: 0 },
        { id: 'outputGain', name: 'Output Gain', min: -20, max: 20, default: 0, unit: 'dB', step: 0.5, precision: 1 },
        { id: 'inputGain', name: 'Input Gain', min: -20, max: 20, default: 0, unit: 'dB', step: 0.5, precision: 1 },
        { id: 'lowCut', name: 'Low Cut', min: 20, max: 500, default: 80, unit: 'Hz', step: 10, precision: 0 },
        { id: 'highCut', name: 'High Cut', min: 2000, max: 20000, default: 15000, unit: 'Hz', step: 100, precision: 0 },
        { id: 'scaleLock', name: 'Scale Lock', min: 0, max: 100, default: 0, unit: '%', step: 1, precision: 0 }
    ];
    
    // Initialize parameters
    parameters.forEach(param => {
        autoTuneParams[param.id] = param.default;
    });
    
    // Create parameter controls
    parameters.forEach(param => {
        const paramDiv = document.createElement('div');
        paramDiv.className = 'auto-tune-param';
        
        const valueId = `${param.id}-value`;
        
        paramDiv.innerHTML = `
            <label for="${param.id}">${param.name}</label>
            <input type="range" 
                   id="${param.id}" 
                   min="${param.min}" 
                   max="${param.max}" 
                   value="${param.default}" 
                   step="${param.step}">
            <span class="param-value" id="${valueId}">${param.default}${param.unit}</span>
        `;
        
        const slider = paramDiv.querySelector('input');
        const valueDisplay = paramDiv.querySelector('.param-value');
        
        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            autoTuneParams[param.id] = value;
            valueDisplay.textContent = `${value.toFixed(param.precision)}${param.unit}`;
        });
        
        autoTuneControls.appendChild(paramDiv);
    });
    
    // Toggle auto-tune
    autoTuneToggle.addEventListener('change', (e) => {
        autoTuneEnabled = e.target.checked;
        autoTuneControls.style.display = autoTuneEnabled ? 'grid' : 'none';
        
        if (autoTuneEnabled) {
            console.log('Auto-tune enabled with parameters:', autoTuneParams);
        } else {
            console.log('Auto-tune disabled');
        }
    });
    
    // Initially hide controls
    autoTuneControls.style.display = 'none';
}

// Run the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}