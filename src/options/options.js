// Options Page Controller
class OptionsController {
  constructor() {
    this.apiKeyInput = document.getElementById('api-key');
    this.stickyModeToggle = document.getElementById('sticky-mode');
    this.statusMessage = document.getElementById('status-message');

    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['tavilyApiKey', 'stickyMode']);

      if (result.tavilyApiKey) {
        this.apiKeyInput.value = result.tavilyApiKey;
      }

      this.stickyModeToggle.checked = result.stickyMode || false;
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showStatus('Failed to load settings', 'error');
    }
  }

  setupEventListeners() {
    // Save API Key
    document.getElementById('save-btn').addEventListener('click', () => {
      this.saveApiKey();
    });

    // Test Connection
    document.getElementById('test-btn').addEventListener('click', () => {
      this.testConnection();
    });

    // Toggle API Key Visibility
    document.getElementById('toggle-visibility').addEventListener('click', () => {
      this.toggleApiKeyVisibility();
    });

    // Sticky Mode Toggle
    this.stickyModeToggle.addEventListener('change', () => {
      this.saveStickyMode();
    });

    // Clear Data
    document.getElementById('clear-data-btn').addEventListener('click', () => {
      this.clearData();
    });

    // Save on Enter key
    this.apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveApiKey();
      }
    });
  }

  async saveApiKey() {
    const apiKey = this.apiKeyInput.value.trim();

    if (!apiKey) {
      this.showStatus('Please enter an API key', 'error');
      return;
    }

    try {
      await chrome.storage.local.set({ tavilyApiKey: apiKey });

      // Notify background script to reinitialize
      chrome.runtime.sendMessage({ action: 'updateApiKey' });

      this.showStatus('API key saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save API key:', error);
      this.showStatus('Failed to save API key', 'error');
    }
  }

  async testConnection() {
    const apiKey = this.apiKeyInput.value.trim();

    if (!apiKey) {
      this.showStatus('Please enter an API key first', 'error');
      return;
    }

    this.showStatus('Testing connection...', 'info');

    try {
      // Save first if not saved
      await chrome.storage.local.set({ tavilyApiKey: apiKey });

      // Test with a simple search
      const response = await chrome.runtime.sendMessage({
        action: 'search',
        query: 'test',
        deep: false,
        maxResults: 1
      });

      if (response.error) {
        this.showStatus(`Connection failed: ${response.error}`, 'error');
      } else {
        this.showStatus('Connection successful! Tavily MCP is working.', 'success');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      this.showStatus(`Connection test failed: ${error.message}`, 'error');
    }
  }

  toggleApiKeyVisibility() {
    const input = this.apiKeyInput;
    const btn = document.getElementById('toggle-visibility');

    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  }

  async saveStickyMode() {
    try {
      const enabled = this.stickyModeToggle.checked;
      await chrome.storage.local.set({ stickyMode: enabled });

      this.showStatus(`Sticky mode ${enabled ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Failed to save sticky mode:', error);
      this.showStatus('Failed to save sticky mode setting', 'error');
    }
  }

  async clearData() {
    const confirmed = confirm(
      'Are you sure you want to clear all data? This will remove your API key and all settings.'
    );

    if (!confirmed) return;

    try {
      await chrome.storage.local.clear();

      this.apiKeyInput.value = '';
      this.stickyModeToggle.checked = false;

      this.showStatus('All data cleared successfully', 'success');

      // Reload after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Failed to clear data:', error);
      this.showStatus('Failed to clear data', 'error');
    }
  }

  showStatus(message, type) {
    this.statusMessage.textContent = message;
    this.statusMessage.className = `status-message ${type}`;
    this.statusMessage.classList.remove('hidden');

    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
      setTimeout(() => {
        this.statusMessage.classList.add('hidden');
      }, 5000);
    }
  }
}

// Initialize options page
new OptionsController();
