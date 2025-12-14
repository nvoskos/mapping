// AI Skills Processor
export class AIProcessor {
  constructor(mcpClient) {
    this.mcpClient = mcpClient;
  }

  async summarize(text) {
    try {
      // Use search to find summarization context
      const searchResult = await this.mcpClient.search(`summarize: ${text.substring(0, 200)}`, {
        deep: true,
        maxResults: 3
      });

      // Create summary using search context
      const summary = this.createSummary(text, searchResult);
      return summary;
    } catch (error) {
      // Fallback to basic summarization
      return this.basicSummarize(text);
    }
  }

  async summarizePage(url) {
    try {
      const extracted = await this.mcpClient.extract(url);
      return await this.summarize(extracted.content || extracted.text || '');
    } catch (error) {
      throw new Error(`Failed to summarize page: ${error.message}`);
    }
  }

  async factCheck(claim) {
    try {
      const searchResult = await this.mcpClient.search(`fact check: ${claim}`, {
        deep: true,
        maxResults: 5
      });

      return this.analyzeFactCheck(claim, searchResult);
    } catch (error) {
      throw new Error(`Fact check failed: ${error.message}`);
    }
  }

  async createReport(topic, type = 'comprehensive') {
    try {
      let searchDepth = type === 'comprehensive' ? true : false;
      let maxResults = type === 'comprehensive' ? 10 : 5;

      const searchResult = await this.mcpClient.search(topic, {
        deep: searchDepth,
        maxResults
      });

      // Get additional context by crawling top result
      let additionalContext = null;
      if (searchResult.results && searchResult.results.length > 0) {
        try {
          additionalContext = await this.mcpClient.extract(searchResult.results[0].url);
        } catch (e) {
          console.warn('Could not extract additional context:', e);
        }
      }

      return this.generateReport(topic, type, searchResult, additionalContext);
    } catch (error) {
      throw new Error(`Report generation failed: ${error.message}`);
    }
  }

  async analyze(text, type = 'general') {
    try {
      const analysis = {
        type,
        timestamp: new Date().toISOString(),
        wordCount: text.split(/\s+/).length,
        characterCount: text.length
      };

      switch (type) {
        case 'sentiment':
          analysis.sentiment = this.analyzeSentiment(text);
          break;
        case 'technical':
          analysis.technical = this.analyzeTechnical(text);
          break;
        case 'competitive':
          // Use search for competitive analysis
          const competitors = await this.mcpClient.search(`competitive analysis ${text.substring(0, 100)}`, {
            deep: true,
            maxResults: 5
          });
          analysis.competitive = this.formatCompetitiveAnalysis(competitors);
          break;
        default:
          analysis.general = this.analyzeGeneral(text);
      }

      return analysis;
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  async analyzePage(url, type = 'general') {
    try {
      const extracted = await this.mcpClient.extract(url);
      const text = extracted.content || extracted.text || '';

      const analysis = await this.analyze(text, type);
      analysis.url = url;
      analysis.title = extracted.title || 'Unknown';

      return analysis;
    } catch (error) {
      throw new Error(`Page analysis failed: ${error.message}`);
    }
  }

  // Helper methods
  createSummary(text, searchContext) {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const keyPoints = sentences.slice(0, 3);

    return {
      summary: keyPoints.join(' '),
      keyPoints: keyPoints,
      wordCount: text.split(/\s+/).length,
      context: searchContext.answer || 'No additional context available'
    };
  }

  basicSummarize(text) {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const summary = sentences.slice(0, 3).join(' ');

    return {
      summary,
      keyPoints: sentences.slice(0, 3),
      wordCount: text.split(/\s+/).length
    };
  }

  analyzeFactCheck(claim, searchResult) {
    const sources = searchResult.results || [];

    return {
      claim,
      verdict: 'Research Required',
      confidence: sources.length > 0 ? 'Medium' : 'Low',
      sources: sources.slice(0, 5).map(s => ({
        title: s.title,
        url: s.url,
        snippet: s.content || s.snippet
      })),
      answer: searchResult.answer || 'No definitive answer found',
      checkedAt: new Date().toISOString()
    };
  }

  generateReport(topic, type, searchResult, additionalContext) {
    const report = {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report: ${topic}`,
      type,
      generatedAt: new Date().toISOString(),
      executive_summary: searchResult.answer || 'No summary available',
      sections: []
    };

    // Overview section
    report.sections.push({
      title: 'Overview',
      content: searchResult.answer || 'No overview available'
    });

    // Key Findings
    if (searchResult.results && searchResult.results.length > 0) {
      report.sections.push({
        title: 'Key Findings',
        content: searchResult.results.slice(0, 5).map((r, i) =>
          `${i + 1}. ${r.title}\n   ${r.content || r.snippet || ''}`
        ).join('\n\n')
      });
    }

    // Sources
    report.sections.push({
      title: 'Sources',
      content: (searchResult.results || []).map(r => `- ${r.title}\n  ${r.url}`).join('\n')
    });

    if (additionalContext) {
      report.sections.push({
        title: 'Additional Context',
        content: additionalContext.content || additionalContext.text || 'No additional context'
      });
    }

    return report;
  }

  analyzeSentiment(text) {
    const positive = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best'];
    const negative = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'disappointing'];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positive.some(p => word.includes(p))) positiveCount++;
      if (negative.some(n => word.includes(n))) negativeCount++;
    });

    const total = positiveCount + negativeCount;
    let sentiment = 'neutral';
    let score = 0;

    if (total > 0) {
      score = (positiveCount - negativeCount) / total;
      if (score > 0.2) sentiment = 'positive';
      else if (score < -0.2) sentiment = 'negative';
    }

    return {
      sentiment,
      score: score.toFixed(2),
      positiveCount,
      negativeCount
    };
  }

  analyzeTechnical(text) {
    const technicalTerms = /\b(API|SDK|database|algorithm|function|class|variable|array|object|server|client|protocol|interface|framework)\b/gi;
    const matches = text.match(technicalTerms) || [];

    return {
      technicalTermCount: matches.length,
      uniqueTerms: [...new Set(matches.map(m => m.toLowerCase()))],
      complexity: matches.length > 10 ? 'high' : matches.length > 5 ? 'medium' : 'low'
    };
  }

  analyzeGeneral(text) {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [];
    const words = text.split(/\s+/);

    return {
      readability: sentences.length > 0 ? (words.length / sentences.length).toFixed(1) : 0,
      sentenceCount: sentences.length,
      averageWordLength: words.reduce((sum, w) => sum + w.length, 0) / words.length || 0,
      paragraphs: text.split(/\n\n+/).length
    };
  }

  formatCompetitiveAnalysis(searchResult) {
    return {
      competitors: (searchResult.results || []).slice(0, 5).map(r => ({
        name: r.title,
        url: r.url,
        summary: r.content || r.snippet
      })),
      marketContext: searchResult.answer || 'No market context available'
    };
  }
}
