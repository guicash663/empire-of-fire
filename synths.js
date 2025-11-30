// synths.js
// Guitar and Drum Synthesis Modules - Enhanced with realistic sounds

// Constants
const SEMITONES_PER_OCTAVE = 12;
const DEFAULT_NOISE_BUFFER_DURATION = 2; // seconds
const DEFAULT_DAMPING = 0.996; // Controls decay rate for Karplus-Strong
const DEFAULT_BRIGHTNESS = 0.5; // Controls tone brightness for Karplus-Strong

// Guitar Note Frequencies (Standard Tuning)
const GUITAR_NOTES = {
    E2: 82.41, A2: 110.00, D3: 146.83, G3: 196.00, B3: 246.94, E4: 329.63,
    F2: 87.31, F3: 174.61, F4: 349.23,
    C3: 130.81, C4: 261.63, C5: 523.25,
    Am: [110.00, 164.81, 220.00, 261.63, 329.63],
    Em: [82.41, 123.47, 164.81, 196.00, 246.94, 329.63],
    G: [98.00, 123.47, 196.00, 246.94, 293.66, 392.00],
    D: [146.83, 220.00, 293.66, 369.99],
    C: [130.81, 164.81, 196.00, 261.63, 329.63]
};

// Guitar Synthesis Module - Karplus-Strong algorithm for realistic plucked string sound
class GuitarSynth {
    constructor(audioContext = null) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.7;
        this.masterGain.connect(this.audioContext.destination);
    }

    // Set shared audio context
    setAudioContext(ctx) {
        if (this.masterGain) {
            this.masterGain.disconnect();
        }
        this.audioContext = ctx;
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = 0.7;
        this.masterGain.connect(ctx.destination);
    }

    // Create a realistic plucked string sound using Karplus-Strong algorithm
    createPluckedString(frequency, duration = 2.0, velocity = 0.8) {
        const sampleRate = this.audioContext.sampleRate;
        const samples = Math.floor(sampleRate * duration);
        const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Calculate delay line length based on frequency
        const delayLength = Math.max(1, Math.round(sampleRate / frequency));
        const delayLine = new Float32Array(delayLength);
        
        // Initialize with noise burst (pluck excitation)
        for (let i = 0; i < delayLength; i++) {
            delayLine[i] = (Math.random() * 2 - 1) * velocity;
        }
        
        // Karplus-Strong synthesis with lowpass filter
        const damping = DEFAULT_DAMPING;
        const brightness = DEFAULT_BRIGHTNESS;
        let delayIndex = 0;
        
        for (let i = 0; i < samples; i++) {
            const currentSample = delayLine[delayIndex];
            data[i] = currentSample;
            
            // Simple lowpass filter: average of current and next sample
            const nextIndex = (delayIndex + 1) % delayLength;
            const filtered = damping * (brightness * currentSample + (1 - brightness) * delayLine[nextIndex]);
            
            delayLine[delayIndex] = filtered;
            delayIndex = nextIndex;
        }
        
        return buffer;
    }

    // Play a single note using plucked string synthesis
    playNote(frequency, duration = 1.5, velocity = 0.7) {
        const now = this.audioContext.currentTime;
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        // Create plucked string sound
        source.buffer = this.createPluckedString(frequency, duration + 0.5, velocity);
        
        // Apply envelope
        gainNode.gain.setValueAtTime(velocity, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        source.start(now);
        source.stop(now + duration + 0.1);
        
        return source;
    }

    // Play a chord (multiple notes)
    playChord(chordName, duration = 2.0, strum = 0.03) {
        const frequencies = GUITAR_NOTES[chordName];
        if (!frequencies || !Array.isArray(frequencies)) {
            console.error('Unknown chord or invalid format:', chordName);
            return;
        }
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playNote(freq, duration - (index * strum), 0.6);
            }, index * strum * 1000);
        });
    }

    // Quick strum effect
    strum(direction = 'down', chordName = 'Em') {
        const frequencies = [...(GUITAR_NOTES[chordName] || GUITAR_NOTES.Em)];
        if (direction === 'up') frequencies.reverse();
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playNote(freq, 1.5, 0.5 + Math.random() * 0.2);
            }, index * 20);
        });
    }

    // Power chord - common in rock music
    playPowerChord(rootFreq, duration = 2.0) {
        const fifth = rootFreq * 1.5;
        const octave = rootFreq * 2;
        
        this.playNote(rootFreq, duration, 0.8);
        this.playNote(fifth, duration, 0.6);
        this.playNote(octave, duration, 0.4);
    }

    // Fingerpick pattern
    fingerpick(chordName = 'Am', pattern = [0, 2, 1, 3, 2, 4], tempo = 120) {
        const frequencies = GUITAR_NOTES[chordName] || GUITAR_NOTES.Am;
        const beatDuration = 60 / tempo;
        
        pattern.forEach((stringIndex, i) => {
            if (stringIndex < frequencies.length) {
                setTimeout(() => {
                    this.playNote(frequencies[stringIndex], 1.0, 0.6);
                }, i * beatDuration * 500);
            }
        });
    }

    // Muted/palm-muted sound
    playMuted(frequency, duration = 0.3) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.value = frequency;
        
        filter.type = 'lowpass';
        filter.frequency.value = 800;
        filter.Q.value = 2;
        
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    // Slide between two notes
    slide(startFreq, endFreq, duration = 0.5) {
        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.linearRampToValueAtTime(endFreq, now + duration * 0.7);
        
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    // Bend note
    bend(frequency, bendAmount = 2, duration = 1.0) {
        const now = this.audioContext.currentTime;
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.createPluckedString(frequency, duration + 0.5, 0.7);
        source.playbackRate.setValueAtTime(1, now);
        source.playbackRate.linearRampToValueAtTime(Math.pow(2, bendAmount / SEMITONES_PER_OCTAVE), now + duration * 0.5);
        
        gainNode.gain.setValueAtTime(0.7, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        source.connect(gainNode);
        gainNode.connect(this.masterGain);
        source.start(now);
        source.stop(now + duration + 0.1);
    }

    // Get available chords
    getChords() {
        return Object.keys(GUITAR_NOTES).filter(key => Array.isArray(GUITAR_NOTES[key]));
    }

    // Get available notes
    getNotes() {
        return Object.entries(GUITAR_NOTES)
            .filter(([, val]) => typeof val === 'number')
            .map(([name, freq]) => ({ name, freq }));
    }
}

// Drum Synthesis Module - Enhanced with realistic sounds
class DrumSynth {
    constructor(audioContext = null) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterGain.connect(this.audioContext.destination);
        
        // Pre-generate noise buffer for efficiency
        this.noiseBuffer = this.createNoiseBuffer(DEFAULT_NOISE_BUFFER_DURATION);
    }

    // Set shared audio context
    setAudioContext(ctx) {
        if (this.masterGain) {
            this.masterGain.disconnect();
        }
        this.audioContext = ctx;
        this.masterGain = ctx.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterGain.connect(ctx.destination);
        this.noiseBuffer = this.createNoiseBuffer(DEFAULT_NOISE_BUFFER_DURATION);
    }

    // Create a reusable noise buffer
    createNoiseBuffer(duration) {
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // Realistic kick drum with pitch envelope and punch
    playKick(velocity = 0.9) {
        const now = this.audioContext.currentTime;
        
        // Main tone oscillator
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        
        osc.type = 'sine';
        // Pitch envelope: start high, drop quickly
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        
        oscGain.gain.setValueAtTime(velocity, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        // Click/attack transient
        const click = this.audioContext.createOscillator();
        const clickGain = this.audioContext.createGain();
        click.type = 'square';
        click.frequency.value = 800;
        clickGain.gain.setValueAtTime(velocity * 0.3, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        
        // Sub bass layer
        const sub = this.audioContext.createOscillator();
        const subGain = this.audioContext.createGain();
        sub.type = 'sine';
        sub.frequency.value = 50;
        subGain.gain.setValueAtTime(velocity * 0.5, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        // Connect everything
        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        
        click.connect(clickGain);
        clickGain.connect(this.masterGain);
        
        sub.connect(subGain);
        subGain.connect(this.masterGain);
        
        osc.start(now);
        click.start(now);
        sub.start(now);
        
        osc.stop(now + 0.5);
        click.stop(now + 0.05);
        sub.stop(now + 0.4);
    }

    // Realistic snare with body and snare wires
    playSnare(velocity = 0.8) {
        const now = this.audioContext.currentTime;
        
        // Snare body (tone)
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
        
        oscGain.gain.setValueAtTime(velocity * 0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        // Snare wires (filtered noise)
        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const noiseFilter = this.audioContext.createBiquadFilter();
        
        noise.buffer = this.noiseBuffer;
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 3000;
        
        noiseGain.gain.setValueAtTime(velocity * 0.6, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        
        // Connect
        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        
        osc.start(now);
        noise.start(now);
        
        osc.stop(now + 0.2);
        noise.stop(now + 0.25);
    }

    // Hi-hat (closed)
    playHiHat(velocity = 0.5) {
        const now = this.audioContext.currentTime;
        
        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const highpass = this.audioContext.createBiquadFilter();
        const bandpass = this.audioContext.createBiquadFilter();
        
        noise.buffer = this.noiseBuffer;
        
        highpass.type = 'highpass';
        highpass.frequency.value = 7000;
        
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 10000;
        bandpass.Q.value = 1;
        
        noiseGain.gain.setValueAtTime(velocity * 0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        noise.connect(highpass);
        highpass.connect(bandpass);
        bandpass.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        
        noise.start(now);
        noise.stop(now + 0.1);
    }

    // Open hi-hat
    playOpenHiHat(velocity = 0.5) {
        const now = this.audioContext.currentTime;
        
        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const highpass = this.audioContext.createBiquadFilter();
        
        noise.buffer = this.noiseBuffer;
        
        highpass.type = 'highpass';
        highpass.frequency.value = 6000;
        
        noiseGain.gain.setValueAtTime(velocity * 0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        noise.connect(highpass);
        highpass.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        
        noise.start(now);
        noise.stop(now + 0.35);
    }

    // Tom drum
    playTom(pitch = 'mid', velocity = 0.7) {
        const now = this.audioContext.currentTime;
        const frequencies = { high: 300, mid: 200, low: 120, floor: 80 };
        const freq = frequencies[pitch] || 200;
        
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 1.5, now);
        osc.frequency.exponentialRampToValueAtTime(freq, now + 0.1);
        
        oscGain.gain.setValueAtTime(velocity, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.5);
    }

    // Crash cymbal
    playCrash(velocity = 0.7) {
        const now = this.audioContext.currentTime;
        
        const noise = this.audioContext.createBufferSource();
        const noiseGain = this.audioContext.createGain();
        const highpass = this.audioContext.createBiquadFilter();
        const lowpass = this.audioContext.createBiquadFilter();
        
        noise.buffer = this.noiseBuffer;
        
        highpass.type = 'highpass';
        highpass.frequency.value = 4000;
        
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 12000;
        
        noiseGain.gain.setValueAtTime(velocity * 0.5, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
        
        noise.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        
        noise.start(now);
        noise.stop(now + 2);
    }

    // Ride cymbal
    playRide(velocity = 0.4, isBell = false) {
        const now = this.audioContext.currentTime;
        
        if (isBell) {
            // Bell sound - more tonal
            const osc = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.value = 900;
            
            oscGain.gain.setValueAtTime(velocity * 0.4, now);
            oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            
            osc.connect(oscGain);
            oscGain.connect(this.masterGain);
            
            osc.start(now);
            osc.stop(now + 1);
        } else {
            // Regular ride hit
            const noise = this.audioContext.createBufferSource();
            const noiseGain = this.audioContext.createGain();
            const bandpass = this.audioContext.createBiquadFilter();
            
            noise.buffer = this.noiseBuffer;
            
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 5000;
            bandpass.Q.value = 2;
            
            noiseGain.gain.setValueAtTime(velocity * 0.3, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            
            noise.connect(bandpass);
            bandpass.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            
            noise.start(now);
            noise.stop(now + 0.8);
        }
    }

    // Clap sound
    playClap(velocity = 0.7) {
        const now = this.audioContext.currentTime;
        
        // Multiple noise bursts for clap texture
        for (let i = 0; i < 3; i++) {
            const noise = this.audioContext.createBufferSource();
            const noiseGain = this.audioContext.createGain();
            const bandpass = this.audioContext.createBiquadFilter();
            
            noise.buffer = this.noiseBuffer;
            
            bandpass.type = 'bandpass';
            bandpass.frequency.value = 2500;
            bandpass.Q.value = 3;
            
            const startTime = now + i * 0.01;
            noiseGain.gain.setValueAtTime(velocity * 0.4, startTime);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
            
            noise.connect(bandpass);
            bandpass.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            
            noise.start(startTime);
            noise.stop(startTime + 0.2);
        }
    }

    // Rimshot
    playRimshot(velocity = 0.8) {
        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(350, now);
        
        oscGain.gain.setValueAtTime(velocity * 0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        
        osc.connect(oscGain);
        oscGain.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Play a simple beat pattern
    playBeat(tempo = 120, bars = 1) {
        const beatDuration = 60 / tempo;
        const beatsPerBar = 4;
        
        for (let bar = 0; bar < bars; bar++) {
            for (let beat = 0; beat < beatsPerBar; beat++) {
                const time = (bar * beatsPerBar + beat) * beatDuration * 1000;
                
                // Kick on 1 and 3
                if (beat === 0 || beat === 2) {
                    setTimeout(() => this.playKick(), time);
                }
                
                // Snare on 2 and 4
                if (beat === 1 || beat === 3) {
                    setTimeout(() => this.playSnare(), time);
                }
                
                // Hi-hat on every 8th note
                setTimeout(() => this.playHiHat(0.3), time);
                setTimeout(() => this.playHiHat(0.2), time + (beatDuration * 500));
            }
        }
    }
}

export { GuitarSynth, DrumSynth, GUITAR_NOTES };