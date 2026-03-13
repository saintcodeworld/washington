const axios = require('axios');
const cheerio = require('cheerio');
const FeedParser = require('feedparser-promised');

class WashingtonTimesScraper {
  constructor() {
    this.baseUrl = 'https://www.washingtontimes.com';
    this.rssFeeds = [
      'https://www.washingtontimes.com/rss/headlines/news/',
      'https://www.washingtontimes.com/rss/headlines/news/politics/',
      'https://www.washingtontimes.com/rss/headlines/news/world/',
      'https://www.washingtontimes.com/rss/headlines/opinion/',
      'https://www.washingtontimes.com/rss/headlines/sports/',
    ];
  }

  async fetchRSSFeeds() {
    try {
      const allArticles = [];
      
      for (const feedUrl of this.rssFeeds) {
        try {
          const items = await FeedParser.parse(feedUrl);
          
          items.forEach(item => {
            allArticles.push({
              title: item.title,
              link: item.link,
              description: item.description,
              pubDate: new Date(item.pubdate),
              category: this.getCategoryFromUrl(feedUrl),
              guid: item.guid || item.link,
            });
          });
        } catch (err) {
          console.error(`Error fetching feed ${feedUrl}:`, err.message);
        }
      }
      
      return allArticles;
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      return [];
    }
  }

  getCategoryFromUrl(url) {
    if (url.includes('/politics/')) return 'Politics';
    if (url.includes('/world/')) return 'World';
    if (url.includes('/opinion/')) return 'Opinion';
    if (url.includes('/sports/')) return 'Sports';
    return 'News';
  }

  async scrapeArticle(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 30000
      });

      const $ = cheerio.load(response.data);
      
      const article = {
        url: url,
        title: $('h1.page-headline').text().trim() || $('meta[property="og:title"]').attr('content'),
        author: $('.author-name').text().trim() || $('.byline').text().trim(),
        publishDate: $('time').attr('datetime') || $('.timestamp').text().trim(),
        content: this.extractContent($),
        images: this.extractImages($),
        css: this.extractCSS($),
        scripts: this.extractScripts($),
        metaDescription: $('meta[name="description"]').attr('content'),
        ogImage: $('meta[property="og:image"]').attr('content'),
      };

      return article;
    } catch (error) {
      console.error(`Error scraping article ${url}:`, error.message);
      return null;
    }
  }

  extractContent($) {
    const contentSelectors = [
      '.article-text',
      '.article-content',
      '.story-text',
      '[itemprop="articleBody"]',
      '.entry-content'
    ];

    for (const selector of contentSelectors) {
      const content = $(selector);
      if (content.length > 0) {
        return content.html();
      }
    }

    return '';
  }

  extractImages($) {
    const images = [];
    
    $('img').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src');
      const alt = $(elem).attr('alt');
      
      if (src && !src.includes('data:image')) {
        images.push({
          src: src.startsWith('http') ? src : this.baseUrl + src,
          alt: alt || '',
        });
      }
    });

    return images;
  }

  extractCSS($) {
    const cssLinks = [];
    
    $('link[rel="stylesheet"]').each((i, elem) => {
      const href = $(elem).attr('href');
      if (href) {
        cssLinks.push(href.startsWith('http') ? href : this.baseUrl + href);
      }
    });

    $('style').each((i, elem) => {
      cssLinks.push({
        inline: true,
        content: $(elem).html()
      });
    });

    return cssLinks;
  }

  extractScripts($) {
    const scripts = [];
    
    $('script[src]').each((i, elem) => {
      const src = $(elem).attr('src');
      if (src && !src.includes('google') && !src.includes('analytics')) {
        scripts.push(src.startsWith('http') ? src : this.baseUrl + src);
      }
    });

    return scripts;
  }

  async downloadAsset(url) {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      
      return {
        data: Buffer.from(response.data).toString('base64'),
        contentType: response.headers['content-type']
      };
    } catch (error) {
      console.error(`Error downloading asset ${url}:`, error.message);
      return null;
    }
  }
}

module.exports = WashingtonTimesScraper;
