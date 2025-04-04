"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase";
import {
  getUserWebsites,
  getTrafficByWebsite,
  getTrafficBySource,
  getTrafficTrends,
  getTopPages,
} from "@/lib/supabase";
import NavBar from "../../components/NavBar";
import AuthGuard from "../../components/AuthGuard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import { XCircle, AlertTriangle } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

// Validate ArcElement registration explicitly
if (!ChartJS.registry.elements.get('arc')) {
  console.error('ArcElement not registered! Doughnut charts will not work.');
  // Try registering again explicitly
  ChartJS.register(ArcElement);
} else {
  console.log('ArcElement successfully registered for doughnut charts');
}

// Log ChartJS initialization
console.log('ChartJS registered with components including ArcElement required for Doughnut charts');

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [trafficData, setTrafficData] = useState({
    totalVisits: 0,
    bySource: [],
    recentVisits: []
  });
  const [trendData, setTrendData] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [isWebsitesLoaded, setIsWebsitesLoaded] = useState(false);
  const [chartKey, setChartKey] = useState(Date.now());
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Filter states
  const [sourceFilter, setSourceFilter] = useState("");
  const [pageFilter, setPageFilter] = useState("");

  // Check for dark mode
  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    // Listen for changes
    const darkModeListener = (e) => setIsDarkMode(e.matches);
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', darkModeListener);
    
    return () => {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', darkModeListener);
    };
  }, []);

  // Log component state on mount
  useEffect(() => {
    console.log('Dashboard mounted with state:', {
      selectedWebsite,
      websitesLength: websites.length,
      timeRange,
      isWebsitesLoaded,
      hasTrafficData: trafficData.bySource.length > 0
    });
  }, []);

  // Fetch traffic data when selected website or time range changes
  useEffect(() => {
    if (selectedWebsite) {
      console.log(`Fetching data for website ID: ${selectedWebsite} with time range: ${timeRange}`);
      fetchAllData();
      setIsWebsitesLoaded(true);
    } else {
      console.log('No website selected yet for data fetching');
    }
  }, [selectedWebsite, timeRange]);

  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    
    try {
      // Get traffic data
      const [trafficRes, sourceRes, trendRes, pagesRes] = await Promise.all([
        getTrafficByWebsite(selectedWebsite, timeRange),
        getTrafficBySource(selectedWebsite, timeRange),
        getTrafficTrends(selectedWebsite, timeRange),
        getTopPages(selectedWebsite, timeRange),
      ]);
  
      // Log the full response structures for debugging
      console.log('API responses:', {
        trafficRes: trafficRes,
        sourceRes: sourceRes,
        trendRes: trendRes,
        pagesRes: pagesRes
      });
      
      // Check for individual errors and log them
      if (trafficRes.error) console.error("Traffic data error:", trafficRes.error);
      if (sourceRes.error) console.error("Source data error:", sourceRes.error);
      if (trendRes.error) console.error("Trend data error:", trendRes.error);
      if (pagesRes.error) console.error("Pages data error:", pagesRes.error);
  
      // If all responses have errors, throw combined error
      if (trafficRes.error && sourceRes.error && trendRes.error && pagesRes.error) {
        throw new Error("All data fetching failed");
      }
  
      // Filter out standard referrals, unknown, and direct referrals - only keep AI referrals
      const aiOnlyTrafficData = trafficRes.data ? trafficRes.data.filter(item => 
        item.source && !['direct', 'unknown', 'standard-referral'].includes(item.source.toLowerCase())
      ) : [];
      
      const aiOnlySourceData = sourceRes.data ? sourceRes.data.filter(item => 
        item.source && !['direct', 'unknown', 'standard-referral'].includes(item.source.toLowerCase())
      ) : [];
  
      console.log('Filtered source data:', aiOnlySourceData);
  
      // Process the data for charts
      setTrafficData({
        totalVisits: aiOnlyTrafficData.length,
        bySource: aiOnlySourceData || [],
        recentVisits: aiOnlyTrafficData
          ? aiOnlyTrafficData.slice(0, 10).map((item) => ({
              source: item.source || "unknown",
              page: item.page_path || "/",
              time: new Date(item.timestamp).toLocaleString(),
              type: item.visit_type || "unknown",
            }))
          : [],
      });
  
      setTrendData(trendRes.data || []);
      setTopPages(pagesRes.data || []);
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      setError("Failed to load traffic data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebsite = () => {
    router.push("/websites/add");
  };

  // Colors for the chart - use colors from old working version
  const sourceColors = {
    chatgpt: "rgba(16, 163, 127, 0.7)", // ChatGPT green
    perplexity: "rgba(106, 90, 205, 0.7)", // Perplexity purple
    copilot: "rgba(0, 120, 212, 0.7)", // Microsoft blue
    claude: "rgba(255, 149, 0, 0.7)", // Claude orange
    bard: "rgba(234, 67, 53, 0.7)", // Google red
    gemini: "rgba(66, 133, 244, 0.7)", // Google blue
    gptbot: "rgba(16, 163, 127, 0.5)", // GPTBot
    "claude-crawler": "rgba(255, 149, 0, 0.5)", // Claude crawler
    "google-ai": "rgba(234, 67, 53, 0.5)", // Google crawler
    "unknown-ai": "rgba(135, 206, 250, 0.7)", // Light blue for unknown
    "google-ai-experimental": "rgba(255, 165, 0, 0.7)", // Google AI experimental
    "stealth-ai": "rgba(255, 255, 255, 0.7)", // Light for unknown
  };

  // Apply filters to data using simpler logic from the old working version
  const getFilteredData = () => {
    // Provide a default if trafficData is missing
    if (!trafficData) return { totalVisits: 0, bySource: [], recentVisits: [] };
    
    let filteredSources = trafficData.bySource || [];
    let filteredVisits = trafficData.recentVisits || [];
    
    if (sourceFilter) {
      const lowerFilter = sourceFilter.toLowerCase();
      filteredSources = filteredSources.filter(item => 
        item && item.source && item.source.toLowerCase().includes(lowerFilter)
      );
      filteredVisits = filteredVisits.filter(visit => 
        visit && visit.source && visit.source.toLowerCase().includes(lowerFilter)
      );
    }
    
    if (pageFilter) {
      const lowerFilter = pageFilter.toLowerCase();
      filteredVisits = filteredVisits.filter(visit => 
        visit && visit.page && visit.page.toLowerCase().includes(lowerFilter)
      );
    }
    
    return {
      totalVisits: trafficData.totalVisits || 0,
      bySource: filteredSources,
      recentVisits: filteredVisits
    };
  };
  
  const filteredData = getFilteredData();

  // Update chart key when data changes to force re-render
  useEffect(() => {
    setChartKey(prevKey => prevKey + 1);
    console.log("Chart key updated due to data change");
  }, [trafficData, activeTab]);

  // Debugging chart rendering
  useEffect(() => {
    console.log('Current chart key:', chartKey);
    console.log('Chart should render with data points:', 
      filteredData && filteredData.bySource ? filteredData.bySource.length : 0
    );
  }, [chartKey, filteredData]);

  // Add debug logging for chart data
  useEffect(() => {
    // Only log when chartKey changes to avoid infinite loops
    if (filteredData && filteredData.bySource) {
      console.log('Filtered data for chart:', {
        totalVisits: filteredData.totalVisits,
        bySourceCount: filteredData.bySource.length,
        sources: filteredData.bySource.map(s => s.source)
      });
      console.log('Chart key:', chartKey);
    } else {
      console.log('No filtered data available for chart');
    }
  }, [chartKey]); // Only depend on chartKey, not filteredData

  // Render the doughnut chart with sources data
  const renderSimpleSourcesChart = () => {
    try {
      if (!filteredData || !filteredData.bySource || filteredData.bySource.length === 0) {
        return (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <XCircle className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No source data available</p>
          </div>
        );
      }

      // Prepare data in the format Chart.js expects
      const sources = filteredData.bySource.map(item => item.source);
      const counts = filteredData.bySource.map(item => item.count);
      
      // Generate colors for each source - with higher opacity for more boldness
      const colors = sources.map(source => {
        const key = Object.keys(sourceColors).find(
          key => source && source.toLowerCase().includes(key.toLowerCase())
        );
        // Use the source color but increase opacity to 0.9 for boldness
        return key ? sourceColors[key].replace(/0\.\d+\)/, "0.9)") : "rgba(150, 150, 150, 0.9)";
      });

      const data = {
        labels: sources,
        datasets: [
          {
            data: counts,
            backgroundColor: colors,
            borderColor: colors.map(color => color.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, "rgba($1, 1)")),
            borderWidth: 2,
            hoverBackgroundColor: colors.map(color => color.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, "rgba($1, 0.95)")),
            hoverBorderWidth: 3,
            hoverBorderColor: colors.map(color => color.replace(/rgba\((\d+,\s*\d+,\s*\d+),[^)]+\)/, "rgba($1, 1)")),
          },
        ],
      };

      // Use a safe default text color if isDarkMode is undefined
      const textColor = typeof isDarkMode !== 'undefined' 
        ? (isDarkMode ? "#e5e7eb" : "#374151") 
        : "#374151"; // Default to light mode color if state isn't ready

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: textColor,
              padding: 15,
              usePointStyle: true,
              pointStyle: 'circle',
              boxWidth: 10,
              boxHeight: 10,
              font: {
                size: 12,
                weight: '500'
              }
            },
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            titleFont: {
              size: 13,
              weight: 'bold'
            },
            bodyFont: {
              size: 12
            },
            padding: 10,
            cornerRadius: 6,
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true
          }
        },
        cutout: '65%',
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 800,
          easing: 'easeOutQuart'
        },
        elements: {
          arc: {
            borderAlign: 'inner',
            borderJoinStyle: 'round'
          }
        }
      };

      return (
        <div className="h-[350px] flex items-center justify-center">
          <Doughnut key={chartKey} data={data} options={options} />
        </div>
      );
    } catch (error) {
      console.error("Error rendering sources chart:", error);
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Error rendering chart</p>
          <p className="text-xs text-gray-400">{error.message}</p>
        </div>
      );
    }
  };

  // Prepare top pages chart data with filters applied
  const filteredPages = pageFilter && Array.isArray(topPages)
    ? topPages.filter(page => page && page.page_path && page.page_path.toLowerCase().includes(pageFilter.toLowerCase()))
    : Array.isArray(topPages) ? topPages : [];

  const pagesChartData = {
    labels:
      filteredPages.map((item) =>
        item && item.page_path
          ? (item.page_path.length > 20
              ? item.page_path.substring(0, 20) + "..."
              : item.page_path)
          : "Unknown page"
      ),
    datasets: [
      {
        label: "Page Views",
        data: filteredPages.map((item) => (item && typeof item.count === 'number') ? item.count : 0),
        backgroundColor: "rgba(53, 162, 235, 0.8)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(53, 162, 235, 0.9)",
        barThickness: 16,
        maxBarThickness: 24,
      },
    ],
  };

  const renderFilters = () => {
    if (activeTab === "overview") return null;
    
    return (
      <motion.div 
        className="p-4 border-b border-gray-200 bg-gray-50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {activeTab === "sources" && (
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Source
              </label>
              <motion.input
                type="text"
                placeholder="e.g., chatgpt, claude"
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-supabase-green focus:border-supabase-green sm:text-sm rounded-md shadow-sm"
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}
          
          {activeTab === "pages" && (
            <div className="w-full sm:w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Page Path
              </label>
              <motion.input
                type="text"
                placeholder="e.g., /blog, /products"
                className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-supabase-green focus:border-supabase-green sm:text-sm rounded-md shadow-sm"
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              />
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderTabs = () => {
    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {["overview", "sources", "pages"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "border-supabase-green text-supabase-green"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.1 }}
            >
              {tab}
            </motion.button>
          ))}
        </nav>
      </div>
    );
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="p-6 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-supabase-green"></div>
        </div>
      );
    }

    if (!trafficData || trafficData.totalVisits === 0) {
      return (
        <motion.div 
          className="text-center py-16 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              No AI traffic data yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 mb-6">
              This dashboard only shows visits from AI platforms. Once AI platforms 
              start citing your website, the data will appear here.
            </p>
            <motion.a
              href="/websites"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-supabase-green hover:bg-green-700"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Get Your Tracking Script
            </motion.a>
          </div>
        </motion.div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <AnimatePresence mode="wait">
            <motion.div 
              key="overview"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-md transition-shadow duration-300"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Traffic by AI Source
                </h3>
                {renderSimpleSourcesChart()}
              </motion.div>
              <motion.div 
                className="bg-white p-5 rounded-lg shadow-md hover:shadow-md transition-shadow duration-300"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              >
                <h3 className="text-lg font-medium text-gray-900">
                  Traffic Overview
                </h3>
                <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <motion.div 
                    className="px-4 py-5 bg-gradient-to-br from-gray-50 to-white shadow-md rounded-lg overflow-hidden sm:p-6"
                    whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <dt className="text-sm font-medium text-gray-700 truncate">
                      Total AI Visits
                    </dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {trafficData.totalVisits}
                    </dd>
                  </motion.div>
                  <motion.div 
                    className="px-4 py-5 bg-gradient-to-br from-gray-50 to-white shadow-md rounded-lg overflow-hidden sm:p-6"
                    whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <dt className="text-sm font-medium text-gray-700 truncate">
                      Top AI Source
                    </dt>
                    <dd className="mt-2 text-3xl font-semibold text-gray-900">
                      {trafficData.bySource.length > 0
                        ? trafficData.bySource[0].source
                        : "None"}
                    </dd>
                  </motion.div>
                  <motion.div 
                    className="px-4 py-5 bg-gradient-to-br from-gray-50 to-white shadow-md rounded-lg overflow-hidden sm:p-6 md:col-span-2"
                    whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <dt className="text-sm font-medium text-gray-700 truncate">
                      Crawler vs Content Generation
                    </dt>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Crawler Visits</span>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                          {trafficData.recentVisits.filter((v) => v.type === "crawler").length}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">Content Gen Visits</span>
                        <p className="mt-1 text-2xl font-semibold text-gray-900">
                          {trafficData.recentVisits.filter((v) => v.type === "referral").length}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </dl>
              </motion.div>
              <motion.div 
                className="md:col-span-2 bg-white p-5 rounded-lg shadow-md hover:shadow-md transition-shadow duration-300"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent AI Visits
                </h3>
                <div className="overflow-x-auto rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Source
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Page
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.recentVisits.map((visit, index) => (
                        <motion.tr 
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03, duration: 0.3 }}
                          whileHover={{ backgroundColor: "#F9FAFB", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
                          className="border-b border-gray-100"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                            <span
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm"
                              style={{
                                backgroundColor: (() => {
                                  const key = Object.keys(sourceColors).find(
                                    k => visit.source && visit.source.toLowerCase().includes(k.toLowerCase())
                                  );
                                  return key ? sourceColors[key].replace(/0\.\d+\)/, "0.9)") : "rgba(150, 150, 150, 0.9)";
                                })(),
                                color: "white",
                                padding: "0.25rem 0.75rem",
                                textShadow: "0px 1px 2px rgba(0, 0, 0, 0.2)"
                              }}
                            >
                              {visit.source}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {visit.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {visit.page}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {visit.time}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        );
      case "sources":
        return (
          <AnimatePresence mode="wait">
            <motion.div 
              key="sources"
              className="p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className="bg-white p-5 rounded-lg shadow-md hover:shadow-md transition-shadow duration-300"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Traffic by AI Source
                    {sourceFilter && (
                      <span className="text-sm font-normal ml-2 text-gray-500">
                        Filtered: {sourceFilter}
                      </span>
                    )}
                  </h3>
                  {renderSimpleSourcesChart()}
                </motion.div>
                <motion.div 
                  className="bg-white p-5 rounded-lg shadow-md hover:shadow-md transition-shadow duration-300"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    AI Source Breakdown
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Visits
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            %
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.bySource.map((source, index) => (
                          <motion.tr 
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                            whileHover={{ backgroundColor: "#F9FAFB", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
                            className="border-b border-gray-100"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                              <span
                                className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm"
                                style={{
                                  backgroundColor: (() => {
                                    const key = Object.keys(sourceColors).find(
                                      k => source.source && source.source.toLowerCase().includes(k.toLowerCase())
                                    );
                                    return key ? sourceColors[key].replace(/0\.\d+\)/, "0.9)") : "rgba(150, 150, 150, 0.9)";
                                  })(),
                                  color: "white",
                                  padding: "0.25rem 0.75rem",
                                  textShadow: "0px 1px 2px rgba(0, 0, 0, 0.2)"
                                }}
                              >
                                {source.source}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {source.count}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {trafficData.totalVisits > 0
                                ? Math.round(
                                    (source.count / trafficData.totalVisits) * 100
                                  )
                                : 0}
                              %
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        );
      case "pages":
        return (
          <AnimatePresence mode="wait">
            <motion.div 
              key="pages"
              className="p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 gap-6">
                <motion.div 
                  className="bg-white p-5 rounded-lg shadow-md hover:shadow-md transition-shadow duration-300"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  whileHover={{ y: -3, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Top Pages Visited by AI
                      {pageFilter && (
                        <span className="text-sm font-normal ml-2 text-gray-500">
                          Filtered: {pageFilter}
                        </span>
                      )}
                    </h3>
                    {filteredPages.length > 0 && (
                      <div className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded-md">
                        {filteredPages.length} pages
                      </div>
                    )}
                  </div>
                  <div className="h-80 relative">
                    <Bar
                      data={pagesChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.75)',
                            padding: 12,
                            cornerRadius: 8,
                            bodyFont: {
                              size: 13
                            },
                            titleFont: {
                              size: 14,
                              weight: 'bold'
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)',
                              lineWidth: 1
                            },
                            ticks: {
                              font: {
                                weight: '500'
                              }
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            },
                            ticks: {
                              font: {
                                size: 11
                              }
                            }
                          }
                        },
                        animation: {
                          duration: 1000,
                          easing: 'easeInOutQuart',
                          delay: (context) => context.dataIndex * 50
                        }
                      }}
                    />
                    {filteredPages.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                        <div className="text-center p-6">
                          <p className="text-gray-500">No pages matching your filter</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
                <motion.div 
                  className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg overflow-hidden"
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Page
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Visits
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Main Source
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPages.map((page, index) => (
                        <motion.tr 
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.03, duration: 0.4 }}
                          whileHover={{ backgroundColor: "#F9FAFB", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
                          className="border-b border-gray-100"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>
                              {page.page_path}
                            </motion.div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {page.count}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm"
                              style={{
                                backgroundColor: (() => {
                                  const key = Object.keys(sourceColors).find(
                                    k => page.main_source && page.main_source.toLowerCase().includes(k.toLowerCase())
                                  );
                                  return key ? sourceColors[key].replace(/0\.\d+\)/, "0.9)") : "rgba(150, 150, 150, 0.9)";
                                })(),
                                color: "white",
                                padding: "0.25rem 0.75rem",
                                textShadow: "0px 1px 2px rgba(0, 0, 0, 0.2)"
                              }}
                            >
                              {page.main_source}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        );
      default:
        return null;
    }
  };

  const renderEmptyState = () => (
    <motion.div 
      className="mt-6 text-center py-12 bg-white shadow-lg rounded-lg border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="px-6">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900">No websites found</h3>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Add a website to start tracking AI traffic to monitor how platforms like ChatGPT, Claude, and Perplexity interact with your content.
        </p>
        <div className="mt-6">
          <motion.button
            type="button"
            onClick={handleAddWebsite}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-supabase-green hover:bg-green-700"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Website
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

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
          <motion.div 
            className="sm:flex sm:items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="sm:flex-auto">
              <h1 className="text-xl font-bold text-gray-900 drop-shadow-sm">
                AI Traffic Analytics
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Monitor and analyze how AI platforms are driving traffic to your websites.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <motion.button
                type="button"
                onClick={handleAddWebsite}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-supabase-green hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-supabase-green"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Add Website
              </motion.button>
            </div>
          </motion.div>

          {error && (
            <motion.div 
              className="mt-4 rounded-md bg-red-50 p-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-sm text-red-700">{error}</div>
            </motion.div>
          )}

          <AnimatePresence>
            {websites.length === 0 ? (
              renderEmptyState()
            ) : (
              <motion.div 
                className="mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <motion.div 
                  className="bg-white   transition-all duration-300 rounded-lg overflow-hidden "
                  whileHover={{ y: -3 }}
                >
                  <div className="p-4 flex justify-end">
                    <div className="w-48">
                      <label
                        htmlFor="time-range"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Time Range
                      </label>
                      <div className="relative">
                        <motion.select
                          id="time-range"
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-supabase-green focus:border-supabase-green sm:text-sm rounded-md shadow-sm"
                          value={timeRange}
                          onChange={(e) => setTimeRange(e.target.value)}
                          whileFocus={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <option value="24h">Last 24 hours</option>
                          <option value="7d">Last 7 days</option>
                          <option value="30d">Last 30 days</option>
                          <option value="90d">Last 90 days</option>
                          <option value="all">All time</option>
                        </motion.select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  {renderTabs()}
                  {renderFilters()}
                  {renderTabContent()}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </AuthGuard>
  );
}