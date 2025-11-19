// ai-drum-machine.js
// AI-powered drum machine with pattern generation and adaptive rhythm

import { DrumSynth } from './synths.js';

class AIDrumMachine {
    constructor(audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.drumSynth = new DrumSynth(this.audioContext);
        
        // Timing and playback
        this.bpm = 120;
        this.isPlaying = false;
        this.currentStep = 0;
        this.stepCount = 16; // 16-step sequencer
        this.intervalId = null;
        
        // Pattern settings
        this.complexity = 0.5; // 0.0 to 1.0
        this.style = 'rock'; // 'rock', 'electronic', 'jazz', 'funk'
        this.swing = 0; // 0 to 100 (swing percentage)
        
        // Current pattern
        this.pattern = this.generatePattern();
        
        // Callbacks
        this.onStepCallback = null;
    }

    // Generate AI drum pattern based on style and complexity
    generatePattern() {
        const pattern = {
            kick: new Array(this.stepCount).fill(false),
            snare: new Array(this.stepCount).fill(false),
            hihat: new Array(this.stepCount).fill(false),
            openhat: new Array(this.stepCount).fill(false)
        };

        switch (this.style) {
            case 'rock':
                this.generateRockPattern(pattern);
                break;
            case 'electronic':
                this.generateElectronicPattern(pattern);
                break;
            case 'jazz':
                this.generateJazzPattern(pattern);
                break;
            case 'funk':
                this.generateFunkPattern(pattern);
                break;
            default:
                this.generateRockPattern(pattern);
        }

        return pattern;
    }

    generateRockPattern(pattern) {
        // Basic rock beat: Kick on 1 and 3, snare on 2 and 4
        pattern.kick[0] = true;
        pattern.kick[8] = true;
        pattern.snare[4] = true;
        pattern.snare[12] = true;

        // Hi-hat on every 8th note
        for (let i = 0; i < this.stepCount; i += 2) {
            pattern.hihat[i] = true;
        }

        // Add complexity
        if (this.complexity > 0.3) {
            pattern.kick[6] = Math.random() < this.complexity;
            pattern.kick[14] = Math.random() < this.complexity;
        }

        if (this.complexity > 0.5) {
            for (let i = 1; i < this.stepCount; i += 4) {
                pattern.hihat[i] = Math.random() < this.complexity * 0.7;
            }
        }

        if (this.complexity > 0.7) {
            pattern.snare[10] = Math.random() < (this.complexity - 0.5);
            pattern.openhat[7] = Math.random() < (this.complexity - 0.5);
        }
    }

    generateElectronicPattern(pattern) {
        // Four-on-the-floor kick
        for (let i = 0; i < this.stepCount; i += 4) {
            pattern.kick[i] = true;
        }

        // Clap/snare on 2 and 4
        pattern.snare[4] = true;
        pattern.snare[12] = true;

        // Hi-hat pattern
        for (let i = 0; i < this.stepCount; i++) {
            if (i % 2 === 0) {
                pattern.hihat[i] = true;
            } else if (this.complexity > 0.4) {
                pattern.hihat[i] = Math.random() < this.complexity;
            }
        }

        // Add variation based on complexity
        if (this.complexity > 0.6) {
            pattern.kick[6] = true;
            pattern.kick[10] = Math.random() < (this.complexity - 0.4);
        }

        if (this.complexity > 0.7) {
            pattern.openhat[3] = true;
            pattern.openhat[11] = Math.random() < (this.complexity - 0.5);
        }
    }

    generateJazzPattern(pattern) {
        // Swing feel with ride cymbal pattern
        for (let i = 0; i < this.stepCount; i++) {
            if (i % 3 === 0 || (i % 6 === 4 && this.complexity > 0.3)) {
                pattern.hihat[i] = true;
            }
        }

        // Subtle kick pattern
        pattern.kick[0] = true;
        pattern.kick[9] = Math.random() < this.complexity;

        // Snare with ghost notes
        pattern.snare[6] = true;
        pattern.snare[14] = true;

        if (this.complexity > 0.5) {
            for (let i = 0; i < this.stepCount; i++) {
                if (!pattern.snare[i] && Math.random() < this.complexity * 0.3) {
                    pattern.snare[i] = Math.random() < 0.3; // Ghost notes (would be quieter)
                }
            }
        }

        // Open hi-hat variations
        if (this.complexity > 0.6) {
            pattern.openhat[7] = Math.random() < (this.complexity - 0.4);
            pattern.openhat[15] = Math.random() < (this.complexity - 0.4);
        }
    }

    generateFunkPattern(pattern) {
        // Syncopated kick pattern
        pattern.kick[0] = true;
        pattern.kick[6] = true;
        pattern.kick[10] = Math.random() < this.complexity;
        pattern.kick[13] = Math.random() < this.complexity;

        // Backbeat snare
        pattern.snare[4] = true;
        pattern.snare[12] = true;

        // Busy hi-hat pattern
        for (let i = 0; i < this.stepCount; i++) {
            if (i % 2 === 1 || this.complexity > 0.4) {
                pattern.hihat[i] = Math.random() < (0.5 + this.complexity * 0.5);
            }
        }

        // Open hi-hat accents
        if (this.complexity > 0.5) {
            pattern.openhat[3] = Math.random() < (this.complexity - 0.3);
            pattern.openhat[11] = Math.random() < (this.complexity - 0.3);
        }

        // Extra kick for funk groove
        if (this.complexity > 0.7) {
            pattern.kick[2] = Math.random() < (this.complexity - 0.5);
            pattern.kick[14] = Math.random() < (this.complexity - 0.5);
        }
    }

    // Start playing the drum machine
    start() {
        if (this.isPlaying) return;

        this.isPlaying = true;
        this.currentStep = 0;

        const stepDuration = (60 / this.bpm / 4) * 1000; // Duration of 16th note in ms
        let lastStepTime = Date.now();
        let nextStepTime = lastStepTime;

        const tick = () => {
            if (!this.isPlaying) return;

            const now = Date.now();
            
            // Check if it's time for the next step
            if (now >= nextStepTime) {
                this.playStep(this.currentStep);
                
                // Calculate next step time with swing
                let swingDelay = 0;
                if (this.swing > 0 && this.currentStep % 2 === 1) {
                    swingDelay = stepDuration * (this.swing / 100) * 0.5;
                }
                
                nextStepTime += stepDuration + swingDelay;
                
                this.currentStep = (this.currentStep + 1) % this.stepCount;
                
                // Callback for UI updates
                if (this.onStepCallback) {
                    this.onStepCallback(this.currentStep);
                }
            }

            this.intervalId = requestAnimationFrame(tick);
        };

        tick();
    }

    // Stop playing
    stop() {
        this.isPlaying = false;
        if (this.intervalId) {
            cancelAnimationFrame(this.intervalId);
            this.intervalId = null;
        }
        this.currentStep = 0;
        if (this.onStepCallback) {
            this.onStepCallback(this.currentStep);
        }
    }

    // Play the sounds for a given step
    playStep(step) {
        const velocity = 1.0;

        if (this.pattern.kick[step]) {
            this.drumSynth.playKick(velocity);
        }

        if (this.pattern.snare[step]) {
            this.drumSynth.playSnare(velocity);
        }

        if (this.pattern.hihat[step]) {
            this.drumSynth.playHiHat(velocity, false);
        }

        if (this.pattern.openhat[step]) {
            this.drumSynth.playHiHat(velocity, true);
        }
    }

    // Set BPM
    setBPM(bpm) {
        this.bpm = Math.max(60, Math.min(200, bpm));
    }

    // Set complexity (0.0 to 1.0)
    setComplexity(complexity) {
        this.complexity = Math.max(0, Math.min(1, complexity));
        this.pattern = this.generatePattern();
    }

    // Set style
    setStyle(style) {
        if (['rock', 'electronic', 'jazz', 'funk'].includes(style)) {
            this.style = style;
            this.pattern = this.generatePattern();
        }
    }

    // Set swing amount (0 to 100)
    setSwing(swing) {
        this.swing = Math.max(0, Math.min(100, swing));
    }

    // Regenerate pattern with current settings
    regenerate() {
        this.pattern = this.generatePattern();
    }

    // Toggle a step for a specific instrument
    toggleStep(instrument, step) {
        if (this.pattern[instrument] && step >= 0 && step < this.stepCount) {
            this.pattern[instrument][step] = !this.pattern[instrument][step];
        }
    }

    // Clear pattern
    clear() {
        this.pattern = {
            kick: new Array(this.stepCount).fill(false),
            snare: new Array(this.stepCount).fill(false),
            hihat: new Array(this.stepCount).fill(false),
            openhat: new Array(this.stepCount).fill(false)
        };
    }

    // Get current pattern
    getPattern() {
        return this.pattern;
    }

    // Get current step
    getCurrentStep() {
        return this.currentStep;
    }

    // Check if playing
    getIsPlaying() {
        return this.isPlaying;
    }
}

export default AIDrumMachine;
