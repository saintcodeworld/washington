const { getArticleById, incrementViewCount } = require('../../../lib/db');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    const article = await getArticleById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found'
      });
    }

    await incrementViewCount(id);

    return res.status(200).json({
      success: true,
      article
    });

  } catch (error) {
    console.error('Error fetching article:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
