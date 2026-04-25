import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-background text-on-background font-body-md selection:bg-secondary-container selection:text-on-secondary-container">
      {/* TopNavBar */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm fixed top-0 z-50 w-full">
        <div className="flex items-center justify-between px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight text-slate-900">PlaceMentor AI</span>
            <nav className="hidden md:flex items-center gap-6 font-inter text-sm font-medium">
              <a className="text-slate-900 border-b-2 border-slate-900 pb-1" href="#">Home</a>
              <a className="text-slate-500 hover:text-slate-700 transition-colors duration-200" href="#features">Features</a>
              <a className="text-slate-500 hover:text-slate-700 transition-colors duration-200" href="#about">About</a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex gap-4">
              <button onClick={() => navigate('/login')} className="font-inter text-sm font-medium text-slate-500 hover:text-slate-900 transition-all active:scale-95">Login</button>
              <button onClick={() => navigate('/register')} className="font-inter text-sm font-medium text-slate-500 hover:text-slate-900 transition-all active:scale-95">Register</button>
            </div>
            <button onClick={() => navigate('/register')} className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-button text-button shadow-md hover:brightness-110 active:scale-95 transition-all">
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 overflow-hidden">
        {/* Hero Section */}
        <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="z-10">
              <div className="inline-flex items-center gap-2 bg-surface-container px-3 py-1 rounded-full text-primary-container font-label-sm text-label-sm mb-6 border border-outline-variant/30">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>AI-Powered Career Transformation</span>
              </div>
              <h1 className="font-h1 text-h1 text-on-background mb-6 leading-tight">
                Bridge the Gap to Your <span className="text-secondary">Dream Career</span> with AI
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 max-w-lg">
                PlaceMentor AI uses advanced AI to simulate realistic interviews, test your aptitude, and connect you with high-growth placement opportunities.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={() => navigate('/register')} className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-button text-button shadow-lg shadow-secondary/20 hover:-translate-y-1 transition-all active:scale-95">
                  Get Started Now
                </button>
                <button className="flex items-center gap-2 bg-white border border-outline-variant px-8 py-4 rounded-xl font-button text-button text-on-surface hover:bg-surface-container transition-all active:scale-95">
                  <span className="material-symbols-outlined">play_circle</span>
                  Watch Demo
                </button>
              </div>
              <div className="mt-12 flex items-center gap-4 text-on-surface-variant font-label-sm text-label-sm">
                <div className="flex -space-x-2">
                  <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDylBGfb7ZhC-zCxpgADGuN7DtszW5QlDiWSDmjK57pYdMEkFMdP2FVkr1m94gJuVJGZMWGq-ugj24iVW8K3hx3aMA7FEGoUN2ZkMLMyztZKkjouy6EoyCLrmzuY5bMr_eANsjsL_y5E03LyRv_qCI3nYrbyrEx4Dh_ICh7WLuVrh3NJ8NzAdx9op9-2V_fRX16CuKeJRCyIiQkYC5VZwTzxnM2ZvlPOZsyx_1hA7XMWNPh-41q1L6Oxod5k65AZ2F0zTKp801NIEW" />
                  <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDULANEIEOQvRyxK79CU41TjfLywByN_mmn2LafdxrM3vnKJnJK0rEdr7xaQZa6acvjwpKyEhWsADLZBIqkO2NUhCa8GbAJd4defbGwWcdi78G9GaPuIFLp51smSheRNYHG4oDtvfmwsqnf309XIr-nD_Wm8Nq00Qmhw9PbJhmTYIAzk1uFXTW1V5U2tcxwrDJ5DsPaHk7cXzLyVU0ql23RfXKjIMZDnZFpcfBrfX0pcjfLC_sxoz2UUtim4JB36pwqdBm9DS2-BLgQ" />
                  <img alt="User" className="w-10 h-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF0AeuHDp_pdWxftA9lkqYHf-JHkrpp4cJRvin10g66o6ck2kstgvys9z9UCf6HA1O8IeCRu1Q8fS47-d2eLbW3zMI29bUDh96Li3BP-NTDO09nLjPx1dTx2yzABnjqnSPcD5PA_EFnqzPbmzrplWeXaBXpIgoPMcxcoQgtXqndEagOgObP6Fd-S7dlPA4UOofjP0YMFGfjINkXZSW1yURB0MIz0hqiB1ftu-0tv05SU4atH_D6bFXFex01Ue7dUfRN6vRdr8Cf5-S" />
                </div>
                <span>Joined by 10,000+ students this month</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="relative bg-white rounded-3xl p-4 shadow-2xl border border-outline-variant/20 overflow-hidden">
                <img alt="Student Success" className="rounded-2xl w-full object-cover aspect-[4/3]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxayaiQ_HHeT6e2QNKgaMaQ7yy-4lBMFQqNpqyfH0yPo5Ueg_1S_M1MACtXWvkFTMOpNhbSHAs2C5paR0JUjjH9pqNbSOtoIbD-T4Gqsz5_wKzynX1HJvTRZ4vbjhE2SRwKsXgZfFjVU_zsNmupgdf5QAcOKZv4Za-tIUmUh571SiuPzxVQxBmsop0Cbwmazkc6Uwc2FCitcZrFWFo-J7kJRttOQDQjaxl8F07vda8YZD7BWtItYtS9eiHpGPkDYTDUskkRz4ZNGhg" />
                <div className="absolute bottom-10 -left-6 glass-card p-6 rounded-2xl shadow-xl max-w-[200px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-tertiary-fixed p-2 rounded-lg">
                      <span className="material-symbols-outlined text-on-tertiary-fixed">trending_up</span>
                    </div>
                    <span className="font-h3 text-[20px] text-on-surface">94%</span>
                  </div>
                  <p className="text-[12px] font-medium text-on-surface-variant">Success placement rate for AI-trained students</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="bg-surface-container-low py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-h2 text-h2 text-on-surface mb-4">Precision Tools for Modern Hires</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto font-body-lg text-body-lg">
                We've built a suite of AI-driven features designed to replicate real-world placement cycles.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
              {/* AI Interviews */}
              <div className="md:col-span-8 bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col justify-between overflow-hidden group hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">videocam</span>
                    </div>
                    <h3 className="font-h3 text-h3">AI Interviews</h3>
                  </div>
                  <p className="text-on-surface-variant font-body-md max-w-md">
                    Face-to-face simulation with adaptive AI that analyzes your tone, and technical accuracy in real-time.
                  </p>
                </div>
                <div className="mt-8 relative h-48 rounded-2xl bg-surface-container-highest overflow-hidden">
                  <img alt="AI Interview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA1AOJZ-8OSd-vtEWOysAy0CDS4qxnXlqU3QH_abEptoXfWNfDJloryV74b_Rshc4mNxsR20tJJoas5M8WlWZLvrkn1-J4HirgDG_xQH5Ncjba6TR3Ov_bnYE5KU_JtWpcjCoJpsiwdIV5fOJ2HHuFCdQwmAI7hW8Tmn9E2t-uu95usqszWkbaPQ1AKXH9et8ELib1QYhY-BlGxYJP8q8pkN7J3tW0MNBCXINCXmOCxVycKU7VgW1720Aj5UORfGXySTeYAM4Nt2ez" />
                </div>
              </div>
              {/* Performance Analytics */}
              <div className="md:col-span-4 bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-sm flex flex-col group hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-white">insights</span>
                </div>
                <h3 className="font-h3 text-h3 text-white mb-4">Performance Analytics</h3>
                <p className="text-slate-400 font-body-md mb-8">
                  Deep-dive metrics into your career readiness score, highlighting technical gaps and strengths.
                </p>
                <div className="mt-auto flex flex-col gap-3">
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-secondary w-3/4 rounded-full"></div>
                  </div>
                  <div className="flex justify-between text-slate-300 font-label-sm text-label-sm">
                    <span>Readiness Score</span><span>75%</span>
                  </div>
                </div>
              </div>
              {/* Mock Tests */}
              <div className="md:col-span-4 bg-white p-8 rounded-3xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary">quiz</span>
                </div>
                <h3 className="font-h3 text-h3 mb-4">Mock Tests</h3>
                <p className="text-on-surface-variant font-body-md">
                  Industry-standard technical assessments tailored to specific company profiles.
                </p>
              </div>
              {/* Smart Matching */}
              <div className="md:col-span-8 bg-surface-container p-8 rounded-3xl border border-outline-variant/30 shadow-sm flex items-center gap-8 group">
                <div className="flex-1">
                  <h3 className="font-h3 text-h3 mb-4">Smart Job Matching</h3>
                  <p className="text-on-surface-variant font-body-md">
                    Our algorithm matches your potential with roles where you'll thrive most.
                  </p>
                  <button className="mt-6 flex items-center gap-2 text-secondary font-button font-bold group-hover:gap-4 transition-all">
                    Explore Placements <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
                <div className="hidden lg:block w-48 h-48 rounded-full border-4 border-white shadow-xl overflow-hidden">
                  <img alt="Career" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2mFbJRQrXE8MVK-SFPlYM47PpGFyvorDuBt-S4NN91CseSgtV5uufYk8a1w4uOZUBGJgBTmC7txgmjO2bZ2xVxKmH5qVCvjZ-5fG9IBhawbTf2QvOqpN8tJpAUkGEPv4uZfQjsFkEF4H7Yx5Wg2M8LVF47wjtm_t4WxBuugDhlK5T8ixN2dmYOxQuXoorfp6LyFDs0cugIN_3bxxhltrAHpgfYnYxchVbkIr7jeFlQt3DtsjL28lBeEtUPDVZUN3FRa3rl22G9FpK" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="about" className="py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto bg-primary-container rounded-[40px] p-8 md:p-16 relative">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-l from-white/20 to-transparent"></div>
            </div>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-h2 text-h2 text-white mb-6">Experience the Student Portal</h2>
                <p className="text-slate-400 font-body-lg text-body-lg mb-10">
                  Track your growth in real-time with our student dashboard. Manage applications, review feedback, and access personalized training.
                </p>
                <ul className="space-y-4 mb-10">
                  {["Unified Placement Tracking", "Instant AI Feedback Loop", "Verified Skills Certification"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-white">
                      <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/register')} className="bg-white text-primary-container px-8 py-4 rounded-xl font-button text-button hover:bg-slate-100 transition-all active:scale-95">
                  Launch Student Portal
                </button>
              </div>
              <div className="relative lg:translate-x-12 translate-y-8">
                <div className="bg-slate-800 rounded-2xl p-2 shadow-2xl border border-slate-700">
                  <div className="bg-background rounded-xl overflow-hidden flex h-[400px]">
                    <div className="w-16 bg-slate-900 flex flex-col items-center py-6 gap-6">
                      <div className="w-8 h-8 rounded-lg bg-slate-700"></div>
                      <div className="w-8 h-8 rounded-lg bg-orange-600"></div>
                      <div className="w-8 h-8 rounded-lg bg-slate-700"></div>
                      <div className="w-8 h-8 rounded-lg bg-slate-700"></div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-6 w-32 bg-slate-200 rounded"></div>
                        <div className="h-10 w-10 rounded-full bg-slate-300"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-32 bg-white border border-slate-200 rounded-xl p-4">
                          <div className="h-2 w-12 bg-slate-200 rounded mb-4"></div>
                          <div className="h-8 w-16 bg-slate-300 rounded"></div>
                        </div>
                        <div className="h-32 bg-white border border-slate-200 rounded-xl p-4">
                          <div className="h-2 w-12 bg-slate-200 rounded mb-4"></div>
                          <div className="h-8 w-16 bg-slate-300 rounded"></div>
                        </div>
                        <div className="col-span-2 h-40 bg-white border border-slate-200 rounded-xl p-4">
                          <div className="h-2 w-24 bg-slate-200 rounded mb-4"></div>
                          <div className="space-y-3">
                            <div className="h-2 w-full bg-slate-100 rounded"></div>
                            <div className="h-2 w-full bg-slate-100 rounded"></div>
                            <div className="h-2 w-3/4 bg-slate-100 rounded"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white border-t border-slate-200 py-16 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 mb-6 block">PlaceMentor AI</span>
              <p className="text-on-surface-variant font-label-sm text-label-sm">
                Empowering the next generation of professionals through intelligent technology.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Platform</h4>
              <ul className="space-y-4 text-on-surface-variant font-label-sm text-label-sm">
                <li><a className="hover:text-primary transition-colors" href="#">Skill Assessments</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">AI Mock Interviews</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Job Matching</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Training Modules</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4 text-on-surface-variant font-label-sm text-label-sm">
                <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Success Stories</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Partnerships</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Join Newsletter</h4>
              <p className="text-on-surface-variant font-label-sm text-label-sm mb-4">Stay updated with latest career tips.</p>
              <div className="flex gap-2">
                <input className="flex-1 bg-surface rounded-lg border-outline-variant focus:ring-secondary focus:border-secondary" placeholder="Email" type="email" />
                <button className="bg-primary text-white px-4 py-2 rounded-lg font-button text-button">Join</button>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant font-label-sm text-label-sm">
            <span>© 2024 PlaceMentor AI. All rights reserved.</span>
            <div className="flex gap-6">
              <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
