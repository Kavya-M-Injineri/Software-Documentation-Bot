import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, MessageSquare, Clock, CheckCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

const COLORS = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"];

const responseTimeData = [
  { time: "00:00", avgTime: 1.2 },
  { time: "04:00", avgTime: 1.1 },
  { time: "08:00", avgTime: 1.5 },
  { time: "12:00", avgTime: 1.8 },
  { time: "16:00", avgTime: 1.6 },
  { time: "20:00", avgTime: 1.3 },
];

interface AnalyticsData {
  stats: {
    total_queries: number;
    success_rate: number;
    avg_response_time: number;
    active_users: number;
  };
  weekly_volume: Array<{ day: string; queries: number }>;
  topic_distribution: Array<{ name: string; value: number }>;
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
        setError("Could not load analytics. Make sure the backend is running.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full gap-3 text-gray-600">
        <Loader2 className="w-6 h-6 animate-spin text-[#3B82F6]" />
        <span>Loading analytics…</span>
      </div>
    );
  }

  const stats = data
    ? [
      {
        label: "Total Queries",
        value: data.stats.total_queries.toString(),
        change: "+live",
        icon: MessageSquare,
        color: "blue",
      },
      {
        label: "Avg Response Time",
        value: `${data.stats.avg_response_time}s`,
        change: "real-time",
        icon: Clock,
        color: "purple",
      },
      {
        label: "Success Rate",
        value: `${data.stats.success_rate}%`,
        change: "+stable",
        icon: CheckCircle,
        color: "green",
      },
      {
        label: "Active Users",
        value: data.stats.active_users.toString(),
        change: "+growing",
        icon: TrendingUp,
        color: "orange",
      },
    ]
    : [];

  return (
    <div className="h-full bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
          Usage Analytics
        </h1>
        <p className="text-sm text-gray-600">
          Developer activity insights and performance metrics.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error} – Showing placeholder data below.
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const bgColorClass = {
              blue: "bg-blue-50", purple: "bg-purple-50",
              green: "bg-green-50", orange: "bg-orange-50",
            }[stat.color];
            const iconColorClass = {
              blue: "text-blue-600", purple: "text-purple-600",
              green: "text-green-600", orange: "text-orange-600",
            }[stat.color];
            return (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <div className={`p-2 ${bgColorClass} rounded-lg`}>
                    <Icon className={`w-4 h-4 ${iconColorClass}`} />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-semibold text-gray-900">{stat.value}</span>
                  <span className="text-sm text-green-600">{stat.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Query Volume */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Query Volume
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data?.weekly_volume || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
                <Bar dataKey="queries" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Topic Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Query Topics Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data?.topic_distribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(data?.topic_distribution || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Response Time */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Average Response Time (24h)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="time" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px" }} />
                <Line type="monotone" dataKey="avgTime" stroke="#3B82F6" strokeWidth={2} dot={{ fill: "#3B82F6", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Errors */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Most Searched Errors (This Week)
          </h3>
          <div className="space-y-3">
            {[
              { error: "TypeError: Cannot read property of undefined", count: 23 },
              { error: "CORS policy: No 'Access-Control-Allow-Origin'", count: 18 },
              { error: "ModuleNotFoundError: No module named", count: 15 },
              { error: "SyntaxError: Unexpected token", count: 12 },
              { error: "ConnectionError: Database connection failed", count: 9 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 font-mono">{item.error}</span>
                <span className="text-sm font-semibold text-[#3B82F6]">{item.count} queries</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}