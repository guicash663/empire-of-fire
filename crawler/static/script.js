// DOM Elements
const urlInput = document.getElementById('urlInput');
const startBtn = document.getElementById('startBtn');
const statusSection = document.getElementById('statusSection');
const statusText = document.getElementById('statusText');
const pagesCount = document.getElementById('pagesCount');
const resultsSection = document.getElementById('resultsSection');
const resultsContainer = document.getElementById('resultsContainer');
const resultSummary = document.getElementById('resultSummary');
const downloadBtn = document.getElementById('downloadBtn');

// State
let crawlResults = null;

// Event Listeners
startBtn.addEventListener('click', startCrawl);
downloadBtn.addEventListener('click', downloadResults);

urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        startCrawl();
    }
});

// Functions
async function startCrawl() {
    const url = urlInput.value.trim();
    
    // Validate URL
    if (!url) {
        alert('Please enter a URL');
        return;
    }
    
    // Basic URL validation
    try {
        new URL(url);
    } catch (e) {
        alert('Please enter a valid URL (e.g., https://example.com)');
        return;
    }
    
    // Reset UI
    resultsSection.style.display = 'none';
    resultsContainer.innerHTML = '';
    crawlResults = null;
    
    // Show status
    statusSection.style.display = 'block';
    statusText.textContent = 'Crawling in progress...';
    pagesCount.textContent = 'Pages crawled: 0';
    
    // Disable button
    startBtn.disabled = true;
    startBtn.textContent = 'Crawling...';
    
    try {
        // Make API request
        const response = await fetch('/api/crawl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: url })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to crawl website');
        }
        
        const data = await response.json();
        
        // Update status
        statusText.textContent = 'Crawling completed!';
        pagesCount.textContent = `Pages crawled: ${data.pages_crawled}`;
        
        // Store results
        crawlResults = data;
        
        // Display results
        displayResults(data);
        
        // Hide status after a delay
        setTimeout(() => {
            statusSection.style.display = 'none';
        }, 2000);
        
    } catch (error) {
        statusSection.style.display = 'none';
        alert(`Error: ${error.message}`);
    } finally {
        // Re-enable button
        startBtn.disabled = false;
        startBtn.textContent = 'Start Crawl';
    }
}

function displayResults(data) {
    if (!data.results || data.results.length === 0) {
        resultsContainer.innerHTML = '<p class="error-message">No results found. The website may be inaccessible or blocking crawlers.</p>';
        resultsSection.style.display = 'block';
        return;
    }
    
    // Update summary
    resultSummary.textContent = `${data.results.length} pages crawled`;
    
    // Clear previous results
    resultsContainer.innerHTML = '';
    
    // Create result cards
    data.results.forEach((result, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        
        const url = document.createElement('div');
        url.className = 'result-url';
        url.textContent = `${index + 1}. ${result.url}`;
        
        const text = document.createElement('div');
        text.className = 'result-text';
        text.textContent = result.text || 'No text content found';
        
        const meta = document.createElement('div');
        meta.className = 'result-meta';
        meta.textContent = `Text length: ${result.length} characters`;
        
        card.appendChild(url);
        card.appendChild(text);
        card.appendChild(meta);
        
        resultsContainer.appendChild(card);
    });
    
    // Show results section
    resultsSection.style.display = 'block';
}

async function downloadResults() {
    if (!crawlResults || !crawlResults.results) {
        alert('No results to download');
        return;
    }
    
    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ results: crawlResults.results })
        });
        
        if (!response.ok) {
            throw new Error('Failed to download results');
        }
        
        // Create blob and download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'crawler_results.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}
