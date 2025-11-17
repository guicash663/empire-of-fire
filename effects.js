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
}

export default AudioEffects;