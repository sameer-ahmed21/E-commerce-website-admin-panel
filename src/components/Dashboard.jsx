import React, { useEffect, useMemo, useState } from 'react';
import { Package, Users, ShieldCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { apiRequest } from '../utils/apiClient';

function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
    <div className={`rounded-3xl p-6 text-white ${colorClass}`}>
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-6">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-3xl font-black">{value}</p>
      <p className="text-sm opacity-90 mt-1">{label}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-3xl p-6 bg-white border border-slate-200">
      <h2 className="text-sm font-black uppercase tracking-tight text-slate-700 mb-6">{title}</h2>
      <div className="h-64">{children}</div>
    </div>
  );
}

// Groups timestamped records by day and returns a running (cumulative) total,
// so the chart reads as "growth over time" rather than a noisy daily count.
function toCumulativeByDay(records) {
  const counts = new Map();
  for (const { createdAt } of records) {
    if (!createdAt) continue;
    const day = new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    counts.set(day, (counts.get(day) || 0) + 1);
  }
  const withDates = records
    .filter((r) => r.createdAt)
    .map((r) => new Date(r.createdAt))
    .sort((a, b) => a - b);
  const days = [...new Set(withDates.map((d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })))];

  let running = 0;
  return days.map((day) => {
    running += counts.get(day) || 0;
    return { day, total: running };
  });
}

function toCategoryCounts(products) {
  const counts = new Map();
  for (const { category } of products) {
    const key = category || 'uncategorized';
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].map(([category, count]) => ({ category, count }));
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiRequest('/api/products'), apiRequest('/api/users')])
      .then(([productsData, usersData]) => {
        setProducts(productsData);
        setUsers(usersData);
      })
      .catch((err) => console.error('Failed to load dashboard stats:', err))
      .finally(() => setLoading(false));
  }, []);

  const categoryCounts = useMemo(() => toCategoryCounts(products), [products]);
  const userGrowth = useMemo(() => toCumulativeByDay(users), [users]);

  if (loading) {
    return <div className="text-center py-20 font-bold text-slate-500">Loading...</div>;
  }

  const admins = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Products" value={products.length} icon={Package} colorClass="bg-indigo-600" />
        <StatCard label="Total Users" value={users.length} icon={Users} colorClass="bg-blue-500" />
        <StatCard label="Total Admins" value={admins} icon={ShieldCheck} colorClass="bg-violet-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="User Growth">
          {userGrowth.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrowthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="total" name="Total users" stroke="#4f46e5" strokeWidth={2} fill="url(#userGrowthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="h-full flex items-center justify-center text-sm text-slate-400">Not enough signup history yet</p>
          )}
        </ChartCard>

        <ChartCard title="Products by Category">
          {categoryCounts.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCounts} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" name="Products" fill="#4f46e5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="h-full flex items-center justify-center text-sm text-slate-400">No products yet</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
