# Quick Start Guide

## 🎯 What You Have

Your Washington Times scraper is now restructured with:

1. **Homepage (`/`)** - Clean, professional news display
2. **Admin Panel (`/scraper`)** - Scraping controls and management
3. **Auto-scraping** - Runs every 15 minutes automatically
4. **Full content** - Articles with images, CSS, and complete styling

## 📋 Before You Deploy

### 1. Set Up Supabase (5 minutes)

1. Go to https://supabase.com and create a free account
2. Create a new project (choose any name)
3. Wait for project creation (~2 minutes)
4. Go to **SQL Editor** tab
5. Copy all content from `schema.sql` file
6. Paste and click **Run**
7. Go to **Settings** → **API** and copy:
   - Project URL
   - anon public key

### 2. Get Your Environment Variables

You need these 3 variables:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CRON_SECRET=any-random-secret-you-choose
```

## 🚀 Deploy to Vercel (10 minutes)

### Option 1: GitHub + Vercel (Recommended)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main

# 2. Go to https://vercel.com/new
# 3. Import your GitHub repository
# 4. Add the 3 environment variables
# 5. Click Deploy
```

### Option 2: Vercel CLI

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Follow prompts and add environment variables
```

## ✅ After Deployment

1. **Visit your site**: `https://your-app.vercel.app`
2. **Go to admin panel**: `https://your-app.vercel.app/scraper`
3. **Enter your CRON_SECRET** in the input field
4. **Click "Trigger Scraping Now"** to fetch first articles
5. **Wait 1-2 minutes** for scraping to complete
6. **Go back to homepage** to see articles

## 🎨 What Each Page Does

### Homepage (`/`)
- Displays all scraped articles in a clean news layout
- Category filtering (Politics, World, Opinion, Sports, News)
- Responsive design
- Links to original Washington Times articles
- First article is featured (larger display)

### Admin Panel (`/scraper`)
- Manual scraping trigger
- Real-time statistics
- Scraping results display
- Article management
- Protected by CRON_SECRET

### Article Pages (`/article/[id]`)
- Full article content with original styling
- Images and media
- Author and publish date
- Link back to original source

## 🔄 How Auto-Scraping Works

```
Every 15 minutes:
  ↓
Vercel Cron triggers /api/scrape-new
  ↓
Fetches RSS feeds from Washington Times
  ↓
Scrapes up to 10 latest articles
  ↓
Extracts: title, content, images, CSS, metadata
  ↓
Saves to Supabase (skips duplicates)
  ↓
Articles appear on homepage automatically
```

## 🛠️ Customization

### Change Scraping Frequency

Edit `vercel.json`:
```json
"schedule": "*/30 * * * *"  // Every 30 minutes
"schedule": "0 * * * *"     // Every hour
```

### Add More RSS Feeds

Edit `lib/scraper.js`:
```javascript
this.rssFeeds = [
  'https://www.washingtontimes.com/rss/headlines/news/',
  'https://www.washingtontimes.com/rss/headlines/news/politics/',
  'https://www.washingtontimes.com/rss/headlines/news/world/',
  // Add more here
];
```

### Customize Design

- Homepage styles: `pages/index.js` (inline styles at bottom)
- Admin panel styles: `pages/scraper.js` (inline styles at bottom)
- Global styles: `styles/globals.css`

## 📊 Monitoring

### Check if Scraping is Working

1. Visit `/scraper`
2. Look at "Total Articles" count
3. Check "Last Updated" timestamp
4. Should update every 15 minutes

### View Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click **Functions** tab
4. Find `/api/scrape-new`
5. View execution logs

## ⚠️ Common Issues

### "No articles found"
- Go to `/scraper` and manually trigger scraping
- Check Vercel function logs for errors
- Verify Supabase credentials are correct

### "Unauthorized" error when scraping
- Make sure you entered the correct CRON_SECRET
- Check environment variables in Vercel dashboard

### Cron not running
- Verify `vercel.json` is in root directory
- Redeploy after any changes to `vercel.json`
- Check Vercel → Settings → Cron Jobs

## 📚 Documentation

- **Full deployment guide**: See `DEPLOYMENT.md`
- **Project overview**: See `README.md`
- **Database schema**: See `schema.sql`

## 🎉 You're Ready!

Your scraper will:
- ✅ Automatically fetch new articles every 15 minutes
- ✅ Display them on a beautiful homepage
- ✅ Store everything in Supabase
- ✅ Handle duplicates automatically
- ✅ Include full images and styling
- ✅ Link back to original sources

**Next Steps:**
1. Deploy to Vercel
2. Set up Supabase
3. Trigger first scrape
4. Watch your news site come to life!

---

Need help? Check `DEPLOYMENT.md` for detailed troubleshooting.
