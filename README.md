# Washington Times News Scraper

Automated news scraper for Washington Times that fetches articles with full content, images, and styling. Features a clean news homepage and powerful admin panel.

## 🎯 Features

- ✅ **Clean Homepage** - Professional news display at `/`
- ✅ **Admin Panel** - Full scraping controls at `/scraper`
- ✅ **Auto-scraping** every 15 minutes via Vercel Cron Jobs
- ✅ **RSS feed monitoring** for new articles
- ✅ **Full article extraction** with images, CSS, and HTML
- ✅ **Supabase storage** for articles and metadata
- ✅ **Click-through attribution** to original Washington Times articles
- ✅ **Category filtering** (Politics, World, Opinion, Sports, News)
- ✅ **Responsive design** with modern UI
- ✅ **No redeployment needed** - runs automatically

## 🛠️ Tech Stack

- **Next.js 14** - React framework for Vercel
- **Supabase** - PostgreSQL database for storing articles
- **Cheerio** - HTML parsing and scraping
- **Axios** - HTTP requests
- **Vercel Cron Jobs** - Automated scraping every 15 minutes

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd wt-scraper
npm install
```

### 2. Set Up Supabase Database

1. Create a free account at https://supabase.com
2. Create a new project
3. Go to SQL Editor and run the contents of `schema.sql`
4. Get your credentials from Settings → API:
   - Project URL
   - anon/public key

### 3. Configure Environment Variables

Create `.env.local` file:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CRON_SECRET=your-random-secret-key-here
SITE_URL=http://localhost:3000
```

### 4. Test Locally

```bash
npm run dev
```

- Homepage: http://localhost:3000
- Admin Panel: http://localhost:3000/scraper

### 5. Deploy to Production

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment guide.

Quick deploy:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

## How It Works

### Automatic Scraping

The scraper runs automatically every 15 minutes via Vercel Cron:

```
vercel.json → Cron triggers /api/scrape-new every 15 min
              ↓
         Fetches RSS feeds
              ↓
         Scrapes new articles
              ↓
         Saves to MongoDB
              ↓
         Frontend displays articles
```

### Manual Scraping

Trigger scraping manually:

```bash
curl -X POST https://your-site.vercel.app/api/scrape-new \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## API Endpoints

### GET /api/articles
Get all articles with pagination and filtering

```bash
# Get all articles
GET /api/articles?limit=50&skip=0

# Filter by category
GET /api/articles?category=Politics&limit=20
```

### GET /api/article/[id]
Get single article by ID

```bash
GET /api/article/507f1f77bcf86cd799439011
```

### POST /api/scrape-new
Trigger scraping (requires authorization)

```bash
POST /api/scrape-new
Authorization: Bearer YOUR_CRON_SECRET
```

### GET /api/stats
Get scraper statistics

```bash
GET /api/stats
```

## 📁 Project Structure

```
wt-scraper/
├── lib/
│   ├── scraper.js       # Washington Times scraper logic
│   └── db.js            # Supabase connection and queries
├── pages/
│   ├── api/
│   │   ├── scrape-new.js    # Cron endpoint for scraping
│   │   ├── articles.js      # Get all articles
│   │   ├── article/[id].js  # Get single article
│   │   └── stats.js         # Get statistics
│   ├── index.js         # 🏠 Homepage - Clean news display
│   ├── scraper.js       # 🎛️ Admin Panel - Scraping controls
│   ├── article/[id].js  # Article detail page
│   └── _app.js          # Next.js app wrapper
├── styles/
│   └── globals.css      # Global styles
├── schema.sql           # Supabase database schema
├── vercel.json          # Vercel config with cron jobs
├── DEPLOYMENT.md        # 📖 Complete deployment guide
├── package.json         # Dependencies
└── README.md            # This file
```

## 🌐 Routes

- **`/`** - Homepage with all articles (public-facing)
- **`/scraper`** - Admin panel for managing scraping
- **`/article/[id]`** - Individual article page
- **`/api/articles`** - API endpoint for fetching articles
- **`/api/scrape-new`** - Cron endpoint (protected by CRON_SECRET)

## Configuration

### Scraping Frequency

Edit `vercel.json` to change scraping frequency:

```json
{
  "crons": [
    {
      "path": "/api/scrape-new",
      "schedule": "*/15 * * * *"  // Every 15 minutes
    }
  ]
}
```

Cron schedule examples:
- `*/15 * * * *` - Every 15 minutes
- `*/30 * * * *` - Every 30 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours

### RSS Feeds

Edit `lib/scraper.js` to add/remove RSS feeds:

```javascript
this.rssFeeds = [
  'https://www.washingtontimes.com/rss/headlines/news/',
  'https://www.washingtontimes.com/rss/headlines/news/politics/',
  // Add more feeds here
];
```

## 🔧 Troubleshooting

### Cron not running

1. Check Vercel dashboard → Project → Cron Jobs
2. Verify `CRON_SECRET` is set in environment variables
3. Check function logs in Vercel dashboard

### Supabase connection issues

1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
2. Check that `schema.sql` has been run in Supabase SQL Editor
3. Ensure Row Level Security policies are set up

### No articles appearing

1. Visit `/scraper` and manually trigger scraping
2. Enter your `CRON_SECRET` and click "Trigger Scraping Now"
3. Check Vercel function logs for errors
4. Verify Supabase database has the articles table
5. Check Supabase logs for any errors

## Legal Notice

This scraper is for educational purposes. Ensure you comply with:
- Washington Times Terms of Service
- Copyright laws
- robots.txt directives
- Fair use policies

Always attribute content to the original source and link back to Washington Times.

## License

MIT License - Use at your own risk
