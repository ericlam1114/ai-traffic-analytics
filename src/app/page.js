'use client';

import { useAuth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import Image from 'next/image';

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
    <main className="bg-white text-gray-900 overflow-hidden" style={whiteStyle}>
      <NavBar />
      <div className="relative" style={whiteStyle}>
        {/* Hero section */}
        <div className="relative overflow-hidden" style={whiteStyle}>
          {/* Decorative background elements */}
          <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full">
            <div className="relative h-full text-lg max-w-prose mx-auto">
              <svg className="absolute top-12 left-full transform translate-x-32" width="404" height="384" fill="none" viewBox="0 0 404 384">
                <defs>
                  <pattern id="74b3fd99-0a6f-4271-bef2-e80eeafdf357" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="384" fill="url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)" />
              </svg>
              <svg className="absolute top-1/2 right-full transform -translate-y-1/2 -translate-x-32" width="404" height="384" fill="none" viewBox="0 0 404 384">
                <defs>
                  <pattern id="f210dbf6-a58d-4871-961e-36d5016a0f49" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="4" height="4" className="text-gray-200" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="404" height="384" fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)" />
              </svg>
            </div>
          </div>
          
          <div className="relative pt-10 pb-20 lg:pt-20 lg:pb-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                {/* Left side - Text content */}
                <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                  <h1>
                    <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                      <span className="block text-gray-900" style={darkTextStyle}>Track AI Traffic to</span>
                      <span className="block text-supabase-green mt-1">Your Website</span>
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                    See how AI platforms like ChatGPT, Perplexity, and Copilot are driving traffic to your site.
                    Understand when your content is being cited in AI responses.
                  </p>
                  
                  {/* Testimonial/Social proof */}
                  {/* <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-1 relative z-0 overflow-hidden">
                        <div className="relative h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs text-white">A</div>
                        <div className="relative h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white">B</div>
                        <div className="relative h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-xs text-white">C</div>
                      </div>
                      <span className="text-sm text-gray-500">
                        Trusted by 1,000+ websites
                      </span>
                    </div>
                  </div> */}
                  
                  <div className="mt-6 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link href="/signup" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-supabase-green to-supabase-green hover:from-supabase-dark-green hover:to-supabase-green md:py-4 md:text-lg md:px-10 transition-all duration-200">
                        Get started for free
                      </Link>
                    </div>
                    {/* <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link href="/login" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 border-gray-200 md:py-4 md:text-lg md:px-10 transition-all duration-200">
                        Sign in
                      </Link>
                    </div> */}
                  </div>
                </div>
                
                {/* Right side - Hero image */}
                <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                  <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md overflow-hidden">
                    <div className="w-full h-96 relative">
                      <Image
                        src="/heroimg.png"
                        alt="AI Traffic Analytics Hero"
                        width={800}
                        height={600}
                        style={{objectFit: 'cover'}}
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Partner logos */}
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-base font-medium text-gray-500">
              Tracking AI traffic from these platforms and more
            </p>
            <div className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
              <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                <div className="h-12 text-gray-400 flex items-center font-medium">ChatGPT</div>
              </div>
              <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                <div className="h-12 text-gray-400 flex items-center font-medium">Perplexity</div>
              </div>
              <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                <div className="h-12 text-gray-400 flex items-center font-medium">Copilot</div>
              </div>
              <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                <div className="h-12 text-gray-400 flex items-center font-medium">Claude</div>
              </div>
              <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
                <div className="h-12 text-gray-400 flex items-center font-medium">Gemini</div>
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

            <div className="relative mt-12 lg:mt-24 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
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
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-supabase-green to-supabase-dark-green text-white">
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
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-supabase-green to-supabase-dark-green text-white">
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
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-supabase-green to-supabase-dark-green text-white">
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
                <div className="relative rounded-xl shadow-xl overflow-hidden">
                  <div className="relative p-8 bg-supabase-light-gray sm:p-10">
                    <div className="text-gray-900 font-mono text-sm sm:text-base">
                      <div className="mb-4 text-lg font-semibold">Installation Code</div>
                      <pre className="bg-white border border-gray-200 p-4 rounded-md overflow-x-auto shadow-sm">
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

            <div className="mt-12 max-w-lg mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
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

              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
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

              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
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

            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:max-w-none max-w-lg mx-auto">
              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
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

              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
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

              <div className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
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
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-supabase-green to-supabase-dark-green rounded-xl shadow-xl overflow-hidden py-12 px-8 sm:px-12 lg:px-16">
              <div className="relative lg:grid lg:grid-cols-2 lg:gap-8">
                <div className="lg:col-span-1">
                  <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                    <span className="block">Start tracking AI traffic today.</span>
                    <span className="block">Set up in just minutes.</span>
                  </h2>
                  <p className="mt-4 text-lg leading-6 text-white opacity-90">
                    See which AI platforms are driving traffic to your site and optimize your content for better visibility.
                  </p>
                  <div className="mt-8">
                    <div className="inline-flex rounded-md shadow">
                      <Link href="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-supabase-green bg-white hover:bg-gray-50 transition-colors duration-200">
                        Sign up for free
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}