"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase";
import {
  getUserWebsites,
  getTrafficTrends,
} from "@/lib/supabase";
import NavBar from "../../components/NavBar";
import AuthGuard from "../../components/AuthGuard";
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts with no SSR to avoid hydration issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

import { 
  TrendingUp, 
  Calendar,
  ChevronDown,
  Filter,
  ArrowUp,
  ArrowDown,
  Globe
} from "lucide-react";

export default function Trends() {
  const { user } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isWebsitesLoaded, setIsWebsitesLoaded] = useState(false);
  const [filterBy, setFilterBy] = useState("all"); // 'all', 'source', 'page'
  const [specificFilter, setSpecificFilter] = useState(""); // For specific source or page

  // Fetch traffic data when selected website or time range changes
  useEffect(() => {
    if (selectedWebsite) {
      fetchTrendData();
    }
  }, [selectedWebsite, timeRange, filterBy, specificFilter]);

  const fetchTrendData = async () => {
    setLoading(true);
    try {
      const trendRes = await getTrafficTrends(selectedWebsite, timeRange);
      if (trendRes.error) throw trendRes.error;
      
      setTrendData(trendRes.data || []);
    } catch (error) {
      console.error("Error fetching trend data:", error);
      setError("Failed to load trend data");
    } finally {
      setLoading(false);
    }
  };

  // Prepare apex chart data
  const chartSeries = [{
    name: 'AI Traffic',
    data: trendData?.map((item) => item.count) || []
  }];

  const chartOptions = {
    chart: {
      type: 'area',
      height: 380,
      fontFamily: 'Inter, system-ui, sans-serif',
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      },
    },
    colors: ['#10a37f'],
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: '#d1f5eb',
            opacity: 0.6
          },
          {
            offset: 90,
            color: '#d1f5eb',
            opacity: 0.2
          },
          {
            offset: 100,
            color: '#d1f5eb',
            opacity: 0.1
          }
        ]
      }
    },
    xaxis: {
      categories: trendData?.map((item) => item.date) || [],
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '11px',
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#6b7280',
          fontSize: '11px',
          fontWeight: 500
        },
        formatter: function(val) {
          return val.toLocaleString();
        }
      }
    },
    grid: {
      borderColor: '#f3f4f6',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    tooltip: {
      x: {
        show: true
      },
      y: {
        formatter: function(val) {
          return val.toLocaleString() + ' visits';
        }
      },
      theme: 'dark',
      style: {
        fontSize: '12px'
      }
    },
    markers: {
      size: 0,
      hover: {
        size: 5
      }
    }
  };

  const renderEmptyState = () => (
    <div className="mt-6 text-center py-12 bg-white shadow-lg rounded-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex-shrink-0 mx-auto p-3 rounded-full bg-emerald-50 w-16 h-16 flex items-center justify-center mb-4">
        <Globe className="h-8 w-8 text-emerald-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900">No websites found</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
        Add a website to start tracking AI traffic to monitor how platforms like ChatGPT, Claude, and Perplexity interact with your content.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={() => router.push("/websites/add")}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:translate-y-[-2px] transition-all duration-200"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Your First Website
        </button>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white p-6 shadow-sm rounded-lg mb-6 border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-1/3">
          <label 
            htmlFor="filter-type" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Filter By
          </label>
          <div className="relative">
            <select
              id="filter-type"
              className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md appearance-none shadow-sm"
              value={filterBy}
              onChange={(e) => {
                setFilterBy(e.target.value);
                setSpecificFilter("");
              }}
            >
              <option value="all">All Traffic</option>
              <option value="source">AI Source</option>
              <option value="page">Page Path</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
        
        {filterBy !== "all" && (
          <div className="w-full sm:w-2/3">
            <label 
              htmlFor="specific-filter" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {filterBy === "source" ? "Source" : "Page Path"}
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                id="specific-filter"
                placeholder={filterBy === "source" ? "e.g., chatgpt, claude" : "e.g., /blog/post-1"}
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md shadow-sm"
                value={specificFilter}
                onChange={(e) => setSpecificFilter(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="p-6 flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-sm text-gray-500">Loading trend data...</p>
        </div>
      );
    }

    if (!trendData || trendData.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="flex-shrink-0 mx-auto p-3 rounded-full bg-amber-50 w-16 h-16 flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">
            No trend data available
          </h3>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Once AI platforms start citing your website, trend data will appear here. Check back soon or add more websites to increase visibility.
          </p>
          <div className="mt-6">
            <a
              href="/websites"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 transform hover:translate-y-[-2px] transition-all duration-200"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Your Tracking Script
            </a>
          </div>
        </div>
      );
    }

    // Calculate trend metrics
    const growthRate = trendData && trendData.length > 1 
      ? (((trendData[trendData.length - 1].count - trendData[0].count) / trendData[0].count) * 100).toFixed(1)
      : 0;

    const peakDay = trendData && trendData.length > 0
      ? trendData.reduce((prev, current) => prev.count > current.count ? prev : current)
      : { date: 'N/A', count: 0 };

    const averageDaily = trendData && trendData.length > 0
      ? Math.round(trendData.reduce((sum, day) => sum + day.count, 0) / trendData.length)
      : 0;

    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300 hover:translate-y-[-2px] transition-transform duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-emerald-50">
                <TrendingUp className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">Growth Rate</p>
                <div className="flex items-center">
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{growthRate > 0 ? "+" : ""}{growthRate}%</p>
                  {growthRate != 0 && (
                    <span className="ml-2">
                      {growthRate > 0 ? 
                        <ArrowUp className="h-5 w-5 text-emerald-500" /> : 
                        <ArrowDown className="h-5 w-5 text-red-500" />}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Since beginning of period</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300 hover:translate-y-[-2px] transition-transform duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-blue-50">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">Peak Day</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{peakDay.date !== 'N/A' ? peakDay.date : 'N/A'}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500 flex items-center">
              <span className="font-medium text-blue-600 mr-1">{peakDay.count}</span> visits
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-300 hover:translate-y-[-2px] transition-transform duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-lg bg-purple-50">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500 truncate">Average Daily</p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">{averageDaily}</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-500">Visits per day</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              AI Traffic Trends 
              {filterBy !== "all" && ` - Filtered by ${filterBy}`}
              {specificFilter && `: ${specificFilter}`}
            </h3>
          </div>
          <div className="h-96">
            {/* Render the ApexCharts component */}
            <div className="h-full w-full">
              {typeof window !== 'undefined' && (
                <ReactApexChart 
                  options={chartOptions} 
                  series={chartSeries} 
                  type="area" 
                  height="100%" 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AuthGuard>
      <NavBar 
        selectedWebsite={selectedWebsite}
        setSelectedWebsite={setSelectedWebsite}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        websites={websites}
        setWebsites={setWebsites}
        isWebsitesLoaded={isWebsitesLoaded}
      />
      <main className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Traffic Trends</h1>
              <p className="mt-1 text-sm text-gray-600">
                Analyze AI traffic patterns over time
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="relative">
                <div className="flex bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                  <div className="px-3 py-2 bg-gray-50 font-medium text-gray-700 flex items-center border-r border-gray-200">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span>Range</span>
                  </div>
                  <select 
                    className="appearance-none bg-transparent pl-3 pr-8 py-2 text-gray-700 focus:outline-none"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 p-4 border border-red-100">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {websites.length === 0 ? (
            renderEmptyState()
          ) : (
            <div>
              {renderFilters()}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
                {renderContent()}
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}