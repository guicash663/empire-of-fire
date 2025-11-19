# Termux Setup Guide for Empire of Fire

This guide will help you set up and run the Empire of Fire Recording Studio on your Android device using Termux.

## Prerequisites

- Android device (phone or tablet)
- Termux app installed from F-Droid (recommended) or Google Play Store
- At least 500MB of free storage space

## Installation Steps

### 1. Install Termux

Download and install Termux from one of these sources:
- **F-Droid** (Recommended): https://f-droid.org/packages/com.termux/
- Google Play Store (Note: May have outdated version)

### 2. Update Termux Packages

Open Termux and run:
```bash
pkg update && pkg upgrade -y
```

### 3. Install Required Packages

Install Node.js and Git:
```bash
pkg install -y nodejs git
```

Verify installation:
```bash
node --version
npm --version
git --version
```

### 4. Clone the Repository

```bash
cd ~
git clone https://github.com/guicash663/empire-of-fire.git
cd empire-of-fire
```

### 5. Start the Server

```bash
node server.js
```

Or use npm:
```bash
npm start
```

The server will start on port 3000 by default.

### 6. Access the Application

#### Option A: On the same device
1. Open Chrome or Firefox on your Android device
2. Navigate to: `http://localhost:3000`

#### Option B: From another device on the same network
1. Find your Android device's IP address:
   ```bash
   ifconfig wlan0
   ```
   Look for the `inet` address (e.g., 192.168.1.100)

2. On another device, open a browser and go to:
   ```
   http://[your-device-ip]:3000
   ```

## Configuration Options

### Change Port

If port 3000 is already in use:
```bash
PORT=8080 node server.js
```

### Change Host

To bind to a specific network interface:
```bash
HOST=127.0.0.1 node server.js
```

## Usage Tips for Termux

### Run in Background

To keep the server running when you exit Termux:
```bash
nohup node server.js &
```

### Stop Background Server

Find the process:
```bash
ps aux | grep node
```

Kill the process:
```bash
kill [PID]
```

### Automatic Startup

Create a startup script:
```bash
echo 'cd ~/empire-of-fire && node server.js' > ~/start-studio.sh
chmod +x ~/start-studio.sh
```

Run it:
```bash
~/start-studio.sh
```

### Grant Microphone Permission

For recording features to work:
1. Install Termux:API: `pkg install termux-api`
2. Grant microphone permissions in Android settings
3. The Web Audio API will request permissions when you access the app

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep 3000

# Use a different port
PORT=8080 node server.js
```

### Can't Access from Browser
- Make sure the server is running (check Termux window)
- Try `http://localhost:3000` instead of `http://127.0.0.1:3000`
- Check if your browser supports Web Audio API
- Clear browser cache and reload

### Recording Not Working
- Grant microphone permissions in Android settings
- Use Chrome or Firefox (they have better Web Audio API support)
- Make sure you're accessing via HTTPS or localhost (browsers require secure context for microphone access)

### Out of Memory
If you encounter memory issues:
```bash
# Close other apps
# Clear Termux cache
pkg clean

# Restart Termux
exit
# Then reopen Termux and start the server again
```

## Performance Tips

1. **Close unnecessary apps** - Free up RAM for better audio processing
2. **Use a modern browser** - Chrome or Firefox recommended
3. **Reduce audio quality** - If experiencing lag, use lower quality audio files
4. **Keep device charged** - Audio processing is CPU-intensive

## Features Available in Termux Version

✅ Full recording studio interface
✅ Audio file upload and playback
✅ Sample cutting and soundboard
✅ Multi-track display
✅ Waveform visualization
✅ Effects controls (reverb, echo, compressor)
✅ Auto-tune interface
✅ File download capabilities

## Security Notes

- The server binds to `0.0.0.0` by default, making it accessible on your local network
- If you only want local access, use: `HOST=127.0.0.1 node server.js`
- Don't expose the server to the public internet without proper security measures

## Additional Resources

- Termux Wiki: https://wiki.termux.com/
- Node.js Documentation: https://nodejs.org/docs/
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

## Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs in the Termux terminal
3. Open an issue on GitHub: https://github.com/guicash663/empire-of-fire/issues

## Updates

To update to the latest version:
```bash
cd ~/empire-of-fire
git pull
node server.js
```

---

**Enjoy creating music on your Android device with Empire of Fire! 🎵🔥**
