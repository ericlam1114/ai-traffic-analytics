import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
// This should only be used in server-side code
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request) {
  try {
    // Get userId from the query string
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    // Validate userId
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    // If we don't have the service role key, return an error
    if (!supabaseAdmin) {
      console.error('Supabase service role key is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Get websites for the user
    const { data, error } = await supabaseAdmin
      .from('websites')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching websites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch websites' },
        { status: 500 }
      );
    }
    
    // Return the websites
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in websites API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, domain, name } = body;
    
    // Validate required fields
    if (!userId || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // If we don't have the service role key, return an error
    if (!supabaseAdmin) {
      console.error('Supabase service role key is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Check if user exists, create if not
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      console.error('Error checking user:', userError);
      return NextResponse.json(
        { error: 'Failed to check user' },
        { status: 500 }
      );
    }
    
    // If user doesn't exist, create it
    if (!existingUser) {
      const { error: createUserError } = await supabaseAdmin
        .from('users')
        .insert([{ id: userId, email: `user-${userId}@example.com` }]);
        
      if (createUserError) {
        console.error('Error creating user:', createUserError);
        return NextResponse.json(
          { error: 'Failed to create user' },
          { status: 500 }
        );
      }
    }
    
    // Add the website using admin privileges
    const { data, error } = await supabaseAdmin
      .from('websites')
      .insert([
        { user_id: userId, domain, name }
      ])
      .select();
    
    if (error) {
      console.error('Error adding website:', error);
      return NextResponse.json(
        { error: 'Failed to add website' },
        { status: 500 }
      );
    }
    
    // Return the created website
    return NextResponse.json({ success: true, website: data[0] });
  } catch (error) {
    console.error('Error in websites API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 