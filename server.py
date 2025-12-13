#!/usr/bin/env python3
"""
Simple Flask server for audio capture and file management.
Provides /upload endpoint for audio chunks and /files endpoint for listing recordings.
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from datetime import datetime
from pathlib import Path

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'recordings'
ALLOWED_EXTENSIONS = {'webm', 'ogg', 'wav', 'mp3', 'mp4'}

# Ensure upload directory exists
Path(UPLOAD_FOLDER).mkdir(exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/')
def index():
    """Serve the main HTML template."""
    return render_template('golem-shell.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle audio chunk uploads."""
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400
    
    file = request.files['audio']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Generate unique filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_%f')
        extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f'recording_{timestamp}.{extension}'
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save the file
        file.save(filepath)
        
        # Check file size - if too small, might be empty/silent
        file_size = os.path.getsize(filepath)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'size': file_size
        }), 200
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route('/files', methods=['GET'])
def list_files():
    """List all uploaded audio files."""
    files = []
    if os.path.exists(UPLOAD_FOLDER):
        for filename in sorted(os.listdir(UPLOAD_FOLDER), reverse=True):
            if allowed_file(filename):
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                files.append({
                    'name': filename,
                    'size': os.path.getsize(filepath),
                    'modified': datetime.fromtimestamp(os.path.getmtime(filepath)).isoformat()
                })
    
    return jsonify({'files': files}), 200

@app.route('/recordings/<path:filename>')
def download_file(filename):
    """Serve recorded audio files."""
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/delete/<path:filename>', methods=['DELETE'])
def delete_file(filename):
    """Delete a specific recording file."""
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    
    if os.path.exists(filepath):
        os.remove(filepath)
        return jsonify({'success': True, 'message': 'File deleted'}), 200
    
    return jsonify({'error': 'File not found'}), 404

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
