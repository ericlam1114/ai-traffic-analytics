'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase';
import { getUserWebsites } from '@/lib/supabase';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import AuthGuard from '@/components/AuthGuard';

export default function Websites() {
  const { user } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchWebsites();
    }
  }, [user]);

  const fetchWebsites = async () => {
    try {
      const response = await fetch(`/api/websites?userId=${user.uid}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch websites');
      }
      
      setWebsites(result.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching websites:', error);
      setError('Failed to load websites');
      setLoading(false);
    }
  };

  const handleAddWebsite = () => {
    router.push('/websites/add');
  };

  return (
    <AuthGuard>
      <NavBar />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Your Websites</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage the websites you're tracking AI traffic for.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                onClick={handleAddWebsite}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Website
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="mt-6 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            </div>
          ) : websites.length === 0 ? (
            <div className="mt-6 text-center py-12 bg-white shadow rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">No websites found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Add a website to start tracking AI traffic.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleAddWebsite}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Add Your First Website
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-col">
              <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle">
                  <div className="shadow-sm ring-1 ring-black ring-opacity-5">
                    <table className="min-w-full border-separate" style={{ borderSpacing: 0 }}>
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter sm:pl-6 lg:pl-8"
                          >
                            Website Name
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                          >
                            Domain
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 px-3 py-3.5 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                          >
                            Created
                          </th>
                          <th
                            scope="col"
                            className="sticky top-0 z-10 border-b border-gray-300 bg-gray-50 bg-opacity-75 py-3.5 pr-4 pl-3 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"
                          >
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {websites.map((website) => (
                          <tr key={website.id}>
                            <td className="whitespace-nowrap border-b border-gray-200 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 lg:pl-8">
                              {website.name || '(No name)'}
                            </td>
                            <td className="whitespace-nowrap border-b border-gray-200 px-3 py-4 text-sm text-gray-500">
                              {website.domain}
                            </td>
                            <td className="whitespace-nowrap border-b border-gray-200 px-3 py-4 text-sm text-gray-500">
                              {new Date(website.created_at).toLocaleDateString()}
                            </td>
                            <td className="relative whitespace-nowrap border-b border-gray-200 py-4 pr-4 pl-3 text-right text-sm font-medium sm:pr-6 lg:pr-8">
                              <Link href={`/websites/${website.id}`} className="text-indigo-600 hover:text-indigo-900">
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}