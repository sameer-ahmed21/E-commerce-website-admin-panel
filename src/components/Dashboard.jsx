import React, { useEffect, useState } from 'react';
import { Package, Users, ShieldCheck } from 'lucide-react';
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

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiRequest('/api/products'), apiRequest('/api/users')])
      .then(([products, users]) => {
        setStats({
          products: products.length,
          users: users.length,
          admins: users.filter((u) => u.role === 'admin').length,
        });
      })
      .catch((err) => console.error('Failed to load dashboard stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20 font-bold text-slate-500">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Total Products" value={stats.products} icon={Package} colorClass="bg-indigo-600" />
        <StatCard label="Total Users" value={stats.users} icon={Users} colorClass="bg-blue-500" />
        <StatCard label="Total Admins" value={stats.admins} icon={ShieldCheck} colorClass="bg-violet-600" />
      </div>
    </div>
  );
}
