# Empire of Fire - Quick Start Guide

## 🚀 Get Started in 3 Steps

### For Desktop/Laptop:
```bash
# 1. Clone the repository
git clone https://github.com/guicash663/empire-of-fire.git

# 2. Navigate to directory
cd empire-of-fire

# 3. Start the server
node server.js
```

### For Termux (Android):
```bash
# 1. Install dependencies
pkg install nodejs git

# 2. Clone and navigate
git clone https://github.com/guicash663/empire-of-fire.git
cd empire-of-fire

# 3. Start the server
node server.js
```

## 🌐 Access the App

Open your browser and go to: **http://localhost:3000**

## 📝 Alternative Start Methods

```bash
npm start          # Using npm
./start.sh         # Unix/Linux/macOS script
start.bat          # Windows script
```

## ⚙️ Configuration

```bash
PORT=8080 node server.js              # Change port
HOST=127.0.0.1 node server.js         # Localhost only
PORT=8080 HOST=0.0.0.0 node server.js # Custom settings
```

## 🎵 Features

- ✅ Audio Recording & Playback
- ✅ Sample Cutter & Soundboard
- ✅ Waveform Visualization
- ✅ Audio Effects (Reverb, Echo, Compressor)
- ✅ Auto-Tune Interface
- ✅ File Upload/Download

## 📖 Need More Help?

- **Termux Users**: See [TERMUX_SETUP.md](TERMUX_SETUP.md)
- **Full Documentation**: See [README.md](README.md)

## 🐛 Troubleshooting

**Port already in use?**
```bash
PORT=8080 node server.js
```

**Can't access from browser?**
- Check if server is running
- Try http://127.0.0.1:3000
- Clear browser cache

**Recording not working?**
- Grant microphone permissions
- Use Chrome or Firefox
- Access via localhost or HTTPS

---

**Happy music making! 🎸🎹🎤**
