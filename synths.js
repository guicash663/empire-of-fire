// synths.js
// Enhanced Guitar and Drum Synthesis Modules with low-latency optimizations

// Enhanced Guitar Synthesis Module with ADSR envelope
class GuitarSynth {
    constructor(audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.activeNotes = new Map(); // Track active notes for polyphony
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;
        this.masterGain.connect(this.audioContext.destination);
    }

    // Play a note with frequency (optimized for low latency)
    playNote(frequency, duration = 1.0, velocity = 0.8) {
        const now = this.audioContext.currentTime;
        
        // Create oscillators for rich guitar-like tone
        const fundamental = this.audioContext.createOscillator();
        const harmonic = this.audioContext.createOscillator();
        
        fundamental.type = 'triangle';
        fundamental.frequency.setValueAtTime(frequency, now);
        
        harmonic.type = 'sine';
        harmonic.frequency.setValueAtTime(frequency * 2, now);
        
        // Create envelope for natural attack/decay
        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(0, now);
        
        // ADSR Envelope (Attack, Decay, Sustain, Release) - optimized for minimal latency
        const attackTime = 0.005;  // 5ms - very fast attack for low latency
        const decayTime = 0.1;
        const sustainLevel = velocity * 0.7;
        const releaseTime = 0.05;
        
        // Attack
        envelope.gain.linearRampToValueAtTime(velocity, now + attackTime);
        // Decay
        envelope.gain.linearRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
        // Sustain (implicit)
        // Release
        envelope.gain.setValueAtTime(sustainLevel, now + duration);
        envelope.gain.linearRampToValueAtTime(0, now + duration + releaseTime);
        
        // Mix fundamental and harmonic
        const fundamentalGain = this.audioContext.createGain();
        const harmonicGain = this.audioContext.createGain();
        fundamentalGain.gain.value = 0.7;
        harmonicGain.gain.value = 0.3;
        
        // Connect audio graph
        fundamental.connect(fundamentalGain);
        harmonic.connect(harmonicGain);
        fundamentalGain.connect(envelope);
        harmonicGain.connect(envelope);
        envelope.connect(this.masterGain);
        
        // Start oscillators
        fundamental.start(now);
        harmonic.start(now);
        
        // Stop oscillators after release
        const stopTime = now + duration + releaseTime;
        fundamental.stop(stopTime);
        harmonic.stop(stopTime);
        
        return { fundamental, harmonic, envelope };
    }

    // Play note by MIDI note number
    playMIDINote(midiNote, duration = 1.0, velocity = 0.8) {
        const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
        return this.playNote(frequency, duration, velocity);
    }

    // Start a sustained note (for keyboard input)
    noteOn(frequency, velocity = 0.8) {
        const noteKey = frequency.toFixed(2);
        
        // Don't retrigger if already playing
        if (this.activeNotes.has(noteKey)) {
            return;
        }
        
        const now = this.audioContext.currentTime;
        
        const fundamental = this.audioContext.createOscillator();
        const harmonic = this.audioContext.createOscillator();
        
        fundamental.type = 'triangle';
        fundamental.frequency.setValueAtTime(frequency, now);
        
        harmonic.type = 'sine';
        harmonic.frequency.setValueAtTime(frequency * 2, now);
        
        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(velocity, now + 0.005); // 5ms attack
        
        const fundamentalGain = this.audioContext.createGain();
        const harmonicGain = this.audioContext.createGain();
        fundamentalGain.gain.value = 0.7;
        harmonicGain.gain.value = 0.3;
        
        fundamental.connect(fundamentalGain);
        harmonic.connect(harmonicGain);
        fundamentalGain.connect(envelope);
        harmonicGain.connect(envelope);
        envelope.connect(this.masterGain);
        
        fundamental.start(now);
        harmonic.start(now);
        
        this.activeNotes.set(noteKey, { fundamental, harmonic, envelope, velocity });
    }

    // Stop a sustained note
    noteOff(frequency) {
        const noteKey = frequency.toFixed(2);
        const note = this.activeNotes.get(noteKey);
        
        if (!note) return;
        
        const now = this.audioContext.currentTime;
        const releaseTime = 0.05;
        
        note.envelope.gain.cancelScheduledValues(now);
        note.envelope.gain.setValueAtTime(note.envelope.gain.value, now);
        note.envelope.gain.linearRampToValueAtTime(0, now + releaseTime);
        
        note.fundamental.stop(now + releaseTime);
        note.harmonic.stop(now + releaseTime);
        
        this.activeNotes.delete(noteKey);
    }

    // Stop all notes
    stopAll() {
        this.activeNotes.forEach((note, key) => {
            const frequency = parseFloat(key);
            this.noteOff(frequency);
        });
    }
}

// Enhanced Drum Synthesis Module with optimized envelopes
class DrumSynth {
    constructor(audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.6;
        this.masterGain.connect(this.audioContext.destination);
        
        // Pre-generate noise buffer for better performance
        this.noiseBuffer = this.createNoiseBuffer();
    }

    // Pre-generate noise buffer to reduce latency
    createNoiseBuffer() {
        const bufferSize = this.audioContext.sampleRate * 0.5;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }

    // Optimized kick drum with fast envelope
    playKick(velocity = 1.0) {
        const now = this.audioContext.currentTime;
        
        // Oscillator for kick body
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        
        // Pitch envelope for realistic kick sound
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.05);
        
        // Amplitude envelope
        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(velocity, now);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        osc.connect(envelope);
        envelope.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.3);
    }

    // Optimized snare drum with noise and tone
    playSnare(velocity = 1.0) {
        const now = this.audioContext.currentTime;
        
        // Noise component (using pre-generated buffer)
        const noise = this.audioContext.createBufferSource();
        noise.buffer = this.noiseBuffer;
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1000, now);
        
        const noiseEnvelope = this.audioContext.createGain();
        noiseEnvelope.gain.setValueAtTime(velocity * 0.7, now);
        noiseEnvelope.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseEnvelope);
        noiseEnvelope.connect(this.masterGain);
        
        // Tonal component
        const tone = this.audioContext.createOscillator();
        tone.type = 'triangle';
        tone.frequency.setValueAtTime(200, now);
        
        const toneEnvelope = this.audioContext.createGain();
        toneEnvelope.gain.setValueAtTime(velocity * 0.5, now);
        toneEnvelope.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        tone.connect(toneEnvelope);
        toneEnvelope.connect(this.masterGain);
        
        // Start both components
        noise.start(now);
        noise.stop(now + 0.15);
        tone.start(now);
        tone.stop(now + 0.1);
    }

    // Hi-hat sound
    playHiHat(velocity = 1.0, open = false) {
        const now = this.audioContext.currentTime;
        const duration = open ? 0.3 : 0.05;
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = this.noiseBuffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(7000, now);
        
        const envelope = this.audioContext.createGain();
        envelope.gain.setValueAtTime(velocity * 0.5, now);
        envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        noise.connect(filter);
        filter.connect(envelope);
        envelope.connect(this.masterGain);
        
        noise.start(now);
        noise.stop(now + duration);
    }
}

export { GuitarSynth, DrumSynth };