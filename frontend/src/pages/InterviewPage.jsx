import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function InterviewPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Interview state
  const [phase, setPhase] = useState('setup'); // setup, interview, submitting
  const [domain, setDomain] = useState(user?.domain || 'Python');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [interviewId, setInterviewId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tabWarning, setTabWarning] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [inputMode, setInputMode] = useState('voice'); // voice or type

  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setUserAnswer(prev => prev + ' ' + finalTranscript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  // Tab switching detection
  useEffect(() => {
    if (phase !== 'interview' || !interviewId) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        try {
          const res = await api.post('/interview/tab-switch', { interview_id: interviewId });
          if (res.data.terminated) {
            setTabWarning({ type: 'terminated', message: res.data.warning });
            setTimeout(() => navigate('/dashboard'), 3000);
          } else {
            setTabWarning({ type: 'warning', message: res.data.warning });
            setTimeout(() => setTabWarning(null), 5000);
          }
        } catch (err) {
          console.error('Tab switch report failed');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [phase, interviewId, navigate]);

  const speakText = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setUserAnswer('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interview/start', { domain, difficulty });
      setInterviewId(res.data.interview_id);
      setQuestions(res.data.questions);
      setCurrentQ(0);
      setPhase('interview');
      setTranscript([]);
      // Read first question aloud
      setTimeout(() => speakText(res.data.questions[0]), 500);
      setTranscript(prev => [...prev, { role: 'ai', text: res.data.questions[0] }]);
    } catch (err) {
      alert('Failed to start interview. Please try again.');
    } finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return;
    setLoading(true);
    setFeedback(null);
    
    const answer = userAnswer.trim();
    setTranscript(prev => [...prev, { role: 'user', text: answer }]);

    try {
      const res = await api.post('/interview/answer', {
        interview_id: interviewId,
        question: questions[currentQ],
        user_answer: answer,
        question_index: currentQ
      });
      
      setFeedback(res.data);
      setAnsweredCount(prev => prev + 1);
      setTranscript(prev => [...prev, { role: 'feedback', text: `Score: ${(res.data.score * 100).toFixed(0)}% - ${res.data.feedback}` }]);
    } catch (err) {
      alert('Failed to submit answer');
    } finally { setLoading(false); }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setUserAnswer('');
      setFeedback(null);
      const nextQ = questions[currentQ + 1];
      speakText(nextQ);
      setTranscript(prev => [...prev, { role: 'ai', text: nextQ }]);
    }
  };

  const endInterview = async () => {
    setPhase('submitting');
    try {
      const res = await api.post('/interview/complete', { interview_id: interviewId });
      navigate(`/interview/results/${interviewId}`);
    } catch (err) {
      alert('Error completing interview');
      navigate('/dashboard');
    }
  };

  // ========== SETUP PHASE ==========
  if (phase === 'setup') {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-container rounded-3xl flex items-center justify-center mx-auto mb-6 ai-pulse">
              <span className="material-symbols-outlined text-white text-4xl">smart_toy</span>
            </div>
            <h1 className="font-h2 text-h2 text-on-surface mb-2">AI Mock Interview</h1>
            <p className="text-on-surface-variant font-body-lg">Prepare for your dream role with real-time AI feedback</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/20 space-y-6">
            <div>
              <label className="block font-label-sm text-on-surface-variant mb-2">Select Domain</label>
              <select value={domain} onChange={(e) => setDomain(e.target.value)}
                className="w-full p-4 bg-white border border-outline-variant rounded-xl font-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all">
                <option value="Python">Python</option>
                <option value="Web Development">Web Development</option>
                <option value="DBMS">DBMS</option>
                <option value="Data Structures">Data Structures</option>
              </select>
            </div>
            <div>
              <label className="block font-label-sm text-on-surface-variant mb-2">Difficulty</label>
              <div className="flex gap-3">
                {['easy', 'intermediate', 'hard'].map(d => (
                  <button key={d} onClick={() => setDifficulty(d)}
                    className={`flex-1 py-3 rounded-xl font-medium capitalize transition-all ${difficulty === d ? 'bg-primary-container text-white shadow-md' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-low p-5 rounded-xl">
              <h4 className="font-medium text-sm text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>Interview Guidelines
              </h4>
              <ul className="text-sm text-on-surface-variant space-y-2">
                <li className="flex items-start gap-2"><span className="text-secondary font-bold">•</span>10 AI-generated questions based on your domain</li>
                <li className="flex items-start gap-2"><span className="text-secondary font-bold">•</span>Use voice or text to answer questions</li>
                <li className="flex items-start gap-2"><span className="text-secondary font-bold">•</span>Real-time AI feedback after each answer</li>
                <li className="flex items-start gap-2"><span className="text-red-500 font-bold">⚠</span>Tab switching more than once will terminate the interview</li>
              </ul>
            </div>

            <button onClick={startInterview} disabled={loading}
              className="w-full bg-secondary-container text-white py-4 rounded-xl font-button text-button shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
              {loading ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>Starting...</> : <><span className="material-symbols-outlined">videocam</span>Start Interview</>}
            </button>
          </div>

          <button onClick={() => navigate('/dashboard')} className="w-full mt-4 text-center text-on-surface-variant font-label-sm hover:text-on-surface transition-colors">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ========== SUBMITTING PHASE ==========
  if (phase === 'submitting') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-5xl text-primary mb-4 block">progress_activity</span>
          <p className="text-on-surface-variant font-body-lg">Analyzing your interview performance...</p>
        </div>
      </div>
    );
  }

  // ========== INTERVIEW PHASE ==========
  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Tab Warning Overlay */}
      {tabWarning && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center ${tabWarning.type === 'terminated' ? 'bg-red-900/80' : 'bg-orange-900/80'}`}>
          <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <span className={`material-symbols-outlined text-5xl mb-4 ${tabWarning.type === 'terminated' ? 'text-red-600' : 'text-orange-600'}`}>
              {tabWarning.type === 'terminated' ? 'gpp_bad' : 'warning'}
            </span>
            <h3 className="font-h3 text-xl mb-2">{tabWarning.type === 'terminated' ? 'Interview Terminated' : 'Warning!'}</h3>
            <p className="text-on-surface-variant">{tabWarning.message}</p>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <header className="bg-primary-container text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">AI Interview</span>
          <span className="px-3 py-1 bg-white/10 rounded-full text-sm">{domain} • {difficulty}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-mono">
            Q {currentQ + 1}/{questions.length}
          </span>
          <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
            Answered: {answeredCount}
          </span>
          <button onClick={endInterview} className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-all">
            End Interview
          </button>
        </div>
      </header>

      <div className="flex-grow flex gap-6 p-6 max-w-7xl mx-auto w-full">
        {/* Left: Interview Panel */}
        <div className="flex-grow flex flex-col gap-6">
          {/* AI Interviewer */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
            <div className="flex items-center gap-4 mb-5">
              <div className={`w-14 h-14 bg-primary-container rounded-2xl flex items-center justify-center ${isSpeaking ? 'ai-pulse' : ''}`}>
                <span className="material-symbols-outlined text-white text-2xl">smart_toy</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">AI Interviewer</h3>
                <p className="text-sm text-on-surface-variant flex items-center gap-1">
                  {isSpeaking ? <><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>Speaking...</> : 'Ready'}
                </p>
              </div>
              <button onClick={() => speakText(questions[currentQ])} className="ml-auto p-2 hover:bg-surface-container rounded-lg transition-colors" title="Replay question">
                <span className="material-symbols-outlined text-on-surface-variant">volume_up</span>
              </button>
            </div>
            <div className="bg-surface-container-low p-5 rounded-xl">
              <p className="text-on-surface font-medium leading-relaxed">{questions[currentQ]}</p>
            </div>
          </div>

          {/* Answer Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex-grow">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-on-surface">Your Answer</h4>
              <div className="flex gap-2">
                <button onClick={() => setInputMode('voice')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'voice' ? 'bg-primary-container text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[18px] mr-1 align-middle">mic</span>Voice
                </button>
                <button onClick={() => setInputMode('type')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'type' ? 'bg-primary-container text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                  <span className="material-symbols-outlined text-[18px] mr-1 align-middle">keyboard</span>Type
                </button>
              </div>
            </div>

            {inputMode === 'voice' ? (
              <div className="text-center py-6">
                <button onClick={toggleListening}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                    isListening ? 'bg-red-500 mic-active shadow-red-500/30' : 'bg-primary-container hover:brightness-110 shadow-primary-container/30'
                  }`}>
                  <span className="material-symbols-outlined text-white text-3xl">{isListening ? 'stop' : 'mic'}</span>
                </button>
                <p className="text-sm text-on-surface-variant mt-4">{isListening ? 'Listening... Click to stop' : 'Click to start speaking'}</p>
                {userAnswer && (
                  <div className="mt-4 bg-surface-container-low p-4 rounded-xl text-left">
                    <p className="text-sm text-on-surface">{userAnswer}</p>
                  </div>
                )}
              </div>
            ) : (
              <textarea value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} placeholder="Type your answer here..."
                className="w-full h-40 p-4 bg-surface-container-low border border-outline-variant/30 rounded-xl font-body-md text-on-surface resize-none focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all" />
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`mt-4 p-5 rounded-xl border ${feedback.score >= 0.7 ? 'bg-green-50 border-green-200' : feedback.score >= 0.4 ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-sm">Score: {(feedback.score * 100).toFixed(0)}%</span>
                </div>
                <p className="text-sm text-on-surface-variant">{feedback.feedback}</p>
                {feedback.correct_answer && <p className="text-sm mt-2"><span className="font-medium">Ideal Answer:</span> {feedback.correct_answer}</p>}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-6">
              <button onClick={submitAnswer} disabled={loading || !userAnswer.trim() || feedback}
                className="px-8 py-3 bg-secondary-container text-white rounded-xl font-button shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 flex items-center gap-2">
                {loading ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Evaluating...</> : <><span className="material-symbols-outlined text-[18px]">send</span>Submit Answer</>}
              </button>
              {feedback && currentQ < questions.length - 1 && (
                <button onClick={nextQuestion} className="px-8 py-3 bg-primary-container text-white rounded-xl font-button hover:brightness-110 transition-all flex items-center gap-2">
                  Next Question<span className="material-symbols-outlined">arrow_forward</span>
                </button>
              )}
              {feedback && currentQ === questions.length - 1 && (
                <button onClick={endInterview} className="px-8 py-3 bg-green-600 text-white rounded-xl font-button hover:brightness-110 transition-all flex items-center gap-2">
                  Finish Interview<span className="material-symbols-outlined">check_circle</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Transcript */}
        <div className="w-80 shrink-0">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/20 sticky top-6 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
            <h4 className="font-medium text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              Interview Transcript
            </h4>
            <div className="flex-grow overflow-y-auto space-y-3 pr-1">
              {transcript.map((t, i) => (
                <div key={i} className={`p-3 rounded-xl text-sm ${
                  t.role === 'ai' ? 'bg-primary-container/10 text-on-surface' :
                  t.role === 'user' ? 'bg-secondary-container/10 text-on-surface ml-4' :
                  'bg-surface-container text-on-surface-variant italic text-xs'
                }`}>
                  <p className="text-xs font-bold mb-1 uppercase text-on-surface-variant">{t.role === 'ai' ? '🤖 AI' : t.role === 'user' ? '👤 You' : '📊 Feedback'}</p>
                  <p className="leading-relaxed">{t.text.length > 150 ? t.text.substring(0, 150) + '...' : t.text}</p>
                </div>
              ))}
              {transcript.length === 0 && <p className="text-center text-sm text-on-surface-variant py-8">Interview transcript will appear here</p>}
            </div>
            {/* Progress */}
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <div className="flex justify-between text-xs text-on-surface-variant mb-2">
                <span>Progress</span>
                <span>{answeredCount}/{questions.length}</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-secondary-container rounded-full transition-all" style={{ width: `${(answeredCount / Math.max(questions.length, 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
