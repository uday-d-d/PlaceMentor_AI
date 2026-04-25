import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AptitudeTest() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('intermediate');

  const domains = [
    { id: 'Python', icon: 'code', title: 'Python', desc: 'Core Python, OOP, Data structures', color: 'bg-blue-50 border-blue-200', iconBg: 'bg-blue-100', tests: 10 },
    { id: 'Web Development', icon: 'language', title: 'Web Development', desc: 'HTML, CSS, JS, React, REST APIs', color: 'bg-green-50 border-green-200', iconBg: 'bg-green-100', tests: 10 },
    { id: 'DBMS', icon: 'database', title: 'DBMS', desc: 'SQL, Normalization, Transactions', color: 'bg-purple-50 border-purple-200', iconBg: 'bg-purple-100', tests: 10 },
    { id: 'Data Structures', icon: 'account_tree', title: 'Data Structures', desc: 'Arrays, Trees, Graphs, Sorting', color: 'bg-orange-50 border-orange-200', iconBg: 'bg-orange-100', tests: 10 },
  ];

  const handleStartTest = () => {
    if (!selectedDomain) return;
    navigate('/aptitude/test', { state: { domain: selectedDomain, difficulty: selectedDifficulty } });
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-container fixed h-screen flex flex-col z-20 shadow-lg">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-white text-xl font-bold tracking-tight cursor-pointer" onClick={() => navigate('/')}>PlaceMentor AI</h1>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
            <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-white font-bold">{user?.name?.charAt(0) || 'S'}</div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user?.name || 'Student'}</p>
              <p className="text-white/60 text-xs truncate">{user?.email || ''}</p>
            </div>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <span className="material-symbols-outlined text-[22px]">space_dashboard</span>Dashboard
          </button>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium bg-secondary-container text-white shadow-md">
            <span className="material-symbols-outlined text-[22px]">quiz</span>Mock Tests
          </button>
          <button onClick={() => navigate('/interview')} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <span className="material-symbols-outlined text-[22px]">videocam</span>AI Interview
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all">
            <span className="material-symbols-outlined text-[22px]">logout</span>Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-grow p-8">
        <div className="mb-8">
          <h2 className="font-h2 text-h3 text-on-surface">Select a Mock Test</h2>
          <p className="text-on-surface-variant mt-1">Choose a domain and difficulty level to start your aptitude test.</p>
        </div>

        {/* Domain Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {domains.map(d => (
            <div key={d.id} onClick={() => setSelectedDomain(d.id)}
              className={`p-6 rounded-2xl border-2 cursor-pointer transition-all hover-lift ${selectedDomain === d.id ? 'border-primary-container bg-surface-container shadow-lg ring-2 ring-primary-container/20' : `${d.color} shadow-sm hover:shadow-md`}`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 ${d.iconBg} rounded-2xl flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-2xl text-on-surface">{d.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-h3 text-lg text-on-surface mb-1">{d.title}</h3>
                  <p className="text-sm text-on-surface-variant mb-3">{d.desc}</p>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">help</span>{d.tests} Questions</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">timer</span>15 min</span>
                  </div>
                </div>
                {selectedDomain === d.id && (
                  <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Difficulty */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm mb-8">
          <h3 className="font-h3 text-lg text-on-surface mb-4">Difficulty Level</h3>
          <div className="flex gap-4">
            {['easy', 'intermediate', 'hard'].map(d => (
              <button key={d} onClick={() => setSelectedDifficulty(d)}
                className={`px-6 py-3 rounded-xl font-medium capitalize transition-all ${selectedDifficulty === d ? 'bg-primary-container text-white shadow-md' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex justify-center">
          <button onClick={handleStartTest} disabled={!selectedDomain}
            className="bg-secondary-container text-white px-12 py-4 rounded-xl font-button text-button shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3">
            <span className="material-symbols-outlined">play_arrow</span>
            Start Test - {selectedDomain || 'Select a Domain'}
          </button>
        </div>
      </main>
    </div>
  );
}
