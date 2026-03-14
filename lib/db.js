const { createClient } = require('@supabase/supabase-js');

// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function saveArticle(article) {
  // Supabase expects column names to be snake_case
  const articleData = {
    url: article.url,
    title: article.title,
    author: article.author,
    publish_date: article.pubDate,
    content: article.content,
    images: article.images,
    css: article.css,
    scripts: article.scripts,
    meta_description: article.metaDescription,
    og_image: article.ogImage,
    category: article.category,
    description: article.description,
    guid: article.guid,
    original_url: article.originalUrl,
  };

  const { data, error } = await supabase
    .from('articles')
    .insert(articleData)
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return { success: false, message: 'Article already exists' };
    }
    console.error('Supabase save error:', error);
    return { success: false, message: error.message };
  }

  return { success: true, message: 'Article saved', articleId: data.id };
}

async function getArticles(limit = 50, skip = 0, category = null) {
  let query = supabase
    .from('articles')
    .select('*')
    .order('publish_date', { ascending: false })
    .range(skip, skip + limit - 1);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Supabase getArticles error:', error);
    return [];
  }

  return data;
}

async function getArticleById(id) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Supabase getArticleById error for id ${id}:`, error);
    return null;
  }

  return data;
}

async function incrementViewCount(articleId) {
    // Supabase doesn't have a simple increment. We need to use an RPC call.
    // First, create this function in your Supabase SQL Editor:
    /*
      create function increment_view_count(article_id uuid) returns void as $$
        update articles
        set view_count = view_count + 1
        where id = article_id;
      $$ language sql volatile;
    */
  const { error } = await supabase.rpc('increment_view_count', { article_id: articleId });

  if (error) {
    console.error('Supabase incrementViewCount error:', error);
  }
}

async function getStats() {
  const { data: total, error: totalError } = await supabase
    .from('articles')
    .select('id', { count: 'exact', head: true });

  const { data: categories, error: categoriesError } = await supabase.rpc('get_distinct_categories');
    // Create this function in Supabase SQL Editor:
    /*
      create function get_distinct_categories() returns text[] as $$
        select array_agg(distinct category) from articles where category is not null;
      $$ language sql stable;
    */

  const { data: recent, error: recentError } = await supabase
    .from('articles')
    .select('scraped_at')
    .order('scraped_at', { ascending: false })
    .limit(1)
    .single();

  if (totalError || categoriesError || recentError) {
    console.error({ totalError, categoriesError, recentError });
  }

  return {
    totalArticles: total?.count || 0,
    categories: categories || [],
    lastScraped: recent?.scraped_at || null,
  };
}

module.exports = {
  saveArticle,
  getArticles,
  getArticleById,
  incrementViewCount,
  getStats,
};
