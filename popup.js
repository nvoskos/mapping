// Popup script for Mapping Chrome Extension

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  attachEventListeners();
});

// Load saved settings
async function loadSettings() {
  const settings = await chrome.storage.sync.get(['tavilyApiKey', 'stickyMode']);
  
  if (settings.tavilyApiKey) {
    document.getElementById('api-key').value = settings.tavilyApiKey;
  }
  
  if (settings.stickyMode) {
    document.getElementById('sticky-mode-toggle').checked = true;
  }
}

// Attach event listeners
function attachEventListeners() {
  // Tool buttons
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => handleToolClick(btn.dataset.tool));
  });

  // AI buttons
  document.querySelectorAll('.ai-btn').forEach(btn => {
    btn.addEventListener('click', () => handleAIClick(btn.dataset.skill));
  });

  // Sticky mode toggle
  document.getElementById('sticky-mode-toggle').addEventListener('change', handleStickyModeToggle);

  // Save API key button
  document.getElementById('save-key-btn').addEventListener('click', saveApiKey);
}

// Handle tool button click
async function handleToolClick(tool) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  switch (tool) {
    case 'search':
      showPrompt('Enter search query:', async (query) => {
        if (query) {
          chrome.runtime.sendMessage({
            action: 'search',
            query: query,
            tabId: tab.id
          });
          showStatus('Searching...');
        }
      });
      break;
      
    case 'extract':
      chrome.runtime.sendMessage({
        action: 'extract',
        tabId: tab.id
      });
      showStatus('Extracting content...');
      window.close();
      break;
      
    case 'map':
      showPrompt('Enter location:', async (location) => {
        if (location) {
          chrome.runtime.sendMessage({
            action: 'map',
            location: location,
            tabId: tab.id
          });
          showStatus('Finding location...');
        }
      });
      break;
      
    case 'crawl':
      chrome.runtime.sendMessage({
        action: 'crawl',
        tabId: tab.id
      });
      showStatus('Crawling website...');
      window.close();
      break;
  }
}

// Handle AI button click
async function handleAIClick(skill) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.runtime.sendMessage({
    action: 'ai-' + skill,
    tabId: tab.id
  });
  
  showStatus(`Running ${skill}...`);
  
  // Close popup after a short delay
  setTimeout(() => window.close(), 500);
}

// Handle sticky mode toggle
async function handleStickyModeToggle(event) {
  const enabled = event.target.checked;
  
  await chrome.storage.sync.set({ stickyMode: enabled });
  
  // Notify only the active tab
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab) {
    chrome.tabs.sendMessage(activeTab.id, {
      action: 'toggleStickyMode',
      enabled: enabled
    }).catch(() => {
      // Tab might not have content script loaded
    });
  }
  
  showStatus(`Sticky Mode ${enabled ? 'enabled' : 'disabled'}`);
}

// Save API key
async function saveApiKey() {
  const apiKey = document.getElementById('api-key').value.trim();
  
  if (!apiKey) {
    showStatus('Please enter an API key', true);
    return;
  }
  
  await chrome.storage.sync.set({ tavilyApiKey: apiKey });
  showStatus('API key saved!');
}

// Show prompt dialog
function showPrompt(message, callback) {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'prompt-modal';
  modal.innerHTML = `
    <div class="prompt-content">
      <h3>${message}</h3>
      <input type="text" class="prompt-input" placeholder="Enter text..." autofocus>
      <div class="prompt-buttons">
        <button class="prompt-btn prompt-cancel">Cancel</button>
        <button class="prompt-btn prompt-ok">OK</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const input = modal.querySelector('.prompt-input');
  const okBtn = modal.querySelector('.prompt-ok');
  const cancelBtn = modal.querySelector('.prompt-cancel');
  
  // Focus input
  setTimeout(() => input.focus(), 100);
  
  // Handle OK
  const handleOk = () => {
    const value = input.value.trim();
    modal.remove();
    if (value) {
      callback(value);
    }
  };
  
  // Handle Cancel
  const handleCancel = () => {
    modal.remove();
  };
  
  okBtn.addEventListener('click', handleOk);
  cancelBtn.addEventListener('click', handleCancel);
  
  // Handle Enter key
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleOk();
    }
  });
  
  // Handle Escape key
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  });
}

// Show status message
function showStatus(message, isError = false) {
  // Remove existing status
  const existing = document.querySelector('.status-message');
  if (existing) {
    existing.remove();
  }
  
  // Create status message
  const status = document.createElement('div');
  status.className = 'status-message' + (isError ? ' error' : '');
  status.textContent = message;
  document.body.appendChild(status);
  
  // Remove after 3 seconds
  setTimeout(() => {
    status.remove();
  }, 3000);
}
