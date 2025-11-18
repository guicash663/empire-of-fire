// visualizer.js
// Live feedback visualization is now integrated in app.js
// This file is kept for potential future standalone visualizer features

// Initialize canvas with placeholder
window.addEventListener('load', () => {
    const canvas = document.getElementById('waveform');
    if (canvas) {
        const canvasContext = canvas.getContext('2d');
        canvasContext.fillStyle = '#2a2a2a';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw center line
        canvasContext.strokeStyle = '#333';
        canvasContext.lineWidth = 1;
        canvasContext.beginPath();
        canvasContext.moveTo(0, canvas.height / 2);
        canvasContext.lineTo(canvas.width, canvas.height / 2);
        canvasContext.stroke();
        
        // Add text
        canvasContext.fillStyle = '#555';
        canvasContext.font = '16px Arial';
        canvasContext.textAlign = 'center';
        canvasContext.fillText('Press Record to see live waveform', canvas.width / 2, canvas.height / 2 - 10);
    }
});