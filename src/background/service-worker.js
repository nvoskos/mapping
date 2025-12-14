import { MCPClient } from '../lib/mcp-client.js';
import { AIProcessor } from '../lib/ai-processor.js';

// Background Service Worker
class BackgroundService {
  constructor() {
    this.mcpClient = null;
    this.aiProcessor = null;
    this.stickyMode = false;
    this.init();
  }

  async init() {
    console.log('AI Web Assistant: Background service initialized');

    // Load API key and initialize MCP client
    await this.initializeMCP();

    // Setup context menu
    this.setupContextMenu();

    // Setup message listener
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep channel open for async response
    });

    // Load sticky mode state
    const result = await chrome.storage.local.get(['stickyMode']);
    this.stickyMode = result.stickyMode || false;
  }

  async initializeMCP() {
    try {
      const result = await chrome.storage.local.get(['tavilyApiKey']);
      if (result.tavilyApiKey) {
        this.mcpClient = new MCPClient(result.tavilyApiKey);
        this.aiProcessor = new AIProcessor(this.mcpClient);

        // Test connection
        await this.mcpClient.connect();
        console.log('MCP Client connected successfully');
      } else {
        console.warn('Tavily API key not configured');
      }
    } catch (error) {
      console.error('Failed to initialize MCP:', error);
    }
  }

  setupContextMenu() {
    chrome.contextMenus.removeAll(() => {
      // Main menu
      chrome.contextMenus.create({
        id: 'ai-assistant-main',
        title: 'AI Web Assistant',
        contexts: ['selection', 'page', 'link']
      });

      // Tools submenu
      chrome.contextMenus.create({
        id: 'search-selection',
        parentId: 'ai-assistant-main',
        title: 'Search "%s"',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'extract-page',
        parentId: 'ai-assistant-main',
        title: 'Extract Page Content',
        contexts: ['page']
      });

      chrome.contextMenus.create({
        id: 'extract-link',
        parentId: 'ai-assistant-main',
        title: 'Extract Link Content',
        contexts: ['link']
      });

      chrome.contextMenus.create({
        id: 'map-site',
        parentId: 'ai-assistant-main',
        title: 'Map This Site',
        contexts: ['page']
      });

      // AI Skills submenu
      chrome.contextMenus.create({
        id: 'separator1',
        parentId: 'ai-assistant-main',
        type: 'separator',
        contexts: ['selection', 'page', 'link']
      });

      chrome.contextMenus.create({
        id: 'summarize-selection',
        parentId: 'ai-assistant-main',
        title: 'Summarize "%s"',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'summarize-page',
        parentId: 'ai-assistant-main',
        title: 'Summarize This Page',
        contexts: ['page']
      });

      chrome.contextMenus.create({
        id: 'factcheck-selection',
        parentId: 'ai-assistant-main',
        title: 'Fact Check "%s"',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'analyze-selection',
        parentId: 'ai-assistant-main',
        title: 'Analyze "%s"',
        contexts: ['selection']
      });

      chrome.contextMenus.create({
        id: 'analyze-page',
        parentId: 'ai-assistant-main',
        title: 'Analyze This Page',
        contexts: ['page']
      });
    });

    // Context menu click handler
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      this.handleContextMenuClick(info, tab);
    });
  }

  async handleContextMenuClick(info, tab) {
    try {
      let result;

      switch (info.menuItemId) {
        case 'search-selection':
          result = await this.handleSearch({
            query: info.selectionText,
            deep: false,
            maxResults: 5
          });
          break;

        case 'extract-page':
          result = await this.handleExtract({ url: tab.url });
          break;

        case 'extract-link':
          result = await this.handleExtract({ url: info.linkUrl });
          break;

        case 'map-site':
          result = await this.handleMap({ url: tab.url, maxDepth: 2 });
          break;

        case 'summarize-selection':
          result = await this.handleSummarize({ text: info.selectionText });
          break;

        case 'summarize-page':
          result = await this.handleSummarizePage({ url: tab.url });
          break;

        case 'factcheck-selection':
          result = await this.handleFactCheck({ claim: info.selectionText });
          break;

        case 'analyze-selection':
          result = await this.handleAnalyze({ text: info.selectionText, type: 'general' });
          break;

        case 'analyze-page':
          result = await this.handleAnalyzePage({ url: tab.url, type: 'general' });
          break;
      }

      // Show result in content script notification
      if (result) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'showNotification',
          result: result
        });
      }
    } catch (error) {
      console.error('Context menu action failed:', error);
      chrome.tabs.sendMessage(tab.id, {
        action: 'showNotification',
        error: error.message
      });
    }
  }

  async handleMessage(message, sender, sendResponse) {
    if (!this.mcpClient) {
      await this.initializeMCP();
      if (!this.mcpClient) {
        sendResponse({ error: 'Tavily API key not configured. Please set it in settings.' });
        return;
      }
    }

    try {
      let result;

      switch (message.action) {
        // MCP Tools
        case 'search':
          result = await this.handleSearch(message);
          break;

        case 'extract':
          result = await this.handleExtract(message);
          break;

        case 'map':
          result = await this.handleMap(message);
          break;

        case 'crawl':
          result = await this.handleCrawl(message);
          break;

        // AI Skills
        case 'summarize':
          result = await this.handleSummarize(message);
          break;

        case 'summarizePage':
          result = await this.handleSummarizePage(message);
          break;

        case 'factCheck':
          result = await this.handleFactCheck(message);
          break;

        case 'createReport':
          result = await this.handleCreateReport(message);
          break;

        case 'analyze':
          result = await this.handleAnalyze(message);
          break;

        case 'analyzePage':
          result = await this.handleAnalyzePage(message);
          break;

        // Settings
        case 'toggleStickyMode':
          this.stickyMode = message.enabled;
          result = { success: true, stickyMode: this.stickyMode };
          break;

        case 'updateApiKey':
          await this.initializeMCP();
          result = { success: true };
          break;

        default:
          result = { error: 'Unknown action' };
      }

      sendResponse({ result });
    } catch (error) {
      console.error('Message handling error:', error);
      sendResponse({ error: error.message });
    }
  }

  // Tool Handlers
  async handleSearch(data) {
    const result = await this.mcpClient.search(data.query, {
      deep: data.deep,
      maxResults: data.maxResults
    });

    return this.formatSearchResults(result);
  }

  async handleExtract(data) {
    const result = await this.mcpClient.extract(data.url);
    return this.formatExtractResults(result);
  }

  async handleMap(data) {
    const result = await this.mcpClient.map(data.url, {
      maxDepth: data.maxDepth
    });

    return this.formatMapResults(result);
  }

  async handleCrawl(data) {
    const result = await this.mcpClient.crawl(data.url, {
      maxPages: data.maxPages
    });

    return this.formatCrawlResults(result);
  }

  // AI Skill Handlers
  async handleSummarize(data) {
    const result = await this.aiProcessor.summarize(data.text);
    return this.formatAIResults('Summary', result);
  }

  async handleSummarizePage(data) {
    const result = await this.aiProcessor.summarizePage(data.url);
    return this.formatAIResults('Page Summary', result);
  }

  async handleFactCheck(data) {
    const result = await this.aiProcessor.factCheck(data.claim);
    return this.formatAIResults('Fact Check', result);
  }

  async handleCreateReport(data) {
    const result = await this.aiProcessor.createReport(data.topic, data.type);
    return this.formatReportResults(result);
  }

  async handleAnalyze(data) {
    const result = await this.aiProcessor.analyze(data.text, data.type);
    return this.formatAIResults('Analysis', result);
  }

  async handleAnalyzePage(data) {
    const result = await this.aiProcessor.analyzePage(data.url, data.type);
    return this.formatAIResults('Page Analysis', result);
  }

  // Result Formatters
  formatSearchResults(result) {
    let html = '<div class="search-results">';

    if (result.answer) {
      html += `<div class="answer"><strong>Answer:</strong> ${result.answer}</div>`;
    }

    if (result.results && result.results.length > 0) {
      html += '<div class="results-list">';
      result.results.forEach((item, index) => {
        html += `
          <div class="result-item">
            <h4>${index + 1}. <a href="${item.url}" target="_blank">${item.title}</a></h4>
            <p>${item.content || item.snippet || ''}</p>
            <small>${item.url}</small>
          </div>
        `;
      });
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  formatExtractResults(result) {
    const content = result.content || result.text || JSON.stringify(result);
    return `
      <div class="extract-results">
        <h3>${result.title || 'Extracted Content'}</h3>
        <div class="content">${this.escapeHtml(content)}</div>
      </div>
    `;
  }

  formatMapResults(result) {
    return `
      <div class="map-results">
        <h3>Site Map</h3>
        <pre>${JSON.stringify(result, null, 2)}</pre>
      </div>
    `;
  }

  formatCrawlResults(result) {
    return `
      <div class="crawl-results">
        <h3>Crawl Results</h3>
        <pre>${JSON.stringify(result, null, 2)}</pre>
      </div>
    `;
  }

  formatAIResults(title, result) {
    return `
      <div class="ai-results">
        <h3>${title}</h3>
        <pre>${JSON.stringify(result, null, 2)}</pre>
      </div>
    `;
  }

  formatReportResults(result) {
    let html = `
      <div class="report-results">
        <h2>${result.title}</h2>
        <p><em>Generated: ${new Date(result.generatedAt).toLocaleString()}</em></p>
        <div class="executive-summary">
          <h3>Executive Summary</h3>
          <p>${result.executive_summary}</p>
        </div>
    `;

    result.sections.forEach(section => {
      html += `
        <div class="section">
          <h3>${section.title}</h3>
          <p>${this.escapeHtml(section.content).replace(/\n/g, '<br>')}</p>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize background service
new BackgroundService();
