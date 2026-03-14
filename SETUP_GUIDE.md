# 🚀 Complete Setup Guide - Washington Times Scraper

## Overview
Your scraper automatically fetches new articles from washingtontimes.com every 15 minutes. This guide will help you set it up and use the admin interface.

---

## 📋 Quick Setup (5 Steps)

### Step 1: Install Dependencies
```bash
cd wt-scraper
npm install
```

### Step 2: Set Up MongoDB Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier is fine)
4. Click "Connect" → "Connect your application"
5. Copy your connection string
6. **Important**: Whitelist all IPs (0.0.0.0/0) in Network Access for Vercel

### Step 3: Configure Environment Variables

Create `.env.local` file in the `wt-scraper` folder:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/washington-times?retryWrites=true&w=majority
CRON_SECRET=your-random-secret-key-here-make-it-strong
SITE_URL=http://localhost:3000
```

**Generate a strong CRON_SECRET:**
```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use any random string generator
```

### Step 4: Test Locally
```bash
npm run dev
```

Visit http://localhost:3000

### Step 5: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Add environment variables in Vercel Dashboard:**
1. Go to your project → Settings → Environment Variables
2. Add:
   - `MONGODB_URI` (your MongoDB connection string)
   - `CRON_SECRET` (same secret from .env.local)
   - `SITE_URL` (your Vercel URL, e.g., https://your-app.vercel.app)

---

## 🎛️ Using the Admin Interface

### Access Admin Controls
1. Open your deployed site
2. Click **"⚙️ Admin Controls"** button in the header
3. Enter your `CRON_SECRET` (from environment variables)
4. Click **"🚀 Trigger Scraping Now"**

### What Happens During Scraping:
- ✅ Fetches latest articles from 5 RSS feeds
- ✅ Scrapes up to 10 newest articles
- ✅ Extracts full content, images, metadata
- ✅ Saves to MongoDB (skips duplicates)
- ✅ Shows real-time results

### Admin Panel Features:
- **Manual Trigger**: Scrape on-demand anytime
- **Real-time Stats**: See total articles, new additions, failures
- **New Articles List**: Direct links to newly scraped content
- **Status Display**: Last scraping time and article count

---

## 🔄 Automatic Scraping

### How It Works:
Your scraper runs **automatically every 15 minutes** via Vercel Cron Jobs.

**Configuration:** `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/scrape-new",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Change Scraping Frequency:
Edit the `schedule` in `vercel.json`:

| Schedule | Frequency |
|----------|-----------|
| `*/15 * * * *` | Every 15 minutes (current) |
| `*/30 * * * *` | Every 30 minutes |
| `0 * * * *` | Every hour |
| `0 */6 * * *` | Every 6 hours |
| `0 0 * * *` | Once daily at midnight |

After changing, redeploy:
```bash
vercel --prod
```

---

## 📊 Monitoring

### Check Cron Jobs in Vercel:
1. Go to Vercel Dashboard
2. Select your project
3. Click "Cron Jobs" tab
4. View execution history and logs

### View Function Logs:
1. Vercel Dashboard → Your Project
2. Click "Functions" or "Logs"
3. Filter by `/api/scrape-new`

---

## 🔧 Customization

### Add More RSS Feeds:
Edit `lib/scraper.js`:
```javascript
this.rssFeeds = [
  'https://www.washingtontimes.com/rss/headlines/news/',
  'https://www.washingtontimes.com/rss/headlines/news/politics/',
  'https://www.washingtontimes.com/rss/headlines/news/world/',
  'https://www.washingtontimes.com/rss/headlines/opinion/',
  'https://www.washingtontimes.com/rss/headlines/sports/',
  // Add more feeds here
];
```

### Increase Articles Per Scrape:
Edit `pages/api/scrape-new.js` line 30:
```javascript
for (const rssArticle of rssArticles.slice(0, 10)) {  // Change 10 to desired number
```

---

## 🐛 Troubleshooting

### Problem: No articles appearing
**Solution:**
1. Check MongoDB connection in Vercel environment variables
2. Verify CRON_SECRET is set correctly
3. Manually trigger scraping via admin panel
4. Check Vercel function logs for errors

### Problem: Cron jobs not running
**Solution:**
1. Verify `vercel.json` is in project root
2. Check Vercel Dashboard → Cron Jobs for status
3. Ensure CRON_SECRET environment variable is set
4. Redeploy: `vercel --prod`

### Problem: "Unauthorized" error when triggering manually
**Solution:**
- Make sure you're entering the exact CRON_SECRET from your environment variables
- No extra spaces before/after the secret

### Problem: MongoDB connection timeout
**Solution:**
1. MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allows all IPs for Vercel)
3. Wait 2-3 minutes for changes to propagate

### Problem: Scraping takes too long / times out
**Solution:**
- Reduce number of articles per scrape (default is 10)
- Increase timeout in `vercel.json`:
```json
"functions": {
  "api/scrape-new.js": {
    "maxDuration": 300  // 5 minutes (max on Pro plan)
  }
}
```

---

## 📱 API Endpoints

### Trigger Scraping (Manual)
```bash
curl -X POST https://your-site.vercel.app/api/scrape-new \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Get All Articles
```bash
curl https://your-site.vercel.app/api/articles?limit=50
```

### Get Articles by Category
```bash
curl https://your-site.vercel.app/api/articles?category=Politics&limit=20
```

### Get Statistics
```bash
curl https://your-site.vercel.app/api/stats
```

---

## 🎯 Best Practices

1. **Keep CRON_SECRET secure** - Never commit it to Git
2. **Monitor MongoDB storage** - Free tier has 512MB limit
3. **Check Vercel function usage** - Free tier has limits
4. **Test locally first** - Before deploying changes
5. **Use environment variables** - Never hardcode secrets

---

## 📈 Scaling Tips

### If you need more frequent scraping:
- Upgrade to Vercel Pro for shorter cron intervals
- Use multiple cron jobs for different categories

### If you need more storage:
- Upgrade MongoDB Atlas plan
- Implement article archiving/cleanup

### If you need faster scraping:
- Optimize selectors in `lib/scraper.js`
- Reduce content extraction depth
- Use parallel scraping (advanced)

---

## ✅ Verification Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Network access configured (0.0.0.0/0)
- [ ] `.env.local` file created with all variables
- [ ] Dependencies installed (`npm install`)
- [ ] Local testing successful (`npm run dev`)
- [ ] Vercel project deployed
- [ ] Environment variables set in Vercel
- [ ] Cron job visible in Vercel dashboard
- [ ] Manual scraping works via admin panel
- [ ] Articles appearing on homepage

---

## 🆘 Need Help?

1. Check Vercel function logs
2. Check MongoDB Atlas logs
3. Test API endpoints with curl
4. Verify environment variables are set correctly
5. Check browser console for frontend errors

---

## 🎉 You're All Set!

Your scraper is now running automatically every 15 minutes. New articles from Washington Times will appear on your site without any manual intervention.

**Admin Panel**: Click "⚙️ Admin Controls" on your homepage to manually trigger scraping anytime.
