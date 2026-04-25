import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

export default function TestInterface() {
  const navigate = useNavigate();
  const location = useLocation();
  const { domain = 'Python', difficulty = 'intermediate' } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    api.get(`/aptitude/questions?domain=${encodeURIComponent(domain)}&count=10`)
      .then(res => { setQuestions(res.data.questions); setLoading(false); })
      .catch(() => setLoading(false));
  }, [domain]);

  // Timer
  useEffect(() => {
    if (showResults || loading) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResults, loading]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const selectAnswer = (qIndex, answer) => {
    setAnswers(prev => ({ ...prev, [qIndex]: answer }));
  };

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    const payload = {
      domain,
      difficulty,
      answers: Object.entries(answers).map(([idx, ans]) => ({
        question_index: parseInt(idx),
        selected_answer: ans
      }))
    };
    try {
      const res = await api.post('/aptitude/submit', payload);
      setResults(res.data);
      setShowResults(true);
    } catch (err) {
      alert('Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  }, [answers, domain, difficulty, submitting]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary mb-4 block">progress_activity</span>
        <p className="text-on-surface-variant">Loading questions...</p>
      </div>
    </div>
  );

  if (showResults && results) {
    return (
      <div className="bg-background min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          {/* Score Header */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/20 mb-8 text-center">
            <div className="inline-flex items-center gap-2 bg-surface-container px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <span className="material-symbols-outlined text-[18px]">emoji_events</span>
              Test Complete
            </div>
            <h2 className="font-h2 text-h2 text-on-surface mb-2">{domain} Aptitude Test</h2>
            <div className="mt-6 mb-4">
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="#e5eeff" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15" fill="none" stroke={results.score_percentage >= 70 ? '#009668' : results.score_percentage >= 50 ? '#fd761a' : '#ba1a1a'} strokeWidth="3" strokeDasharray={`${results.score_percentage * 0.94} 94`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-on-surface">{results.score_percentage}%</span>
                  <span className="text-xs text-on-surface-variant">{results.correct_answers}/{results.total_questions}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">✓ Correct: {results.correct_answers}</div>
              <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium">✗ Wrong: {results.total_questions - results.correct_answers}</div>
            </div>
          </div>

          {/* Suggestions */}
          {results.suggestions && (
            <div className="bg-surface-container p-6 rounded-2xl mb-8 border border-outline-variant/20">
              <h3 className="font-h3 text-lg mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">lightbulb</span>
                AI Suggestions
              </h3>
              <p className="text-on-surface-variant whitespace-pre-line text-sm leading-relaxed">{results.suggestions}</p>
            </div>
          )}

          {/* Detailed Results */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 mb-8">
            <h3 className="font-h3 text-lg mb-6">Question-wise Analysis</h3>
            <div className="space-y-4">
              {(results.results || []).map((r, i) => (
                <div key={i} className={`p-5 rounded-xl border ${r.is_correct ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`material-symbols-outlined mt-0.5 ${r.is_correct ? 'text-green-600' : 'text-red-600'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {r.is_correct ? 'check_circle' : 'cancel'}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-on-surface mb-2">{r.question}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <p><span className="text-on-surface-variant">Your answer:</span> <span className={r.is_correct ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{r.selected_answer || 'Not answered'}</span></p>
                        {!r.is_correct && <p><span className="text-on-surface-variant">Correct:</span> <span className="text-green-700 font-medium">{r.correct_answer}</span></p>}
                      </div>
                      <p className="text-xs text-on-surface-variant mt-2 italic">{r.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/aptitude')} className="bg-surface-container text-on-surface px-8 py-3 rounded-xl font-button hover:bg-surface-container-high transition-all">
              Retake Test
            </button>
            <button onClick={() => navigate('/dashboard')} className="bg-primary-container text-white px-8 py-3 rounded-xl font-button hover:brightness-110 transition-all">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="bg-white border-b border-outline-variant/20 shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-on-surface">PlaceMentor AI</span>
          <span className="px-3 py-1 bg-surface-container rounded-full text-sm font-medium text-on-surface-variant">{domain}</span>
        </div>
        <div className="flex items-center gap-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${timeLeft < 120 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-surface-container text-on-surface'}`}>
            <span className="material-symbols-outlined text-[20px]">timer</span>
            {formatTime(timeLeft)}
          </div>
          <div className="text-sm text-on-surface-variant font-medium">
            {Object.keys(answers).length}/{questions.length} answered
          </div>
        </div>
      </header>

      <div className="flex-grow flex max-w-7xl mx-auto w-full p-6 gap-6">
        {/* Question Panel */}
        <div className="flex-grow bg-white rounded-2xl p-8 shadow-sm border border-outline-variant/20">
          <div className="flex items-center justify-between mb-6">
            <span className="px-4 py-1.5 bg-primary-container text-white rounded-lg text-sm font-medium">Question {currentQ + 1} of {questions.length}</span>
            <span className={`material-symbols-outlined text-[20px] cursor-pointer ${answers[currentQ] !== undefined ? 'text-green-500' : 'text-outline'}`}>
              {answers[currentQ] !== undefined ? 'bookmark_added' : 'bookmark_border'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-surface-container rounded-full mb-8 overflow-hidden">
            <div className="h-full bg-secondary-container rounded-full transition-all duration-300" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}></div>
          </div>

          <h3 className="font-h3 text-xl text-on-surface mb-8 leading-relaxed">{q?.question}</h3>

          <div className="space-y-3">
            {(q?.options || []).map((opt, i) => (
              <button key={i} onClick={() => selectAnswer(currentQ, opt)}
                className={`w-full text-left p-5 rounded-xl border-2 font-medium transition-all ${
                  answers[currentQ] === opt
                    ? 'bg-primary-container/10 border-primary-container text-on-surface shadow-md'
                    : 'bg-white border-outline-variant/30 text-on-surface hover:border-outline hover:bg-surface-container-low'
                }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                    answers[currentQ] === opt ? 'bg-primary-container text-white border-primary-container' : 'border-outline-variant text-on-surface-variant'
                  }`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span>{opt}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-outline-variant/20">
            <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
              className="flex items-center gap-2 px-6 py-3 bg-surface-container rounded-xl font-button hover:bg-surface-container-high transition-all disabled:opacity-30">
              <span className="material-symbols-outlined">arrow_back</span>Previous
            </button>
            {currentQ === questions.length - 1 ? (
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-secondary-container text-white rounded-xl font-button shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Test'}
                <span className="material-symbols-outlined">check</span>
              </button>
            ) : (
              <button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                className="flex items-center gap-2 px-6 py-3 bg-primary-container text-white rounded-xl font-button hover:brightness-110 transition-all">
                Next<span className="material-symbols-outlined">arrow_forward</span>
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="w-56 shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20 sticky top-24">
            <h4 className="font-medium text-sm text-on-surface mb-4">Question Navigator</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button key={i} onClick={() => setCurrentQ(i)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    i === currentQ ? 'active-question' : answers[i] !== undefined ? 'answered-question' : 'unanswered-question'
                  }`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="mt-5 space-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-primary-container rounded"></div><span className="text-on-surface-variant">Current</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-surface-container-highest rounded border border-outline-variant"></div><span className="text-on-surface-variant">Answered</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white rounded border border-outline-variant"></div><span className="text-on-surface-variant">Unanswered</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
