// src/app/api/track/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      websiteId, 
      source, 
      type, 
      pagePath, 
      referrer, 
      userAgent, 
      language, 
      screenWidth, 
      screenHeight,
      timestamp 
    } = body;
    
    // Validate required fields
    if (!websiteId || !pagePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if the website exists
    const { data: website, error: websiteError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .single();
    
    if (websiteError || !website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }
    
    // Record the traffic data with enhanced fields
    const { error } = await supabase
      .from('ai_traffic')
      .insert([
        {
          website_id: websiteId,
          source: source || 'unknown',
          visit_type: type || 'referral',
          page_path: pagePath,
          referrer: referrer || '',
          user_agent: userAgent || '',
          language: language || '',
          screen_width: screenWidth || null,
          screen_height: screenHeight || null,
          timestamp: timestamp || new Date().toISOString()
        }
      ]);
    
    if (error) {
      console.error('Error recording traffic:', error);
      return NextResponse.json(
        { error: 'Failed to record traffic data' },
        { status: 500 }
      );
    }
    
    // Return success
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in tracking API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
