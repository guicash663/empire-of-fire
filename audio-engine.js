// audio-engine.js

// Core Recording, Playback, and Audio File Import/Export using Web Audio API

class AudioEngine {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    async startRecording() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);
        };

        this.mediaRecorder.start();
    }

    stopRecording() {
        return new Promise((resolve) => {
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                resolve(audioBlob);
            };
            this.mediaRecorder.stop();
        });
    }

    async playAudio(audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
    }

    async importAudio(file) {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        return audioBuffer;
    }

    async exportAudio(audioBuffer) {
        const offlineContext = new OfflineAudioContext(audioBuffer.numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();

        const renderedBuffer = await offlineContext.startRendering();
        const wavData = this.audioBufferToWav(renderedBuffer);
        return new Blob([wavData], { type: 'audio/wav' });
    }

    audioBufferToWav(buffer) {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2 + 44;
        const bufferData = new ArrayBuffer(length);
        const view = new DataView(bufferData);
        this.writeWavHeader(view, buffer);
        this.writeWavSamples(view, buffer);
        return bufferData;
    }

    writeWavHeader(view, buffer) {
        // Write WAV header
        // Sample WAV header specs
        // 'RIFF' + (file length - 8 bytes) + 'WAVE'
        let offset = 0;
        view.setUint32(offset, 0x52494646, false); // 'RIFF'
        offset += 4;
        view.setUint32(offset, 0, true); // file length placeholder
        offset += 4;
        view.setUint32(offset, 0x57415645, false); // 'WAVE'
        offset += 4;
        view.setUint32(offset, 0x666d7420, false); // 'fmt '
        offset += 4;
        view.setUint32(offset, 16, true); // Subchunk1Size (16 for PCM)
        view.setUint16(offset, 1, true); // AudioFormat (PCM = 1)
        offset += 2;
        view.setUint16(offset, numOfChan, true); // NumChannels
        offset += 2;
        view.setUint32(offset, buffer.sampleRate, true); // SampleRate
        view.setUint32(offset, buffer.sampleRate * numOfChan * 2, true); // ByteRate
        view.setUint16(offset, numOfChan * 2, true); // BlockAlign
        view.setUint16(offset, 16, true); // BitsPerSample
        offset += 2;
        view.setUint32(offset, 0x64617461, false); // 'data'
        offset += 4;
        view.setUint32(offset, buffer.length * numOfChan * 2, true); // Subchunk2Size

        // Update the file length
        view.setUint32(4, offset - 8, true);
    }

    writeWavSamples(view, buffer) {
        // Write the PCM samples
        let offset = 44; // Skip WAV header
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let sample = 0; sample < channelData.length; sample++) {
                view.setInt16(offset, channelData[sample] * 0x7FFF, true);
                offset += 2;
            }
        }
    }
}

export default AudioEngine;
