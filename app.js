// app.js

// This file wires up the recording studio UI with the audio engine, visualizer, soundboard, and all recording controls.

import SampleManager from './sample-manager.js';
import { GuitarSynth, DrumSynth, GUITAR_NOTES } from './synths.js';
import AudioEffects from './effects.js';

// Global state
let audioContext;
let sampleManager;
let loadedAudioBuffer = null;
let guitarSynth;
let drumSynth;
let audioEffects;

function init() {
    // Initialize audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Initialize sample manager
    sampleManager = new SampleManager(audioContext);
    
    // Initialize instruments with shared audio context
    guitarSynth = new GuitarSynth(audioContext);
    drumSynth = new DrumSynth(audioContext);
    
    // Initialize effects
    audioEffects = new AudioEffects(audioContext);
    
    // Setup event listeners
    setupSongLoader();
    setupSampleEditor();
    setupSoundboard();
    setupInstruments();
    setupKeyboardShortcuts();
    
    console.log('Application initialized with enhanced audio');
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
        addVisualFeedback(pad);
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
        addVisualFeedback(pad);
    });
    
    return pad;
}

// Visual feedback for button presses
function addVisualFeedback(element) {
    element.classList.add('active');
    setTimeout(() => {
        element.classList.remove('active');
    }, 150);
}

// Setup virtual instruments (Guitar and Drums)
function setupInstruments() {
    // Guitar chord buttons
    document.querySelectorAll('.chord-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const chord = btn.dataset.chord;
            guitarSynth.playChord(chord);
            addVisualFeedback(btn);
        });
    });
    
    // Guitar note buttons
    document.querySelectorAll('.note-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const noteName = btn.dataset.note;
            const freq = GUITAR_NOTES[noteName];
            if (freq) {
                guitarSynth.playNote(freq);
                addVisualFeedback(btn);
            }
        });
    });
    
    // Guitar strum buttons
    const strumDownBtn = document.getElementById('strumDownBtn');
    const strumUpBtn = document.getElementById('strumUpBtn');
    const fingerpickBtn = document.getElementById('fingerpickBtn');
    
    if (strumDownBtn) {
        strumDownBtn.addEventListener('click', () => {
            guitarSynth.strum('down', 'Em');
            addVisualFeedback(strumDownBtn);
        });
    }
    
    if (strumUpBtn) {
        strumUpBtn.addEventListener('click', () => {
            guitarSynth.strum('up', 'Em');
            addVisualFeedback(strumUpBtn);
        });
    }
    
    if (fingerpickBtn) {
        fingerpickBtn.addEventListener('click', () => {
            guitarSynth.fingerpick('Am');
            addVisualFeedback(fingerpickBtn);
        });
    }
    
    // Drum pad buttons
    document.querySelectorAll('.drum-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const drum = btn.dataset.drum;
            playDrumSound(drum);
            addVisualFeedback(btn);
        });
    });
    
    // Play beat button
    const playBeatBtn = document.getElementById('playBeatBtn');
    const tempoInput = document.getElementById('tempoInput');
    
    if (playBeatBtn) {
        playBeatBtn.addEventListener('click', () => {
            const tempo = parseInt(tempoInput.value) || 120;
            drumSynth.playBeat(tempo, 2);
            addVisualFeedback(playBeatBtn);
        });
    }
}

// Play drum sound based on type
function playDrumSound(type) {
    switch (type) {
        case 'kick':
            drumSynth.playKick();
            break;
        case 'snare':
            drumSynth.playSnare();
            break;
        case 'hihat':
            drumSynth.playHiHat();
            break;
        case 'openhat':
            drumSynth.playOpenHiHat();
            break;
        case 'tom-high':
            drumSynth.playTom('high');
            break;
        case 'tom-mid':
            drumSynth.playTom('mid');
            break;
        case 'tom-low':
            drumSynth.playTom('low');
            break;
        case 'crash':
            drumSynth.playCrash();
            break;
        case 'ride':
            drumSynth.playRide();
            break;
        case 'clap':
            drumSynth.playClap();
            break;
        case 'rimshot':
            drumSynth.playRimshot();
            break;
    }
}

// Keyboard shortcuts for instruments
function setupKeyboardShortcuts() {
    const drumKeyMap = {
        'q': 'kick',
        'w': 'snare',
        'e': 'hihat',
        'r': 'openhat',
        't': 'tom-high',
        'y': 'tom-mid',
        'u': 'tom-low',
        'i': 'crash',
        'o': 'ride',
        'p': 'clap'
    };
    
    const guitarKeyMap = {
        'a': 'Am',
        's': 'Em',
        'd': 'G',
        'f': 'D',
        'g': 'C'
    };
    
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        const key = e.key.toLowerCase();
        
        // Drum shortcuts
        if (drumKeyMap[key]) {
            playDrumSound(drumKeyMap[key]);
            const btn = document.querySelector(`[data-drum="${drumKeyMap[key]}"]`);
            if (btn) addVisualFeedback(btn);
        }
        
        // Guitar chord shortcuts
        if (guitarKeyMap[key]) {
            guitarSynth.playChord(guitarKeyMap[key]);
            const btn = document.querySelector(`[data-chord="${guitarKeyMap[key]}"]`);
            if (btn) addVisualFeedback(btn);
        }
        
        // Space for strum
        if (key === ' ') {
            e.preventDefault();
            guitarSynth.strum('down', 'Em');
        }
    });
}

// Draw waveform visualization - optimized for performance
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
    
    // Draw waveform - optimized: avoid creating arrays with slice()
    ctx.strokeStyle = '#1DB954';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Handle empty audio buffer
    if (data.length === 0) {
        return;
    }
    
    for (let i = 0; i < width; i++) {
        const start = i * step;
        const end = Math.min(start + step, data.length);
        
        // Skip if start is beyond data length
        if (start >= data.length) {
            break;
        }
        
        let min = data[start];
        let max = data[start];
        
        // Calculate min/max without creating new arrays
        for (let j = start + 1; j < end; j++) {
            const val = data[j];
            if (val < min) min = val;
            if (val > max) max = val;
        }
        
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

// Run the application
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}