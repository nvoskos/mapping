// Content Script - Runs on all web pages
class ContentScript {
  constructor() {
    this.notification = null;
    this.stickyPanel = null;
    this.init();
  }

  init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message);
    });

    // Check if sticky mode is enabled
    this.checkStickyMode();
  }

  async checkStickyMode() {
    const result = await chrome.storage.local.get(['stickyMode']);
    if (result.stickyMode) {
      this.createStickyPanel();
    }

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes.stickyMode) {
        if (changes.stickyMode.newValue) {
          this.createStickyPanel();
        } else {
          this.removeStickyPanel();
        }
      }
    });
  }

  handleMessage(message) {
    switch (message.action) {
      case 'showNotification':
        if (message.error) {
          this.showNotification(`Error: ${message.error}`, 'error');
        } else if (message.result) {
          this.showNotification('Action completed successfully!', 'success');
        }
        break;

      case 'extractContent':
        return this.extractPageContent();

      case 'getSelection':
        return { selection: window.getSelection().toString() };
    }
  }

  extractPageContent() {
    // Extract meaningful content from the page
    const content = {
      url: window.location.href,
      title: document.title,
      text: document.body.innerText,
      html: document.body.innerHTML,
      meta: {
        description: document.querySelector('meta[name="description"]')?.content || '',
        keywords: document.querySelector('meta[name="keywords"]')?.content || '',
        author: document.querySelector('meta[name="author"]')?.content || ''
      },
      headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        level: h.tagName,
        text: h.innerText
      })),
      links: Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.innerText,
        href: a.href
      })).slice(0, 50), // Limit to 50 links
      images: Array.from(document.querySelectorAll('img[src]')).map(img => ({
        src: img.src,
        alt: img.alt
      })).slice(0, 20) // Limit to 20 images
    };

    return content;
  }

  showNotification(message, type = 'info') {
    // Remove existing notification
    if (this.notification) {
      this.notification.remove();
    }

    // Create notification element
    this.notification = document.createElement('div');
    this.notification.className = `ai-assistant-notification ${type}`;
    this.notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">×</button>
      </div>
    `;

    document.body.appendChild(this.notification);

    // Close button
    this.notification.querySelector('.notification-close').addEventListener('click', () => {
      this.notification.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (this.notification) {
        this.notification.remove();
      }
    }, 5000);
  }

  createStickyPanel() {
    if (this.stickyPanel) return;

    this.stickyPanel = document.createElement('div');
    this.stickyPanel.className = 'ai-assistant-sticky-panel';
    this.stickyPanel.innerHTML = `
      <div class="sticky-header">
        <span>AI Assistant</span>
        <button class="sticky-close">×</button>
      </div>
      <div class="sticky-content">
        <button class="sticky-btn" data-action="summarize">Summarize Page</button>
        <button class="sticky-btn" data-action="extract">Extract Content</button>
        <button class="sticky-btn" data-action="analyze">Analyze Page</button>
        <button class="sticky-btn" data-action="factcheck">Fact Check Selection</button>
      </div>
    `;

    document.body.appendChild(this.stickyPanel);

    // Close button
    this.stickyPanel.querySelector('.sticky-close').addEventListener('click', async () => {
      await chrome.storage.local.set({ stickyMode: false });
      this.removeStickyPanel();
    });

    // Action buttons
    this.stickyPanel.querySelectorAll('.sticky-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        this.handleStickyAction(action);
      });
    });

    // Make panel draggable
    this.makeDraggable(this.stickyPanel);
  }

  removeStickyPanel() {
    if (this.stickyPanel) {
      this.stickyPanel.remove();
      this.stickyPanel = null;
    }
  }

  async handleStickyAction(action) {
    const url = window.location.href;
    const selection = window.getSelection().toString();

    switch (action) {
      case 'summarize':
        chrome.runtime.sendMessage({ action: 'summarizePage', url });
        this.showNotification('Summarizing page...', 'info');
        break;

      case 'extract':
        chrome.runtime.sendMessage({ action: 'extract', url });
        this.showNotification('Extracting content...', 'info');
        break;

      case 'analyze':
        chrome.runtime.sendMessage({ action: 'analyzePage', url, type: 'general' });
        this.showNotification('Analyzing page...', 'info');
        break;

      case 'factcheck':
        if (selection) {
          chrome.runtime.sendMessage({ action: 'factCheck', claim: selection });
          this.showNotification('Fact checking...', 'info');
        } else {
          this.showNotification('Please select text to fact check', 'warning');
        }
        break;
    }
  }

  makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = element.querySelector('.sticky-header');

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }
}

// Initialize content script
new ContentScript();
