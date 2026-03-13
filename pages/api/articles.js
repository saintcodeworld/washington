const { getArticles } = require('../../lib/db');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = 50, skip = 0, category } = req.query;
    
    const articles = await getArticles(
      parseInt(limit),
      parseInt(skip),
      category || null
    );

    return res.status(200).json({
      success: true,
      count: articles.length,
      articles: articles.map(article => ({
        id: article._id,
        title: article.title,
        description: article.description,
        category: article.category,
        author: article.author,
        publishDate: article.publishDate,
        originalUrl: article.originalUrl,
        ogImage: article.ogImage,
        scrapedAt: article.scrapedAt,
      }))
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
