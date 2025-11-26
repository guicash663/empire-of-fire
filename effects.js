// effects.js
// Audio Effects Module - Fully implemented with Web Audio API

class AudioEffects {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.inputGain = this.audioContext.createGain();
        this.outputGain = this.audioContext.createGain();
        
        // Initialize all effects
        this.reverb = this.createReverb();
        this.echo = this.createEcho();
        this.compressor = this.createCompressor();
        this.eq = this.createEQ();
        this.distortion = this.createDistortion();
        this.chorus = this.createChorus();
        this.tremolo = this.createTremolo();
        this.phaser = this.createPhaser();
        
        // Auto-tune/pitch correction placeholder
        this.autoTune = { enabled: false };
        this.pitchCorrection = { enabled: false };
    }

    // Convolution Reverb with impulse response generation
    createReverb() {
        const convolver = this.audioContext.createConvolver();
        const wet = this.audioContext.createGain();
        const dry = this.audioContext.createGain();
        
        wet.gain.value = 0.3;
        dry.gain.value = 0.7;
        
        // Generate impulse response for reverb
        const impulse = this.generateImpulseResponse(2, 2, false);
        convolver.buffer = impulse;
        
        return {
            convolver,
            wet,
            dry,
            enabled: false,
            connect: (input, output) => {
                input.connect(dry);
                input.connect(convolver);
                convolver.connect(wet);
                dry.connect(output);
                wet.connect(output);
            },
            setMix: (wetAmount) => {
                wet.gain.value = Math.min(1, Math.max(0, wetAmount));
                dry.gain.value = 1 - wet.gain.value;
            },
            setDecay: (seconds) => {
                convolver.buffer = this.generateImpulseResponse(2, seconds, false);
            }
        };
    }

    // Generate impulse response for reverb
    generateImpulseResponse(channels, duration, reverse = false) {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.audioContext.createBuffer(channels, length, sampleRate);
        
        for (let channel = 0; channel < channels; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const n = reverse ? length - i : i;
                // Exponential decay with noise
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, 2);
            }
        }
        
        return impulse;
    }

    // Delay/Echo effect
    createEcho() {
        const delay = this.audioContext.createDelay(5.0);
        const feedback = this.audioContext.createGain();
        const wet = this.audioContext.createGain();
        const dry = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        delay.delayTime.value = 0.3;
        feedback.gain.value = 0.4;
        wet.gain.value = 0.3;
        dry.gain.value = 0.7;
        filter.type = 'lowpass';
        filter.frequency.value = 3000;
        
        return {
            delay,
            feedback,
            wet,
            dry,
            filter,
            enabled: false,
            connect: (input, output) => {
                input.connect(dry);
                input.connect(delay);
                delay.connect(filter);
                filter.connect(feedback);
                feedback.connect(delay);
                filter.connect(wet);
                dry.connect(output);
                wet.connect(output);
            },
            setTime: (seconds) => {
                delay.delayTime.value = Math.min(5, Math.max(0, seconds));
            },
            setFeedback: (amount) => {
                feedback.gain.value = Math.min(0.95, Math.max(0, amount));
            },
            setMix: (wetAmount) => {
                wet.gain.value = Math.min(1, Math.max(0, wetAmount));
                dry.gain.value = 1 - wet.gain.value;
            }
        };
    }

    // Dynamics Compressor
    createCompressor() {
        const compressor = this.audioContext.createDynamicsCompressor();
        const makeupGain = this.audioContext.createGain();
        
        // Default compressor settings
        compressor.threshold.value = -24;
        compressor.knee.value = 30;
        compressor.ratio.value = 12;
        compressor.attack.value = 0.003;
        compressor.release.value = 0.25;
        makeupGain.gain.value = 1.5;
        
        return {
            compressor,
            makeupGain,
            enabled: false,
            connect: (input, output) => {
                input.connect(compressor);
                compressor.connect(makeupGain);
                makeupGain.connect(output);
            },
            setThreshold: (db) => {
                compressor.threshold.value = Math.min(0, Math.max(-100, db));
            },
            setRatio: (ratio) => {
                compressor.ratio.value = Math.min(20, Math.max(1, ratio));
            },
            setAttack: (seconds) => {
                compressor.attack.value = Math.min(1, Math.max(0, seconds));
            },
            setRelease: (seconds) => {
                compressor.release.value = Math.min(1, Math.max(0, seconds));
            },
            setMakeupGain: (gain) => {
                makeupGain.gain.value = Math.min(10, Math.max(0, gain));
            }
        };
    }

    // 3-Band Parametric EQ
    createEQ() {
        const lowShelf = this.audioContext.createBiquadFilter();
        const mid = this.audioContext.createBiquadFilter();
        const highShelf = this.audioContext.createBiquadFilter();
        
        // Low shelf
        lowShelf.type = 'lowshelf';
        lowShelf.frequency.value = 320;
        lowShelf.gain.value = 0;
        
        // Mid peak
        mid.type = 'peaking';
        mid.frequency.value = 1000;
        mid.Q.value = 1;
        mid.gain.value = 0;
        
        // High shelf
        highShelf.type = 'highshelf';
        highShelf.frequency.value = 3200;
        highShelf.gain.value = 0;
        
        return {
            lowShelf,
            mid,
            highShelf,
            enabled: false,
            connect: (input, output) => {
                input.connect(lowShelf);
                lowShelf.connect(mid);
                mid.connect(highShelf);
                highShelf.connect(output);
            },
            setLow: (gain) => {
                lowShelf.gain.value = Math.min(12, Math.max(-12, gain));
            },
            setMid: (gain) => {
                mid.gain.value = Math.min(12, Math.max(-12, gain));
            },
            setHigh: (gain) => {
                highShelf.gain.value = Math.min(12, Math.max(-12, gain));
            },
            setMidFrequency: (freq) => {
                mid.frequency.value = Math.min(8000, Math.max(200, freq));
            }
        };
    }

    // Distortion/Overdrive
    createDistortion() {
        const waveshaper = this.audioContext.createWaveShaper();
        const preGain = this.audioContext.createGain();
        const postGain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        preGain.gain.value = 1;
        postGain.gain.value = 0.5;
        filter.type = 'lowpass';
        filter.frequency.value = 5000;
        
        // Generate distortion curve
        const amount = 50;
        waveshaper.curve = this.makeDistortionCurve(amount);
        waveshaper.oversample = '4x';
        
        return {
            waveshaper,
            preGain,
            postGain,
            filter,
            enabled: false,
            connect: (input, output) => {
                input.connect(preGain);
                preGain.connect(waveshaper);
                waveshaper.connect(filter);
                filter.connect(postGain);
                postGain.connect(output);
            },
            setAmount: (amount) => {
                waveshaper.curve = this.makeDistortionCurve(Math.min(100, Math.max(0, amount)));
            },
            setDrive: (gain) => {
                preGain.gain.value = Math.min(10, Math.max(0.1, gain));
            },
            setTone: (freq) => {
                filter.frequency.value = Math.min(10000, Math.max(500, freq));
            }
        };
    }

    // Generate distortion curve
    makeDistortionCurve(amount) {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2 / samples) - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        return curve;
    }

    // Chorus effect
    createChorus() {
        const delay1 = this.audioContext.createDelay();
        const delay2 = this.audioContext.createDelay();
        const lfo1 = this.audioContext.createOscillator();
        const lfo2 = this.audioContext.createOscillator();
        const lfoGain1 = this.audioContext.createGain();
        const lfoGain2 = this.audioContext.createGain();
        const wet = this.audioContext.createGain();
        const dry = this.audioContext.createGain();
        
        delay1.delayTime.value = 0.025;
        delay2.delayTime.value = 0.03;
        
        lfo1.type = 'sine';
        lfo1.frequency.value = 1.5;
        lfo2.type = 'sine';
        lfo2.frequency.value = 1.7;
        
        lfoGain1.gain.value = 0.002;
        lfoGain2.gain.value = 0.002;
        
        wet.gain.value = 0.5;
        dry.gain.value = 0.5;
        
        // Connect LFOs to delay time
        lfo1.connect(lfoGain1);
        lfo2.connect(lfoGain2);
        lfoGain1.connect(delay1.delayTime);
        lfoGain2.connect(delay2.delayTime);
        
        lfo1.start();
        lfo2.start();
        
        return {
            delay1,
            delay2,
            lfo1,
            lfo2,
            wet,
            dry,
            enabled: false,
            connect: (input, output) => {
                input.connect(dry);
                input.connect(delay1);
                input.connect(delay2);
                delay1.connect(wet);
                delay2.connect(wet);
                dry.connect(output);
                wet.connect(output);
            },
            setRate: (rate) => {
                lfo1.frequency.value = rate;
                lfo2.frequency.value = rate * 1.1;
            },
            setDepth: (depth) => {
                const d = Math.min(0.01, Math.max(0, depth * 0.01));
                lfoGain1.gain.value = d;
                lfoGain2.gain.value = d;
            },
            setMix: (wetAmount) => {
                wet.gain.value = Math.min(1, Math.max(0, wetAmount));
                dry.gain.value = 1 - wet.gain.value;
            }
        };
    }

    // Tremolo effect
    createTremolo() {
        const lfo = this.audioContext.createOscillator();
        const depth = this.audioContext.createGain();
        const output = this.audioContext.createGain();
        
        lfo.type = 'sine';
        lfo.frequency.value = 5;
        depth.gain.value = 0.5;
        output.gain.value = 1;
        
        lfo.connect(depth);
        depth.connect(output.gain);
        lfo.start();
        
        return {
            lfo,
            depth,
            output,
            enabled: false,
            connect: (input, outputNode) => {
                input.connect(output);
                output.connect(outputNode);
            },
            setRate: (rate) => {
                lfo.frequency.value = Math.min(20, Math.max(0.1, rate));
            },
            setDepth: (amount) => {
                depth.gain.value = Math.min(1, Math.max(0, amount));
            }
        };
    }

    // Phaser effect
    createPhaser() {
        const filters = [];
        const lfo = this.audioContext.createOscillator();
        const lfoGain = this.audioContext.createGain();
        const feedback = this.audioContext.createGain();
        const wet = this.audioContext.createGain();
        const dry = this.audioContext.createGain();
        
        // Create allpass filters
        const stages = 4;
        for (let i = 0; i < stages; i++) {
            const filter = this.audioContext.createBiquadFilter();
            filter.type = 'allpass';
            filter.frequency.value = 1000 + (i * 500);
            filter.Q.value = 5;
            filters.push(filter);
        }
        
        lfo.type = 'sine';
        lfo.frequency.value = 0.5;
        lfoGain.gain.value = 500;
        feedback.gain.value = 0.7;
        wet.gain.value = 0.5;
        dry.gain.value = 0.5;
        
        // Connect LFO to all filter frequencies
        lfo.connect(lfoGain);
        filters.forEach(filter => {
            lfoGain.connect(filter.frequency);
        });
        lfo.start();
        
        return {
            filters,
            lfo,
            feedback,
            wet,
            dry,
            enabled: false,
            connect: (input, output) => {
                input.connect(dry);
                
                // Chain filters
                let lastNode = input;
                filters.forEach(filter => {
                    lastNode.connect(filter);
                    lastNode = filter;
                });
                
                lastNode.connect(wet);
                lastNode.connect(feedback);
                feedback.connect(filters[0]);
                
                dry.connect(output);
                wet.connect(output);
            },
            setRate: (rate) => {
                lfo.frequency.value = Math.min(5, Math.max(0.1, rate));
            },
            setDepth: (depth) => {
                lfoGain.gain.value = Math.min(1000, Math.max(100, depth * 100));
            },
            setFeedback: (amount) => {
                feedback.gain.value = Math.min(0.95, Math.max(0, amount));
            }
        };
    }

    // Apply an effect to a buffer and return processed buffer
    // Note: A new AudioEffects instance is required here because Web Audio nodes
    // cannot be shared between different AudioContext instances. OfflineAudioContext
    // is used for non-real-time rendering.
    async processBuffer(inputBuffer, effectName, params = {}) {
        const offlineContext = new OfflineAudioContext(
            inputBuffer.numberOfChannels,
            inputBuffer.length,
            inputBuffer.sampleRate
        );
        
        const source = offlineContext.createBufferSource();
        source.buffer = inputBuffer;
        
        // Create effect factory function to avoid full AudioEffects instantiation
        const effect = this.createSingleEffect(offlineContext, effectName);
        
        if (!effect) {
            console.error('Unknown effect:', effectName);
            return inputBuffer;
        }
        
        // Apply parameters
        Object.entries(params).forEach(([key, value]) => {
            if (effect[key] && typeof effect[key] === 'function') {
                effect[key](value);
            }
        });
        
        // Connect effect chain
        effect.connect(source, offlineContext.destination);
        
        source.start(0);
        return await offlineContext.startRendering();
    }

    // Create a single effect for offline processing (more efficient than full AudioEffects instance)
    createSingleEffect(context, effectName) {
        // Store original context and temporarily swap
        const originalContext = this.audioContext;
        this.audioContext = context;
        
        let effect = null;
        switch (effectName) {
            case 'reverb':
                effect = this.createReverb();
                break;
            case 'echo':
                effect = this.createEcho();
                break;
            case 'compressor':
                effect = this.createCompressor();
                break;
            case 'eq':
                effect = this.createEQ();
                break;
            case 'distortion':
                effect = this.createDistortion();
                break;
            case 'chorus':
                effect = this.createChorus();
                break;
            case 'tremolo':
                effect = this.createTremolo();
                break;
            case 'phaser':
                effect = this.createPhaser();
                break;
        }
        
        // Restore original context
        this.audioContext = originalContext;
        return effect;
    }
}

export default AudioEffects;