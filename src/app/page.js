'use client';

import { useAuth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import NavBar from '../components/NavBar';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // If user is logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  const whiteStyle = { backgroundColor: 'white', color: '#1f2937' };
  const darkTextStyle = { color: '#1f2937' };
  const lightGrayStyle = { backgroundColor: '#F8F9FA' };
  
  return (
    <main className="bg-white text-gray-900" style={whiteStyle}>
      <NavBar />
      <div className="relative bg-white" style={whiteStyle}>
        {/* Hero section */}
        <div className="relative bg-white pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8" style={whiteStyle}>
          <div className="absolute inset-0" style={whiteStyle}>
            <div className="bg-supabase-light-gray h-1/3 sm:h-2/3" style={lightGrayStyle} />
          </div>
          <div className="relative max-w-7xl mx-auto" style={whiteStyle}>
            <div className="text-center" style={whiteStyle}>
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl" style={darkTextStyle}>
                <span className="block" style={darkTextStyle}>Track AI Traffic to</span>
                <span className="block text-supabase-green">Your Website</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-600 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl" style={darkTextStyle}>
                See how AI platforms like ChatGPT, Perplexity, and Copilot are driving traffic to your site.
                Understand when your content is being cited in AI responses.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <Link href="/signup" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-supabase-green hover:bg-supabase-dark-green md:py-4 md:text-lg md:px-10">
                    Get started
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link href="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 border-gray-200 md:py-4 md:text-lg md:px-10">
                    Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature section */}
        <div className="py-16 bg-white overflow-hidden lg:py-24" style={whiteStyle}>
          <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
            <div className="relative">
              <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-600">
                Simple setup, powerful insights. Start tracking AI traffic in minutes.
              </p>
            </div>

            <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="relative">
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
                  Simple Installation
                </h3>
                <p className="mt-3 text-lg text-gray-600">
                  Add a single line of code to your website to start tracking when AI platforms drive traffic to your site.
                </p>

                <dl className="mt-10 space-y-10">
                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-supabase-green text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Sign Up & Add Your Website</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-600">
                      Create an account, add your website, and get your unique tracking code.
                    </dd>
                  </div>

                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-supabase-green text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Install the Tracking Script</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-600">
                      Add our lightweight JavaScript snippet to your website's head section.
                    </dd>
                  </div>

                  <div className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-supabase-green text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Track & Analyze</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-600">
                      See real-time data on which AI platforms are driving traffic to your site and which content is being cited.
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="mt-10 -mx-4 relative lg:mt-0">
                <div className="relative rounded-lg shadow-lg overflow-hidden">
                  <div className="relative p-8 bg-supabase-light-gray sm:p-10">
                    <div className="text-gray-900 font-mono text-sm sm:text-base">
                      <div className="mb-4 text-lg font-semibold">Installation Code</div>
                      <pre className="bg-white border border-gray-200 p-4 rounded-md overflow-x-auto">
{`<script 
  src="https://your-app.com/ai-traffic-tracker.js" 
  data-website-id="your-website-id">
</script>`}
                      </pre>
                      <div className="mt-6 text-gray-600">
                        Add this to the <code className="bg-white border border-gray-200 px-1 rounded">&lt;head&gt;</code> section of your website
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Platforms section */}
        <div className="bg-supabase-light-gray pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8" style={lightGrayStyle}>
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
                Supported AI Platforms
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600 sm:mt-4">
                Track traffic from all major AI platforms that are driving visitors to your site.
              </p>
            </div>

            <div className="mt-12 max-w-lg mx-auto grid gap-8 lg:grid-cols-3 lg:max-w-none">
              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">ChatGPT</p>
                      <p className="mt-3 text-base text-gray-600">
                        Track when visitors arrive at your site from links in ChatGPT responses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">Perplexity</p>
                      <p className="mt-3 text-base text-gray-600">
                        See when Perplexity AI cites your content and drives traffic to your website.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">Microsoft Copilot</p>
                      <p className="mt-3 text-base text-gray-600">
                        Monitor traffic coming from Microsoft's Copilot AI assistant.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:max-w-none max-w-lg mx-auto">
              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">Claude</p>
                      <p className="mt-3 text-base text-gray-600">
                        Track when Anthropic's Claude AI assistant cites your website.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">Google Gemini</p>
                      <p className="mt-3 text-base text-gray-600">
                        See when Google's Gemini AI drives visitors to your content.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg">
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <div className="block mt-2">
                      <p className="text-xl font-semibold text-gray-900">And More</p>
                      <p className="mt-3 text-base text-gray-600">
                        We're constantly adding support for new AI platforms as they emerge.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA section */}
        <div className="bg-white pt-16 pb-20" style={whiteStyle}>
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8 bg-supabase-light-gray rounded-lg" style={lightGrayStyle}>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl" style={darkTextStyle}>
              <span className="block">Start tracking AI traffic today.</span>
              <span className="block">Set up in just minutes.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-gray-600" style={darkTextStyle}>
              See which AI platforms are driving traffic to your site and optimize your content for better visibility.
            </p>
            <Link href="/signup" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-supabase-green hover:bg-supabase-dark-green sm:w-auto">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}