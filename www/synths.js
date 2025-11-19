// synths.js
// Guitar and Drum Synthesis Modules

// Guitar Synthesis Module
class GuitarSynth {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sine'; // Can be 'sine', 'square', 'sawtooth', etc.
        this.oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
        this.oscillator.start();
    }

    play() {
        this.oscillator.connect(this.audioContext.destination);
        this.oscillator.stop(this.audioContext.currentTime + 1); // Play sound for 1 second
    }
}

// Drum Synthesis Module
class DrumSynth {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    playKick() {
        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.connect(this.audioContext.destination);
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2); // Play kick for 0.2 seconds
    }

    playSnare() {
        const noise = this.audioContext.createBufferSource();
        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = Math.random() * 2 - 1; // White noise
        }
        noise.buffer = buffer;
        noise.connect(this.audioContext.destination);
        noise.start();
        noise.stop(this.audioContext.currentTime + 0.1); // Play snare for 0.1 seconds
    }
}

export { GuitarSynth, DrumSynth };