import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm_password: '', branch: '', domain: '', year_of_study: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const update = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center p-lg">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-xl bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          {/* Left: Branding */}
          <div className="hidden lg:flex flex-col justify-between p-xl bg-primary-container relative overflow-hidden">
            <div className="z-10">
              <div className="text-white text-xl font-bold tracking-tight mb-3xl cursor-pointer" onClick={() => navigate('/')}>PlaceMentor AI</div>
              <h1 className="font-h1 text-h2 text-white mb-lg">Bridge the Gap to Your Dream Career.</h1>
              <p className="text-on-primary-container font-body-lg mb-xl max-w-md">
                Join thousands of students who are transforming their academic success into professional placements with our AI-driven career pathing.
              </p>
            </div>
            <div className="z-10 bg-white/5 backdrop-blur-sm p-lg rounded-xl border border-white/10">
              <div className="flex items-center gap-md mb-sm">
                <span className="material-symbols-outlined text-tertiary-fixed text-3xl">school</span>
                <div className="font-h3 text-white text-md">Skill Assessment</div>
              </div>
              <p className="text-on-primary-container text-sm">Validate your technical skills and get certified for top-tier industry roles.</p>
            </div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl"></div>
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed-dim/10 rounded-full blur-3xl"></div>
          </div>

          {/* Right: Form */}
          <div className="p-lg lg:p-xl flex flex-col justify-center">
            <div className="mb-xl">
              <h2 className="font-h2 text-h3 text-on-surface mb-xs">Create Student Profile</h2>
              <p className="text-on-surface-variant font-body-md">Fill in your details to start your professional journey.</p>
            </div>

            {error && <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

            <form className="grid grid-cols-1 md:grid-cols-2 gap-lg" onSubmit={handleSubmit}>
              <div className="md:col-span-2">
                <label className="block font-label-sm text-on-surface-variant mb-xs">Student Name</label>
                <input className="w-full p-md bg-white border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary-container form-input-focus transition-all duration-200" placeholder="Enter your full name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)} required />
              </div>

              <div className="md:col-span-2">
                <label className="block font-label-sm text-on-surface-variant mb-xs">Email</label>
                <input className="w-full p-md bg-white border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary-container form-input-focus transition-all duration-200" placeholder="Enter your email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
              </div>

              <div className="col-span-1">
                <label className="block font-label-sm text-on-surface-variant mb-xs">Branch</label>
                <select className="w-full p-md bg-white border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary-container form-input-focus transition-all duration-200 appearance-none" value={form.branch} onChange={(e) => update('branch', e.target.value)} required>
                  <option disabled value="">Select Branch</option>
                  <option value="cs">Computer Science</option>
                  <option value="it">Information Technology</option>
                  <option value="ece">Electronics & Communication</option>
                  <option value="me">Mechanical Engineering</option>
                  <option value="ee">Electrical Engineering</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block font-label-sm text-on-surface-variant mb-xs">Domain</label>
                <select className="w-full p-md bg-white border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary-container form-input-focus transition-all duration-200 appearance-none" value={form.domain} onChange={(e) => update('domain', e.target.value)} required>
                  <option disabled value="">Select Domain</option>
                  <option value="Python">Python</option>
                  <option value="Web Development">Web Development</option>
                  <option value="DBMS">DBMS</option>
                  <option value="Data Structures">Data Structures</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block font-label-sm text-on-surface-variant mb-xs">Year of Study</label>
                <select className="w-full p-md bg-white border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary-container form-input-focus transition-all duration-200 appearance-none" value={form.year_of_study} onChange={(e) => update('year_of_study', e.target.value)} required>
                  <option disabled value="">Select Year</option>
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

              <div className="col-span-1">
                <label className="block font-label-sm text-on-surface-variant mb-xs">Password</label>
                <input className="w-full p-md bg-white border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary-container form-input-focus transition-all duration-200" placeholder="••••••••" type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required />
              </div>

              <div className="col-span-1">
                <label className="block font-label-sm text-on-surface-variant mb-xs">Confirm Password</label>
                <input className="w-full p-md bg-white border border-outline-variant rounded-lg font-body-md text-on-surface focus:border-primary-container form-input-focus transition-all duration-200" placeholder="••••••••" type="password" value={form.confirm_password} onChange={(e) => update('confirm_password', e.target.value)} required />
              </div>

              <div className="md:col-span-2 pt-md">
                <button disabled={loading} className="w-full bg-secondary-container text-white py-md px-xl rounded-lg font-button hover:brightness-110 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50" type="submit">
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
              </div>

              <div className="md:col-span-2 text-center mt-sm">
                <p className="text-on-surface-variant font-label-sm">
                  Already have an account? <a className="text-secondary font-semibold hover:underline decoration-2 underline-offset-4 ml-xs cursor-pointer" onClick={() => navigate('/login')}>Login here</a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
      <footer className="p-lg text-center">
        <p className="text-on-surface-variant font-label-sm opacity-60">© 2024 PlaceMentor AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
