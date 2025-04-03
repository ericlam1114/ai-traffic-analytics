'use client';

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

// AI Traffic Data
export async function recordAITraffic(websiteId, source, pagePath, referrer, userAgent) {
  return await supabase
    .from('ai_traffic')
    .insert([
      {
        website_id: websiteId,
        source,
        page_path: pagePath,
        referrer,
        user_agent: userAgent
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
  }
  
  return await supabase
    .from('ai_traffic')
    .select('*')
    .eq('website_id', websiteId)
    .gte('timestamp', startDate.toISOString());
}

export async function getTrafficBySource(websiteId, timeRange = '7d') {
  const { data, error } = await getTrafficByWebsite(websiteId, timeRange);
  
  if (error) return { data: null, error };
  
  // Group traffic by source
  const sourceCount = {};
  data.forEach(item => {
    sourceCount[item.source] = (sourceCount[item.source] || 0) + 1;
  });
  
  return { 
    data: Object.entries(sourceCount).map(([source, count]) => ({ source, count })),
    error: null 
  };
}