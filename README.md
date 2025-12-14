# Mapping - AI Web Assistant

A powerful Chrome extension with AI capabilities for advanced web interaction, content extraction, and intelligent analysis.

## 🚀 Features

### 🔧 Tools

1. **Search** - Advanced web search using Tavily API
   - Perform deep web searches with AI-powered relevance
   - Get comprehensive results with snippets and URLs
   - Configure your own Tavily API key

2. **Extract** - Extract content from web pages
   - Extract titles, headings, paragraphs, and metadata
   - Get structured data from any webpage
   - Export links and images

3. **Map** - Location-based search and mapping
   - Search for locations on Google Maps
   - Quick access to geographical information
   - Open maps in new tab or inline view

4. **Crawl** - Web crawling capabilities
   - Discover internal and external links
   - Analyze website structure
   - Extract resources (scripts, styles, images)

### 🤖 AI Skills

1. **Summarize** - Intelligent text summarization
   - Extract key sentences from content
   - Get compression statistics
   - Works on selected text or entire pages

2. **Fact Check** - Verify claims and statements
   - Identify verifiable claims
   - Get verification recommendations
   - Confidence ratings for detected claims

3. **Create Report** - Generate comprehensive reports
   - Automatic content analysis
   - Structured report sections
   - Include metadata and timestamps

4. **Analyze** - Deep text analysis
   - Word frequency analysis
   - Reading time estimation
   - Complexity assessment
   - Statistical breakdowns

### 👤 User Features

1. **Right-click Context Menu**
   - Access all tools and AI skills from any webpage
   - Context-aware options based on selection
   - Quick actions without opening popup

2. **Sticky Mode**
   - Keep results pinned on screen
   - Toggle on/off from popup or context menu
   - Persistent indicator when enabled

## 📦 Installation

### From Source

1. Clone or download this repository:
   ```bash
   git clone https://github.com/nvoskos/mapping.git
   cd mapping
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked"

5. Select the `mapping` directory

6. The extension is now installed! Look for the 🗺️ icon in your toolbar

## 🔑 Configuration

### Tavily API Key

To use the Search tool, you need a Tavily API key:

1. Visit [tavily.com](https://tavily.com) and sign up for an account
2. Get your API key from the dashboard
3. Click the extension icon and go to Settings
4. Enter your API key and click "Save Key"

## 🎯 Usage

### Using the Popup

1. Click the extension icon (🗺️) in your Chrome toolbar
2. Choose a tool or AI skill from the popup
3. Follow the prompts to enter required information
4. Results will be displayed on the current page

### Using the Context Menu

1. Right-click on any webpage, selected text, or link
2. Hover over "Mapping AI Assistant"
3. Select a tool or AI skill from the submenu
4. Results will be displayed automatically

### Sticky Mode

Enable Sticky Mode to keep results visible:
- Toggle in the extension popup under "Features"
- Or right-click and select "Toggle Sticky Mode"
- A green indicator (📌) appears when active

## 🛠️ Development

### File Structure

```
mapping/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (background tasks)
├── content.js            # Content script (page interaction)
├── content.css           # Styles for content script
├── popup.html            # Popup UI structure
├── popup.css             # Popup styles
├── popup.js              # Popup functionality
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

### Key Components

- **manifest.json**: Chrome extension configuration (manifest v3)
- **background.js**: Handles context menus, API calls, and message routing
- **content.js**: Injects UI into web pages and displays results
- **popup.html/js/css**: Extension popup interface

## 🔒 Permissions

The extension requires the following permissions:

- **contextMenus**: For right-click menu functionality
- **activeTab**: To interact with the current tab
- **storage**: To save settings and API keys
- **tabs**: To manage tabs and send messages
- **scripting**: To inject content scripts
- **host_permissions**: To access web pages for extraction and crawling

## 🎨 UI Features

- **Draggable Panels**: Move result panels anywhere on the page
- **Auto-dismiss**: Panels auto-close after 30 seconds (unless Sticky Mode is on)
- **Responsive Design**: Works on all screen sizes
- **Clean Interface**: Modern, intuitive design

## 📝 Examples

### Search Example
1. Select text on a webpage
2. Right-click → Mapping AI Assistant → Search with Tavily
3. View search results in a panel

### Extract Example
1. Visit any webpage
2. Click extension icon → Extract
3. View structured content in a panel

### Summarize Example
1. Select a long paragraph or article
2. Right-click → Mapping AI Assistant → Summarize
3. Get a concise summary with statistics

## 🐛 Troubleshooting

**Search not working?**
- Make sure you've set your Tavily API key in Settings

**Context menu not appearing?**
- Try reloading the page
- Check that the extension is enabled

**Results not showing?**
- Open Developer Console (F12) and check for errors
- Make sure content script has loaded

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

Made with ❤️ by the Mapping Team
