// Popup UI Controller
class PopupController {
  constructor() {
    this.currentTab = 'tools';
    this.stickyMode = false;
    this.init();
  }

  async init() {
    await this.checkApiKey();
    this.setupEventListeners();
    this.loadStickyMode();
  }

  async checkApiKey() {
    const result = await chrome.storage.local.get(['tavilyApiKey']);
    const warning = document.getElementById('api-key-warning');

    if (!result.tavilyApiKey) {
      warning.classList.remove('hidden');
    } else {
      warning.classList.add('hidden');
    }
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Settings
    document.getElementById('settings-btn').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });

    // Sticky Mode
    document.getElementById('sticky-mode-btn').addEventListener('click', () => {
      this.toggleStickyMode();
    });

    // Search Tool
    document.getElementById('search-btn').addEventListener('click', () => this.handleSearch());
    document.getElementById('search-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });

    // Extract Tool
    document.getElementById('extract-btn').addEventListener('click', () => this.handleExtract());
    document.getElementById('extract-current-btn').addEventListener('click', () => this.handleExtractCurrent());

    // Map Tool
    document.getElementById('map-btn').addEventListener('click', () => this.handleMap());
    document.getElementById('map-current-btn').addEventListener('click', () => this.handleMapCurrent());

    // Crawl Tool
    document.getElementById('crawl-btn').addEventListener('click', () => this.handleCrawl());
    document.getElementById('crawl-current-btn').addEventListener('click', () => this.handleCrawlCurrent());

    // Summarize Skill
    document.getElementById('summarize-btn').addEventListener('click', () => this.handleSummarize());
    document.getElementById('summarize-current-btn').addEventListener('click', () => this.handleSummarizeCurrent());

    // Fact Check Skill
    document.getElementById('factcheck-btn').addEventListener('click', () => this.handleFactCheck());

    // Report Skill
    document.getElementById('report-btn').addEventListener('click', () => this.handleReport());

    // Analyze Skill
    document.getElementById('analyze-btn').addEventListener('click', () => this.handleAnalyze());
    document.getElementById('analyze-current-btn').addEventListener('click', () => this.handleAnalyzeCurrent());

    // Results
    document.getElementById('clear-results').addEventListener('click', () => this.hideResults());
  }

  switchTab(tab) {
    this.currentTab = tab;

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tab}-tab`);
    });
  }

  async loadStickyMode() {
    const result = await chrome.storage.local.get(['stickyMode']);
    this.stickyMode = result.stickyMode || false;
    this.updateStickyModeUI();
  }

  async toggleStickyMode() {
    this.stickyMode = !this.stickyMode;
    await chrome.storage.local.set({ stickyMode: this.stickyMode });
    this.updateStickyModeUI();

    // Notify background script
    chrome.runtime.sendMessage({
      action: 'toggleStickyMode',
      enabled: this.stickyMode
    });
  }

  updateStickyModeUI() {
    const btn = document.getElementById('sticky-mode-btn');
    btn.style.background = this.stickyMode ? 'rgba(255, 255, 255, 0.3)' : 'transparent';
    btn.title = this.stickyMode ? 'Sticky Mode ON' : 'Sticky Mode OFF';
  }

  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  showLoading() {
    document.getElementById('loading').classList.remove('hidden');
  }

  hideLoading() {
    document.getElementById('loading').classList.add('hidden');
  }

  showResults(content) {
    const resultsDiv = document.getElementById('results');
    const contentDiv = document.getElementById('results-content');

    contentDiv.innerHTML = '';

    if (typeof content === 'object') {
      contentDiv.innerHTML = `<pre>${JSON.stringify(content, null, 2)}</pre>`;
    } else {
      contentDiv.innerHTML = content;
    }

    resultsDiv.classList.remove('hidden');
  }

  hideResults() {
    document.getElementById('results').classList.add('hidden');
  }

  async sendMessage(action, data = {}) {
    this.showLoading();
    try {
      const response = await chrome.runtime.sendMessage({ action, ...data });
      this.hideLoading();

      if (response.error) {
        this.showResults(`<div style="color: #ef4444;">Error: ${response.error}</div>`);
      } else {
        this.showResults(response.result);
      }
    } catch (error) {
      this.hideLoading();
      this.showResults(`<div style="color: #ef4444;">Error: ${error.message}</div>`);
    }
  }

  // Tool Handlers
  async handleSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    const deep = document.getElementById('search-deep').checked;
    const maxResults = parseInt(document.getElementById('search-max').value);

    await this.sendMessage('search', { query, deep, maxResults });
  }

  async handleExtract() {
    const url = document.getElementById('extract-url').value.trim();
    if (!url) return;

    await this.sendMessage('extract', { url });
  }

  async handleExtractCurrent() {
    const tab = await this.getCurrentTab();
    await this.sendMessage('extract', { url: tab.url });
  }

  async handleMap() {
    const url = document.getElementById('map-url').value.trim();
    if (!url) return;

    const maxDepth = parseInt(document.getElementById('map-depth').value);
    await this.sendMessage('map', { url, maxDepth });
  }

  async handleMapCurrent() {
    const tab = await this.getCurrentTab();
    const maxDepth = parseInt(document.getElementById('map-depth').value);
    await this.sendMessage('map', { url: tab.url, maxDepth });
  }

  async handleCrawl() {
    const url = document.getElementById('crawl-url').value.trim();
    if (!url) return;

    const maxPages = parseInt(document.getElementById('crawl-max').value);
    await this.sendMessage('crawl', { url, maxPages });
  }

  async handleCrawlCurrent() {
    const tab = await this.getCurrentTab();
    const maxPages = parseInt(document.getElementById('crawl-max').value);
    await this.sendMessage('crawl', { url: tab.url, maxPages });
  }

  // AI Skill Handlers
  async handleSummarize() {
    const text = document.getElementById('summarize-input').value.trim();
    if (!text) return;

    await this.sendMessage('summarize', { text });
  }

  async handleSummarizeCurrent() {
    const tab = await this.getCurrentTab();
    await this.sendMessage('summarizePage', { url: tab.url });
  }

  async handleFactCheck() {
    const claim = document.getElementById('factcheck-input').value.trim();
    if (!claim) return;

    await this.sendMessage('factCheck', { claim });
  }

  async handleReport() {
    const topic = document.getElementById('report-topic').value.trim();
    if (!topic) return;

    const type = document.getElementById('report-type').value;
    await this.sendMessage('createReport', { topic, type });
  }

  async handleAnalyze() {
    const text = document.getElementById('analyze-input').value.trim();
    if (!text) return;

    const type = document.getElementById('analyze-type').value;
    await this.sendMessage('analyze', { text, type });
  }

  async handleAnalyzeCurrent() {
    const tab = await this.getCurrentTab();
    const type = document.getElementById('analyze-type').value;
    await this.sendMessage('analyzePage', { url: tab.url, type });
  }
}

// Initialize popup
new PopupController();
