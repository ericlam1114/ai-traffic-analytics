'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase';
import { addWebsite } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import AuthGuard from '@/components/AuthGuard';

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
      <main className="py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-gray-900">Add a Website</h1>
          
          <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <div className="md:col-span-1">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Website Details</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add a website to start tracking AI traffic sources and citations.
                </p>
              </div>
              <div className="mt-5 md:mt-0 md:col-span-2">
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-6">
                      <div className="text-sm text-red-700">{error}</div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="website-name" className="block text-sm font-medium text-gray-700">
                        Website Name (optional)
                      </label>
                      <input
                        type="text"
                        name="website-name"
                        id="website-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="My Company Website"
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
                        Domain
                      </label>
                      <input
                        type="text"
                        name="domain"
                        id="domain"
                        required
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="example.com"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Enter just the domain name without "http://" or "www."
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => router.push('/websites')}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
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