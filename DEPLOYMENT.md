# Deployment Guide - Washington Times News Scraper

## 🚀 Quick Deploy to Production

This guide will help you deploy your Washington Times news scraper to production on Vercel.

## Architecture Overview

- **Homepage (`/`)**: Clean news display showing all scraped articles
- **Admin Panel (`/scraper`)**: Scraping controls and management interface
- **Auto-scraping**: Runs every 15 minutes via Vercel Cron Jobs
- **Database**: Supabase (PostgreSQL) for article storage

## Prerequisites

1. **Supabase Account** (Free tier available)
   - Sign up at https://supabase.com
   
2. **Vercel Account** (Free tier available)
   - Sign up at https://vercel.com

## Step 1: Set Up Supabase Database

### 1.1 Create a New Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose a name and password
4. Wait for the project to be created (~2 minutes)

### 1.2 Run the Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the entire contents of `schema.sql` from this project
3. Paste it into the SQL Editor
4. Click "Run" to create the tables and functions

### 1.3 Get Your Credentials
1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   cd wt-scraper
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   
   Add these environment variables in Vercel:
   
   | Variable | Value | Example |
   |----------|-------|---------|
   | `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
   | `SUPABASE_ANON_KEY` | Your Supabase anon key | `eyJhbGc...` |
   | `CRON_SECRET` | A random secret string | `my-super-secret-key-123` |
   | `SITE_URL` | Your Vercel deployment URL | `https://your-app.vercel.app` |

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (~2 minutes)

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

## Step 3: Configure Cron Jobs

Vercel will automatically set up the cron job from `vercel.json`. The scraper will run every 15 minutes.

To verify:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Cron Jobs**
4. You should see: `/api/scrape-new` scheduled for `*/15 * * * *`

## Step 4: Initial Scraping

After deployment, trigger the first scrape manually:

1. Go to `https://your-app.vercel.app/scraper`
2. Enter your `CRON_SECRET` in the input field
3. Click "🚀 Trigger Scraping Now"
4. Wait for the scraping to complete
5. Go back to the homepage to see the articles

## Step 5: Verify Everything Works

### Check Homepage
- Visit `https://your-app.vercel.app`
- You should see scraped articles with images
- Categories should be filterable
- Articles should link to detail pages

### Check Admin Panel
- Visit `https://your-app.vercel.app/scraper`
- Verify scraping controls work
- Check statistics are displayed

### Check Cron Logs
1. Go to Vercel dashboard → Your Project
2. Click on **Functions** tab
3. Find `/api/scrape-new`
4. Check the logs to ensure cron is running

## Environment Variables Reference

```env
# Required
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
CRON_SECRET=your-random-secret-key

# Optional
SITE_URL=https://your-app.vercel.app
```

## Customization

### Change Scraping Frequency

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/scrape-new",
      "schedule": "*/30 * * * *"  // Every 30 minutes
    }
  ]
}
```

Common schedules:
- `*/15 * * * *` - Every 15 minutes
- `*/30 * * * *` - Every 30 minutes
- `0 * * * *` - Every hour
- `0 */6 * * *` - Every 6 hours

### Add More RSS Feeds

Edit `lib/scraper.js`:

```javascript
this.rssFeeds = [
  'https://www.washingtontimes.com/rss/headlines/news/',
  'https://www.washingtontimes.com/rss/headlines/news/politics/',
  'https://www.washingtontimes.com/rss/headlines/news/world/',
  // Add more feeds here
];
```

## Troubleshooting

### No Articles Showing
1. Check Vercel function logs for errors
2. Verify Supabase credentials are correct
3. Manually trigger scraping from `/scraper` page
4. Check Supabase database to see if articles are being saved

### Cron Not Running
1. Verify `vercel.json` is in the root directory
2. Check that `CRON_SECRET` environment variable is set
3. Redeploy the project after making changes
4. Check Vercel dashboard → Cron Jobs tab

### Database Connection Errors
1. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
2. Check that the schema has been run in Supabase
3. Ensure Row Level Security policies are set up correctly

### Scraping Fails
1. Check if Washington Times website structure has changed
2. Verify RSS feeds are still accessible
3. Check function timeout (increase in `vercel.json` if needed)
4. Review error logs in Vercel dashboard

## Performance Tips

1. **Optimize Images**: Consider using Vercel's Image Optimization
2. **Caching**: Articles are cached in the database
3. **Pagination**: Limit API responses to 50 articles per request
4. **Incremental Scraping**: Only new articles are added (duplicates skipped)

## Security Notes

1. **CRON_SECRET**: Keep this secret and never commit it to Git
2. **Supabase Keys**: Use the anon key for public access, service key for admin operations
3. **Rate Limiting**: The scraper includes delays between requests
4. **Attribution**: Always link back to original Washington Times articles

## Monitoring

### Check Scraper Health
- Visit `/scraper` to see statistics
- Monitor "Last Updated" timestamp
- Check "Total Articles" count

### Vercel Analytics
- Enable Vercel Analytics in your project settings
- Monitor page views and performance

## Support

If you encounter issues:
1. Check Vercel function logs
2. Check Supabase database logs
3. Review this deployment guide
4. Check the main README.md for additional information

## Legal Compliance

⚠️ **Important**: This scraper is for educational purposes. Ensure you:
- Comply with Washington Times Terms of Service
- Respect copyright laws
- Follow robots.txt directives
- Always attribute content to the original source
- Link back to Washington Times for full articles

## Next Steps

After successful deployment:
1. ✅ Set up a custom domain in Vercel (optional)
2. ✅ Enable Vercel Analytics
3. ✅ Monitor cron job execution
4. ✅ Customize the design to match your brand
5. ✅ Add more RSS feeds or news sources

---

**Deployment Complete!** 🎉

Your Washington Times news scraper is now live at: `https://your-app.vercel.app`
