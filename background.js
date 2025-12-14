// Background service worker for Mapping Chrome Extension

// Configuration
const CONFIG = {
  TAVILY_API_KEY: '', // To be set by user in options
  STICKY_MODE_ENABLED: false
};

// Initialize context menu on install
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
  console.log('Mapping extension installed');
});

// Create context menus
function createContextMenus() {
  chrome.contextMenus.removeAll(() => {
    // Main menu
    chrome.contextMenus.create({
      id: 'mapping-main',
      title: 'Mapping AI Assistant',
      contexts: ['selection', 'page', 'link']
    });

    // Tools submenu
    chrome.contextMenus.create({
      id: 'tool-search',
      parentId: 'mapping-main',
      title: 'Search with Tavily',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'tool-extract',
      parentId: 'mapping-main',
      title: 'Extract Content',
      contexts: ['page', 'link']
    });

    chrome.contextMenus.create({
      id: 'tool-map',
      parentId: 'mapping-main',
      title: 'Map Location',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'tool-crawl',
      parentId: 'mapping-main',
      title: 'Crawl Website',
      contexts: ['page', 'link']
    });

    // Separator
    chrome.contextMenus.create({
      id: 'separator1',
      parentId: 'mapping-main',
      type: 'separator',
      contexts: ['selection', 'page', 'link']
    });

    // AI Skills submenu
    chrome.contextMenus.create({
      id: 'ai-summarize',
      parentId: 'mapping-main',
      title: 'Summarize',
      contexts: ['selection', 'page']
    });

    chrome.contextMenus.create({
      id: 'ai-factcheck',
      parentId: 'mapping-main',
      title: 'Fact Check',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'ai-report',
      parentId: 'mapping-main',
      title: 'Create Report',
      contexts: ['selection', 'page']
    });

    chrome.contextMenus.create({
      id: 'ai-analyze',
      parentId: 'mapping-main',
      title: 'Analyze',
      contexts: ['selection', 'page']
    });

    // Separator
    chrome.contextMenus.create({
      id: 'separator2',
      parentId: 'mapping-main',
      type: 'separator',
      contexts: ['selection', 'page', 'link']
    });

    // Sticky mode toggle
    chrome.contextMenus.create({
      id: 'toggle-sticky',
      parentId: 'mapping-main',
      title: 'Toggle Sticky Mode',
      contexts: ['page']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  handleContextMenuClick(info, tab);
});

// Context menu click handler
async function handleContextMenuClick(info, tab) {
  const menuId = info.menuItemId;
  const selectedText = info.selectionText || '';
  const pageUrl = info.pageUrl || tab.url;
  const linkUrl = info.linkUrl || '';

  console.log('Context menu clicked:', menuId, { selectedText, pageUrl, linkUrl });

  switch (menuId) {
    case 'tool-search':
      await handleSearch(selectedText, tab);
      break;
    case 'tool-extract':
      await handleExtract(linkUrl || pageUrl, tab);
      break;
    case 'tool-map':
      await handleMap(selectedText, tab);
      break;
    case 'tool-crawl':
      await handleCrawl(linkUrl || pageUrl, tab);
      break;
    case 'ai-summarize':
      await handleSummarize(selectedText, tab);
      break;
    case 'ai-factcheck':
      await handleFactCheck(selectedText, tab);
      break;
    case 'ai-report':
      await handleCreateReport(selectedText, tab);
      break;
    case 'ai-analyze':
      await handleAnalyze(selectedText, tab);
      break;
    case 'toggle-sticky':
      await toggleStickyMode(tab);
      break;
  }
}

// Tool: Search with Tavily API
async function handleSearch(query, tab) {
  if (!query) {
    showNotification('Please select text to search');
    return;
  }

  try {
    const settings = await chrome.storage.sync.get(['tavilyApiKey']);
    const apiKey = settings.tavilyApiKey;

    if (!apiKey) {
      showNotification('Please set Tavily API key in extension settings');
      return;
    }

    showNotification('Searching with Tavily...');

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: query,
        search_depth: 'advanced',
        max_results: 5
      })
    });

    const data = await response.json();

    // Send results to content script for display
    chrome.tabs.sendMessage(tab.id, {
      action: 'showResults',
      type: 'search',
      data: data,
      query: query
    });

  } catch (error) {
    console.error('Search error:', error);
    showNotification('Search failed: ' + error.message);
  }
}

// Tool: Extract content from web page
async function handleExtract(url, tab) {
  if (!url) {
    showNotification('No URL to extract from');
    return;
  }

  try {
    showNotification('Extracting content...');

    // Execute content extraction in the tab
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageContent
    });

    const content = results[0].result;

    // Send extracted content to content script for display
    chrome.tabs.sendMessage(tab.id, {
      action: 'showResults',
      type: 'extract',
      data: content,
      url: url
    });

  } catch (error) {
    console.error('Extract error:', error);
    showNotification('Extraction failed: ' + error.message);
  }
}

// Function to extract page content (runs in page context)
function extractPageContent() {
  const content = {
    title: document.title,
    url: window.location.href,
    meta: {
      description: document.querySelector('meta[name="description"]')?.content || '',
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
      author: document.querySelector('meta[name="author"]')?.content || ''
    },
    headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
      level: h.tagName,
      text: h.textContent.trim()
    })),
    paragraphs: Array.from(document.querySelectorAll('p')).slice(0, 10).map(p => p.textContent.trim()),
    links: Array.from(document.querySelectorAll('a[href]')).slice(0, 20).map(a => ({
      text: a.textContent.trim(),
      href: a.href
    })),
    images: Array.from(document.querySelectorAll('img[src]')).slice(0, 10).map(img => ({
      src: img.src,
      alt: img.alt
    }))
  };
  return content;
}

// Tool: Map location
async function handleMap(location, tab) {
  if (!location) {
    showNotification('Please select a location to map');
    return;
  }

  try {
    showNotification('Finding location on map...');

    // Create Google Maps search URL
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

    // Open in new tab or send to content script
    const settings = await chrome.storage.sync.get(['openMapsInNewTab']);
    if (settings.openMapsInNewTab !== false) {
      chrome.tabs.create({ url: mapsUrl });
    } else {
      chrome.tabs.sendMessage(tab.id, {
        action: 'showResults',
        type: 'map',
        data: { location, mapsUrl },
        query: location
      });
    }

  } catch (error) {
    console.error('Map error:', error);
    showNotification('Map failed: ' + error.message);
  }
}

// Tool: Crawl website
async function handleCrawl(url, tab) {
  if (!url) {
    showNotification('No URL to crawl');
    return;
  }

  try {
    showNotification('Crawling website...');

    // Simple crawl: get links from the page
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: crawlPage,
      args: [url]
    });

    const crawlData = results[0].result;

    // Send crawl results to content script
    chrome.tabs.sendMessage(tab.id, {
      action: 'showResults',
      type: 'crawl',
      data: crawlData,
      url: url
    });

  } catch (error) {
    console.error('Crawl error:', error);
    showNotification('Crawl failed: ' + error.message);
  }
}

// Function to crawl page (runs in page context)
function crawlPage(baseUrl) {
  const links = Array.from(document.querySelectorAll('a[href]'));
  const domain = new URL(baseUrl).hostname;
  
  const crawlData = {
    baseUrl: baseUrl,
    timestamp: new Date().toISOString(),
    totalLinks: links.length,
    internalLinks: [],
    externalLinks: [],
    resources: {
      scripts: Array.from(document.querySelectorAll('script[src]')).map(s => s.src),
      styles: Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href),
      images: Array.from(document.querySelectorAll('img[src]')).map(img => img.src)
    }
  };

  links.forEach(link => {
    const href = link.href;
    if (href) {
      try {
        const linkUrl = new URL(href);
        const linkData = {
          url: href,
          text: link.textContent.trim().substring(0, 100)
        };

        if (linkUrl.hostname === domain) {
          crawlData.internalLinks.push(linkData);
        } else {
          crawlData.externalLinks.push(linkData);
        }
      } catch (e) {
        // Invalid URL
      }
    }
  });

  // Limit results
  crawlData.internalLinks = crawlData.internalLinks.slice(0, 50);
  crawlData.externalLinks = crawlData.externalLinks.slice(0, 20);

  return crawlData;
}

// AI Skill: Summarize
async function handleSummarize(text, tab) {
  try {
    showNotification('Summarizing...');

    // Get content if no text selected
    if (!text) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText
      });
      text = results[0].result;
    }

    // Simple summarization: extract key sentences
    const summary = summarizeText(text);

    chrome.tabs.sendMessage(tab.id, {
      action: 'showResults',
      type: 'summarize',
      data: { summary, originalLength: text.length }
    });

  } catch (error) {
    console.error('Summarize error:', error);
    showNotification('Summarization failed: ' + error.message);
  }
}

// AI Skill: Fact Check
async function handleFactCheck(text, tab) {
  if (!text) {
    showNotification('Please select text to fact check');
    return;
  }

  try {
    showNotification('Fact checking...');

    // Simple fact check: analyze claims
    const factCheck = performFactCheck(text);

    chrome.tabs.sendMessage(tab.id, {
      action: 'showResults',
      type: 'factcheck',
      data: factCheck,
      query: text
    });

  } catch (error) {
    console.error('Fact check error:', error);
    showNotification('Fact check failed: ' + error.message);
  }
}

// AI Skill: Create Report
async function handleCreateReport(text, tab) {
  try {
    showNotification('Creating report...');

    // Get content if no text selected
    if (!text) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractPageContent
      });
      text = JSON.stringify(results[0].result);
    }

    const report = createReport(text);

    chrome.tabs.sendMessage(tab.id, {
      action: 'showResults',
      type: 'report',
      data: report
    });

  } catch (error) {
    console.error('Report error:', error);
    showNotification('Report creation failed: ' + error.message);
  }
}

// AI Skill: Analyze
async function handleAnalyze(text, tab) {
  try {
    showNotification('Analyzing...');

    // Get content if no text selected
    if (!text) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText
      });
      text = results[0].result;
    }

    const analysis = analyzeText(text);

    chrome.tabs.sendMessage(tab.id, {
      action: 'showResults',
      type: 'analyze',
      data: analysis
    });

  } catch (error) {
    console.error('Analyze error:', error);
    showNotification('Analysis failed: ' + error.message);
  }
}

// Toggle sticky mode
async function toggleStickyMode(tab) {
  const settings = await chrome.storage.sync.get(['stickyMode']);
  const newStickyMode = !settings.stickyMode;
  
  await chrome.storage.sync.set({ stickyMode: newStickyMode });
  
  chrome.tabs.sendMessage(tab.id, {
    action: 'toggleStickyMode',
    enabled: newStickyMode
  });

  showNotification(`Sticky Mode ${newStickyMode ? 'enabled' : 'disabled'}`);
}

// Helper: Show notification
function showNotification(message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Mapping AI Assistant',
    message: message
  });
}

// Helper functions for AI operations

function summarizeText(text) {
  // Simple extractive summarization
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const wordCounts = sentences.map(s => s.split(/\s+/).length);
  const avgWords = wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length;
  
  // Select sentences with important keywords
  const keywords = ['important', 'significant', 'key', 'main', 'primary', 'essential', 'critical'];
  const importantSentences = sentences.filter(s => 
    keywords.some(k => s.toLowerCase().includes(k)) || s.split(/\s+/).length > avgWords
  );

  const summary = importantSentences.slice(0, 5).join(' ') || sentences.slice(0, 3).join(' ');
  
  return {
    text: summary,
    sentenceCount: sentences.length,
    summarySentences: importantSentences.length,
    compressionRatio: (summary.length / text.length * 100).toFixed(1) + '%'
  };
}

function performFactCheck(text) {
  // Simple fact checking: identify claims and provide structure
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  // Look for claim indicators
  const claimIndicators = ['is', 'are', 'was', 'were', 'has', 'have', 'will', 'can', 'says', 'said'];
  
  const claims = sentences.filter(s => 
    claimIndicators.some(indicator => s.toLowerCase().includes(` ${indicator} `))
  );

  return {
    originalText: text,
    identifiedClaims: claims.map(claim => ({
      text: claim.trim(),
      confidence: 'medium',
      needsVerification: true
    })),
    recommendation: 'Cross-reference claims with reliable sources',
    timestamp: new Date().toISOString()
  };
}

function createReport(text) {
  const now = new Date();
  const lines = text.split('\n').filter(l => l.trim());
  
  return {
    title: 'Analysis Report',
    generatedAt: now.toISOString(),
    sections: [
      {
        title: 'Overview',
        content: `Report generated from ${lines.length} lines of content`
      },
      {
        title: 'Content Analysis',
        content: `Total characters: ${text.length}, Words: ~${text.split(/\s+/).length}`
      },
      {
        title: 'Summary',
        content: summarizeText(text).text
      }
    ],
    metadata: {
      version: '1.0.0',
      generator: 'Mapping AI Assistant'
    }
  };
}

function analyzeText(text) {
  const words = text.split(/\s+/);
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  const paragraphs = text.split(/\n\n+/);
  
  // Word frequency
  const wordFreq = {};
  words.forEach(word => {
    const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleaned.length > 3) {
      wordFreq[cleaned] = (wordFreq[cleaned] || 0) + 1;
    }
  });

  const topWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return {
    statistics: {
      characters: text.length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      avgWordsPerSentence: (words.length / sentences.length).toFixed(1),
      avgSentencesPerParagraph: (sentences.length / paragraphs.length).toFixed(1)
    },
    topWords: topWords,
    readingTime: Math.ceil(words.length / 200) + ' minutes',
    complexity: words.length / sentences.length > 20 ? 'High' : words.length / sentences.length > 15 ? 'Medium' : 'Low'
  };
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStickyMode') {
    chrome.storage.sync.get(['stickyMode'], (result) => {
      sendResponse({ enabled: result.stickyMode || false });
    });
    return true;
  }
});
