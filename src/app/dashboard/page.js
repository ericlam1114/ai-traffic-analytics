'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase';
import { getUserWebsites, getTrafficByWebsite, getTrafficBySource } from '@/lib/supabase';
import NavBar from '../../components/NavBar';
import AuthGuard from '../../components/AuthGuard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch websites when component mounts
  useEffect(() => {
    if (user) {
      fetchWebsites();
    }
  }, [user]);

  // Fetch traffic data when selected website or time range changes
  useEffect(() => {
    if (selectedWebsite) {
      fetchTrafficData();
    }
  }, [selectedWebsite, timeRange]);

  const fetchWebsites = async () => {
    try {
      const { data, error } = await getUserWebsites(user.uid);
      if (error) throw error;
      
      setWebsites(data || []);
      if (data && data.length > 0) {
        setSelectedWebsite(data[0].id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
      setError('Failed to load websites');
      setLoading(false);
    }
  };

  const fetchTrafficData = async () => {
    setLoading(true);
    try {
      // Get traffic data
      const { data: allTraffic, error: trafficError } = await getTrafficByWebsite(selectedWebsite, timeRange);
      if (trafficError) throw trafficError;
      
      // Get traffic by source
      const { data: sourceData, error: sourceError } = await getTrafficBySource(selectedWebsite, timeRange);
      if (sourceError) throw sourceError;
      
      // Process the data for charts
      setTrafficData({
        totalVisits: allTraffic ? allTraffic.length : 0,
        bySource: sourceData || [],
        recentVisits: allTraffic ? allTraffic.slice(0, 10).map(item => ({
          source: item.source,
          page: item.page_path,
          time: new Date(item.timestamp).toLocaleString(),
        })) : [],
      });
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      setError('Failed to load traffic data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebsite = () => {
    router.push('/websites/add');
  };

  // Colors for the chart
  const sourceColors = {
    chatgpt: 'rgba(16, 163, 127, 0.7)',   // ChatGPT green
    perplexity: 'rgba(106, 90, 205, 0.7)', // Perplexity purple
    copilot: 'rgba(0, 120, 212, 0.7)',    // Microsoft blue
    claude: 'rgba(255, 149, 0, 0.7)',     // Claude orange
    bard: 'rgba(234, 67, 53, 0.7)',       // Google red
    gemini: 'rgba(66, 133, 244, 0.7)',    // Google blue
    'unknown-ai': 'rgba(128, 128, 128, 0.7)', // Gray for unknown
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

  return (
    <AuthGuard>
      <NavBar />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">AI Traffic Dashboard</h1>
              <p className="mt-2 text-sm text-gray-700">
                Monitor how AI platforms are driving traffic to your websites.
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

          {websites.length === 0 ? (
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
            <div className="mt-4">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-4">
                  <div className="flex-1">
                    <label htmlFor="website-select" className="block text-sm font-medium text-gray-700">
                      Select Website
                    </label>
                    <select
                      id="website-select"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={selectedWebsite || ''}
                      onChange={(e) => setSelectedWebsite(e.target.value)}
                    >
                      {websites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name || site.domain}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <label htmlFor="time-range" className="block text-sm font-medium text-gray-700">
                      Time Range
                    </label>
                    <select
                      id="time-range"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="24h">Last 24 hours</option>
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                    </select>
                  </div>
                </div>
                
                {loading ? (
                  <div className="p-6 flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                  </div>
                ) : (
                  <div className="p-6">
                    {trafficData && trafficData.totalVisits > 0 ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic by AI Source</h3>
                            <div className="h-64">
                              <Doughnut 
                                data={sourceChartData} 
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: 'bottom'
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-medium text-gray-900">Traffic Overview</h3>
                            <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                              <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Total AI Visits</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{trafficData.totalVisits}</dd>
                              </div>
                              <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                                <dt className="text-sm font-medium text-gray-500 truncate">Top Source</dt>
                                <dd className="mt-1 text-3xl font-semibold text-gray-900 capitalize">
                                  {trafficData.bySource.length > 0 ? trafficData.bySource[0].source : 'None'}
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent AI Visits</h3>
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
                                          Page
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Time
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {trafficData.recentVisits.map((visit, index) => (
                                        <tr key={index}>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                                  style={{ backgroundColor: sourceColors[visit.source] || 'gray', color: 'white', padding: '0.25rem 0.75rem' }}>
                                              {visit.source}
                                            </span>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {visit.page}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {visit.time}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <h3 className="text-lg font-medium text-gray-900">No traffic data yet</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Once AI platforms start citing your website, traffic data will appear here.
                        </p>
                        <div className="mt-6">
                          <a
                            href="/websites"
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Get Your Tracking Script
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}