// src/app/websites/[id]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase';
import { getWebsiteById, getTrafficByWebsite, getTrafficBySource } from '@/lib/supabase';
import NavBar from '@/components/NavBar';
import AuthGuard from '@/components/AuthGuard';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Tooltip as ReactTooltip } from 'react-tooltip';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function WebsiteDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [website, setWebsite] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user && id) {
      fetchWebsiteData();
    }
  }, [user, id, timeRange]);

  const fetchWebsiteData = async () => {
    setLoading(true);
    try {
      // Get website details
      const { data: websiteData, error: websiteError } = await getWebsiteById(id);
      if (websiteError) throw websiteError;
      
      setWebsite(websiteData);
      
      // Get traffic data
      const { data: trafficRes, error: trafficError } = await getTrafficByWebsite(id, timeRange);
      if (trafficError) throw trafficError;
      
      // Get source distribution
      const { data: sourceData, error: sourceError } = await getTrafficBySource(id, timeRange);
      if (sourceError) throw sourceError;
      
      setTrafficData({
        totalVisits: trafficRes?.length || 0,
        bySource: sourceData || [],
        recentVisits: trafficRes ? trafficRes.slice(0, 10).map(item => ({
          source: item.source,
          page: item.page_path,
          time: new Date(item.timestamp).toLocaleString(),
          type: item.visit_type
        })) : [],
      });
    } catch (error) {
      console.error('Error fetching website data:', error);
      setError('Failed to load website data');
    } finally {
      setLoading(false);
    }
  };

  // Colors for the chart
  const sourceColors = {
    chatgpt: 'rgba(16, 163, 127, 0.7)',
    perplexity: 'rgba(106, 90, 205, 0.7)',
    copilot: 'rgba(0, 120, 212, 0.7)',
    claude: 'rgba(255, 149, 0, 0.7)',
    bard: 'rgba(234, 67, 53, 0.7)',
    gemini: 'rgba(66, 133, 244, 0.7)',
    'unknown-ai': 'rgba(128, 128, 128, 0.7)',
  };

  // Prepare chart data
  const sourceChartData = {
    labels: trafficData?.bySource.map(item => item.source) || [],
    datasets: [
      {
        data: trafficData?.bySource.map(item => item.count) || [],
        backgroundColor: trafficData?.bySource.map(item => sourceColors[item.source] || 'rgba(128, 128, 128, 0.7)') || [],
        borderColor: 'rgba(255, 255, 255, 0.7)',
        borderWidth: 1,
      },
    ],
  };

  // Add copy to clipboard function
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <AuthGuard>
      <NavBar />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">
                {website ? (website.name || website.domain) : 'Website Details'}
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                View AI traffic analytics for this website
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <select
                id="time-range"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md cursor-pointer hover:bg-gray-50"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                data-tooltip-id="time-range-tooltip"
                data-tooltip-content="Select a time period to view analytics"
              >
                <option value="24h">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="all">All time</option>
              </select>
              <ReactTooltip id="time-range-tooltip" />
            </div>
          </div>
          
          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {loading ? (
            <div className="mt-6 flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
              <p className="text-sm text-gray-500">Loading website data...</p>
            </div>
          ) : website ? (
            <div className="mt-6">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Website Information
                  </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Domain</dt>
                      <dd className="mt-1 text-sm text-gray-900">{website.domain}</dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Added on</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(website.created_at).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-2" id="tracking-code">
                      <dt className="text-sm font-medium text-gray-500">
                        Tracking Code 
                        <span className="ml-2 text-xs text-gray-400">
                          (Add this to your website's &lt;head&gt; section)
                        </span>
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <div className="relative bg-gray-50 p-4 rounded-md border border-gray-200">
                          <div className="font-mono text-sm overflow-x-auto whitespace-nowrap">
                            {`<script src="https://parsleyanalytics.com/ai-traffic-tracker.js" data-website-id="${website.id}"></script>`}
                          </div>
                          <div className="absolute top-3 right-3 flex items-center">
                            <button
                              onClick={() => copyToClipboard(`<script src="https://parsleyanalytics.com/ai-traffic-tracker.js" data-website-id="${website.id}"></script>`)}
                              className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                            >
                              {copied ? "Copied" : "Copy to clipboard"}
                            </button>
                          </div>
                        </div>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {trafficData && trafficData.totalVisits > 0 ? (
                <>
                  <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                          Traffic by AI Source
                          <span 
                            className="ml-2 text-gray-400 hover:text-gray-600 cursor-help"
                            data-tooltip-id="chart-tooltip"
                            data-tooltip-content="Distribution of AI platforms accessing your website"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </span>
                        </h3>
                        <ReactTooltip id="chart-tooltip" />
                        <div className="mt-5 h-64">
                          <Doughnut 
                            data={sourceChartData} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'bottom',
                                  labels: {
                                    padding: 20,
                                    usePointStyle: true
                                  }
                                },
                                tooltip: {
                                  callbacks: {
                                    label: function(context) {
                                      const label = context.label || '';
                                      const value = context.raw || 0;
                                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                      const percentage = Math.round((value / total) * 100);
                                      return `${label}: ${value} visits (${percentage}%)`;
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Overview</h3>
                        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6 hover:bg-gray-100 transition-colors duration-200">
                            <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
                              Total AI Visits
                              <span 
                                className="ml-2 text-gray-400 hover:text-gray-600 cursor-help"
                                data-tooltip-id="total-visits-tooltip"
                                data-tooltip-content="Total number of AI platform visits to your website"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{trafficData.totalVisits}</dd>
                            <ReactTooltip id="total-visits-tooltip" />
                          </div>
                          <div className="px-4 py-5 bg-gray-50 shadow-sm rounded-lg overflow-hidden sm:p-6 hover:bg-gray-100 transition-colors duration-200">
                            <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
                              Top Source
                              <span 
                                className="ml-2 text-gray-400 hover:text-gray-600 cursor-help"
                                data-tooltip-id="top-source-tooltip"
                                data-tooltip-content="Most frequent AI platform visiting your website"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                            </dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900 capitalize">
                              {trafficData.bySource.length > 0 ? trafficData.bySource[0].source : 'None'}
                            </dd>
                            <ReactTooltip id="top-source-tooltip" />
                          </div>
                        </dl>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        Recent AI Visits
                        <span 
                          className="ml-2 text-gray-400 hover:text-gray-600 cursor-help"
                          data-tooltip-id="recent-visits-tooltip"
                          data-tooltip-content="Most recent AI platform visits to your website"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </h3>
                      <ReactTooltip id="recent-visits-tooltip" />
                    </div>
                    <div className="flex flex-col">
                      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Source
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Page
                                  </th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Time
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {trafficData.recentVisits.map((visit, index) => (
                                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                            style={{ backgroundColor: sourceColors[visit.source] || 'gray', color: 'white', padding: '0.25rem 0.75rem' }}>
                                        {visit.source}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                      {visit.type || 'referral'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hover:text-gray-900 transition-colors duration-150">
                                      <div className="max-w-xs truncate" title={visit.page}>
                                        {visit.page}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      <span title={visit.time}>{visit.time}</span>
                                    </td>
                                  </tr>
                                ))}
                                {trafficData.recentVisits.length === 0 && (
                                  <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                      No recent visits to display
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">No traffic data yet</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Once AI platforms start citing your website, traffic data will appear here.
                    </p>
                    <p className="mt-5 text-sm font-medium text-gray-700">
                      Make sure you've added the tracking code to your website's &lt;head&gt; section.
                    </p>
                    <div className="mt-4 flex justify-center">
                      <a href="#tracking-code" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200">
                        View Tracking Code
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Website not found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  The website you are looking for does not exist or you don't have permission to view it.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}