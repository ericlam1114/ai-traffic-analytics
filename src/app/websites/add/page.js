'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase';
import { addWebsite } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import AuthGuard from '@/components/AuthGuard';
import { Globe, X, Check, ArrowLeft } from 'lucide-react';

export default function AddWebsite() {
  const { user } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate domain
    if (!domain) {
      setError('Domain is required');
      return;
    }
    
    // Strip protocol and www if present
    let formattedDomain = domain.trim().toLowerCase();
    formattedDomain = formattedDomain.replace(/^(https?:\/\/)?(www\.)?/, '');
    
    setLoading(true);
    
    try {
      // Use our new API endpoint instead of direct Supabase call
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          domain: formattedDomain,
          name: name,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add website');
      }
      
      router.push('/websites');
    } catch (error) {
      console.error('Error adding website:', error);
      setError('Failed to add website. Please try again.');
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <NavBar />
      <main className="py-10 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.push('/websites')}
              className="mr-4 p-2 rounded-full bg-white shadow-sm border border-gray-200 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-supabase-green"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add a Website</h1>
          </div>
          
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="p-6 bg-gradient-to-br from-supabase-green to-supabase-green md:col-span-1 text-white">
                <div className="flex items-center mb-4 bg-supabase-green">
                  <div className="p-2  rounded-lg">
                    <Globe className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="text-lg font-medium leading-6">Website Details</h3>
                <p className="mt-2 text-sm text-white text-opacity-90">
                  Add a website to start tracking AI traffic sources and citations.
                </p>
                <div className="mt-8 bg-supabase-green">
                  <h4 className="text-sm font-medium mb-2">What you'll get:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">AI traffic analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">Citation tracking</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">Source attribution</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="p-6 md:p-8 md:col-span-2">
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="rounded-lg bg-red-50 p-4 mb-6 border border-red-100 flex items-start">
                      <X className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="website-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Website Name (optional)
                      </label>
                      <input
                        type="text"
                        name="website-name"
                        id="website-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-supabase-green focus:border-supabase-green text-sm"
                        placeholder="My Company Website"
                      />
                    </div>

                    <div>
                      <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                        Domain
                      </label>
                      <div className="relative rounded-lg shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          name="domain"
                          id="domain"
                          required
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          className="block w-full pl-10 border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-supabase-green focus:border-supabase-green text-sm"
                          placeholder="example.com"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Enter just the domain name without "http://" or "www."
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => router.push('/websites')}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-supabase-green"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-supabase-green to-supabase-green hover:from-supabase-green hover:to-supabase-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-supabase-green disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Adding...' : 'Add Website'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}