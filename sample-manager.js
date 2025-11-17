// sample-manager.js
// Manages audio samples: loading, cutting, storing, and triggering with delays

class SampleManager {
    constructor(audioContext) {
        this.audioContext = audioContext;
        this.samples = []; // Array of sample objects
        this.currentAudioBuffer = null; // Currently loaded audio file
        this.maxSamples = 12; // Maximum soundboard pads
    }

    // Load an audio file
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

    // Extract a sample from the loaded audio buffer
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

        // Copy the audio data
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sourceData = this.currentAudioBuffer.getChannelData(channel);
            const sampleData = sampleBuffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                sampleData[i] = sourceData[startFrame + i];
            }
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

    // Play a sample with its configured delays
    playSample(sampleId) {
        const sample = this.samples.find(s => s.id === sampleId);
        if (!sample) {
            console.error('Sample not found');
            return;
        }

        const currentTime = this.audioContext.currentTime;
        
        // Play with primary delay
        this.playSampleBuffer(sample.buffer, currentTime + sample.delay1);
        
        // Play with secondary delay (if different from delay1)
        if (sample.delay2 > 0 && sample.delay2 !== sample.delay1) {
            this.playSampleBuffer(sample.buffer, currentTime + sample.delay2);
        }
    }

    // Helper method to play a buffer at a specific time
    playSampleBuffer(buffer, startTime) {
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start(startTime);
    }

    // Get all samples
    getSamples() {
        return this.samples;
    }

    // Get audio buffer duration
    getAudioDuration() {
        return this.currentAudioBuffer ? this.currentAudioBuffer.duration : 0;
    }

    // Clear all samples
    clearSamples() {
        this.samples = [];
    }
}

export default SampleManager;
