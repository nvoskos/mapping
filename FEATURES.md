# Features Documentation

Complete overview of all features in the Mapping Chrome Extension.

## 🔧 Tools (4 Tools)

### 1. Search - Advanced Web Search
**Description:** Powerful web search using the Tavily API with advanced search depth

**How to use:**
- Select text on any webpage
- Right-click → Mapping AI Assistant → Search with Tavily
- OR: Click extension icon → Search → Enter query

**Features:**
- Advanced search depth for comprehensive results
- Returns up to 5 high-quality results
- Displays title, snippet, and URL for each result
- Results shown in draggable panel

**Requirements:**
- Tavily API key (configured in extension settings)

**Output:**
- Search results with titles, descriptions, and URLs
- Query information
- Clickable links to sources

---

### 2. Extract - Web Page Content Extraction
**Description:** Extract structured content and metadata from any webpage

**How to use:**
- Visit any webpage
- Right-click → Mapping AI Assistant → Extract Content
- OR: Click extension icon → Extract

**Features:**
- Extracts page title and URL
- Captures meta tags (description, keywords, author)
- Lists all headings (H1, H2, H3)
- Extracts first 10 paragraphs
- Shows up to 20 links with anchor text
- Lists up to 10 images with alt text

**Output:**
- Structured JSON-like data
- Organized display of page elements
- Links are clickable

---

### 3. Map - Location-Based Search
**Description:** Quick location search integrated with Google Maps

**How to use:**
- Select a location name (e.g., "Paris, France")
- Right-click → Mapping AI Assistant → Map Location
- OR: Click extension icon → Map → Enter location

**Features:**
- Instant Google Maps integration
- Opens in new tab (configurable)
- Works with any location format
- Supports addresses, landmarks, cities, etc.

**Output:**
- Google Maps search URL
- Direct link to view location
- Visual button for easy access

---

### 4. Crawl - Website Crawler
**Description:** Analyze website structure and discover links

**How to use:**
- Visit any website
- Right-click → Mapping AI Assistant → Crawl Website
- OR: Click extension icon → Crawl

**Features:**
- Identifies internal vs external links
- Counts total links on page
- Lists up to 50 internal links
- Shows up to 20 external links
- Extracts resource URLs (scripts, stylesheets, images)
- Analyzes site structure

**Output:**
- Total link count
- Categorized internal/external links
- Resource inventory
- Timestamp of crawl

---

## 🤖 AI Skills (4 Skills)

### 1. Summarize - Intelligent Text Summarization
**Description:** Extract key information and create concise summaries

**How to use:**
- Select text or use on entire page
- Right-click → Mapping AI Assistant → Summarize
- OR: Click extension icon → Summarize

**Algorithm:**
- Extractive summarization using keyword detection
- Identifies sentences with important keywords
- Selects sentences above average length
- Returns top 3-5 key sentences

**Output:**
- Summary text
- Original sentence count
- Summary sentence count
- Compression ratio (%)
- Statistics panel

---

### 2. Fact Check - Claim Verification
**Description:** Identify verifiable claims and provide verification guidance

**How to use:**
- Select text containing claims
- Right-click → Mapping AI Assistant → Fact Check
- OR: Click extension icon → Fact Check

**Algorithm:**
- Identifies sentences with claim indicators
- Detects statements with verbs like "is", "has", "will"
- Assigns confidence levels
- Provides verification recommendations

**Output:**
- List of identified claims
- Confidence rating for each claim
- Verification status
- Recommendations for cross-referencing

---

### 3. Create Report - Comprehensive Reports
**Description:** Generate structured analytical reports

**How to use:**
- Select text or use on entire page
- Right-click → Mapping AI Assistant → Create Report
- OR: Click extension icon → Create Report

**Features:**
- Multi-section report structure
- Automatic content analysis
- Metadata inclusion
- Professional formatting

**Output:**
- Report title
- Generation timestamp
- Overview section
- Content analysis section
- Summary section
- Generator metadata

---

### 4. Analyze - Deep Text Analysis
**Description:** Statistical analysis of text content

**How to use:**
- Select text or use on entire page
- Right-click → Mapping AI Assistant → Analyze
- OR: Click extension icon → Analyze

**Metrics Analyzed:**
- Character count
- Word count
- Sentence count
- Paragraph count
- Average words per sentence
- Average sentences per paragraph
- Top 10 most frequent words (min 4 characters)
- Reading time estimate (200 words/minute)
- Complexity rating (Low/Medium/High)

**Output:**
- Complete text statistics
- Word frequency chart
- Reading time estimate
- Complexity assessment

---

## 👤 User Features (2 Features)

### 1. Right-Click Context Menu
**Description:** Quick access to all tools from anywhere on the web

**Features:**
- Hierarchical menu structure
- Context-aware options
- Appears on: selection, page, links
- Organized by category (Tools/AI Skills)
- Includes sticky mode toggle

**Menu Structure:**
```
Mapping AI Assistant
  ├── Search with Tavily (on selection)
  ├── Extract Content (on page/link)
  ├── Map Location (on selection)
  ├── Crawl Website (on page/link)
  ├── ─────────────── (separator)
  ├── Summarize (on selection/page)
  ├── Fact Check (on selection)
  ├── Create Report (on selection/page)
  ├── Analyze (on selection/page)
  ├── ─────────────── (separator)
  └── Toggle Sticky Mode (on page)
```

**Contexts:**
- **On text selection:** Search, Map, Summarize, Fact Check, Analyze
- **On page:** Extract, Crawl, all AI skills
- **On links:** Extract, Crawl

---

### 2. Sticky Mode
**Description:** Keep result panels visible until manually closed

**Features:**
- Toggle on/off from popup or context menu
- Visual indicator (green badge) when enabled
- Prevents auto-dismiss of panels
- Persists across page reloads
- Per-browser setting (stored in sync storage)

**How to use:**
- **Enable:** Click extension icon → Toggle Sticky Mode ON
- **OR:** Right-click → Mapping AI Assistant → Toggle Sticky Mode
- **Indicator:** Green "📌 Sticky Mode ON" badge appears bottom-right
- **Disable:** Toggle off the same way

**Behavior:**
- **ON:** Results stay until you close them (click X button)
- **OFF:** Results auto-dismiss after 30 seconds

---

## 🎨 UI Features

### Result Panels
- **Draggable:** Click and hold header to move anywhere on screen
- **Resizable:** Fixed size optimized for readability
- **Styled:** Modern design with gradient headers
- **Scrollable:** Content area scrolls for long results
- **Closeable:** X button in top-right corner
- **Color-coded:** Different colors for different result types

### Extension Popup
- **Compact:** 380px wide, responsive height
- **Organized:** Tools, AI Skills, Features, Settings sections
- **Interactive:** Hover effects, smooth transitions
- **Settings:** API key storage with password field
- **Visual:** Icons and emojis for easy navigation

### Animations
- **Slide-in:** Panels slide in from right
- **Fade-in:** Smooth opacity transitions
- **Hover effects:** Buttons scale and change color
- **Status messages:** Temporary notifications

---

## 🔒 Permissions Used

| Permission | Purpose |
|------------|---------|
| `contextMenus` | Create right-click menu options |
| `activeTab` | Access current tab content |
| `storage` | Save settings and preferences |
| `tabs` | Manage tabs and send messages |
| `scripting` | Inject content scripts |
| `notifications` | Show status notifications |
| `host_permissions` | Access web pages for extraction |

---

## 💾 Storage

### Stored Settings
- **tavilyApiKey:** User's Tavily API key (encrypted)
- **stickyMode:** Boolean flag for sticky mode state
- **openMapsInNewTab:** Preference for map opening (default: true)

### Storage Type
- **chrome.storage.sync:** Syncs across user's Chrome browsers

---

## 🎯 Performance

### Response Times
- **Extract:** < 1 second (instant)
- **Crawl:** < 2 seconds (depends on page size)
- **Summarize:** < 1 second
- **Fact Check:** < 1 second
- **Analyze:** < 1 second
- **Report:** < 1 second
- **Search:** 1-3 seconds (depends on API)
- **Map:** Instant (opens URL)

### Resource Usage
- **Memory:** ~20-30 MB (typical extension)
- **CPU:** Minimal (only during active operations)
- **Network:** Only for Search tool (API calls)

---

## 🔄 Browser Compatibility

### Fully Supported
- ✅ Google Chrome (latest)
- ✅ Microsoft Edge (Chromium-based)
- ✅ Brave Browser
- ✅ Opera (Chromium-based)
- ✅ Vivaldi

### Requirements
- Manifest V3 support
- Chrome Extension APIs
- Modern JavaScript (ES6+)

---

## 📊 Statistics

### Code Stats
- **Total Files:** 16
- **JavaScript:** ~1,200 lines
- **CSS:** ~690 lines
- **HTML:** ~470 lines
- **Documentation:** ~1,600 lines

### Features Count
- **Tools:** 4
- **AI Skills:** 4
- **User Features:** 2
- **Context Menu Items:** 10
- **UI Components:** 8

---

## 🚀 Future Enhancements (Potential)

### Tools
- [ ] PDF extraction
- [ ] Screenshot capture
- [ ] Translation tool
- [ ] Text-to-speech

### AI Skills
- [ ] Sentiment analysis
- [ ] Entity extraction
- [ ] Question answering
- [ ] Text comparison

### Features
- [ ] Export results (JSON, CSV, PDF)
- [ ] History of operations
- [ ] Keyboard shortcuts
- [ ] Dark mode theme
- [ ] Multi-language support

---

**Last Updated:** 2024
**Version:** 1.0.0
