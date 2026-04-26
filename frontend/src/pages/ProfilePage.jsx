import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/profile')
      .then(res => { setProfile(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
    </div>
  );

  if (!profile) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-on-surface-variant">Could not load profile.</p>
    </div>
  );

  const initials = profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'S';

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="bg-primary-container text-white px-6 py-8 shadow-lg">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-secondary-container rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.name}</h1>
              <p className="text-white/70 text-sm mt-1">{profile.email}</p>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all">
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
          <h3 className="font-bold text-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: 'Full Name', value: profile.name, icon: 'badge' },
              { label: 'Email Address', value: profile.email, icon: 'mail' },
              { label: 'Branch', value: profile.branch || 'Not set', icon: 'school' },
              { label: 'Year of Study', value: profile.year_of_study || 'Not set', icon: 'calendar_month' },
              { label: 'Domain', value: profile.domain || 'Not set', icon: 'code' },
              { label: 'Member Since', value: profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A', icon: 'event' },
            ].map((item, i) => (
              <div key={i} className="bg-surface-container-low rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{item.icon}</span>
                  <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">{item.label}</span>
                </div>
                <p className="text-on-surface font-medium text-sm mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
          <h3 className="font-bold text-lg text-on-surface mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">analytics</span>
            Performance Summary
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Interviews', value: profile.total_interviews || 0, icon: 'videocam', bg: 'bg-primary-container' },
              { label: 'Completed', value: profile.completed_interviews || 0, icon: 'check_circle', bg: 'bg-tertiary-container' },
              { label: 'Avg Aptitude', value: `${profile.avg_aptitude_score || 0}%`, icon: 'quiz', bg: 'bg-secondary-container' },
            ].map((stat, i) => (
              <div key={i} className="text-center bg-surface-container-low rounded-xl p-5">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <span className="material-symbols-outlined text-white">{stat.icon}</span>
                </div>
                <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
                <p className="text-xs text-on-surface-variant mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center pb-8">
          <button onClick={() => navigate('/interview')} className="px-8 py-3 bg-secondary-container text-white rounded-xl font-button hover:brightness-110 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">videocam</span>Start Interview
          </button>
          <button onClick={() => navigate('/aptitude')} className="px-8 py-3 bg-primary-container text-white rounded-xl font-button hover:brightness-110 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">quiz</span>Take Aptitude Test
          </button>
        </div>
      </main>
    </div>
  );
}
