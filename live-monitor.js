// live-monitor.js
// Optimized live monitoring system with autotune and electric hum
// Designed for minimal latency and maximum performance

import AudioEffects from './effects.js';

class LiveMonitor {
    constructor(audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.effects = new AudioEffects(this.audioContext);
        
        // State
        this.isActive = false;
        this.mediaStream = null;
        this.sourceNode = null;
        
        // Effects nodes
        this.autotuneEffect = null;
        this.electricHum = null;
        
        // Settings (optimized for speed)
        this.autotuneStrength = 0.3; // Shallow vibe (0.0 to 1.0)
        this.humIntensity = 0.02; // Subtle electric hum
        this.humFrequency = 60; // 60Hz for US mains hum
        
        // Audio graph nodes
        this.inputGain = this.audioContext.createGain();
        this.outputGain = this.audioContext.createGain();
        this.inputGain.gain.value = 1.0;
        this.outputGain.gain.value = 0.8; // Prevent clipping
        
        // Connect to destination (headphones)
        this.outputGain.connect(this.audioContext.destination);
    }

    // Start live monitoring with minimal latency
    async start() {
        if (this.isActive) return;

        try {
            // Request microphone access with optimized settings for low latency
            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false, // Disable for speed
                    noiseSuppression: false, // Disable for speed
                    autoGainControl: false, // Manual control for better sound
                    latency: 0, // Request lowest possible latency
                    sampleRate: 48000 // Standard rate for professional audio
                }
            });

            // Create source from microphone
            this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
            
            // Connect input to gain
            this.sourceNode.connect(this.inputGain);
            
            // Setup audio routing
            this.setupAudioRouting();
            
            this.isActive = true;
            
            return true;
        } catch (error) {
            console.error('Failed to start live monitoring:', error);
            throw error;
        }
    }

    // Setup optimized audio routing
    setupAudioRouting() {
        // Disconnect previous routing
        this.inputGain.disconnect();
        
        let currentNode = this.inputGain;
        
        // Add autotune if enabled
        if (this.autotuneEffect) {
            currentNode.connect(this.autotuneEffect.input);
            currentNode.connect(this.autotuneEffect.dryGain);
            this.autotuneEffect.dryGain.connect(this.outputGain);
            this.autotuneEffect.wetGain.connect(this.outputGain);
            currentNode = this.autotuneEffect.input;
        } else {
            currentNode.connect(this.outputGain);
        }
        
        // Add electric hum if enabled (mixed in parallel)
        if (this.electricHum) {
            this.electricHum.output.connect(this.outputGain);
        }
    }

    // Stop monitoring
    stop() {
        if (!this.isActive) return;

        // Disconnect and clean up
        if (this.sourceNode) {
            this.sourceNode.disconnect();
            this.sourceNode = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }

        // Stop electric hum
        if (this.electricHum) {
            this.electricHum.stop();
            this.electricHum = null;
        }

        this.isActive = false;
    }

    // Enable fast autotune with shallow vibe
    enableAutotune(strength = 0.3) {
        this.autotuneStrength = Math.max(0, Math.min(1, strength));
        
        // Disconnect old autotune if exists
        if (this.autotuneEffect) {
            this.autotuneEffect.input.disconnect();
            this.autotuneEffect.dryGain.disconnect();
            this.autotuneEffect.wetGain.disconnect();
        }
        
        // Create new autotune effect
        this.autotuneEffect = this.effects.createFastAutotune(this.autotuneStrength);
        
        // Reconnect routing
        if (this.isActive) {
            this.setupAudioRouting();
        }
    }

    // Disable autotune
    disableAutotune() {
        if (this.autotuneEffect) {
            this.autotuneEffect.input.disconnect();
            this.autotuneEffect.dryGain.disconnect();
            this.autotuneEffect.wetGain.disconnect();
            this.autotuneEffect = null;
            
            if (this.isActive) {
                this.setupAudioRouting();
            }
        }
    }

    // Enable electric hum
    enableElectricHum(intensity = 0.02, frequency = 60) {
        this.humIntensity = Math.max(0, Math.min(0.1, intensity));
        this.humFrequency = frequency;
        
        // Stop old hum if exists
        if (this.electricHum) {
            this.electricHum.stop();
        }
        
        // Create new electric hum
        this.electricHum = this.effects.createElectricHum(this.humFrequency, this.humIntensity);
        
        // Connect to output
        if (this.isActive) {
            this.setupAudioRouting();
        }
    }

    // Disable electric hum
    disableElectricHum() {
        if (this.electricHum) {
            this.electricHum.stop();
            this.electricHum.output.disconnect();
            this.electricHum = null;
        }
    }

    // Set autotune strength (0.0 to 1.0)
    setAutotuneStrength(strength) {
        this.autotuneStrength = Math.max(0, Math.min(1, strength));
        if (this.autotuneEffect && this.autotuneEffect.feedback) {
            this.autotuneEffect.feedback.gain.setValueAtTime(
                this.autotuneStrength * 0.5,
                this.audioContext.currentTime
            );
            this.autotuneEffect.dryGain.gain.setValueAtTime(
                1 - this.autotuneStrength,
                this.audioContext.currentTime
            );
            this.autotuneEffect.wetGain.gain.setValueAtTime(
                this.autotuneStrength,
                this.audioContext.currentTime
            );
        }
    }

    // Set hum intensity (0.0 to 0.1)
    setHumIntensity(intensity) {
        this.humIntensity = Math.max(0, Math.min(0.1, intensity));
        if (this.electricHum) {
            this.electricHum.setIntensity(this.humIntensity);
        }
    }

    // Set input gain
    setInputGain(gain) {
        this.inputGain.gain.setValueAtTime(gain, this.audioContext.currentTime);
    }

    // Set output gain
    setOutputGain(gain) {
        this.outputGain.gain.setValueAtTime(gain, this.audioContext.currentTime);
    }

    // Get monitoring status
    isMonitoring() {
        return this.isActive;
    }

    // Get current settings
    getSettings() {
        return {
            autotuneEnabled: this.autotuneEffect !== null,
            autotuneStrength: this.autotuneStrength,
            humEnabled: this.electricHum !== null,
            humIntensity: this.humIntensity,
            humFrequency: this.humFrequency
        };
    }
}

export default LiveMonitor;
