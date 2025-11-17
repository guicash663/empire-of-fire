// sample-manager.js
// Optimized audio sample management with low-latency playback and buffer pooling

class SampleManager {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.samples = []; // Array of sample objects
        this.currentAudioBuffer = null; // Currently loaded audio file
        this.maxSamples = 12; // Maximum soundboard pads
        
        // Buffer source pool for reduced latency and garbage collection
        this.sourcePool = [];
        this.maxPoolSize = 20;
        
        // Pre-create master gain node for all samples
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.8;
        this.masterGain.connect(this.audioContext.destination);
    }

    // Load an audio file with optimized decoding
    async loadAudioFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            this.currentAudioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            return this.currentAudioBuffer;
        } catch (error) {
            console.error('Error loading audio file:', error);
            throw error;
        }
    }

    // Extract a sample from the loaded audio buffer (optimized for performance)
    extractSample(startTime, endTime, name = 'Sample') {
        if (!this.currentAudioBuffer) {
            throw new Error('No audio file loaded');
        }

        const sampleRate = this.currentAudioBuffer.sampleRate;
        const startFrame = Math.floor(startTime * sampleRate);
        const endFrame = Math.floor(endTime * sampleRate);
        const frameCount = endFrame - startFrame;

        if (frameCount <= 0) {
            throw new Error('Invalid time range');
        }

        // Create a new buffer for the sample
        const numberOfChannels = this.currentAudioBuffer.numberOfChannels;
        const sampleBuffer = this.audioContext.createBuffer(
            numberOfChannels,
            frameCount,
            sampleRate
        );

        // Optimized copy with typed array operations
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sourceData = this.currentAudioBuffer.getChannelData(channel);
            const sampleData = sampleBuffer.getChannelData(channel);
            // Use subarray for better performance
            sampleData.set(sourceData.subarray(startFrame, endFrame));
        }

        return {
            name: name,
            buffer: sampleBuffer,
            duration: frameCount / sampleRate,
            delay1: 0, // Primary delay in seconds
            delay2: 0  // Secondary delay in seconds
        };
    }

    // Add a sample to the soundboard
    addSample(sample) {
        if (this.samples.length >= this.maxSamples) {
            throw new Error(`Maximum ${this.maxSamples} samples allowed`);
        }
        
        const sampleWithId = {
            ...sample,
            id: Date.now() + Math.random() // Unique ID
        };
        
        this.samples.push(sampleWithId);
        return sampleWithId;
    }

    // Remove a sample from the soundboard
    removeSample(sampleId) {
        const index = this.samples.findIndex(s => s.id === sampleId);
        if (index !== -1) {
            this.samples.splice(index, 1);
            return true;
        }
        return false;
    }

    // Update sample delays
    updateSampleDelays(sampleId, delay1, delay2) {
        const sample = this.samples.find(s => s.id === sampleId);
        if (sample) {
            sample.delay1 = delay1;
            sample.delay2 = delay2;
            return true;
        }
        return false;
    }

    // Optimized buffer source creation with pooling
    getBufferSource() {
        // Try to reuse from pool
        if (this.sourcePool.length > 0) {
            return this.sourcePool.pop();
        }
        
        // Create new if pool is empty
        return this.audioContext.createBufferSource();
    }

    // Return source to pool for reuse (reduces garbage collection)
    returnBufferSource(source) {
        if (this.sourcePool.length < this.maxPoolSize) {
            // Reset source state
            source.disconnect();
            this.sourcePool.push(source);
        }
    }

    // Play a sample with its configured delays (optimized for minimal latency)
    playSample(sampleId) {
        const sample = this.samples.find(s => s.id === sampleId);
        if (!sample) {
            console.error('Sample not found');
            return;
        }

        const currentTime = this.audioContext.currentTime;
        
        // Play with primary delay - use minimal latency path
        this.playSampleBufferOptimized(sample.buffer, currentTime + sample.delay1);
        
        // Play with secondary delay (if different from delay1)
        if (sample.delay2 > 0 && Math.abs(sample.delay2 - sample.delay1) > 0.001) {
            this.playSampleBufferOptimized(sample.buffer, currentTime + sample.delay2);
        }
    }

    // Optimized buffer playback with minimal latency
    playSampleBufferOptimized(buffer, startTime) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        // Direct connection to master gain (pre-connected to destination)
        source.connect(this.masterGain);
        
        // Schedule start with precise timing
        source.start(startTime);
        
        // Clean up after playback
        source.onended = () => {
            source.disconnect();
        };
    }

    // Helper method to play a buffer at a specific time (legacy compatibility)
    playSampleBuffer(buffer, startTime) {
        this.playSampleBufferOptimized(buffer, startTime);
    }

    // Quick play without delay (for preview/instant feedback)
    quickPlay(buffer) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.masterGain);
        source.start(0);
        source.onended = () => source.disconnect();
        return source;
    }

    // Batch play multiple samples (optimized for sequencing)
    playSamples(sampleIds, startTime = null) {
        const baseTime = startTime || this.audioContext.currentTime;
        sampleIds.forEach((id, index) => {
            const sample = this.samples.find(s => s.id === id);
            if (sample) {
                this.playSampleBufferOptimized(sample.buffer, baseTime + (index * 0.001));
            }
        });
    }

    // Get all samples
    getSamples() {
        return this.samples;
    }

    // Get audio buffer duration
    getAudioDuration() {
        return this.currentAudioBuffer ? this.currentAudioBuffer.duration : 0;
    }

    // Clear all samples and reset pool
    clearSamples() {
        this.samples = [];
        this.sourcePool = [];
    }

    // Set master volume
    setMasterVolume(volume) {
        this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }

    // Get current master volume
    getMasterVolume() {
        return this.masterGain.gain.value;
    }
}

export default SampleManager;
