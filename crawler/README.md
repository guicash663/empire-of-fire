# Web Crawler Application

A simple yet powerful web crawler that extracts text content from websites.

## Features

- 🕷️ Crawls up to 50 pages from a single domain
- 📄 Extracts visible text content (no HTML, scripts, or styles)
- 🔒 Single domain restriction for focused crawling
- 💾 Download results as a text file
- 🎨 Clean, responsive user interface
- ⚡ Real-time progress tracking
- 🛡️ Robust error handling

## Setup Instructions

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. Navigate to the crawler directory:
   ```bash
   cd crawler
   ```

2. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

   Or if you prefer using a virtual environment (recommended):
   ```bash
   # Create virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

## Usage

### Starting the Application

1. Run the Flask application:
   ```bash
   python app.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:5000
   ```

### Using the Web Interface

1. **Enter a URL**: Type the starting URL in the input field (e.g., `https://example.com`)
2. **Start Crawling**: Click the "Start Crawl" button
3. **Monitor Progress**: Watch the progress indicator showing crawling status
4. **View Results**: Browse through the extracted text from each page
5. **Download Results**: Click "Download Results" to save all extracted text as a .txt file

## API Endpoints

### POST /api/crawl
Start a new crawl job.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "pages_crawled": 10,
  "results": [
    {
      "url": "https://example.com/page1",
      "text": "Extracted text content...",
      "length": 1234
    }
  ]
}
```

### POST /api/download
Download crawl results as a text file.

**Request Body:**
```json
{
  "results": [...]
}
```

**Response:** Text file download

## Technical Details

### Technologies Used

- **Backend**: Flask (Python web framework)
- **Web Scraping**: BeautifulSoup4, Requests
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

### Crawler Behavior

- **Domain Restriction**: Only crawls pages within the same domain as the starting URL
- **Page Limit**: Maximum of 50 pages per crawl session
- **Text Extraction**: Removes all HTML tags, scripts, styles, and other non-visible elements
- **Error Handling**: Gracefully handles 404s, timeouts, and other network errors
- **Duplicate Prevention**: Tracks visited URLs to avoid crawling the same page twice

### Limitations

- Does not check robots.txt
- No rate limiting implemented
- Synchronous crawling (one page at a time)
- Maximum 10-second timeout per request

## File Structure

```
/crawler/
├── app.py                 # Flask application and crawler logic
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── static/
│   ├── style.css         # Stylesheet for the web interface
│   └── script.js         # Client-side JavaScript
└── templates/
    └── index.html        # Main HTML template
```

## Troubleshooting

### Common Issues

**Issue**: `ModuleNotFoundError: No module named 'flask'`
- **Solution**: Make sure you've installed all dependencies: `pip install -r requirements.txt`

**Issue**: Port 5000 already in use
- **Solution**: Stop other applications using port 5000, or modify the port in `app.py`

**Issue**: Crawler returns no results
- **Solution**: Check if the target website is accessible and doesn't block crawlers

**Issue**: Timeout errors
- **Solution**: The website may be slow or blocking requests. Try a different website or increase the timeout value in `app.py`

## Security Considerations

**⚠️ IMPORTANT: This application is designed for development and educational purposes.**

- The Flask app runs in **debug mode** by default. For production use:
  - Set `debug=False` in `app.py`
  - Use a production WSGI server like Gunicorn or uWSGI
  - Implement proper authentication and rate limiting
  - Add input validation and sanitization
- Always respect website terms of service and robots.txt when crawling
- This crawler does not implement rate limiting or robots.txt checking
- Only use this tool on websites you own or have explicit permission to crawl

## License

This project is part of the Empire of Fire repository and follows the same license terms.

## Security Note

This crawler is intended for educational purposes and testing on websites you own or have permission to crawl. Always respect website terms of service and robots.txt files when crawling in production environments.
