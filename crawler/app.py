from flask import Flask, render_template, request, jsonify, send_file
from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin, urlparse
from collections import deque
import io

app = Flask(__name__)

class WebCrawler:
    def __init__(self, start_url, max_pages=50):
        self.start_url = start_url
        self.max_pages = max_pages
        self.visited = set()
        self.results = []
        self.base_domain = urlparse(start_url).netloc
        
    def is_same_domain(self, url):
        """Check if URL belongs to the same domain"""
        return urlparse(url).netloc == self.base_domain
    
    def extract_text(self, html):
        """Extract visible text from HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove script and style elements
        for script in soup(['script', 'style', 'meta', 'link', 'noscript']):
            script.decompose()
        
        # Get text
        text = soup.get_text(separator=' ', strip=True)
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        return text
    
    def get_links(self, html, current_url):
        """Extract all links from HTML"""
        soup = BeautifulSoup(html, 'html.parser')
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link['href']
            # Convert relative URLs to absolute
            absolute_url = urljoin(current_url, href)
            # Only include HTTP(S) URLs
            if absolute_url.startswith(('http://', 'https://')):
                links.append(absolute_url)
        
        return links
    
    def crawl(self):
        """Crawl the website starting from start_url"""
        queue = deque([self.start_url])
        
        while queue and len(self.visited) < self.max_pages:
            url = queue.popleft()
            
            # Skip if already visited
            if url in self.visited:
                continue
            
            # Skip if not same domain
            if not self.is_same_domain(url):
                continue
            
            try:
                # Make request with timeout
                response = requests.get(url, timeout=10, allow_redirects=True)
                
                # Check if successful
                if response.status_code != 200:
                    continue
                
                # Check if HTML content
                content_type = response.headers.get('Content-Type', '')
                if 'text/html' not in content_type:
                    continue
                
                # Mark as visited
                self.visited.add(url)
                
                # Extract text
                text = self.extract_text(response.text)
                
                # Store result
                self.results.append({
                    'url': url,
                    'text': text,
                    'length': len(text)
                })
                
                # Extract and queue new links
                links = self.get_links(response.text, url)
                for link in links:
                    if link not in self.visited:
                        queue.append(link)
                
            except requests.exceptions.Timeout:
                # Handle timeout
                continue
            except requests.exceptions.RequestException:
                # Handle other request errors
                continue
            except Exception:
                # Handle any other errors
                continue
        
        return {
            'success': True,
            'pages_crawled': len(self.visited),
            'results': self.results
        }

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/crawl', methods=['POST'])
def crawl():
    """API endpoint to start crawling"""
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
    
    url = data['url']
    
    # Validate URL
    try:
        parsed = urlparse(url)
        if not parsed.scheme or not parsed.netloc:
            return jsonify({'error': 'Invalid URL format'}), 400
    except Exception:
        return jsonify({'error': 'Invalid URL'}), 400
    
    # Create crawler and start crawling
    crawler = WebCrawler(url, max_pages=50)
    results = crawler.crawl()
    
    return jsonify(results)

@app.route('/api/download', methods=['POST'])
def download():
    """API endpoint to download results as text file"""
    data = request.get_json()
    
    if not data or 'results' not in data:
        return jsonify({'error': 'Results data is required'}), 400
    
    results = data['results']
    
    # Create text file content
    content = []
    content.append("=" * 80)
    content.append("WEB CRAWLER RESULTS")
    content.append("=" * 80)
    content.append("")
    
    for i, result in enumerate(results, 1):
        content.append(f"PAGE {i}: {result['url']}")
        content.append("-" * 80)
        content.append(result['text'])
        content.append("")
        content.append("=" * 80)
        content.append("")
    
    text_content = '\n'.join(content)
    
    # Create file-like object
    file_obj = io.BytesIO(text_content.encode('utf-8'))
    file_obj.seek(0)
    
    return send_file(
        file_obj,
        mimetype='text/plain',
        as_attachment=True,
        download_name='crawler_results.txt'
    )

if __name__ == '__main__':
    app.run(debug=True, port=5000)
