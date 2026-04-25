import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/students')
    ]).then(([dashRes, studRes]) => {
      setData(dashRes.data);
      setStudents(studRes.data.students);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSearch = async () => {
    try {
      const res = await api.get(`/admin/students?search=${encodeURIComponent(search)}`);
      setStudents(res.data.students);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const timer = setTimeout(() => { if (search) handleSearch(); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-background"><span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span></div>;

  const stats = data?.stats || {};

  return (
    <div className="bg-background min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-container fixed h-screen flex flex-col z-20 shadow-lg">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-white text-xl font-bold">PlaceMentor AI</h1>
          <p className="text-white/50 text-xs mt-1">Admin Panel</p>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
            <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-white font-bold">A</div>
            <div>
              <p className="text-white font-medium text-sm">{user?.name || 'Admin'}</p>
              <p className="text-white/60 text-xs">Administrator</p>
            </div>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {[
            { id: 'overview', icon: 'space_dashboard', label: 'Overview' },
            { id: 'students', icon: 'people', label: 'Students' },
            { id: 'interviews', icon: 'videocam', label: 'Interviews' },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-secondary-container text-white shadow-md' : 'text-white/70 hover:bg-white/10'}`}>
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-all">
            <span className="material-symbols-outlined text-[22px]">logout</span>Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-grow p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Admin Dashboard</h2>
            <p className="text-on-surface-variant mt-1">Manage students and monitor placement performance.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Students', value: stats.total_students || 0, icon: 'people', color: 'bg-primary-container' },
            { label: 'Total Interviews', value: stats.total_interviews || 0, icon: 'videocam', color: 'bg-secondary-container' },
            { label: 'Completed', value: stats.completed_interviews || 0, icon: 'check_circle', color: 'bg-tertiary-container' },
            { label: 'Placement Rate', value: `${stats.placement_rate || 0}%`, icon: 'trending_up', color: 'bg-surface-variant' },
          ].map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm hover-lift">
              <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                <span className="material-symbols-outlined text-white">{card.icon}</span>
              </div>
              <p className="text-3xl font-bold text-on-surface">{card.value}</p>
              <p className="text-sm text-on-surface-variant mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg text-on-surface">Student Directory</h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..."
                className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all w-64" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Branch</th>
                  <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Domain</th>
                  <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Joined</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-medium text-on-surface">{s.name}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{s.email}</td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-surface-container rounded-md text-xs font-medium">{s.branch}</span></td>
                    <td className="py-3 px-4"><span className="px-2 py-1 bg-primary-container/10 rounded-md text-xs font-medium">{s.domain}</span></td>
                    <td className="py-3 px-4 text-on-surface-variant text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={5} className="py-10 text-center text-on-surface-variant">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
