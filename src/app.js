let audioCtx, source, scriptNode, analyser, mediaRecorder;
let wasm, chunks = [];
let isRec = false, isLive = false;

// Helpers for the circular buffer
const BUFFER_SIZE = 512;
const inputPtr = 0, outputPtr = 512 * 4;

// Load Core
createAudioCore().then(module => {
    wasm = module;
    const ram = wasm._malloc(BUFFER_SIZE * 8); // Input + Output floats
    
    document.getElementById('boot').innerText = "POWER ON";
    document.getElementById('boot').disabled = false;
    
    window.processAudioChunk = (inputArr) => {
        wasm.HEAPF32.set(inputArr, ram >> 2);
        
        // Trigger optimized C++ vector pipeline
        wasm._process_frame(ram, ram + (BUFFER_SIZE*4), BUFFER_SIZE, 0.8, 0.5);
        
        return wasm.HEAPF32.subarray(
            (ram + (BUFFER_SIZE*4)) >> 2,
            (ram + (BUFFER_SIZE*8)) >> 2
        );
    };
});

// START
document.getElementById('boot').onclick = async () => {
    if(isLive) { location.reload(); return; } // Reset button hack for stability
    
    audioCtx = new AudioContext({latencyHint: 'playback'}); // 'playback' gives more stability than 'interactive' for intensive stuff
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    source = audioCtx.createMediaStreamSource(stream);
    
    // Recorder Destination
    const dest = audioCtx.createMediaStreamDestination();
    mediaRecorder = new MediaRecorder(dest.stream);
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = saveRecording;

    scriptNode = audioCtx.createScriptProcessor(BUFFER_SIZE, 1, 1);
    scriptNode.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const output = e.outputBuffer.getChannelData(0);
        
        const processed = window.processAudioChunk(input);
        output.set(processed);
    };

    source.connect(scriptNode);
    scriptNode.connect(audioCtx.destination); // Hear it
    scriptNode.connect(dest); // Record it
    
    setupVisuals();
    
    isLive = true;
    document.getElementById('boot').classList.add('live');
    document.getElementById('boot').innerText = "SHUT DOWN";
    document.getElementById('rec').disabled = false;
};

document.getElementById('rec').onclick = () => {
    if(!isRec) {
        chunks = [];
        mediaRecorder.start();
        document.getElementById('rec').innerText = "STOP & SAVE";
        document.getElementById('rec').classList.add('recording');
    } else {
        mediaRecorder.stop();
        document.getElementById('rec').innerText = "RECORD";
        document.getElementById('rec').classList.remove('recording');
    }
    isRec = !isRec;
};

function saveRecording() {
    const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vocal_lab_session_${Date.now()}.ogg`;
    a.click();
}

function setupVisuals() {
    analyser = audioCtx.createAnalyser();
    scriptNode.connect(analyser);
    const cvs = document.getElementById('vis');
    const ctx = cvs.getContext('2d');
    const data = new Uint8Array(analyser.frequencyBinCount);
    
    function loop() {
        if(!isLive) return;
        requestAnimationFrame(loop);
        analyser.getByteTimeDomainData(data);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(0,0,cvs.width,cvs.height);
        ctx.fillStyle = '#0f0';
        
        for(let i=0; i<cvs.width; i+=2) {
            const v = data[Math.floor((i/cvs.width) * data.length)] / 128.0;
            ctx.fillRect(i, cvs.height/2 - (v*cvs.height/2) + 20, 2, v*50);
        }
    }
    loop();
}
