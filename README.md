# AI Web Assistant - Chrome Extension with Tavily MCP

A powerful Chrome extension that leverages Tavily's Model Context Protocol (MCP) to provide AI-powered web research, content extraction, and analysis capabilities.

## Features

### 🛠️ Tools (Powered by Tavily MCP)

- **🔍 Search** - Real-time web search with deep search capabilities using Tavily API
- **📄 Extract** - Intelligent content extraction from any web page
- **🗺️ Map** - Create structured maps of websites and their architecture
- **🕷️ Crawl** - Systematic web crawling with metadata collection

### 🤖 AI Skills

- **📝 Summarize** - Generate concise summaries of web content
- **✅ Fact Check** - Verify claims against reliable sources
- **📊 Create Report** - Generate comprehensive reports on any topic
- **🔬 Analyze** - Perform sentiment, technical, and competitive analysis

### 💡 User Features

- **Right-click Context Menu** - Quick access to tools from any webpage
- **Sticky Mode** - Persistent floating panel with one-click access to features
- **Clean UI** - Modern, intuitive interface with tabbed navigation

## Installation

### Prerequisites

1. **Tavily API Key** - Get your free API key from [tavily.com](https://tavily.com)
2. **Chrome Browser** - Version 88 or higher

### Steps

1. **Clone or Download this repository**
   ```bash
   git clone <repository-url>
   cd mapping
   ```

2. **Load Extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the repository folder containing `manifest.json`

3. **Configure API Key**
   - Click the extension icon in Chrome toolbar
   - Click the settings icon (⚙️)
   - Enter your Tavily API key
   - Click "Save API Key"
   - Click "Test Connection" to verify

## Usage

### Popup Interface

Click the extension icon to open the main interface:

#### Tools Tab

**Search**
- Enter your search query
- Toggle "Deep Search" for more comprehensive results
- Adjust max results (1-20)
- Click "Search"

**Extract**
- Enter a URL or click "Extract Current Page"
- View extracted content, headings, and metadata

**Map**
- Enter a URL or click "Map Current Site"
- Set max depth (1-5)
- Generate a structural map of the website

**Crawl**
- Enter a URL or click "Crawl Current Site"
- Set max pages (1-50)
- Systematically explore the website

#### AI Skills Tab

**Summarize**
- Paste text or click "Summarize Current Page"
- Get key points and concise summary

**Fact Check**
- Enter a claim to verify
- Get sources and verification results

**Create Report**
- Enter a topic
- Select report type (Comprehensive/Summary/Technical)
- Generate detailed report with sources

**Analyze**
- Paste content or click "Analyze Current Page"
- Choose analysis type (General/Sentiment/Technical/Competitive)
- View detailed analysis results

### Context Menu

Right-click on any webpage:
- **Search** - Search selected text
- **Extract** - Extract page or link content
- **Map Site** - Map the current website
- **Summarize** - Summarize selection or page
- **Fact Check** - Verify selected claim
- **Analyze** - Analyze selection or page

### Sticky Mode

Enable in settings for a persistent floating panel:
- Appears on all webpages
- Draggable to any position
- Quick access to:
  - Summarize Page
  - Extract Content
  - Analyze Page
  - Fact Check Selection

## Architecture

### Tavily MCP Integration

The extension connects to Tavily's remote MCP server:

```
Extension → MCP Client → https://mcp.tavily.com/mcp/?tavilyApiKey=<key>
```

**MCP Tools Used:**
- `tavily-search` - Web search
- `tavily-extract` - Content extraction
- `tavily-map` - Website mapping
- `tavily-crawl` - Web crawling

### File Structure

```
mapping/
├── manifest.json              # Extension configuration
├── src/
│   ├── background/
│   │   └── service-worker.js  # Background service & message handler
│   ├── popup/
│   │   ├── popup.html         # Main UI
│   │   ├── popup.css          # Popup styles
│   │   └── popup.js           # Popup controller
│   ├── content/
│   │   ├── content-script.js  # Page interaction & notifications
│   │   └── content-script.css # Content script styles
│   ├── options/
│   │   ├── options.html       # Settings page
│   │   ├── options.css        # Settings styles
│   │   └── options.js         # Settings controller
│   ├── lib/
│   │   ├── mcp-client.js      # MCP protocol client
│   │   └── ai-processor.js    # AI skills implementation
│   └── assets/
│       └── icons/             # Extension icons
└── README.md
```

### Components

**MCP Client** (`src/lib/mcp-client.js`)
- Connects to Tavily MCP server
- Implements MCP protocol (JSON-RPC 2.0)
- Handles tool calls and responses

**AI Processor** (`src/lib/ai-processor.js`)
- Implements AI skills using MCP tools
- Combines multiple tool results
- Formats and structures outputs

**Background Service Worker** (`src/background/service-worker.js`)
- Manages MCP client lifecycle
- Handles messages from popup and content scripts
- Creates context menus
- Coordinates tool execution

**Content Script** (`src/content/content-script.js`)
- Injects sticky panel when enabled
- Shows notifications
- Extracts page content
- Handles page-level interactions

## Development

### Prerequisites

- Node.js (for any future tooling)
- Chrome browser with Developer mode enabled

### Local Development

1. Make changes to source files
2. Go to `chrome://extensions/`
3. Click reload icon on the extension card
4. Test your changes

### Debugging

**Background Script:**
- `chrome://extensions/` → Click "service worker" link
- View console logs and errors

**Popup:**
- Right-click extension icon → Inspect popup
- View console and network activity

**Content Script:**
- Open DevTools on any webpage (F12)
- Console shows content script logs

## API Limits

Tavily API limits depend on your plan:
- Free tier: Check [tavily.com](https://tavily.com) for current limits
- Results may be cached for performance

## Privacy

- API key stored locally in Chrome storage
- No data sent to third parties except Tavily MCP server
- All requests use HTTPS
- No telemetry or analytics

## Troubleshooting

### "API key not configured"
- Go to Settings (⚙️) and enter your Tavily API key
- Click "Test Connection" to verify

### "Failed to connect to MCP server"
- Check internet connection
- Verify API key is correct
- Check Tavily service status

### Context menu not appearing
- Reload the extension
- Check permissions in `chrome://extensions/`

### Sticky panel not showing
- Enable Sticky Mode in Settings
- Reload the current webpage
- Check for JavaScript errors in console

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

See LICENSE file for details.

## Credits

- Built with [Tavily MCP](https://tavily.com)
- Uses Model Context Protocol (MCP) 2024-11-05
- Chrome Extension Manifest V3

## Support

For issues and questions:
- Check troubleshooting section
- Review Tavily documentation
- Open an issue on GitHub

---

**Version:** 1.0.0
**MCP Protocol:** 2024-11-05
**Last Updated:** 2025
