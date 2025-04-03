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

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [websites, setWebsites] = useState([]);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [timeRange, setTimeRange] = useState("7d");
  const [trafficData, setTrafficData] = useState(null);
  const [trendData, setTrendData] = useState(null);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch websites when component mounts
  useEffect(() => {
    if (user) {
      fetchWebsites();
    }
  }, [user]);

  // Fetch traffic data when selected website or time range changes
  useEffect(() => {
    if (selectedWebsite) {
      fetchAllData();
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
      console.error("Error fetching websites:", error);
      setError("Failed to load websites");
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Get traffic data
      const [trafficRes, sourceRes, trendRes, pagesRes] = await Promise.all([
        getTrafficByWebsite(selectedWebsite, timeRange),
        getTrafficBySource(selectedWebsite, timeRange),
        getTrafficTrends(selectedWebsite, timeRange),
        getTopPages(selectedWebsite, timeRange),
      ]);

      if (trafficRes.error) throw trafficRes.error;
      if (sourceRes.error) throw sourceRes.error;
      if (trendRes.error) throw trendRes.error;
      if (pagesRes.error) throw pagesRes.error;

      // Process the data for charts
      setTrafficData({
        totalVisits: trafficRes.data ? trafficRes.data.length : 0,
        bySource: sourceRes.data || [],
        recentVisits: trafficRes.data
          ? trafficRes.data.slice(0, 10).map((item) => ({
              source: item.source,
              page: item.page_path,
              time: new Date(item.timestamp).toLocaleString(),
              type: item.visit_type,
            }))
          : [],
      });

      setTrendData(trendRes.data || []);
      setTopPages(pagesRes.data || []);
    } catch (error) {
      console.error("Error fetching traffic data:", error);
      setError("Failed to load traffic data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWebsite = () => {
    router.push("/websites/add");
  };

  // Colors for the chart
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
  };

  // Prepare chart data
  const sourceChartData = {
    labels: trafficData?.bySource.map((item) => item.source) || [],
    datasets: [
      {
        data: trafficData?.bySource.map((item) => item.count) || [],
        backgroundColor:
          trafficData?.bySource.map(
            (item) => sourceColors[item.source] || "rgba(128, 128, 128, 0.7)"
          ) || [],
        borderColor: "rgba(255, 255, 255, 0.7)",
        borderWidth: 1,
      },
    ],
  };

  // Prepare trend chart data
  const trendChartData = {
    labels: trendData?.map((item) => item.date) || [],
    datasets: [
      {
        label: "AI Traffic",
        data: trendData?.map((item) => item.count) || [],
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
    ],
  };

  // Prepare top pages chart data
  const pagesChartData = {
    labels:
      topPages?.map((item) =>
        item.page_path.length > 20
          ? item.page_path.substring(0, 20) + "..."
          : item.page_path
      ) || [],
    datasets: [
      {
        label: "Page Views",
        data: topPages?.map((item) => item.count) || [],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const renderTabs = () => {
    return (
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {["overview", "sources", "pages", "trends"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${
                activeTab === tab
                  ? "border-supabase-green text-supabase-green"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
            >
              {tab}
            </button>
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
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">
            No traffic data yet
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Once AI platforms start citing your website, traffic data will
            appear here.
          </p>
          <div className="mt-6">
            <a
              href="/websites"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-supabase-green hover:bg-indigo-700"
            >
              Get Your Tracking Script
            </a>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Traffic by AI Source
              </h3>
              <div className="h-64">
                <Doughnut
                  data={sourceChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900">
                Traffic Overview
              </h3>
              <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total AI Visits
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {trafficData.totalVisits}
                  </dd>
                </div>
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Top Source
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900 capitalize">
                    {trafficData.bySource.length > 0
                      ? trafficData.bySource[0].source
                      : "None"}
                  </dd>
                </div>
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Referrals
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {
                      trafficData.recentVisits.filter(
                        (v) => v.type === "referral"
                      ).length
                    }
                  </dd>
                </div>
                <div className="px-4 py-5 bg-white shadow rounded-lg overflow-hidden sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Crawler Visits
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {
                      trafficData.recentVisits.filter(
                        (v) => v.type === "crawler"
                      ).length
                    }
                  </dd>
                </div>
              </dl>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent AI Visits
              </h3>
              <div className="overflow-x-auto shadow border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Page
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {trafficData.recentVisits.map((visit, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                          <span
                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            style={{
                              backgroundColor:
                                sourceColors[visit.source] || "gray",
                              color: "white",
                              padding: "0.25rem 0.75rem",
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "sources":
        return (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Traffic by AI Source
                </h3>
                <div className="h-80">
                  <Doughnut
                    data={sourceChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  AI Source Breakdown
                </h3>
                <table className="min-w-full divide-y divide-gray-200">
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
                    {trafficData.bySource.map((source, index) => (
                      <tr key={index}>
                        <td
                          className="px-6 py-4 whitespace-
                        // Continuing from where we left off in the dashboard component
                        nowrap text-sm capitalize"
                        >
                          <span
                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            style={{
                              backgroundColor:
                                sourceColors[source.source] || "gray",
                              color: "white",
                              padding: "0.25rem 0.75rem",
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "pages":
        return (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Top Pages Visited by AI
                </h3>
                <div className="h-80">
                  <Bar
                    data={pagesChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
                    {topPages.map((page, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {page.page_path}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {page.count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                            style={{
                              backgroundColor:
                                sourceColors[page.main_source] || "gray",
                              color: "white",
                              padding: "0.25rem 0.75rem",
                            }}
                          >
                            {page.main_source}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case "trends":
        return (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  AI Traffic Trends
                </h3>
                <div className="h-80">
                  <Line
                    data={trendChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        tooltip: {
                          mode: "index",
                          intersect: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
              <div className="bg-white p-4 shadow rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Traffic Insights
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700">Growth Rate</h4>
                    <p className="text-2xl font-bold mt-2">
                      {trendData && trendData.length > 1
                        ? (() => {
                            const first = trendData[0].count;
                            const last = trendData[trendData.length - 1].count;
                            const growth =
                              first > 0 ? ((last - first) / first) * 100 : 0;
                            return `${growth > 0 ? "+" : ""}${Math.round(
                              growth
                            )}%`;
                          })()
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Since beginning of period
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700">Peak Day</h4>
                    <p className="text-2xl font-bold mt-2">
                      {trendData && trendData.length > 0
                        ? (() => {
                            const max = trendData.reduce((prev, current) =>
                              prev.count > current.count ? prev : current
                            );
                            return max.date;
                          })()
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {trendData && trendData.length > 0
                        ? (() => {
                            const max = trendData.reduce((prev, current) =>
                              prev.count > current.count ? prev : current
                            );
                            return `${max.count} visits`;
                          })()
                        : ""}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700">Average Daily</h4>
                    <p className="text-2xl font-bold mt-2">
                      {trendData && trendData.length > 0
                        ? Math.round(
                            trendData.reduce((sum, day) => sum + day.count, 0) /
                              trendData.length
                          )
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Visits per day</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderEmptyState = () => (
    <div className="mt-6 text-center py-12 bg-white shadow rounded-lg">
      <h3 className="text-lg font-medium text-gray-900">No websites found</h3>
      <p className="mt-2 text-sm text-gray-500">
        Add a website to start tracking AI traffic.
      </p>
      <div className="mt-6">
        <button
          type="button"
          onClick={handleAddWebsite}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-supabase-green hover:bg-indigo-700"
        >
          Add Your First Website
        </button>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <NavBar />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">
                AI Traffic Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Monitor how AI platforms are driving traffic to your websites.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                onClick={handleAddWebsite}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-supabase-green hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-supabase-green"
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
            renderEmptyState()
          ) : (
            <div className="mt-4">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-4">
                  <div className="flex-1">
                    <label
                      htmlFor="website-select"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Select Website
                    </label>
                    <select
                      id="website-select"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-supabase-green focus:border-supabase-green sm:text-sm rounded-md"
                      value={selectedWebsite || ""}
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
                    <label
                      htmlFor="time-range"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Time Range
                    </label>
                    <select
                      id="time-range"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-supabase-green focus:border-supabase-green sm:text-sm rounded-md"
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                    >
                      <option value="24h">Last 24 hours</option>
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="all">All time</option>
                    </select>
                  </div>
                </div>

                {renderTabs()}
                {renderTabContent()}
              </div>
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
