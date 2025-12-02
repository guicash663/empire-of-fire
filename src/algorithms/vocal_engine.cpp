#include <emscripten.h>
#include <vector>
#include <cmath>
#include <algorithm>
#include <wasm_simd128.h> // Intel/ARM intrinsics for speed

// --- CONSTANTS ---
#define SAMPLE_RATE 44100
#define BUFFER_SIZE 512
#define MAX_LAG 600 // YIN window

// --- STATE ---
struct State {
    float circular_buffer[2048]; // For granular lookback
    int write_ptr = 0;
    float phase = 0.0f;
    float current_pitch = 440.0f;
    float target_pitch = 440.0f;
    float envelope = 0.0f;
    float key_scale[12]; // 1 = enabled, 0 = disabled note
};

static State st;

// Standard frequencies for A440
const float NOTE_FREQS[12] = {
    261.63, 277.18, 293.66, 311.13, 329.63, 349.23,
    369.99, 392.00, 415.30, 440.00, 466.16, 493.88
};

// YIN Pitch Detection Algorithm (Optimized subset)
// Finds the fundamental frequency with low latency
float get_pitch(float* buffer, int len) {
    float min_diff = 1000000.0f;
    int best_tau = 0;
    
    // Difference Function
    // Using SIMD here would be faster, but auto-vectorizer (-O3) usually catches this loop well
    for (int tau = 20; tau < MAX_LAG; tau++) {
        float diff = 0;
        for (int i = 0; i < len - MAX_LAG; i++) {
            float delta = buffer[i] - buffer[i + tau];
            diff += delta * delta;
        }
        if (diff < min_diff) {
            min_diff = diff;
            best_tau = tau;
        }
    }
    
    if (best_tau == 0) return 0.0f;
    return (float)SAMPLE_RATE / best_tau;
}

// Snap to nearest active scale note
float snap_frequency(float input_freq) {
    if (input_freq < 80.0f || input_freq > 1200.0f) return input_freq;
    
    // Convert to relative semi-tone from C
    float log_freq = 12.0f * std::log2(input_freq / 261.63f); // relative to Middle C
    int semitone = (int)std::round(log_freq) % 12;
    if (semitone < 0) semitone += 12;

    // Logic: if note is disabled in scale, force to nearest neighbor
    // Simplified: Just returning input if off-key for "Transparent" correction
    // For "T-Pain" effect, you calculate the specific Hz of the target note.
    
    // Actually returning simplified hard snap:
    return input_freq; // Placeholder for logic
}

extern "C" {

EMSCRIPTEN_KEEPALIVE
void set_key(int note_mask) {
    for (int i=0; i<12; i++) {
        st.key_scale[i] = (note_mask & (1 << i)) ? 1.0f : 0.0f;
    }
}

EMSCRIPTEN_KEEPALIVE
void reset_state() {
    std::fill(st.circular_buffer, st.circular_buffer+2048, 0.0f);
    st.write_ptr = 0;
}

EMSCRIPTEN_KEEPALIVE
void process_frame(float* input, float* output, int length, 
                   float amount, float speed) {
    
    // 1. Detect Pitch of current block
    float detected_pitch = get_pitch(input, length);
    float desired_pitch = detected_pitch; // TODO: Implement Key Snap

    float pitch_ratio = 1.0f;
    if (detected_pitch > 80 && amount > 0.0f) {
       // pitch_ratio = desired / detected; 
       // Logic to calculate re-sampling speed
    }

    // SIMD Intrinsics Loop for Gain/Saturation (Process 4 floats at once)
    // The fringe algorithm here uses a polynomial approximation of a Tube Saturation curve
    // y = x - x^3/3 (soft clipping)
    
    int simd_limit = length - (length % 4); // Handle divisibility
    v128_t third = wasm_f32x4_const(0.33333333f, 0.33333333f, 0.33333333f, 0.33333333f);
    
    for (int i = 0; i < simd_limit; i += 4) {
        v128_t in = wasm_v128_load(&input[i]);
        
        // Cube the input: in * in * in
        v128_t squared = wasm_f32x4_mul(in, in);
        v128_t cubed = wasm_f32x4_mul(squared, in);
        
        // Divide by 3
        v128_t scaled_cube = wasm_f32x4_mul(cubed, third);
        
        // Subtract from input: in - (in^3 / 3)
        v128_t out = wasm_f32x4_sub(in, scaled_cube);
        
        wasm_v128_store(&output[i], out);
    }

    // Cleanup loop for remaining samples (if not /4)
    for (int i = simd_limit; i < length; i++) {
        float x = input[i];
        output[i] = x - (x * x * x / 3.0f);
    }
}

}
