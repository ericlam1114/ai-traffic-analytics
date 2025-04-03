// src/lib/supabase.js

// Import the existing code from the current file
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User Management
export async function createUserInSupabase(id, email) {
  return await supabase
    .from('users')
    .insert([{ id, email }]);
}

// Website Management
export async function addWebsite(userId, domain, name) {
  return await supabase
    .from('websites')
    .insert([
      { user_id: userId, domain, name }
    ]);
}

export async function getUserWebsites(userId) {
  return await supabase
    .from('websites')
    .select('*')
    .eq('user_id', userId);
}

export async function getWebsiteById(websiteId) {
  return await supabase
    .from('websites')
    .select('*')
    .eq('id', websiteId)
    .single();
}

// AI Traffic Data - Enhanced functions
export async function recordAITraffic(
  websiteId, 
  source, 
  visitType,
  pagePath, 
  referrer, 
  userAgent,
  language,
  screenWidth,
  screenHeight,
  timestamp
) {
  return await supabase
    .from('ai_traffic')
    .insert([
      {
        website_id: websiteId,
        source: source || 'stealth ai',
        visit_type: visitType || 'referral',
        page_path: pagePath,
        referrer,
        user_agent: userAgent,
        language,
        screen_width: screenWidth,
        screen_height: screenHeight,
        timestamp: timestamp || new Date().toISOString()
      }
    ]);
}

export async function recordExitClick(websiteId, source, originPage, exitLink) {
  return await supabase
    .from('exit_clicks')
    .insert([
      {
        website_id: websiteId,
        source,
        origin_page: originPage,
        exit_link: exitLink
      }
    ]);
}

export async function getTrafficByWebsite(websiteId, timeRange = '7d') {
  // Calculate the start date based on timeRange
  const now = new Date();
  let startDate = new Date();
  
  if (timeRange === '24h') {
    startDate.setDate(now.getDate() - 1);
  } else if (timeRange === '7d') {
    startDate.setDate(now.getDate() - 7);
  } else if (timeRange === '30d') {
    startDate.setDate(now.getDate() - 30);
  } else if (timeRange === '90d') {
    startDate.setDate(now.getDate() - 90);
  } else if (timeRange === 'all') {
    startDate = new Date(2020, 0, 1); // Go far back to include all data
  }
  
  return await supabase
    .from('ai_traffic')
    .select('*')
    .eq('website_id', websiteId)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });
}

export async function getTrafficBySource(websiteId, timeRange = '7d') {
  const { data, error } = await getTrafficByWebsite(websiteId, timeRange);
  
  if (error) return { data: null, error };
  
  // Group traffic by source
  const sourceCount = {};
  data.forEach(item => {
    sourceCount[item.source] = (sourceCount[item.source] || 0) + 1;
  });
  
  // Convert to array and sort by count
  const result = Object.entries(sourceCount)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
    
  return { data: result, error: null };
}

export async function getTrafficTrends(websiteId, timeRange = '7d') {
  // Calculate the start date based on timeRange
  const now = new Date();
  let startDate = new Date();
  let groupByFormat = 'YYYY-MM-DD'; // Daily grouping by default
  
  if (timeRange === '24h') {
    startDate.setDate(now.getDate() - 1);
    groupByFormat = 'YYYY-MM-DD HH24'; // Group by hour
  } else if (timeRange === '7d') {
    startDate.setDate(now.getDate() - 7);
    // Keep daily grouping
  } else if (timeRange === '30d') {
    startDate.setDate(now.getDate() - 30);
    // Keep daily grouping
  } else if (timeRange === '90d') {
    startDate.setDate(now.getDate() - 90);
    groupByFormat = 'YYYY-MM'; // Monthly grouping
  } else if (timeRange === 'all') {
    startDate = new Date(2020, 0, 1);
    groupByFormat = 'YYYY-MM'; // Monthly grouping
  }
  
  // Using PostgreSQL date_trunc to group by day/hour/month
  const { data, error } = await supabase
    .rpc('get_traffic_trends', { 
      website_id: websiteId,
      start_date: startDate.toISOString(),
      date_format: groupByFormat
    });
  
  if (error) {
    console.error('Error getting traffic trends:', error);
    
    // Fallback: manual aggregation if the RPC function isn't available
    const { data: rawData, error: fallbackError } = await supabase
      .from('ai_traffic')
      .select('timestamp')
      .eq('website_id', websiteId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });
      
    if (fallbackError) return { data: null, error: fallbackError };
    
    // Manual grouping by date
    const dateGroups = {};
    rawData.forEach(item => {
      let dateStr;
      const date = new Date(item.timestamp);
      
      if (timeRange === '24h') {
        dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}`;
      } else if (timeRange === '7d' || timeRange === '30d') {
        dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else {
        dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      dateGroups[dateStr] = (dateGroups[dateStr] || 0) + 1;
    });
    
    const trendData = Object.entries(dateGroups)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
      
    return { data: trendData, error: null };
  }
  
  return { data, error };
}

export async function getTopPages(websiteId, timeRange = '7d') {
  const { data: rawData, error: rawError } = await getTrafficByWebsite(websiteId, timeRange);
  
  if (rawError) return { data: null, error: rawError };
  
  // Group by page path
  const pageGroups = {};
  const pageSourceCounts = {};
  
  rawData.forEach(item => {
    const page = item.page_path;
    const source = item.source;
    
    // Count total visits for this page
    pageGroups[page] = (pageGroups[page] || 0) + 1;
    
    // Track source counts for this page
    if (!pageSourceCounts[page]) {
      pageSourceCounts[page] = {};
    }
    pageSourceCounts[page][source] = (pageSourceCounts[page][source] || 0) + 1;
  });
  
  // Determine the main source for each page
  const pageMainSource = {};
  Object.entries(pageSourceCounts).forEach(([page, sources]) => {
    let maxCount = 0;
    let mainSource = 'stealth ai';

    Object.entries(sources).forEach(([source, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mainSource = source;
      }
    });
    
    pageMainSource[page] = mainSource;
  });
  
  // Convert to array and sort by count
  const result = Object.entries(pageGroups)
    .map(([page_path, count]) => ({ 
      page_path, 
      count,
      main_source: pageMainSource[page_path]
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 pages
    
  return { data: result, error: null };
}

// Add a function to get summary stats
export async function getWebsiteSummary(websiteId) {
  const { data, error } = await supabase
    .rpc('get_website_summary', { website_id: websiteId });
    
  if (error) {
    console.error('Error getting website summary:', error);
    
    // Fallback: calculate some basic stats
    const { data: rawData, error: fallbackError } = await supabase
      .from('ai_traffic')
      .select('*')
      .eq('website_id', websiteId);
      
    if (fallbackError) return { data: null, error: fallbackError };
    
    // Calculate basic stats
    const totalVisits = rawData.length;
    
    const referrals = rawData.filter(item => 
      item.visit_type === 'referral' || !item.visit_type
    ).length;
    
    const crawlers = rawData.filter(item => 
      item.visit_type === 'crawler'
    ).length;
    
    // Get earliest and latest visits
    let earliest = new Date();
    let latest = new Date(0);
    
    rawData.forEach(item => {
      const date = new Date(item.timestamp);
      if (date < earliest) earliest = date;
      if (date > latest) latest = date;
    });
    
    const result = {
      total_visits: totalVisits,
      referrals: referrals,
      crawlers: crawlers,
      earliest_visit: earliest.toISOString(),
      latest_visit: latest.toISOString()
    };
    
    return { data: result, error: null };
  }
  
  return { data, error };
}