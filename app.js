// app.js

// This file wires up the recording studio UI with the audio engine, visualizer, soundboard, and all recording controls.

import SampleManager from './sample-manager.js';
import AIDrumMachine from './ai-drum-machine.js';
import LiveMonitor from './live-monitor.js';

// Global state
let audioContext;
let sampleManager;
let loadedAudioBuffer = null;
let drumMachine;
let liveMonitor;

function init() {
    // Initialize audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Initialize sample manager
    sampleManager = new SampleManager(audioContext);
    
    // Initialize AI drum machine
    drumMachine = new AIDrumMachine(audioContext);
    
    // Initialize live monitor
    liveMonitor = new LiveMonitor(audioContext);
    
    // Setup event listeners
    setupSongLoader();
    setupSampleEditor();
    setupSoundboard();
    setupDrumMachine();
    setupLiveMonitor();
    
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
            // Use optimized quick play for instant preview with minimal latency
            sampleManager.quickPlay(sample.buffer);
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

// Draw waveform visualization (optimized for performance)
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
    
    // Use optimized rendering with path2D for better performance
    ctx.strokeStyle = '#1DB954';
    ctx.lineWidth = 1;
    
    // Pre-calculate min/max values for better performance
    const peaks = new Float32Array(width * 2);
    for (let i = 0; i < width; i++) {
        const start = i * step;
        const end = Math.min(start + step, data.length);
        let min = 1.0;
        let max = -1.0;
        
        // Find min and max in this segment
        for (let j = start; j < end; j++) {
            const value = data[j];
            if (value < min) min = value;
            if (value > max) max = value;
        }
        
        peaks[i * 2] = min;
        peaks[i * 2 + 1] = max;
    }
    
    // Draw waveform using optimized path
    ctx.beginPath();
    for (let i = 0; i < width; i++) {
        const min = peaks[i * 2];
        const max = peaks[i * 2 + 1];
        
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

// AI Drum Machine functionality
function setupDrumMachine() {
    // Get DOM elements
    const playBtn = document.getElementById('drumPlayBtn');
    const stopBtn = document.getElementById('drumStopBtn');
    const regenerateBtn = document.getElementById('drumRegenerateBtn');
    const clearBtn = document.getElementById('drumClearBtn');
    const bpmInput = document.getElementById('drumBPM');
    const bpmValue = document.getElementById('bpmValue');
    const styleSelect = document.getElementById('drumStyle');
    const complexityInput = document.getElementById('drumComplexity');
    const complexityValue = document.getElementById('complexityValue');
    const swingInput = document.getElementById('drumSwing');
    const swingValue = document.getElementById('swingValue');
    const sequencerContainer = document.getElementById('drumSequencer');

    // Render the sequencer grid
    function renderSequencer() {
        const pattern = drumMachine.getPattern();
        const instruments = ['kick', 'snare', 'hihat', 'openhat'];
        const labels = ['Kick', 'Snare', 'Hi-Hat', 'Open Hat'];
        
        sequencerContainer.innerHTML = '';
        
        instruments.forEach((instrument, idx) => {
            const row = document.createElement('div');
            row.className = 'sequencer-row';
            
            const label = document.createElement('div');
            label.className = 'sequencer-label';
            label.textContent = labels[idx];
            row.appendChild(label);
            
            const steps = document.createElement('div');
            steps.className = 'sequencer-steps';
            
            for (let i = 0; i < 16; i++) {
                const step = document.createElement('div');
                step.className = 'sequencer-step';
                step.dataset.instrument = instrument;
                step.dataset.step = i;
                
                if (pattern[instrument][i]) {
                    step.classList.add('active');
                }
                
                step.addEventListener('click', () => {
                    drumMachine.toggleStep(instrument, i);
                    renderSequencer();
                });
                
                steps.appendChild(step);
            }
            
            row.appendChild(steps);
            sequencerContainer.appendChild(row);
        });
    }

    // Update current step indicator
    drumMachine.onStepCallback = (step) => {
        const allSteps = document.querySelectorAll('.sequencer-step');
        allSteps.forEach((stepEl, index) => {
            const stepNum = index % 16;
            if (stepNum === step) {
                stepEl.classList.add('current');
            } else {
                stepEl.classList.remove('current');
            }
        });
    };

    // Play button
    playBtn.addEventListener('click', () => {
        if (!drumMachine.getIsPlaying()) {
            drumMachine.start();
            playBtn.textContent = '⏸ Pause';
        } else {
            drumMachine.stop();
            playBtn.textContent = '▶ Play';
        }
    });

    // Stop button
    stopBtn.addEventListener('click', () => {
        drumMachine.stop();
        playBtn.textContent = '▶ Play';
    });

    // Regenerate button
    regenerateBtn.addEventListener('click', () => {
        drumMachine.regenerate();
        renderSequencer();
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        drumMachine.clear();
        renderSequencer();
    });

    // BPM control
    bpmInput.addEventListener('input', (e) => {
        const bpm = parseInt(e.target.value);
        drumMachine.setBPM(bpm);
        bpmValue.textContent = bpm;
    });

    // Style control
    styleSelect.addEventListener('change', (e) => {
        drumMachine.setStyle(e.target.value);
        renderSequencer();
    });

    // Complexity control
    complexityInput.addEventListener('input', (e) => {
        const complexity = parseInt(e.target.value) / 100;
        drumMachine.setComplexity(complexity);
        complexityValue.textContent = e.target.value + '%';
        renderSequencer();
    });

    // Swing control
    swingInput.addEventListener('input', (e) => {
        const swing = parseInt(e.target.value);
        drumMachine.setSwing(swing);
        swingValue.textContent = e.target.value + '%';
    });

    // Initial render
    renderSequencer();
}

// Live Monitor functionality (optimized for speed)
function setupLiveMonitor() {
    // Get DOM elements
    const monitorToggle = document.getElementById('monitorToggle');
    const autoTuneToggle = document.getElementById('autoTuneToggle');
    const autoTuneStrength = document.getElementById('autoTuneStrength');
    const autoTuneValue = document.getElementById('autoTuneValue');
    const electricHumToggle = document.getElementById('electricHumToggle');
    const humIntensity = document.getElementById('humIntensity');
    const humValue = document.getElementById('humValue');
    const humFrequency = document.getElementById('humFrequency');

    // Monitor toggle button
    monitorToggle.addEventListener('click', async () => {
        if (!liveMonitor.isMonitoring()) {
            try {
                await liveMonitor.start();
                monitorToggle.textContent = '🔴 Stop Monitoring';
                monitorToggle.className = 'monitor-btn-on';
                
                // Enable controls
                autoTuneStrength.disabled = !autoTuneToggle.checked;
                humIntensity.disabled = !electricHumToggle.checked;
                humFrequency.disabled = !electricHumToggle.checked;
            } catch (error) {
                alert('Failed to start monitoring. Please allow microphone access.');
                console.error(error);
            }
        } else {
            liveMonitor.stop();
            monitorToggle.textContent = '🎤 Start Monitoring';
            monitorToggle.className = 'monitor-btn-off';
            
            // Disable controls
            autoTuneStrength.disabled = true;
            humIntensity.disabled = true;
            humFrequency.disabled = true;
        }
    });

    // Auto-tune toggle
    autoTuneToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            const strength = parseInt(autoTuneStrength.value) / 100;
            liveMonitor.enableAutotune(strength);
            autoTuneStrength.disabled = false;
        } else {
            liveMonitor.disableAutotune();
            autoTuneStrength.disabled = true;
        }
    });

    // Auto-tune strength
    autoTuneStrength.addEventListener('input', (e) => {
        const strength = parseInt(e.target.value) / 100;
        autoTuneValue.textContent = e.target.value + '%';
        liveMonitor.setAutotuneStrength(strength);
    });

    // Electric hum toggle
    electricHumToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            const intensity = parseInt(humIntensity.value) / 1000; // Scale to 0.0-0.1
            const frequency = parseInt(humFrequency.value);
            liveMonitor.enableElectricHum(intensity, frequency);
            humIntensity.disabled = false;
            humFrequency.disabled = false;
        } else {
            liveMonitor.disableElectricHum();
            humIntensity.disabled = true;
            humFrequency.disabled = true;
        }
    });

    // Hum intensity
    humIntensity.addEventListener('input', (e) => {
        const intensity = parseInt(e.target.value) / 1000; // Scale to 0.0-0.1
        humValue.textContent = e.target.value + '%';
        liveMonitor.setHumIntensity(intensity);
    });

    // Hum frequency
    humFrequency.addEventListener('change', (e) => {
        const intensity = parseInt(humIntensity.value) / 1000;
        const frequency = parseInt(e.target.value);
        
        // Restart hum with new frequency
        if (electricHumToggle.checked) {
            liveMonitor.disableElectricHum();
            liveMonitor.enableElectricHum(intensity, frequency);
        }
    });
}

// Run the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}