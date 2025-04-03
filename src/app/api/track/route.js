import { recordAITraffic, getWebsiteById } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { websiteId, source, pagePath, referrer, userAgent } = body;
    
    // Validate required fields
    if (!websiteId || !source || !pagePath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if the website exists
    const { data: website, error: websiteError } = await getWebsiteById(websiteId);
    
    if (websiteError || !website) {
      return NextResponse.json(
        { error: 'Website not found' },
        { status: 404 }
      );
    }
    
    // Record the traffic data
    const { error } = await recordAITraffic(websiteId, source, pagePath, referrer, userAgent);
    
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