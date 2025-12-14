// MCP Client for Tavily Remote Server
export class MCPClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://mcp.tavily.com/mcp/';
    this.sessionId = null;
  }

  async connect() {
    try {
      // Initialize connection to Tavily MCP server
      const response = await fetch(`${this.baseUrl}?tavilyApiKey=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: {
              roots: { listChanged: true },
              sampling: {}
            },
            clientInfo: {
              name: 'ai-web-assistant',
              version: '1.0.0'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to connect to MCP server: ${response.statusText}`);
      }

      const data = await response.json();
      this.sessionId = data.result?.sessionId || Date.now().toString();
      return data;
    } catch (error) {
      console.error('MCP connection error:', error);
      throw error;
    }
  }

  async callTool(toolName, params) {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}?tavilyApiKey=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/call',
          params: {
            name: toolName,
            arguments: params
          }
        })
      });

      if (!response.ok) {
        throw new Error(`MCP tool call failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'MCP tool error');
      }

      return data.result;
    } catch (error) {
      console.error(`MCP ${toolName} error:`, error);
      throw error;
    }
  }

  async search(query, options = {}) {
    const params = {
      query,
      search_depth: options.deep ? 'advanced' : 'basic',
      max_results: options.maxResults || 5,
      include_answer: true,
      include_raw_content: false,
      include_images: true
    };

    return await this.callTool('tavily-search', params);
  }

  async extract(url) {
    return await this.callTool('tavily-extract', { url });
  }

  async map(url, options = {}) {
    const params = {
      url,
      max_depth: options.maxDepth || 2,
      include_subdomains: options.includeSubdomains || false
    };

    return await this.callTool('tavily-map', params);
  }

  async crawl(url, options = {}) {
    const params = {
      url,
      max_pages: options.maxPages || 10,
      include_metadata: true
    };

    return await this.callTool('tavily-crawl', params);
  }

  async listTools() {
    try {
      const response = await fetch(`${this.baseUrl}?tavilyApiKey=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'tools/list',
          params: {}
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to list tools: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('List tools error:', error);
      throw error;
    }
  }
}
