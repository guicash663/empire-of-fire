// app.js

// This file wires up the recording studio UI with the audio engine, visualizer, and all recording controls.

function init() {
    // Initialize audio engine
    const audioEngine = new AudioEngine();

    // Initialize visualizer
    const visualizer = new Visualizer();

    // Setup recording controls
    const recordButton = document.getElementById('record');
    const stopButton = document.getElementById('stop');

    recordButton.addEventListener('click', () => {
        audioEngine.startRecording();
        visualizer.start();
    });

    stopButton.addEventListener('click', () => {
        audioEngine.stopRecording();
        visualizer.stop();
    });
}

// Run the application
window.onload = init;