-- Create the articles table
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL UNIQUE,
  title TEXT,
  author TEXT,
  publish_date TIMESTAMPTZ,
  content TEXT,
  images JSONB,
  css JSONB,
  scripts JSONB,
  meta_description TEXT,
  og_image TEXT,
  category TEXT,
  description TEXT,
  guid TEXT,
  original_url TEXT,
  scraped_at TIMESTAMPTZ DEFAULT now(),
  view_count INT DEFAULT 0
);

-- Create an index for faster lookups by URL
CREATE INDEX idx_articles_url ON articles(url);

-- Create an index for faster lookups by category
CREATE INDEX idx_articles_category ON articles(category);

-- Enable Row Level Security (RLS)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access" ON articles
  FOR SELECT USING (true);

-- Note: Inserts, updates, and deletes should be handled using the Supabase service key for security.
-- This is done on the server-side in the API routes, not on the client.

-- Create a function to increment the view count for an article
CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID) RETURNS VOID AS $$
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
$$ LANGUAGE SQL VOLATILE;

-- Create a function to get an array of distinct categories
CREATE OR REPLACE FUNCTION get_distinct_categories() RETURNS TEXT[] AS $$
  SELECT array_agg(DISTINCT category) FROM articles WHERE category IS NOT NULL;
$$ LANGUAGE SQL STABLE;
