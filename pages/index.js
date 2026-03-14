import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
        <title>Washington Times - Politics, Breaking News, US and World News</title>
        <meta name="description" content="The Washington Times delivers breaking news and commentary on the issues that affect the future of our nation." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="https://www.washingtontimes.com/static/icons/favicon-32x32.png" />
      </Head>

      <div className="page-wrapper">
        <header className="site-header">
          <div className="header-container">
            <div className="logo-section">
              <h1 className="site-title">Washington Times</h1>
              <p className="site-tagline">Politics, Breaking News, US and World News</p>
            </div>
            <nav className="header-nav">
              <Link href="/scraper" className="admin-link">
                Admin Panel
              </Link>
            </nav>
          </div>
        </header>

        <main className="main-content">
          <div className="content-container">
            {stats && (
              <div className="stats-bar">
                <span className="stat-item">📰 {stats.totalArticles} Articles</span>
                {stats.lastScraped && (
                  <span className="stat-item">🔄 Updated: {formatDate(stats.lastScraped)}</span>
                )}
              </div>
            )}

            <nav className="categories-nav">
              <button 
                className={`category-btn ${!selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                All News
              </button>
              {stats?.categories.map(category => (
                <button
                  key={category}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </nav>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading latest news...</p>
              </div>
            ) : articles.length > 0 ? (
              <div className="articles-layout">
                {articles.map((article, index) => (
                  <article key={article.id} className={`news-card ${index === 0 ? 'featured' : ''}`}>
                    {article.ogImage && (
                      <div className="card-image">
                        <img src={article.ogImage} alt={article.title} loading="lazy" />
                        <span className="category-tag">{article.category}</span>
                      </div>
                    )}
                    
                    <div className="card-body">
                      <h2 className="card-title">
                        <Link href={`/article/${article.id}`}>
                          {article.title}
                        </Link>
                      </h2>
                      
                      {article.description && (
                        <p className="card-excerpt">{article.description}</p>
                      )}
                      
                      <div className="card-footer">
                        <div className="meta-info">
                          {article.author && <span className="author-name">By {article.author}</span>}
                          <span className="publish-date">{formatDate(article.publishDate)}</span>
                        </div>
                        <a 
                          href={article.originalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="source-link"
                        >
                          View Original →
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h2>No Articles Available</h2>
                <p>Articles are automatically scraped every 15 minutes. Check back soon!</p>
                <Link href="/scraper" className="scraper-link">
                  Go to Admin Panel
                </Link>
              </div>
            )}
          </div>
        </main>

        <footer className="site-footer">
          <div className="footer-container">
            <p>© {new Date().getFullYear()} Washington Times News Mirror</p>
            <p className="footer-note">All content sourced from <a href="https://www.washingtontimes.com" target="_blank" rel="noopener noreferrer">washingtontimes.com</a></p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #f5f5f5;
        }

        .site-header {
          background: #a9091f;
          color: white;
          padding: 20px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-section {
          flex: 1;
        }

        .site-title {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .site-tagline {
          margin: 5px 0 0 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .header-nav {
          display: flex;
          gap: 20px;
        }

        .admin-link {
          padding: 10px 20px;
          background: rgba(255,255,255,0.2);
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: background 0.3s ease;
        }

        .admin-link:hover {
          background: rgba(255,255,255,0.3);
        }

        .main-content {
          flex: 1;
          padding: 30px 0;
        }

        .content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .stats-bar {
          background: white;
          padding: 15px 25px;
          border-radius: 8px;
          margin-bottom: 25px;
          display: flex;
          gap: 30px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          font-size: 0.9rem;
        }

        .stat-item {
          color: #333;
        }

        .categories-nav {
          display: flex;
          gap: 12px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }

        .category-btn {
          padding: 10px 24px;
          border: 2px solid #ddd;
          background: white;
          border-radius: 30px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          color: #333;
        }

        .category-btn:hover {
          border-color: #a9091f;
          color: #a9091f;
        }

        .category-btn.active {
          background: #a9091f;
          color: white;
          border-color: #a9091f;
        }

        .loading-state {
          text-align: center;
          padding: 80px 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #a9091f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .articles-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .news-card {
          background: white;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
        }

        .news-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }

        .news-card.featured {
          grid-column: 1 / -1;
          flex-direction: row;
        }

        .news-card.featured .card-image {
          width: 50%;
          height: 400px;
        }

        .news-card.featured .card-body {
          width: 50%;
          padding: 40px;
        }

        .news-card.featured .card-title {
          font-size: 2rem;
        }

        .card-image {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: #e0e0e0;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .news-card:hover .card-image img {
          transform: scale(1.05);
        }

        .category-tag {
          position: absolute;
          top: 15px;
          left: 15px;
          background: #a9091f;
          color: white;
          padding: 6px 14px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .card-body {
          padding: 25px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .card-title {
          margin: 0 0 15px 0;
          font-size: 1.4rem;
          line-height: 1.3;
          font-weight: 700;
        }

        .card-title a {
          color: #1a1a1a;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .card-title a:hover {
          color: #a9091f;
        }

        .card-excerpt {
          color: #555;
          line-height: 1.6;
          margin: 0 0 20px 0;
          font-size: 0.95rem;
          flex: 1;
        }

        .card-footer {
          margin-top: auto;
          padding-top: 15px;
          border-top: 1px solid #eee;
        }

        .meta-info {
          display: flex;
          gap: 15px;
          margin-bottom: 12px;
          font-size: 0.85rem;
          color: #777;
          flex-wrap: wrap;
        }

        .author-name {
          font-weight: 600;
          color: #333;
        }

        .source-link {
          display: inline-block;
          color: #a9091f;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: color 0.2s ease;
        }

        .source-link:hover {
          color: #7a0616;
          text-decoration: underline;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .empty-state h2 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .empty-state p {
          color: #666;
          margin-bottom: 25px;
        }

        .scraper-link {
          display: inline-block;
          padding: 12px 30px;
          background: #a9091f;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          transition: background 0.3s ease;
        }

        .scraper-link:hover {
          background: #7a0616;
        }

        .site-footer {
          background: #1a1a1a;
          color: white;
          padding: 30px 0;
          margin-top: auto;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          text-align: center;
        }

        .footer-container p {
          margin: 5px 0;
          font-size: 0.9rem;
        }

        .footer-note {
          opacity: 0.8;
        }

        .footer-note a {
          color: #a9091f;
          text-decoration: none;
        }

        .footer-note a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .site-title {
            font-size: 1.5rem;
          }

          .site-tagline {
            font-size: 0.8rem;
          }

          .header-container {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }

          .articles-layout {
            grid-template-columns: 1fr;
          }

          .news-card.featured {
            flex-direction: column;
          }

          .news-card.featured .card-image,
          .news-card.featured .card-body {
            width: 100%;
          }

          .news-card.featured .card-image {
            height: 250px;
          }

          .news-card.featured .card-body {
            padding: 25px;
          }

          .news-card.featured .card-title {
            font-size: 1.5rem;
          }

          .stats-bar {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </>
  );
}
