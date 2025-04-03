/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
      // Don't run ESLint during build
      ignoreDuringBuilds: true,
    },
    images: {
      domains: [],
      unoptimized: true,
    },
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://tngibqzphuitepjzkafi.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2licXpwaHVpdGVwanprYWZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NDMxNzQsImV4cCI6MjA1OTIxOTE3NH0.v2jlvaOeKEtXudBDIWNG1JMzkuf232pUULus-NcV52I',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuZ2licXpwaHVpdGVwanprYWZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzY0MzE3NCwiZXhwIjoyMDU5MjE5MTc0fQ.6ah8Ac2TrhNfLuMXnRCW8-kOcwaugm2f05xt7JSmyOQ'
    }
  };
  
  module.exports = nextConfig;