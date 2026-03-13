# Washington Times Scraper

Automated news scraper for Washington Times that mirrors articles and redirects to original content.

## Features

- ✅ **Auto-scraping** every 15 minutes via Vercel Cron Jobs
- ✅ **RSS feed monitoring** for new articles
- ✅ **Full article extraction** with CSS/HTML styling
- ✅ **MongoDB storage** for articles and metadata
- ✅ **Click-through attribution** to original Washington Times articles
- ✅ **Category filtering** (Politics, World, Opinion, Sports, News)
- ✅ **Responsive design** with modern UI
- ✅ **No redeployment needed** - runs automatically

## Tech Stack

- **Next.js** - React framework for Vercel
- **MongoDB** - Database for storing articles
- **Cheerio** - HTML parsing and scraping
- **Axios** - HTTP requests
- **Vercel Cron Jobs** - Automated scraping

## Setup Instructions

### 1. Clone and Install

```bash
cd wt-scraper
npm install
```

### 2. Set Up MongoDB

Create a free MongoDB Atlas account:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Whitelist all IPs (0.0.0.0/0) for Vercel

### 3. Configure Environment Variables

Create `.env.local` file:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/washington-times?retryWrites=true&w=majority
CRON_SECRET=your-random-secret-key-here
SITE_URL=https://your-site.vercel.app
```

### 4. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard:
# - MONGODB_URI
# - CRON_SECRET
# - SITE_URL
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

## Project Structure

```
wt-scraper/
├── lib/
│   ├── scraper.js       # Washington Times scraper logic
│   └── db.js            # MongoDB connection and queries
├── pages/
│   ├── api/
│   │   ├── scrape-new.js    # Cron endpoint for scraping
│   │   ├── articles.js      # Get all articles
│   │   ├── article/[id].js  # Get single article
│   │   └── stats.js         # Get statistics
│   ├── index.js         # Homepage with article grid
│   ├── article/[id].js  # Article detail page
│   └── _app.js          # Next.js app wrapper
├── styles/
│   └── globals.css      # Global styles
├── vercel.json          # Vercel config with cron jobs
├── package.json         # Dependencies
└── README.md           # This file
```

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

## Troubleshooting

### Cron not running

1. Check Vercel dashboard → Project → Cron Jobs
2. Verify `CRON_SECRET` is set in environment variables
3. Check function logs in Vercel dashboard

### MongoDB connection issues

1. Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
2. Verify connection string is correct
3. Check MongoDB Atlas cluster is running

### No articles appearing

1. Manually trigger scraping:
   ```bash
   curl -X POST https://your-site.vercel.app/api/scrape-new \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
2. Check Vercel function logs for errors
3. Verify MongoDB connection

## Legal Notice

This scraper is for educational purposes. Ensure you comply with:
- Washington Times Terms of Service
- Copyright laws
- robots.txt directives
- Fair use policies

Always attribute content to the original source and link back to Washington Times.

## License

MIT License - Use at your own risk
