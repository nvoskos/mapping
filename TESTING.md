# Testing Guide for Mapping Chrome Extension

## Installation Testing

1. **Load Extension**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the mapping directory
   - Verify extension icon appears in toolbar

2. **Initial Setup**
   - Click extension icon
   - Verify popup opens correctly
   - Enter a Tavily API key in Settings (get from https://tavily.com)
   - Click "Save Key"
   - Verify success message appears

## Feature Testing

### 🔧 Tools Testing

#### Search Tool
1. Visit any webpage (e.g., Wikipedia)
2. Select some text
3. Right-click → "Mapping AI Assistant" → "Search with Tavily"
4. Verify results panel appears with search results
5. Test from popup: Click extension icon → Search → Enter query
6. Verify results display correctly

#### Extract Tool
1. Visit a content-rich webpage (e.g., a news article)
2. Right-click → "Mapping AI Assistant" → "Extract Content"
3. Verify extracted content panel shows:
   - Page title
   - Headings
   - Links
   - Meta information
4. Test from popup: Click extension icon → Extract
5. Verify all content is extracted properly

#### Map Tool
1. Select a location name (e.g., "New York")
2. Right-click → "Mapping AI Assistant" → "Map Location"
3. Verify Google Maps link appears or opens in new tab
4. Test from popup: Click extension icon → Map → Enter location
5. Verify map functionality works

#### Crawl Tool
1. Visit any website
2. Right-click → "Mapping AI Assistant" → "Crawl Website"
3. Verify crawl results panel shows:
   - Total links count
   - Internal links
   - External links
   - Resources (scripts, styles, images)
4. Test from popup: Click extension icon → Crawl
5. Verify crawl data is complete

### 🤖 AI Skills Testing

#### Summarize
1. Visit a long article or select a paragraph
2. Right-click → "Mapping AI Assistant" → "Summarize"
3. Verify summary panel shows:
   - Summary text
   - Sentence count
   - Compression ratio
4. Test with no selection (entire page)
5. Test from popup: Click extension icon → Summarize

#### Fact Check
1. Select a statement or claim
2. Right-click → "Mapping AI Assistant" → "Fact Check"
3. Verify fact check panel shows:
   - Identified claims
   - Confidence levels
   - Recommendations
4. Test with multiple claims
5. Test from popup: Click extension icon → Fact Check

#### Create Report
1. Visit a webpage or select text
2. Right-click → "Mapping AI Assistant" → "Create Report"
3. Verify report panel shows:
   - Report title
   - Generation timestamp
   - Multiple sections (Overview, Analysis, Summary)
   - Metadata
4. Test from popup: Click extension icon → Create Report

#### Analyze
1. Visit a text-heavy page or select text
2. Right-click → "Mapping AI Assistant" → "Analyze"
3. Verify analysis panel shows:
   - Text statistics (characters, words, sentences, paragraphs)
   - Top words with frequency
   - Reading time
   - Complexity rating
4. Test from popup: Click extension icon → Analyze

### 👤 User Features Testing

#### Right-click Context Menu
1. **On page**
   - Right-click on empty area
   - Verify "Mapping AI Assistant" menu appears
   - Verify all tools and AI skills are present
   
2. **On selection**
   - Select text
   - Right-click
   - Verify context-appropriate options appear
   
3. **On link**
   - Right-click on a link
   - Verify Extract and Crawl options available

#### Sticky Mode
1. **Enable from popup**
   - Click extension icon
   - Toggle "Sticky Mode" on
   - Verify green indicator (📌) appears on page
   - Perform any operation (e.g., Summarize)
   - Verify results stay on screen (don't auto-dismiss)
   
2. **Enable from context menu**
   - Right-click → "Mapping AI Assistant" → "Toggle Sticky Mode"
   - Verify indicator appears
   - Perform operations and verify results persist
   
3. **Disable**
   - Toggle off from popup or context menu
   - Verify indicator disappears
   - Verify results auto-dismiss after 30 seconds

## UI/UX Testing

### Result Panels
1. **Draggable**
   - Click and drag panel header
   - Verify panel moves smoothly
   
2. **Close Button**
   - Click X button on panel
   - Verify panel closes immediately
   
3. **Auto-dismiss** (when Sticky Mode off)
   - Open a result panel
   - Wait 30 seconds
   - Verify panel auto-closes

### Popup Interface
1. **Tool Buttons**
   - Hover over each tool button
   - Verify hover effect
   - Click each button
   - Verify appropriate action
   
2. **AI Buttons**
   - Hover over each AI button
   - Verify hover effect
   - Click each button
   - Verify appropriate action
   
3. **Settings**
   - Enter API key
   - Click Save
   - Verify saved (reload popup, key should be there)

## Browser Testing

Test on:
- [ ] Chrome (latest version)
- [ ] Chromium-based browsers (Edge, Brave, etc.)

## Error Handling Testing

1. **No API Key**
   - Clear API key from settings
   - Try to use Search tool
   - Verify error notification appears
   
2. **Invalid Location**
   - Use Map tool with empty/invalid location
   - Verify appropriate handling
   
3. **Empty Selection**
   - Try Fact Check without selecting text
   - Verify error message appears

## Performance Testing

1. **Large Pages**
   - Visit pages with lots of content
   - Try Extract and Crawl tools
   - Verify reasonable performance
   
2. **Multiple Operations**
   - Perform several operations in sequence
   - Verify no memory leaks or slowdowns

## Expected Results

All features should:
- ✓ Work without errors
- ✓ Display results in clean, styled panels
- ✓ Respond quickly (< 2 seconds for most operations)
- ✓ Handle edge cases gracefully
- ✓ Persist settings across browser sessions

## Known Limitations

- Search tool requires valid Tavily API key
- Map tool uses Google Maps (requires internet connection)
- AI skills use simple heuristics (not actual AI/ML models)
- Works best on standard web pages (may have issues with SPAs)

## Troubleshooting

If issues occur:
1. Open DevTools Console (F12)
2. Look for error messages
3. Check Network tab for failed requests
4. Verify extension is enabled in chrome://extensions/
5. Try reloading the page
6. Try reinstalling the extension
