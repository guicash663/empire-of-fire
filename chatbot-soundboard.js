// chatbot-soundboard.js
// 300-key soundboard with AI chatbot control for advanced audio triggering

import { DrumSynth } from './synths.js';

class ChatbotSoundboard {
    constructor(audioContext) {
        this.audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
        this.drumSynth = new DrumSynth(this.audioContext);
        
        // Soundboard configuration
        this.keyCount = 300;
        this.keys = [];
        this.activeKeys = new Set();
        
        // Chatbot state
        this.chatbotEnabled = false;
        this.chatbotSpeed = 100; // ms between triggers
        this.chatbotPattern = 'random'; // 'random', 'sequence', 'rhythm', 'melody'
        this.chatbotIntervalId = null;
        
        // Master output
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.6;
        this.masterGain.connect(this.audioContext.destination);
        
        // Initialize keys with different sounds
        this.initializeKeys();
    }

    // Initialize all 300 keys with varied sounds
    initializeKeys() {
        for (let i = 0; i < this.keyCount; i++) {
            // Create different sound types across the range
            const soundType = this.getSoundTypeForKey(i);
            const frequency = this.getFrequencyForKey(i);
            
            this.keys.push({
                id: i,
                soundType: soundType,
                frequency: frequency,
                velocity: 0.7,
                color: this.getColorForKey(i),
                active: false
            });
        }
    }

    // Determine sound type based on key position
    getSoundTypeForKey(keyIndex) {
        if (keyIndex < 75) return 'kick';
        if (keyIndex < 150) return 'snare';
        if (keyIndex < 225) return 'hihat';
        return 'tone';
    }

    // Calculate frequency for tonal keys
    getFrequencyForKey(keyIndex) {
        // Map keys to musical frequencies (C2 to C7)
        const baseFreq = 65.41; // C2
        const semitones = (keyIndex % 60); // 5 octaves worth
        return baseFreq * Math.pow(2, semitones / 12);
    }

    // Get color for visual feedback
    getColorForKey(keyIndex) {
        const hue = (keyIndex / this.keyCount) * 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    // Play a specific key
    playKey(keyIndex, velocity = 0.7) {
        if (keyIndex < 0 || keyIndex >= this.keyCount) return;
        
        const key = this.keys[keyIndex];
        const now = this.audioContext.currentTime;
        
        switch (key.soundType) {
            case 'kick':
                this.drumSynth.playKick(velocity);
                break;
            case 'snare':
                this.drumSynth.playSnare(velocity);
                break;
            case 'hihat':
                this.drumSynth.playHiHat(velocity, false);
                break;
            case 'tone':
                this.playTone(key.frequency, 0.1, velocity);
                break;
        }
        
        // Mark key as active for visual feedback
        key.active = true;
        this.activeKeys.add(keyIndex);
        
        // Auto-deactivate after short time
        setTimeout(() => {
            key.active = false;
            this.activeKeys.delete(keyIndex);
            if (this.onKeyStateChange) {
                this.onKeyStateChange(keyIndex, false);
            }
        }, 100);
        
        // Trigger callback for UI update
        if (this.onKeyStateChange) {
            this.onKeyStateChange(keyIndex, true);
        }
    }

    // Play a tone for tonal keys
    playTone(frequency, duration, velocity) {
        const osc = this.audioContext.createOscillator();
        const env = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = frequency;
        
        const now = this.audioContext.currentTime;
        env.gain.setValueAtTime(velocity, now);
        env.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        osc.connect(env);
        env.connect(this.masterGain);
        
        osc.start(now);
        osc.stop(now + duration);
    }

    // Start chatbot auto-play
    startChatbot() {
        if (this.chatbotEnabled) return;
        
        this.chatbotEnabled = true;
        this.runChatbotLoop();
    }

    // Stop chatbot
    stopChatbot() {
        this.chatbotEnabled = false;
        if (this.chatbotIntervalId) {
            clearTimeout(this.chatbotIntervalId);
            this.chatbotIntervalId = null;
        }
    }

    // Main chatbot loop
    runChatbotLoop() {
        if (!this.chatbotEnabled) return;
        
        const keysToPlay = this.selectChatbotKeys();
        
        keysToPlay.forEach(keyIndex => {
            this.playKey(keyIndex, Math.random() * 0.5 + 0.5);
        });
        
        // Schedule next iteration
        this.chatbotIntervalId = setTimeout(() => {
            this.runChatbotLoop();
        }, this.chatbotSpeed);
    }

    // Select which keys the chatbot should play
    selectChatbotKeys() {
        const keys = [];
        
        switch (this.chatbotPattern) {
            case 'random':
                // Play 1-3 random keys
                const count = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < count; i++) {
                    keys.push(Math.floor(Math.random() * this.keyCount));
                }
                break;
                
            case 'sequence':
                // Play sequential keys
                const startKey = Math.floor(Math.random() * (this.keyCount - 10));
                for (let i = 0; i < 3; i++) {
                    keys.push(startKey + i);
                }
                break;
                
            case 'rhythm':
                // Play rhythmic pattern (drums)
                if (Math.random() > 0.5) keys.push(Math.floor(Math.random() * 75)); // Kick
                if (Math.random() > 0.3) keys.push(75 + Math.floor(Math.random() * 75)); // Snare
                if (Math.random() > 0.2) keys.push(150 + Math.floor(Math.random() * 75)); // Hihat
                break;
                
            case 'melody':
                // Play melodic pattern (tones)
                const scale = [0, 2, 4, 5, 7, 9, 11]; // Major scale
                const rootKey = 225 + Math.floor(Math.random() * 12);
                const scaleStep = scale[Math.floor(Math.random() * scale.length)];
                keys.push(rootKey + scaleStep);
                break;
        }
        
        return keys;
    }

    // Set chatbot speed (ms between triggers)
    setChatbotSpeed(speed) {
        this.chatbotSpeed = Math.max(10, Math.min(2000, speed));
    }

    // Set chatbot pattern
    setChatbotPattern(pattern) {
        if (['random', 'sequence', 'rhythm', 'melody'].includes(pattern)) {
            this.chatbotPattern = pattern;
        }
    }

    // Play multiple keys at once
    playChord(keyIndices) {
        keyIndices.forEach(index => this.playKey(index));
    }

    // Get key information
    getKey(keyIndex) {
        return this.keys[keyIndex];
    }

    // Get all keys
    getAllKeys() {
        return this.keys;
    }

    // Get active keys
    getActiveKeys() {
        return Array.from(this.activeKeys);
    }

    // Clear all active keys
    clearActiveKeys() {
        this.activeKeys.clear();
        this.keys.forEach(key => key.active = false);
    }

    // Set master volume
    setVolume(volume) {
        this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }

    // Get chatbot status
    getChatbotStatus() {
        return {
            enabled: this.chatbotEnabled,
            speed: this.chatbotSpeed,
            pattern: this.chatbotPattern
        };
    }
}

export default ChatbotSoundboard;
