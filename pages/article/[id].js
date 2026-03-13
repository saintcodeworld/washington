import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function Article() {
  const router = useRouter();
  const { id } = router.query;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/article/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setArticle(data.article);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadOriginal = () => {
    setRedirecting(true);
    setTimeout(() => {
      window.open(article.originalUrl, '_blank');
    }, 500);
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="error-container">
        <h1>Article not found</h1>
        <Link href="/">← Back to home</Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{article.title} - Washington Times</title>
        <meta name="description" content={article.metaDescription || article.description} />
      </Head>

      <div className="article-page">
        <nav className="breadcrumb">
          <Link href="/">← Back to all articles</Link>
        </nav>

        <article className="article-container">
          <div className="article-header">
            <span className="category-badge">{article.category}</span>
            <h1 className="article-title">{article.title}</h1>
            
            <div className="article-meta">
              {article.author && <span className="author">By {article.author}</span>}
              <span className="date">{formatDate(article.publishDate)}</span>
            </div>

            <div className="original-link-banner">
              <p>This article is from Washington Times</p>
              <button onClick={handleReadOriginal} className="read-original-btn">
                {redirecting ? 'Opening original article...' : 'Read Full Article on Washington Times →'}
              </button>
            </div>
          </div>

          {article.ogImage && (
            <div className="featured-image">
              <img src={article.ogImage} alt={article.title} />
            </div>
          )}

          <div className="article-body">
            {article.content && (
              <div 
                className="content"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            )}

            {!article.content && article.description && (
              <div className="description">
                <p>{article.description}</p>
              </div>
            )}
          </div>

          <div className="article-footer">
            <div className="cta-box">
              <h3>Continue reading on Washington Times</h3>
              <p>This is a preview. Click below to read the full article on the original website.</p>
              <a 
                href={article.originalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="cta-button"
              >
                Read Full Article →
              </a>
            </div>
          </div>
        </article>

        {article.css && article.css.length > 0 && (
          <>
            {article.css.map((css, index) => {
              if (css.inline) {
                return <style key={index} dangerouslySetInnerHTML={{ __html: css.content }} />;
              }
              return <link key={index} rel="stylesheet" href={css} />;
            })}
          </>
        )}
      </div>

      <style jsx>{`
        .loading-container,
        .error-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          flex-direction: column;
          gap: 20px;
        }

        .loading {
          font-size: 1.2rem;
          color: #666;
        }

        .article-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .breadcrumb {
          margin-bottom: 30px;
        }

        .breadcrumb a {
          color: #e74c3c;
          text-decoration: none;
          font-weight: 500;
        }

        .breadcrumb a:hover {
          text-decoration: underline;
        }

        .article-container {
          background: white;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .article-header {
          margin-bottom: 30px;
        }

        .category-badge {
          display: inline-block;
          padding: 6px 14px;
          background: #e74c3c;
          color: white;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .article-title {
          font-size: 2.5rem;
          line-height: 1.3;
          margin: 0 0 20px 0;
          color: #1a1a1a;
        }

        .article-meta {
          display: flex;
          gap: 20px;
          color: #777;
          font-size: 0.95rem;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 2px solid #eee;
        }

        .author {
          font-weight: 600;
        }

        .original-link-banner {
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          text-align: center;
        }

        .original-link-banner p {
          margin: 0 0 15px 0;
          color: #856404;
          font-weight: 500;
        }

        .read-original-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .read-original-btn:hover {
          background: #c0392b;
        }

        .featured-image {
          width: 100%;
          margin-bottom: 30px;
          border-radius: 8px;
          overflow: hidden;
        }

        .featured-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .article-body {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #333;
        }

        .content {
          margin-bottom: 40px;
        }

        .content :global(p) {
          margin-bottom: 1.2em;
        }

        .content :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 20px 0;
        }

        .content :global(a) {
          color: #e74c3c;
          text-decoration: none;
        }

        .content :global(a:hover) {
          text-decoration: underline;
        }

        .article-footer {
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #eee;
        }

        .cta-box {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
        }

        .cta-box h3 {
          margin: 0 0 15px 0;
          font-size: 1.8rem;
        }

        .cta-box p {
          margin: 0 0 25px 0;
          opacity: 0.9;
        }

        .cta-button {
          display: inline-block;
          background: #e74c3c;
          color: white;
          padding: 15px 40px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
          transition: background 0.3s ease;
        }

        .cta-button:hover {
          background: #c0392b;
        }

        @media (max-width: 768px) {
          .article-page {
            padding: 10px;
          }

          .article-container {
            padding: 20px;
          }

          .article-title {
            font-size: 1.8rem;
          }

          .article-meta {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </>
  );
}
