const WashingtonTimesScraper = require('../../lib/scraper');
const { saveArticle } = require('../../lib/db');

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const scraper = new WashingtonTimesScraper();
    
    console.log('Fetching RSS feeds...');
    const rssArticles = await scraper.fetchRSSFeeds();
    
    console.log(`Found ${rssArticles.length} articles from RSS feeds`);
    
    const results = {
      total: rssArticles.length,
      new: 0,
      existing: 0,
      failed: 0,
      articles: []
    };

    for (const rssArticle of rssArticles.slice(0, 10)) {
      try {
        console.log(`Scraping: ${rssArticle.title}`);
        
        const fullArticle = await scraper.scrapeArticle(rssArticle.link);
        
        if (!fullArticle) {
          results.failed++;
          continue;
        }

        const articleData = {
          ...rssArticle,
          ...fullArticle,
          originalUrl: rssArticle.link,
        };

        const saveResult = await saveArticle(articleData);
        
        if (saveResult.success) {
          results.new++;
          results.articles.push({
            title: articleData.title,
            url: articleData.url,
            id: saveResult.articleId
          });
        } else {
          results.existing++;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing article ${rssArticle.link}:`, error.message);
        results.failed++;
      }
    }

    console.log('Scraping completed:', results);

    return res.status(200).json({
      success: true,
      message: 'Scraping completed',
      results
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
