#!/bin/bash
# generate-assets.sh - Generate placeholder app icons and splash screens

echo "Generating placeholder app assets..."

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "Warning: ImageMagick not found. Skipping asset generation."
    echo "To generate actual icons, install ImageMagick and run this script again."
    echo "Creating placeholder README instead..."
    
    cat > res/ASSETS_README.md << 'EOF'
# App Assets

This directory contains placeholder assets for the Android application.

## Icons Required

Place the following icon files in `res/icon/android/`:
- `ldpi.png` (36x36)
- `mdpi.png` (48x48)
- `hdpi.png` (72x72)
- `xhdpi.png` (96x96)
- `xxhdpi.png` (144x144)
- `xxxhdpi.png` (192x192)

## Splash Screens Required

Place the following splash screen files in `res/screen/android/`:

Portrait:
- `splash-port-ldpi.png` (200x320)
- `splash-port-mdpi.png` (320x480)
- `splash-port-hdpi.png` (480x800)
- `splash-port-xhdpi.png` (720x1280)
- `splash-port-xxhdpi.png` (960x1600)
- `splash-port-xxxhdpi.png` (1280x1920)

Landscape:
- `splash-land-ldpi.png` (320x200)
- `splash-land-mdpi.png` (480x320)
- `splash-land-hdpi.png` (800x480)
- `splash-land-xhdpi.png` (1280x720)
- `splash-land-xxhdpi.png` (1600x960)
- `splash-land-xxxhdpi.png` (1920x1280)

## Design Guidelines

- Use a music-themed icon (e.g., musical note, waveform, microphone)
- Background color: #121212 (dark)
- Primary color: #1DB954 (Spotify green)
- Keep designs simple and recognizable at small sizes

## Generating Assets

You can use online tools like:
- https://icon.kitchen/ (for app icons)
- https://apetools.webprofusion.com/app/#/tools/imagegorilla (for splash screens)

Or use this script if you have ImageMagick installed.
EOF
    exit 0
fi

# Create a simple icon with music note emoji/text
create_icon() {
    local size=$1
    local output=$2
    
    convert -size ${size}x${size} xc:"#121212" \
        -gravity center \
        -fill "#1DB954" \
        -pointsize $((size/2)) \
        -font "DejaVu-Sans-Bold" \
        -annotate +0+0 "♪" \
        "$output"
}

# Create splash screen
create_splash() {
    local width=$1
    local height=$2
    local output=$3
    
    local fontsize=$((height/8))
    
    convert -size ${width}x${height} xc:"#121212" \
        -gravity center \
        -fill "#1DB954" \
        -pointsize $fontsize \
        -font "DejaVu-Sans-Bold" \
        -annotate +0-$((height/8)) "♪" \
        -fill "#E0E0E0" \
        -pointsize $((fontsize/3)) \
        -annotate +0+$((height/8)) "Empire of Fire\nMusic Studio" \
        "$output"
}

# Generate icons
echo "Generating icons..."
create_icon 36 "res/icon/android/ldpi.png"
create_icon 48 "res/icon/android/mdpi.png"
create_icon 72 "res/icon/android/hdpi.png"
create_icon 96 "res/icon/android/xhdpi.png"
create_icon 144 "res/icon/android/xxhdpi.png"
create_icon 192 "res/icon/android/xxxhdpi.png"

# Generate portrait splash screens
echo "Generating portrait splash screens..."
create_splash 200 320 "res/screen/android/splash-port-ldpi.png"
create_splash 320 480 "res/screen/android/splash-port-mdpi.png"
create_splash 480 800 "res/screen/android/splash-port-hdpi.png"
create_splash 720 1280 "res/screen/android/splash-port-xhdpi.png"
create_splash 960 1600 "res/screen/android/splash-port-xxhdpi.png"
create_splash 1280 1920 "res/screen/android/splash-port-xxxhdpi.png"

# Generate landscape splash screens
echo "Generating landscape splash screens..."
create_splash 320 200 "res/screen/android/splash-land-ldpi.png"
create_splash 480 320 "res/screen/android/splash-land-mdpi.png"
create_splash 800 480 "res/screen/android/splash-land-hdpi.png"
create_splash 1280 720 "res/screen/android/splash-land-xhdpi.png"
create_splash 1600 960 "res/screen/android/splash-land-xxhdpi.png"
create_splash 1920 1280 "res/screen/android/splash-land-xxxhdpi.png"

echo "Asset generation complete!"
echo "All icons and splash screens have been created in the res/ directory."
