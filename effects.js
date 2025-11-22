// effects.js
// High-performance audio effects optimized for low latency

class AudioEffects {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
    }

    // Create optimized reverb effect using ConvolverNode
    createReverb(duration = 2, decay = 2) {
        const convolver = this.audioContext.createConvolver();
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        // Generate impulse response for reverb
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            }
        }
        
        convolver.buffer = impulse;
        
        // Dry/wet mix control
        const dryGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        dryGain.gain.value = 0.7;
        wetGain.gain.value = 0.3;
        
        return { convolver, dryGain, wetGain };
    }

    // Create optimized echo/delay effect
    createEcho(delayTime = 0.3, feedback = 0.4) {
        const delay = this.audioContext.createDelay(5.0);
        const feedbackGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        
        delay.delayTime.value = delayTime;
        feedbackGain.gain.value = feedback;
        wetGain.gain.value = 0.5;
        
        // Create feedback loop
        delay.connect(feedbackGain);
        feedbackGain.connect(delay);
        
        return { delay, feedbackGain, wetGain };
    }

    // Create optimized compressor for dynamic range control
    createCompressor() {
        const compressor = this.audioContext.createDynamicsCompressor();
        
        // Optimized settings for studio use
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003; // 3ms - fast attack for minimal latency
        compressor.release.value = 0.25;
        
        return compressor;
    }

    // Create 3-band EQ for tone shaping
    createEQ() {
        const lowShelf = this.audioContext.createBiquadFilter();
        const mid = this.audioContext.createBiquadFilter();
        const highShelf = this.audioContext.createBiquadFilter();
        
        // Low frequencies (bass)
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 200;
        lowShelf.gain.value = 0;
        
        // Mid frequencies
        mid.type = 'peaking';
        mid.frequency.value = 1000;
        mid.Q.value = 0.5;
        mid.gain.value = 0;
        
        // High frequencies (treble)
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 3000;
        highShelf.gain.value = 0;
        
        // Chain filters
        lowShelf.connect(mid);
        mid.connect(highShelf);
        
        return { lowShelf, mid, highShelf, input: lowShelf, output: highShelf };
    }

    // Apply reverb effect to a source
    applyReverb(source, outputNode = this.masterGain) {
        const { convolver, dryGain, wetGain } = this.createReverb();
        
        // Route audio through parallel wet/dry paths
        source.connect(dryGain);
        source.connect(convolver);
        convolver.connect(wetGain);
        
        dryGain.connect(outputNode);
        wetGain.connect(outputNode);
        
        return { dryGain, wetGain, convolver };
    }

    // Apply echo effect to a source
    applyEcho(source, outputNode = this.masterGain) {
        const { delay, feedbackGain, wetGain } = this.createEcho();
        
        source.connect(delay);
        source.connect(outputNode); // Dry signal
        delay.connect(wetGain);
        wetGain.connect(outputNode);
        
        return { delay, feedbackGain, wetGain };
    }

    // Apply compressor to a source
    applyCompressor(source, outputNode = this.masterGain) {
        const compressor = this.createCompressor();
        
        source.connect(compressor);
        compressor.connect(outputNode);
        
        return compressor;
    }

    // Apply EQ to a source
    applyEQ(source, outputNode = this.masterGain) {
        const eq = this.createEQ();
        
        source.connect(eq.input);
        eq.output.connect(outputNode);
        
        return eq;
    }

    // Create a complete effect chain for studio-quality processing
    createEffectChain() {
        const compressor = this.createCompressor();
        const eq = this.createEQ();
        const { delay, feedbackGain, wetGain } = this.createEcho();
        
        // Chain: Input -> Compressor -> EQ -> Echo -> Output
        compressor.connect(eq.input);
        eq.output.connect(delay);
        delay.connect(feedbackGain);
        feedbackGain.connect(delay);
        delay.connect(wetGain);
        wetGain.connect(this.masterGain);
        
        return {
            input: compressor,
            compressor,
            eq,
            delay,
            feedbackGain,
            wetGain,
            output: this.masterGain
        };
    }

    // Create fast, shallow autotune effect (optimized for minimal latency)
    createFastAutotune(strength = 0.3) {
        // Use a very tight pitch quantization for fast response
        // This creates a subtle "T-Pain/Cher" vibe without heavy processing
        
        // Create a short delay for pitch shifting simulation
        const pitchDelay = this.audioContext.createDelay(0.1);
        pitchDelay.delayTime.value = 0.005; // 5ms delay for shallow effect
        
        // Create a feedback loop for the characteristic autotune sound
        const feedback = this.audioContext.createGain();
        feedback.gain.value = strength * 0.5; // Subtle feedback
        
        // Create wet/dry mix
        const dryGain = this.audioContext.createGain();
        const wetGain = this.audioContext.createGain();
        dryGain.gain.value = 1 - strength;
        wetGain.gain.value = strength;
        
        // Simple pitch quantization using waveshaper for fast processing
        const shaper = this.audioContext.createWaveShaper();
        const curve = new Float32Array(256);
        for (let i = 0; i < 256; i++) {
            const x = (i / 128) - 1;
            // Quantize to semitones for autotune effect
            curve[i] = Math.round(x * 6) / 6; // Quantize to 6 semitones
        }
        shaper.curve = curve;
        shaper.oversample = 'none'; // No oversampling for speed
        
        // Connect nodes
        pitchDelay.connect(shaper);
        shaper.connect(feedback);
        feedback.connect(pitchDelay);
        shaper.connect(wetGain);
        
        return {
            input: pitchDelay,
            dryGain,
            wetGain,
            feedback,
            shaper
        };
    }

    // Create electric hum effect (60Hz or 50Hz mains hum for authenticity)
    createElectricHum(frequency = 60, intensity = 0.02) {
        // Create oscillator for base hum
        const hum = this.audioContext.createOscillator();
        hum.type = 'sine';
        hum.frequency.value = frequency; // 60Hz for US, 50Hz for EU
        
        // Create harmonics for realistic electric hum
        const harmonic2 = this.audioContext.createOscillator();
        harmonic2.type = 'sine';
        harmonic2.frequency.value = frequency * 2; // 120Hz
        
        const harmonic3 = this.audioContext.createOscillator();
        harmonic3.type = 'sine';
        harmonic3.frequency.value = frequency * 3; // 180Hz
        
        // Create gain nodes for mixing
        const humGain = this.audioContext.createGain();
        const harm2Gain = this.audioContext.createGain();
        const harm3Gain = this.audioContext.createGain();
        const masterHumGain = this.audioContext.createGain();
        
        // Set intensity levels
        humGain.gain.value = intensity;
        harm2Gain.gain.value = intensity * 0.3;
        harm3Gain.gain.value = intensity * 0.1;
        masterHumGain.gain.value = 1;
        
        // Connect oscillators
        hum.connect(humGain);
        harmonic2.connect(harm2Gain);
        harmonic3.connect(harm3Gain);
        
        // Mix harmonics
        humGain.connect(masterHumGain);
        harm2Gain.connect(masterHumGain);
        harm3Gain.connect(masterHumGain);
        
        // Start oscillators
        hum.start();
        harmonic2.start();
        harmonic3.start();
        
        return {
            hum,
            harmonic2,
            harmonic3,
            humGain,
            harm2Gain,
            harm3Gain,
            output: masterHumGain,
            setIntensity: (value) => {
                humGain.gain.setValueAtTime(value, this.audioContext.currentTime);
                harm2Gain.gain.setValueAtTime(value * 0.3, this.audioContext.currentTime);
                harm3Gain.gain.setValueAtTime(value * 0.1, this.audioContext.currentTime);
            },
            stop: () => {
                hum.stop();
                harmonic2.stop();
                harmonic3.stop();
            }
        };
    }
}

export default AudioEffects;