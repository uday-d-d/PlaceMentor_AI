import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');

  useEffect(() => {
    api.get('/student/dashboard').then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const navItems = [
    { id: 'dashboard', icon: 'space_dashboard', label: 'Dashboard' },
    { id: 'aptitude', icon: 'quiz', label: 'Mock Tests' },
    { id: 'interview', icon: 'videocam', label: 'AI Interview' },
    { id: 'results', icon: 'analytics', label: 'Results' },
  ];

  const handleNav = (id) => {
    setActiveNav(id);
    if (id === 'aptitude') navigate('/aptitude');
    else if (id === 'interview') navigate('/interview');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
    </div>
  );

  const stats = data?.stats || {};
  const metrics = data?.performance_metrics || {};

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-container fixed h-screen flex flex-col transition-all duration-300 z-20 shadow-lg">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-white text-xl font-bold tracking-tight">PlaceMentor AI</h1>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
            <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user?.name || 'Student'}</p>
              <p className="text-white/60 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => handleNav(item.id)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeNav === item.id ? 'bg-secondary-container text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <span className="material-symbols-outlined text-[22px]">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-grow p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="font-h2 text-h3 text-on-surface">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h2>
            <p className="text-on-surface-variant mt-1 font-body-md">Track your progress and enhance your skills.</p>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => alert('No new notifications at this time.')} className="p-2.5 bg-white rounded-xl shadow-sm border border-outline-variant/30 hover:shadow-md transition-all">
              <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            </button>
            <div className="w-10 h-10 bg-primary-container rounded-full flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'S'}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Interviews Done', value: stats.total_interviews || 0, icon: 'videocam', color: 'bg-primary-container', iconColor: 'text-white' },
            { label: 'Avg Interview Score', value: `${stats.avg_interview_score || 0}%`, icon: 'trending_up', color: 'bg-secondary-container', iconColor: 'text-white' },
            { label: 'Aptitude Tests', value: stats.total_aptitude_tests || 0, icon: 'quiz', color: 'bg-tertiary-container', iconColor: 'text-white' },
            { label: 'Overall Progress', value: `${stats.overall_progress || 0}%`, icon: 'speed', color: 'bg-surface-variant', iconColor: 'text-primary' },
          ].map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${card.iconColor}`}>{card.icon}</span>
                </div>
                <span className="material-symbols-outlined text-outline text-[18px]">more_horiz</span>
              </div>
              <p className="text-3xl font-bold text-on-surface">{card.value}</p>
              <p className="text-sm text-on-surface-variant mt-1 font-label-sm">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Radar - Simplified */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h3 className="font-h3 text-lg text-on-surface mb-6">Performance Overview</h3>
            <div className="grid grid-cols-5 gap-4">
              {[
                { label: 'Communication', value: metrics.communication || 0, color: '#131b2e' },
                { label: 'Technical', value: metrics.technical_knowledge || 0, color: '#9d4300' },
                { label: 'Confidence', value: metrics.confidence || 0, color: '#005236' },
                { label: 'Clarity', value: metrics.clarity || 0, color: '#565e74' },
                { label: 'Problem Solving', value: metrics.problem_solving || 0, color: '#fd761a' },
              ].map((m, i) => (
                <div key={i} className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="#e5eeff" strokeWidth="3" />
                      <circle cx="18" cy="18" r="14" fill="none" stroke={m.color} strokeWidth="3"
                        strokeDasharray={`${m.value * 0.88} 88`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">{Math.round(m.value)}%</div>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium">{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
            <h3 className="font-h3 text-lg text-on-surface mb-6">Quick Actions</h3>
            <div className="space-y-3">
              <button onClick={() => navigate('/interview')} className="w-full flex items-center gap-3 p-4 bg-primary-container text-white rounded-xl hover:brightness-110 transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined">videocam</span>
                <span className="font-medium">Start AI Interview</span>
              </button>
              <button onClick={() => navigate('/aptitude')} className="w-full flex items-center gap-3 p-4 bg-secondary-container text-white rounded-xl hover:brightness-110 transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined">quiz</span>
                <span className="font-medium">Take Aptitude Test</span>
              </button>
              <button onClick={() => alert('Profile settings feature coming soon!')} className="w-full flex items-center gap-3 p-4 bg-surface-container text-on-surface rounded-xl hover:bg-surface-container-high transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined">person</span>
                <span className="font-medium">View Profile</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interview History */}
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-lg text-on-surface">Recent Interviews</h3>
              <span className="text-sm text-secondary font-medium cursor-pointer hover:underline">View All</span>
            </div>
            {(data?.interview_history || []).length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">videocam_off</span>
                <p>No interviews yet. Start your first one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(data?.interview_history || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.status === 'completed' ? 'bg-tertiary-fixed/20' : 'bg-secondary-fixed-dim/20'}`}>
                        <span className="material-symbols-outlined text-[20px]">{item.status === 'completed' ? 'check_circle' : 'pending'}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-on-surface">{item.domain}</p>
                        <p className="text-xs text-on-surface-variant">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className="font-bold text-sm">{item.total_score}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aptitude History */}
          <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-h3 text-lg text-on-surface">Recent Aptitude Tests</h3>
              <span className="text-sm text-secondary font-medium cursor-pointer hover:underline">View All</span>
            </div>
            {(data?.aptitude_history || []).length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">assignment</span>
                <p>No tests taken yet. Start practicing!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(data?.aptitude_history || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-fixed/20 rounded-xl flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">quiz</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-on-surface">{item.domain}</p>
                        <p className="text-xs text-on-surface-variant">{item.correct_answers}/{item.total_questions} correct</p>
                      </div>
                    </div>
                    <span className={`font-bold text-sm ${item.score_percentage >= 70 ? 'text-green-600' : item.score_percentage >= 50 ? 'text-orange-600' : 'text-red-600'}`}>{item.score_percentage}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
