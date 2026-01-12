"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Users,
  MousePointer2,
  Smartphone,
  Globe,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import Link from "next/link";

// Dynamically import map to avoid SSR issues
const VisitorMap = dynamic(() => import("@/components/VisitorMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-zinc-100 animate-pulse rounded-xl" />
  ),
});

// Types (simplified)
type AnalyticsData = {
  totalClicks: number;
  uniqueVisitors: number;
  chartData: { date: string; count: number }[];
  locations: { name: string; value: number }[];
  devices: { name: string; value: number }[];
  browsers: { name: string; value: number }[];
  os: { name: string; value: number }[];
  recentVisits: any[];
  targetUrl: string;
  used: boolean;
};

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setCode(p.code);
      fetchData(p.code);
    });
  }, [params]);

  const fetchData = async (codev: string) => {
    try {
      const res = await fetch(`/api/analytics/${codev}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" size={40} />
      </div>
    );
  if (!data) return <div className="text-center py-20">Link not found</div>;

  // Prepare points for map
  const mapPoints = data.recentVisits
    .filter((v) => v.lat && v.lon)
    .map((v) => ({
      lat: v.lat,
      lon: v.lon,
      info: `${v.city}, ${v.country}`,
    }));

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                /{code}
                <span className="text-sm font-normal text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">
                  Analytics
                </span>
                {data.used && (
                  <span className="text-sm font-normal text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                    Expired
                  </span>
                )}
              </h1>
              <p className="text-xs text-zinc-500 truncate max-w-xs">
                {data.targetUrl}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            label="Total Clicks"
            value={data.totalClicks}
            icon={<MousePointer2 className="text-blue-500" />}
          />
          <Card
            label="Unique Visitors"
            value={data.uniqueVisitors}
            icon={<Users className="text-green-500" />}
          />
          <Card
            label="Top Country"
            value={data.locations[0]?.name || "-"}
            icon={<Globe className="text-purple-500" />}
            subValue={
              data.locations[0] ? `${data.locations[0].value} visits` : ""
            }
          />
          <Card
            label="Top OS"
            value={data.os[0]?.name || "-"}
            icon={<Smartphone className="text-orange-500" />}
            subValue={data.os[0] ? `${data.os[0].value} visits` : ""}
          />
        </div>

        {/* Main Chart */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="font-semibold mb-6 text-lg">Traffic Over Time</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  cursor={{ fill: "#f4f4f5" }}
                />
                <Bar
                  dataKey="count"
                  fill="#18181b"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Map & Lists Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section - Spans 2 cols */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <h3 className="font-semibold mb-6 text-lg">Visitor Locations</h3>
            <div className="rounded-xl overflow-hidden border border-zinc-100">
              <VisitorMap points={mapPoints} />
            </div>
          </div>

          {/* Country List */}
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm h-fit">
            <h3 className="font-semibold mb-4 text-lg">Top Locations</h3>
            <div className="space-y-3">
              {data.locations.slice(0, 5).map((loc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 hover:bg-zinc-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-mono text-sm">
                      #{i + 1}
                    </span>
                    <span className="font-medium">{loc.name}</span>
                  </div>
                  <span className="font-bold">{loc.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ListCard title="Operating Systems" items={data.os} />
          <ListCard title="Browsers" items={data.browsers} />
          <ListCard title="Recent Activity" items={null}>
            <div className="space-y-4">
              {data.recentVisits.slice(0, 5).map((v, i) => (
                <div
                  key={i}
                  className="text-sm border-b border-zinc-100 pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between font-medium">
                    <span>{v.ip}</span>
                    <span className="text-zinc-400 text-xs">
                      {new Date(v.time).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-zinc-500 text-xs mt-1">
                    {v.city}, {v.country}
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5">
                    {v.os} • {v.browser}
                  </div>
                  <div
                    className="text-zinc-400 text-[10px] mt-1 truncate"
                    title={v.ua}
                  >
                    {v.ua}
                  </div>
                </div>
              ))}
            </div>
          </ListCard>
        </div>
      </main>
    </div>
  );
}

function Card({ label, value, icon, subValue }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-zinc-500 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold mt-2">{value}</p>
        {subValue && <p className="text-xs text-zinc-400 mt-1">{subValue}</p>}
      </div>
      <div className="p-3 bg-zinc-50 rounded-xl">{icon}</div>
    </div>
  );
}

function ListCard({ title, items, children }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
      <h3 className="font-semibold mb-4 text-lg">{title}</h3>
      {children ? (
        children
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-zinc-600">{item.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full"
                    style={{ width: `${Math.min(item.value * 10, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium w-6 text-right">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
