import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Scraper() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [cronSecret, setCronSecret] = useState('');
  const [showAdmin, setShowAdmin] = useState(true);

  useEffect(() => {
    fetchArticles();
    fetchStats();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory ? `&category=${selectedCategory}` : '';
      const response = await fetch(`/api/articles?limit=50${categoryParam}`);
      const data = await response.json();
      
      if (data.success) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const triggerScraping = async () => {
    if (!cronSecret) {
      alert('Please enter your CRON_SECRET first');
      return;
    }

    try {
      setScraping(true);
      setScrapeResult(null);
      
      const response = await fetch('/api/scrape-new', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cronSecret}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setScrapeResult(data.results);
        await fetchArticles();
        await fetchStats();
      } else {
        alert('Scraping failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error triggering scraping:', error);
      alert('Error triggering scraping: ' + error.message);
    } finally {
      setScraping(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Head>
        <title>Washington Times - Scraper Admin</title>
        <meta name="description" content="Admin panel for Washington Times scraper" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="container">
        <header className="header">
          <h1>Washington Times News</h1>
          <p className="subtitle">Latest articles from washingtontimes.com</p>
          
          {stats && (
            <div className="stats">
              <span>Total Articles: {stats.totalArticles}</span>
              {stats.lastScraped && (
                <span>Last Updated: {formatDate(stats.lastScraped)}</span>
              )}
            </div>
          )}

          <button 
            className="admin-toggle"
            onClick={() => setShowAdmin(!showAdmin)}
          >
            {showAdmin ? '🔒 Hide Admin' : '⚙️ Show Admin'}
          </button>
        </header>

        {showAdmin && (
          <div className="admin-panel">
            <h2>🎛️ Scraping Controls</h2>
            <p className="admin-info">
              Automated scraping runs every 15 minutes via Vercel Cron. 
              Use this panel to trigger manual scraping.
            </p>
            
            <div className="admin-form">
              <label htmlFor="cronSecret">CRON_SECRET:</label>
              <input
                id="cronSecret"
                type="password"
                value={cronSecret}
                onChange={(e) => setCronSecret(e.target.value)}
                placeholder="Enter your CRON_SECRET from .env"
                className="secret-input"
              />
              
              <button 
                onClick={triggerScraping}
                disabled={scraping || !cronSecret}
                className="scrape-button"
              >
                {scraping ? '🔄 Scraping...' : '🚀 Trigger Scraping Now'}
              </button>
            </div>

            {scrapeResult && (
              <div className="scrape-results">
                <h3>✅ Scraping Complete</h3>
                <div className="result-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Found:</span>
                    <span className="stat-value">{scrapeResult.total}</span>
                  </div>
                  <div className="stat-item success">
                    <span className="stat-label">New Articles:</span>
                    <span className="stat-value">{scrapeResult.new}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Already Exists:</span>
                    <span className="stat-value">{scrapeResult.existing}</span>
                  </div>
                  <div className="stat-item error">
                    <span className="stat-label">Failed:</span>
                    <span className="stat-value">{scrapeResult.failed}</span>
                  </div>
                </div>
                
                {scrapeResult.articles && scrapeResult.articles.length > 0 && (
                  <div className="new-articles-list">
                    <h4>New Articles Added:</h4>
                    <ul>
                      {scrapeResult.articles.map((article, idx) => (
                        <li key={idx}>
                          <Link href={`/article/${article.id}`}>
                            {article.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="admin-tips">
              <h4>💡 Tips:</h4>
              <ul>
                <li>Automatic scraping runs every 15 minutes (configured in vercel.json)</li>
                <li>Each scraping session processes up to 10 latest articles</li>
                <li>Duplicate articles are automatically skipped</li>
                <li>Check Vercel dashboard for cron job logs</li>
              </ul>
            </div>
          </div>
        )}

        <nav className="categories">
          <button 
            className={!selectedCategory ? 'active' : ''}
            onClick={() => setSelectedCategory(null)}
          >
            All
          </button>
          {stats?.categories.map(category => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>

        {loading ? (
          <div className="loading">Loading articles...</div>
        ) : (
          <div className="articles-grid">
            {articles.map(article => (
              <article key={article.id} className="article-card">
                {article.ogImage && (
                  <div className="article-image">
                    <img src={article.ogImage} alt={article.title} />
                  </div>
                )}
                
                <div className="article-content">
                  <span className="category-badge">{article.category}</span>
                  
                  <h2 className="article-title">
                    <Link href={`/article/${article.id}`}>
                      {article.title}
                    </Link>
                  </h2>
                  
                  {article.description && (
                    <p className="article-description">{article.description}</p>
                  )}
                  
                  <div className="article-meta">
                    {article.author && <span className="author">{article.author}</span>}
                    <span className="date">{formatDate(article.publishDate)}</span>
                  </div>
                  
                  <a 
                    href={article.originalUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="read-original"
                  >
                    Read on Washington Times →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="no-articles">
            <p>No articles found. The scraper will fetch articles automatically every 15 minutes.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px 20px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          border-radius: 12px;
        }

        .header h1 {
          margin: 0 0 10px 0;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .subtitle {
          margin: 0 0 20px 0;
          opacity: 0.9;
          font-size: 1.1rem;
        }

        .stats {
          display: flex;
          gap: 30px;
          justify-content: center;
          margin-top: 20px;
          font-size: 0.9rem;
        }

        .categories {
          display: flex;
          gap: 10px;
          margin-bottom: 30px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .categories button {
          padding: 10px 20px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 25px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .categories button:hover {
          border-color: #1a1a1a;
          background: #f5f5f5;
        }

        .categories button.active {
          background: #1a1a1a;
          color: white;
          border-color: #1a1a1a;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          font-size: 1.2rem;
          color: #666;
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }

        .article-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .article-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .article-image {
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f0f0f0;
        }

        .article-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .article-content {
          padding: 20px;
        }

        .category-badge {
          display: inline-block;
          padding: 4px 12px;
          background: #e74c3c;
          color: white;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .article-title {
          margin: 0 0 12px 0;
          font-size: 1.3rem;
          line-height: 1.4;
        }

        .article-title a {
          color: #1a1a1a;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .article-title a:hover {
          color: #e74c3c;
        }

        .article-description {
          color: #555;
          line-height: 1.6;
          margin: 0 0 15px 0;
          font-size: 0.95rem;
        }

        .article-meta {
          display: flex;
          gap: 15px;
          margin-bottom: 15px;
          font-size: 0.85rem;
          color: #777;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .author {
          font-weight: 600;
        }

        .read-original {
          display: inline-block;
          color: #e74c3c;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .read-original:hover {
          color: #c0392b;
          text-decoration: underline;
        }

        .no-articles {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .admin-toggle {
          margin-top: 20px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.5);
          color: white;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .admin-toggle:hover {
          background: rgba(255, 255, 255, 0.3);
          border-color: white;
        }

        .admin-panel {
          background: white;
          border-radius: 12px;
          padding: 30px;
          margin-bottom: 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 2px solid #e74c3c;
        }

        .admin-panel h2 {
          margin: 0 0 10px 0;
          color: #1a1a1a;
          font-size: 1.8rem;
        }

        .admin-info {
          color: #666;
          margin-bottom: 20px;
          line-height: 1.6;
        }

        .admin-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 30px;
        }

        .admin-form label {
          font-weight: 600;
          color: #1a1a1a;
        }

        .secret-input {
          padding: 12px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .secret-input:focus {
          outline: none;
          border-color: #e74c3c;
        }

        .scrape-button {
          padding: 15px 30px;
          background: #e74c3c;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .scrape-button:hover:not(:disabled) {
          background: #c0392b;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(231, 76, 60, 0.3);
        }

        .scrape-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .scrape-results {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .scrape-results h3 {
          margin: 0 0 15px 0;
          color: #27ae60;
        }

        .result-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-item {
          background: white;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }

        .stat-item.success {
          border-left-color: #27ae60;
        }

        .stat-item.error {
          border-left-color: #e74c3c;
        }

        .stat-label {
          display: block;
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 5px;
        }

        .stat-value {
          display: block;
          font-size: 1.8rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .new-articles-list {
          background: white;
          padding: 15px;
          border-radius: 8px;
        }

        .new-articles-list h4 {
          margin: 0 0 10px 0;
          color: #1a1a1a;
        }

        .new-articles-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .new-articles-list li {
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .new-articles-list li:last-child {
          border-bottom: none;
        }

        .new-articles-list a {
          color: #e74c3c;
          text-decoration: none;
          font-weight: 500;
        }

        .new-articles-list a:hover {
          text-decoration: underline;
        }

        .admin-tips {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          border-radius: 8px;
        }

        .admin-tips h4 {
          margin: 0 0 10px 0;
          color: #856404;
        }

        .admin-tips ul {
          margin: 0;
          padding-left: 20px;
          color: #856404;
        }

        .admin-tips li {
          margin-bottom: 5px;
        }

        @media (max-width: 768px) {
          .articles-grid {
            grid-template-columns: 1fr;
          }

          .header h1 {
            font-size: 2rem;
          }

          .stats {
            flex-direction: column;
            gap: 10px;
          }

          .result-stats {
            grid-template-columns: 1fr;
          }

          .admin-panel {
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
}
