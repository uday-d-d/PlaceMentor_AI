import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function InterviewResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/interview/results/${id}`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-background"><span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span></div>;
  if (!data) return <div className="flex items-center justify-center min-h-screen bg-background"><p>Results not found</p></div>;

  const metrics = data.performance_metrics || {};
  const metricsArr = [
    { label: 'Communication', value: metrics.communication || 0, color: '#131b2e' },
    { label: 'Technical', value: metrics.technical_knowledge || 0, color: '#9d4300' },
    { label: 'Confidence', value: metrics.confidence || 0, color: '#005236' },
    { label: 'Clarity', value: metrics.clarity || 0, color: '#565e74' },
    { label: 'Problem Solving', value: metrics.problem_solving || 0, color: '#fd761a' },
  ];

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-primary-container text-white px-6 py-6 shadow-lg">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Interview Results</h1>
            <p className="text-white/70 text-sm mt-1">{data.domain} • {data.difficulty} • {data.status}</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all">← Dashboard</button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto p-6">
        {/* Score */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/20 mb-8 text-center">
          <div className="relative w-44 h-44 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e5eeff" strokeWidth="2.5"/>
              <circle cx="18" cy="18" r="15" fill="none" stroke={data.total_score >= 70 ? '#009668' : '#fd761a'} strokeWidth="2.5" strokeDasharray={`${data.total_score*0.94} 94`} strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold">{Math.round(data.total_score)}</span>
              <span className="text-sm text-on-surface-variant">out of 100</span>
            </div>
          </div>
          <p className={`font-bold text-lg ${data.total_score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
            {data.total_score >= 70 ? 'Excellent!' : data.total_score >= 50 ? 'Good Effort' : 'Needs Improvement'}
          </p>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <span className="px-4 py-2 bg-surface-container rounded-lg">Questions: {data.questions?.length || 0}</span>
            <span className="px-4 py-2 bg-surface-container rounded-lg">Answered: {data.answers?.length || 0}</span>
            <span className="px-4 py-2 bg-surface-container rounded-lg">Tab Switches: {data.tab_switches || 0}</span>
          </div>
        </div>
        {/* Metrics */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 mb-8">
          <h3 className="font-bold text-lg mb-6">Performance Breakdown</h3>
          <div className="grid grid-cols-5 gap-6">
            {metricsArr.map((m, i) => (
              <div key={i} className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-2">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e5eeff" strokeWidth="3"/>
                    <circle cx="18" cy="18" r="14" fill="none" stroke={m.color} strokeWidth="3" strokeDasharray={`${m.value*0.88} 88`} strokeLinecap="round"/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">{Math.round(m.value)}%</div>
                </div>
                <p className="text-xs text-on-surface-variant font-medium">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Answers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 mb-8">
          <h3 className="font-bold text-lg mb-6">Question Analysis</h3>
          <div className="space-y-4">
            {(data.answers || []).map((a, i) => (
              <div key={i} className={`p-5 rounded-xl border ${a.score >= 7.0 ? 'bg-green-50/50 border-green-200' : 'bg-orange-50/50 border-orange-200'}`}>
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium"><span className="text-on-surface-variant mr-2">Q{a.question_index+1}.</span>{a.question}</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${a.score >= 7.0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{a.score?.toFixed(1)} / 10</span>
                </div>
                <p className="text-sm text-on-surface-variant mt-2"><b>Your answer:</b> {a.user_answer || 'N/A'}</p>
                {a.feedback && <p className="text-sm text-blue-700 mt-1"><b>Feedback:</b> {a.feedback}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-4 justify-center pb-8">
          <button onClick={() => navigate('/interview')} className="px-8 py-3 bg-secondary-container text-white rounded-xl font-button hover:brightness-110 transition-all">Retake</button>
          <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-primary-container text-white rounded-xl font-button hover:brightness-110 transition-all">Dashboard</button>
        </div>
      </main>
    </div>
  );
}
