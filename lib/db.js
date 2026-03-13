const { MongoClient } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = client.db('washington-times');

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

async function saveArticle(article) {
  const { db } = await connectToDatabase();
  const collection = db.collection('articles');

  const existingArticle = await collection.findOne({ url: article.url });
  
  if (existingArticle) {
    return { success: false, message: 'Article already exists', articleId: existingArticle._id };
  }

  const result = await collection.insertOne({
    ...article,
    scrapedAt: new Date(),
    viewCount: 0,
  });

  return { success: true, message: 'Article saved', articleId: result.insertedId };
}

async function getArticles(limit = 50, skip = 0, category = null) {
  const { db } = await connectToDatabase();
  const collection = db.collection('articles');

  const query = category ? { category } : {};
  
  const articles = await collection
    .find(query)
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return articles;
}

async function getArticleByUrl(url) {
  const { db } = await connectToDatabase();
  const collection = db.collection('articles');

  const article = await collection.findOne({ url });
  return article;
}

async function getArticleById(id) {
  const { db } = await connectToDatabase();
  const { ObjectId } = require('mongodb');
  const collection = db.collection('articles');

  const article = await collection.findOne({ _id: new ObjectId(id) });
  return article;
}

async function incrementViewCount(articleId) {
  const { db } = await connectToDatabase();
  const { ObjectId } = require('mongodb');
  const collection = db.collection('articles');

  await collection.updateOne(
    { _id: new ObjectId(articleId) },
    { $inc: { viewCount: 1 } }
  );
}

async function getStats() {
  const { db } = await connectToDatabase();
  const collection = db.collection('articles');

  const totalArticles = await collection.countDocuments();
  const categories = await collection.distinct('category');
  
  const recentArticles = await collection
    .find()
    .sort({ scrapedAt: -1 })
    .limit(1)
    .toArray();

  return {
    totalArticles,
    categories,
    lastScraped: recentArticles[0]?.scrapedAt || null,
  };
}

module.exports = {
  connectToDatabase,
  saveArticle,
  getArticles,
  getArticleByUrl,
  getArticleById,
  incrementViewCount,
  getStats,
};
