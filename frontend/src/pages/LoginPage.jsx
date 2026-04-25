import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur-md text-slate-900 font-inter text-sm font-medium border-b border-slate-200 shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-slate-900 cursor-pointer" onClick={() => navigate('/')}>PlaceMentor AI</span>
            <nav className="hidden md:flex gap-6">
              <a className="text-slate-500 hover:text-slate-700 transition-colors duration-200" onClick={() => navigate('/')}>Home</a>
              <a className="text-slate-500 hover:text-slate-700 transition-colors duration-200" href="#">Features</a>
              <a className="text-slate-500 hover:text-slate-700 transition-colors duration-200" href="#">About</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <a className="text-slate-900 border-b-2 border-slate-900 pb-1 font-medium cursor-pointer">Login</a>
            <a onClick={() => navigate('/register')} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-button text-button active:scale-95 transition-transform cursor-pointer">Get Started</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center relative px-gutter py-2xl bg-login-hero">
        <div className="w-full max-w-md z-10">
          <div className="bg-surface-container-lowest border border-outline-variant shadow-xl rounded-xl p-xl transition-all">
            <div className="text-center mb-xl">
              <h1 className="font-h2 text-h2 text-on-surface mb-xs">Welcome Back</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Continue your journey to professional success.</p>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg mb-4 text-sm font-medium">
                {error}
              </div>
            )}

            <form className="space-y-lg" onSubmit={handleSubmit}>
              <div className="space-y-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="username">Username or Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <input className="block w-full pl-[44px] pr-md py-md bg-white border border-outline rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all outline-none" id="username" placeholder="Enter your student ID or email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-xs">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="password">Password</label>
                  <a className="font-label-sm text-label-sm text-primary hover:underline" href="#">Forgot Password?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-[20px]">lock</span>
                  </div>
                  <input className="block w-full pl-[44px] pr-md py-md bg-white border border-outline rounded-lg font-body-md text-body-md focus:ring-2 focus:ring-primary-fixed focus:border-primary transition-all outline-none" id="password" placeholder="••••••••" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                </div>
              </div>

              <div className="flex items-center gap-sm">
                <input className="w-4 h-4 text-primary border-outline rounded focus:ring-primary" id="remember" type="checkbox" />
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="remember">Remember this device</label>
              </div>

              <button disabled={loading} className="w-full bg-primary-container text-on-primary font-button text-button py-md rounded-lg shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-50" type="submit">
                {loading ? 'Logging in...' : 'Login to Portal'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="relative my-xl">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant"></div></div>
              <div className="relative flex justify-center text-label-sm font-label-sm uppercase">
                <span className="bg-surface-container-lowest px-md text-outline">New to PlaceMentor AI?</span>
              </div>
            </div>

            <a onClick={() => navigate('/register')} className="w-full border-2 border-secondary text-secondary font-button text-button py-md rounded-lg flex items-center justify-center gap-sm hover:bg-secondary-fixed transition-colors active:scale-[0.98] cursor-pointer">
              <span className="material-symbols-outlined">person_add</span>
              Create an Account
            </a>
          </div>

          <div className="mt-lg text-center">
            <p className="font-label-sm text-label-sm text-white/80">
              By logging in, you agree to our <a className="underline font-semibold" href="#">Terms of Service</a> and <a className="underline font-semibold" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-surface-container-highest py-lg px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-md">
          <div className="flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary">verified</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">© 2024 PlaceMentor AI. Accredited Placement Platform.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
