// Content script for Mapping Chrome Extension

let stickyPanel = null;
let stickyModeEnabled = false;

// Initialize
(function init() {
  console.log('Mapping content script loaded');
  checkStickyMode();
})();

// Check if sticky mode is enabled
function checkStickyMode() {
  chrome.runtime.sendMessage({ action: 'getStickyMode' }, (response) => {
    if (response && response.enabled) {
      enableStickyMode();
    }
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request.action);

  switch (request.action) {
    case 'showResults':
      showResults(request.type, request.data, request.query || request.url);
      break;
    case 'toggleStickyMode':
      if (request.enabled) {
        enableStickyMode();
      } else {
        disableStickyMode();
      }
      break;
  }

  sendResponse({ success: true });
});

// Show results in a panel
function showResults(type, data, context) {
  const panel = createResultsPanel(type, data, context);
  document.body.appendChild(panel);

  // Auto-remove after 30 seconds if not sticky
  if (!stickyModeEnabled) {
    setTimeout(() => {
      if (panel && panel.parentNode) {
        panel.remove();
      }
    }, 30000);
  }
}

// Create results panel
function createResultsPanel(type, data, context) {
  const panel = document.createElement('div');
  panel.className = 'mapping-results-panel';
  panel.innerHTML = `
    <div class="mapping-panel-header">
      <span class="mapping-panel-title">${getPanelTitle(type)}</span>
      <button class="mapping-panel-close" onclick="this.closest('.mapping-results-panel').remove()">×</button>
    </div>
    <div class="mapping-panel-content">
      ${formatResults(type, data, context)}
    </div>
  `;

  // Make draggable
  makeDraggable(panel);

  return panel;
}

// Get panel title based on type
function getPanelTitle(type) {
  const titles = {
    search: '🔍 Search Results',
    extract: '📄 Extracted Content',
    map: '🗺️ Location Map',
    crawl: '🕷️ Crawl Results',
    summarize: '📝 Summary',
    factcheck: '✓ Fact Check',
    report: '📊 Report',
    analyze: '📈 Analysis'
  };
  return titles[type] || 'Results';
}

// Format results based on type
function formatResults(type, data, context) {
  switch (type) {
    case 'search':
      return formatSearchResults(data, context);
    case 'extract':
      return formatExtractResults(data, context);
    case 'map':
      return formatMapResults(data, context);
    case 'crawl':
      return formatCrawlResults(data, context);
    case 'summarize':
      return formatSummaryResults(data);
    case 'factcheck':
      return formatFactCheckResults(data, context);
    case 'report':
      return formatReportResults(data);
    case 'analyze':
      return formatAnalyzeResults(data);
    default:
      return '<p>Results displayed</p>';
  }
}

// Format search results
function formatSearchResults(data, query) {
  if (!data || !data.results) {
    return `<p>No results found for: <strong>${escapeHtml(query)}</strong></p>`;
  }

  let html = `<p class="mapping-query">Query: <strong>${escapeHtml(query)}</strong></p>`;
  html += '<div class="mapping-results-list">';

  data.results.forEach((result, index) => {
    html += `
      <div class="mapping-result-item">
        <h4>${index + 1}. <a href="${escapeHtml(result.url)}" target="_blank">${escapeHtml(result.title)}</a></h4>
        <p class="mapping-result-snippet">${escapeHtml(result.content || result.snippet || '')}</p>
        <p class="mapping-result-url">${escapeHtml(result.url)}</p>
      </div>
    `;
  });

  html += '</div>';
  return html;
}

// Format extract results
function formatExtractResults(data, url) {
  let html = `<p class="mapping-url">URL: <a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url)}</a></p>`;
  html += `<h3>${escapeHtml(data.title)}</h3>`;

  if (data.meta && data.meta.description) {
    html += `<p class="mapping-meta"><strong>Description:</strong> ${escapeHtml(data.meta.description)}</p>`;
  }

  if (data.headings && data.headings.length > 0) {
    html += '<h4>Headings:</h4><ul class="mapping-list">';
    data.headings.slice(0, 5).forEach(h => {
      html += `<li><strong>${h.level}:</strong> ${escapeHtml(h.text)}</li>`;
    });
    html += '</ul>';
  }

  if (data.links && data.links.length > 0) {
    html += `<h4>Links (${data.links.length}):</h4><ul class="mapping-list">`;
    data.links.slice(0, 10).forEach(link => {
      html += `<li><a href="${escapeHtml(link.href)}" target="_blank">${escapeHtml(link.text || link.href)}</a></li>`;
    });
    html += '</ul>';
  }

  return html;
}

// Format map results
function formatMapResults(data, query) {
  return `
    <p class="mapping-query">Location: <strong>${escapeHtml(data.location)}</strong></p>
    <p><a href="${escapeHtml(data.mapsUrl)}" target="_blank" class="mapping-button">Open in Google Maps</a></p>
    <iframe 
      width="100%" 
      height="300" 
      frameborder="0" 
      style="border:0; margin-top: 10px;" 
      src="https://www.google.com/maps/embed/v1/place?key=&q=${encodeURIComponent(data.location)}" 
      allowfullscreen>
    </iframe>
  `;
}

// Format crawl results
function formatCrawlResults(data, url) {
  let html = `<p class="mapping-url">Crawled: <a href="${escapeHtml(url)}" target="_blank">${escapeHtml(url)}</a></p>`;
  html += `<p><strong>Total Links:</strong> ${data.totalLinks}</p>`;
  html += `<p><strong>Internal Links:</strong> ${data.internalLinks.length} | <strong>External Links:</strong> ${data.externalLinks.length}</p>`;

  if (data.internalLinks.length > 0) {
    html += '<h4>Internal Links:</h4><ul class="mapping-list">';
    data.internalLinks.slice(0, 10).forEach(link => {
      html += `<li><a href="${escapeHtml(link.url)}" target="_blank">${escapeHtml(link.text || link.url)}</a></li>`;
    });
    html += '</ul>';
  }

  if (data.externalLinks.length > 0) {
    html += '<h4>External Links:</h4><ul class="mapping-list">';
    data.externalLinks.slice(0, 5).forEach(link => {
      html += `<li><a href="${escapeHtml(link.url)}" target="_blank">${escapeHtml(link.text || link.url)}</a></li>`;
    });
    html += '</ul>';
  }

  return html;
}

// Format summary results
function formatSummaryResults(data) {
  return `
    <div class="mapping-summary">
      <p><strong>Summary:</strong></p>
      <p class="mapping-summary-text">${escapeHtml(data.summary.text)}</p>
      <hr>
      <p class="mapping-stats">
        <strong>Statistics:</strong><br>
        Original sentences: ${data.summary.sentenceCount}<br>
        Summary sentences: ${data.summary.summarySentences}<br>
        Compression: ${data.summary.compressionRatio}
      </p>
    </div>
  `;
}

// Format fact check results
function formatFactCheckResults(data, query) {
  let html = `<p class="mapping-query">Checking: <strong>${escapeHtml(query)}</strong></p>`;
  html += '<div class="mapping-factcheck">';

  if (data.identifiedClaims && data.identifiedClaims.length > 0) {
    html += '<h4>Identified Claims:</h4><ul class="mapping-list">';
    data.identifiedClaims.forEach(claim => {
      html += `
        <li>
          <p>${escapeHtml(claim.text)}</p>
          <p class="mapping-claim-confidence">Confidence: ${claim.confidence} | Needs verification: ${claim.needsVerification ? 'Yes' : 'No'}</p>
        </li>
      `;
    });
    html += '</ul>';
  }

  html += `<p class="mapping-recommendation"><strong>Recommendation:</strong> ${escapeHtml(data.recommendation)}</p>`;
  html += '</div>';

  return html;
}

// Format report results
function formatReportResults(data) {
  let html = `<h3>${escapeHtml(data.title)}</h3>`;
  html += `<p class="mapping-timestamp">Generated: ${new Date(data.generatedAt).toLocaleString()}</p>`;

  if (data.sections && data.sections.length > 0) {
    data.sections.forEach(section => {
      html += `
        <div class="mapping-report-section">
          <h4>${escapeHtml(section.title)}</h4>
          <p>${escapeHtml(section.content)}</p>
        </div>
      `;
    });
  }

  return html;
}

// Format analyze results
function formatAnalyzeResults(data) {
  let html = '<div class="mapping-analysis">';
  
  if (data.statistics) {
    html += '<h4>Text Statistics:</h4>';
    html += '<ul class="mapping-list">';
    html += `<li>Characters: ${data.statistics.characters}</li>`;
    html += `<li>Words: ${data.statistics.words}</li>`;
    html += `<li>Sentences: ${data.statistics.sentences}</li>`;
    html += `<li>Paragraphs: ${data.statistics.paragraphs}</li>`;
    html += `<li>Avg words per sentence: ${data.statistics.avgWordsPerSentence}</li>`;
    html += '</ul>';
  }

  if (data.topWords && data.topWords.length > 0) {
    html += '<h4>Top Words:</h4>';
    html += '<ul class="mapping-list">';
    data.topWords.forEach(item => {
      html += `<li>${escapeHtml(item.word)}: ${item.count}</li>`;
    });
    html += '</ul>';
  }

  html += `<p><strong>Reading Time:</strong> ${escapeHtml(data.readingTime)}</p>`;
  html += `<p><strong>Complexity:</strong> ${escapeHtml(data.complexity)}</p>`;
  html += '</div>';

  return html;
}

// Enable sticky mode
function enableStickyMode() {
  stickyModeEnabled = true;
  
  if (!stickyPanel) {
    stickyPanel = document.createElement('div');
    stickyPanel.className = 'mapping-sticky-indicator';
    stickyPanel.innerHTML = '📌 Sticky Mode ON';
    stickyPanel.title = 'Results will stay on screen';
    document.body.appendChild(stickyPanel);
  }
}

// Disable sticky mode
function disableStickyMode() {
  stickyModeEnabled = false;
  
  if (stickyPanel) {
    stickyPanel.remove();
    stickyPanel = null;
  }
}

// Make element draggable
function makeDraggable(element) {
  const header = element.querySelector('.mapping-panel-header');
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  header.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    header.style.cursor = 'grabbing';
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + 'px';
    element.style.left = (element.offsetLeft - pos1) + 'px';
    element.style.right = 'auto';
    element.style.bottom = 'auto';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    header.style.cursor = 'move';
  }
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
