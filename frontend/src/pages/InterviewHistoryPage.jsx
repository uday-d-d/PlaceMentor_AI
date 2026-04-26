import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function InterviewHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/interview/history')
      .then(res => { setHistory(res.data.history || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
    </div>
  );

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-primary-container text-white px-6 py-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Interview History</h1>
            <p className="text-white/70 text-sm mt-1">{history.length} interview{history.length !== 1 ? 's' : ''} recorded</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all">
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {history.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-outline-variant/20 text-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">videocam_off</span>
            <h3 className="font-bold text-lg text-on-surface mb-2">No Interviews Yet</h3>
            <p className="text-on-surface-variant mb-6">Start your first AI mock interview to see your history here.</p>
            <button onClick={() => navigate('/interview')} className="px-8 py-3 bg-secondary-container text-white rounded-xl font-button hover:brightness-110 transition-all">
              Start Interview
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item, i) => (
              <div key={i}
                onClick={() => item.status === 'completed' ? navigate(`/interview/results/${item.id}`) : null}
                className={`bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex items-center justify-between hover:shadow-md transition-all ${item.status === 'completed' ? 'cursor-pointer' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    item.status === 'completed' ? 'bg-green-100' :
                    item.status === 'terminated' ? 'bg-red-100' :
                    'bg-orange-100'
                  }`}>
                    <span className={`material-symbols-outlined ${
                      item.status === 'completed' ? 'text-green-600' :
                      item.status === 'terminated' ? 'text-red-600' :
                      'text-orange-600'
                    }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {item.status === 'completed' ? 'check_circle' :
                       item.status === 'terminated' ? 'cancel' : 'pending'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-on-surface">{item.domain}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-on-surface-variant">{item.difficulty}</span>
                      <span className="text-xs text-on-surface-variant">•</span>
                      <span className="text-xs text-on-surface-variant">
                        {item.answered_count || 0}/{item.questions_count || 0} answered
                      </span>
                      <span className="text-xs text-on-surface-variant">•</span>
                      <span className="text-xs text-on-surface-variant">
                        {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      item.total_score >= 70 ? 'text-green-600' :
                      item.total_score >= 50 ? 'text-orange-600' : 'text-red-600'
                    }`}>{Math.round(item.total_score || 0)}%</p>
                    <p className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${
                      item.status === 'completed' ? 'bg-green-100 text-green-700' :
                      item.status === 'terminated' ? 'bg-red-100 text-red-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>{item.status}</p>
                  </div>
                  {item.status === 'completed' && (
                    <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8 pb-8">
          <button onClick={() => navigate('/interview')} className="px-8 py-3 bg-secondary-container text-white rounded-xl font-button hover:brightness-110 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>New Interview
          </button>
        </div>
      </main>
    </div>
  );
}
