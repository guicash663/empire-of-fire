#!/bin/bash

# Empire of Fire - Quick Start Script
# This script starts the recording studio server

echo "Starting Empire of Fire Recording Studio..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo ""
    echo "Please install Node.js:"
    echo "  - On Termux: pkg install nodejs"
    echo "  - On Ubuntu/Debian: sudo apt install nodejs"
    echo "  - On macOS: brew install node"
    echo "  - Or download from: https://nodejs.org/"
    echo ""
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 12 ]; then
    echo "⚠️  Warning: Node.js version 12 or higher is recommended."
    echo "   Current version: $(node -v)"
    echo ""
fi

# Start the server
node server.js
