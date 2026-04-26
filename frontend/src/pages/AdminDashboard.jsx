import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/students?per_page=50'),
      api.get('/admin/interviews')
    ]).then(([dashRes, studRes, intRes]) => {
      setData(dashRes.data);
      setStudents(studRes.data.students);
      setInterviews(intRes.data.interviews);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Search students
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'students') {
        api.get(`/admin/students?search=${encodeURIComponent(search)}&per_page=50`)
          .then(res => setStudents(res.data.students))
          .catch(() => {});
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search, activeTab]);

  // Filter interviews
  useEffect(() => {
    if (activeTab === 'interviews') {
      const url = statusFilter ? `/admin/interviews?status=${statusFilter}` : '/admin/interviews';
      api.get(url).then(res => setInterviews(res.data.interviews)).catch(() => {});
    }
  }, [statusFilter, activeTab]);

  // Load student detail
  const viewStudent = async (studentId) => {
    try {
      const res = await api.get(`/admin/student/${studentId}`);
      setStudentDetail(res.data);
      setSelectedStudent(studentId);
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <span className="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
    </div>
  );

  const stats = data?.stats || {};

  return (
    <div className="bg-background min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-container fixed h-screen flex flex-col z-20 shadow-lg">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-white text-xl font-bold">PlaceMentor AI</h1>
          <p className="text-white/50 text-xs mt-1">Admin Panel</p>
        </div>
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
            <div className="w-10 h-10 bg-secondary-container rounded-full flex items-center justify-center text-white font-bold">A</div>
            <div>
              <p className="text-white font-medium text-sm">{user?.name || 'Admin'}</p>
              <p className="text-white/60 text-xs">Administrator</p>
            </div>
          </div>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {[
            { id: 'overview', icon: 'space_dashboard', label: 'Overview' },
            { id: 'students', icon: 'people', label: 'Students' },
            { id: 'interviews', icon: 'videocam', label: 'Interviews' },
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setSelectedStudent(null); }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-secondary-container text-white shadow-md' : 'text-white/70 hover:bg-white/10'}`}>
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 transition-all">
            <span className="material-symbols-outlined text-[22px]">logout</span>Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-grow p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-on-surface capitalize">{activeTab === 'overview' ? 'Admin Dashboard' : activeTab}</h2>
            <p className="text-on-surface-variant mt-1">
              {activeTab === 'overview' && 'Monitor placement performance across all students.'}
              {activeTab === 'students' && `${students.length} students registered on the platform.`}
              {activeTab === 'interviews' && `${interviews.length} interviews recorded.`}
            </p>
          </div>
        </div>

        {/* ========== OVERVIEW TAB ========== */}
        {activeTab === 'overview' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Students', value: stats.total_students || 0, icon: 'people', color: 'bg-primary-container' },
                { label: 'Total Interviews', value: stats.total_interviews || 0, icon: 'videocam', color: 'bg-secondary-container' },
                { label: 'Completed', value: stats.completed_interviews || 0, icon: 'check_circle', color: 'bg-tertiary-container' },
                { label: 'Aptitude Tests', value: stats.total_aptitude_tests || 0, icon: 'quiz', color: 'bg-surface-variant' },
              ].map((card, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm hover-lift">
                  <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4`}>
                    <span className="material-symbols-outlined text-white">{card.icon}</span>
                  </div>
                  <p className="text-3xl font-bold text-on-surface">{card.value}</p>
                  <p className="text-sm text-on-surface-variant mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Students */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-lg text-on-surface">Recent Students</h3>
                  <span onClick={() => setActiveTab('students')} className="text-sm text-secondary font-medium cursor-pointer hover:underline">View All</span>
                </div>
                <div className="space-y-3">
                  {(data?.recent_students || []).slice(0, 5).map((s, i) => (
                    <div key={i} onClick={() => { setActiveTab('students'); viewStudent(s.id); }}
                      className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-container rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {s.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-on-surface">{s.name}</p>
                          <p className="text-xs text-on-surface-variant">{s.email}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-primary-container/10 rounded-md text-xs font-medium">{s.domain}</span>
                    </div>
                  ))}
                  {(data?.recent_students || []).length === 0 && (
                    <p className="text-center py-8 text-on-surface-variant text-sm">No students registered yet</p>
                  )}
                </div>
              </div>

              {/* Recent Interviews */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-lg text-on-surface">Recent Interviews</h3>
                  <span onClick={() => setActiveTab('interviews')} className="text-sm text-secondary font-medium cursor-pointer hover:underline">View All</span>
                </div>
                <div className="space-y-3">
                  {interviews.slice(0, 5).map((iv, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          iv.status === 'completed' ? 'bg-green-100' : iv.status === 'terminated' ? 'bg-red-100' : 'bg-orange-100'
                        }`}>
                          <span className={`material-symbols-outlined text-[18px] ${
                            iv.status === 'completed' ? 'text-green-600' : iv.status === 'terminated' ? 'text-red-600' : 'text-orange-600'
                          }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                            {iv.status === 'completed' ? 'check_circle' : iv.status === 'terminated' ? 'cancel' : 'pending'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-on-surface">{iv.student_name}</p>
                          <p className="text-xs text-on-surface-variant">{iv.domain} &bull; {iv.difficulty}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${iv.total_score >= 70 ? 'text-green-600' : iv.total_score >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                        {Math.round(iv.total_score)}%
                      </span>
                    </div>
                  ))}
                  {interviews.length === 0 && (
                    <p className="text-center py-8 text-on-surface-variant text-sm">No interviews conducted yet</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ========== STUDENTS TAB ========== */}
        {activeTab === 'students' && !selectedStudent && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-on-surface">Student Directory</h3>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..."
                  className="pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary-container/20 focus:border-primary-container transition-all w-72" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Branch</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Domain</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Joined</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-container rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {s.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-on-surface">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant">{s.email}</td>
                      <td className="py-3 px-4"><span className="px-2 py-1 bg-surface-container rounded-md text-xs font-medium">{s.branch}</span></td>
                      <td className="py-3 px-4"><span className="px-2 py-1 bg-primary-container/10 rounded-md text-xs font-medium">{s.domain}</span></td>
                      <td className="py-3 px-4 text-on-surface-variant text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => viewStudent(s.id)}
                          className="px-3 py-1.5 bg-primary-container text-white rounded-lg text-xs font-medium hover:brightness-110 transition-all">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {students.length === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center text-on-surface-variant">No students found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== STUDENT DETAIL VIEW ========== */}
        {activeTab === 'students' && selectedStudent && studentDetail && (
          <div>
            <button onClick={() => { setSelectedStudent(null); setStudentDetail(null); }}
              className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface mb-6 transition-colors">
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>Back to Student List
            </button>

            {/* Student Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 mb-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {studentDetail.student.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-surface">{studentDetail.student.name}</h3>
                  <p className="text-on-surface-variant text-sm">{studentDetail.student.email}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="px-2 py-1 bg-surface-container rounded-md text-xs font-medium">{studentDetail.student.branch}</span>
                    <span className="px-2 py-1 bg-primary-container/10 rounded-md text-xs font-medium">{studentDetail.student.domain}</span>
                    <span className="px-2 py-1 bg-surface-container rounded-md text-xs font-medium">Year {studentDetail.student.year_of_study}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Interview History */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
                <h4 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">videocam</span>
                  Interviews ({studentDetail.interviews.length})
                </h4>
                {studentDetail.interviews.length === 0 ? (
                  <p className="text-center py-8 text-on-surface-variant text-sm">No interviews taken</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {studentDetail.interviews.map((iv, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                        <div>
                          <p className="font-medium text-sm text-on-surface">{iv.domain} &bull; {iv.difficulty}</p>
                          <p className="text-xs text-on-surface-variant mt-1">
                            {iv.answered_count}/{iv.questions_count} answered &bull; {new Date(iv.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm ${iv.total_score >= 70 ? 'text-green-600' : iv.total_score >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                            {Math.round(iv.total_score)}%
                          </p>
                          <p className={`text-xs font-medium capitalize ${
                            iv.status === 'completed' ? 'text-green-600' : iv.status === 'terminated' ? 'text-red-600' : 'text-orange-600'
                          }`}>{iv.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Aptitude History */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
                <h4 className="font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">quiz</span>
                  Aptitude Tests ({studentDetail.aptitude_results.length})
                </h4>
                {studentDetail.aptitude_results.length === 0 ? (
                  <p className="text-center py-8 text-on-surface-variant text-sm">No aptitude tests taken</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {studentDetail.aptitude_results.map((apt, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                        <div>
                          <p className="font-medium text-sm text-on-surface">{apt.domain}</p>
                          <p className="text-xs text-on-surface-variant mt-1">
                            {apt.correct_answers}/{apt.total_questions} correct &bull; {new Date(apt.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`font-bold text-sm ${apt.score_percentage >= 70 ? 'text-green-600' : apt.score_percentage >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                          {apt.score_percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========== INTERVIEWS TAB ========== */}
        {activeTab === 'interviews' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-on-surface">All Interviews</h3>
              <div className="flex gap-2">
                {['', 'completed', 'in_progress', 'terminated'].map(f => (
                  <button key={f} onClick={() => setStatusFilter(f)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                      statusFilter === f ? 'bg-primary-container text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}>
                    {f || 'All'}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/20">
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Student</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Domain</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Difficulty</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Progress</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Score</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Tab Switches</th>
                    <th className="text-left py-3 px-4 font-medium text-on-surface-variant">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {interviews.map((iv, i) => (
                    <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-on-surface">{iv.student_name}</p>
                          <p className="text-xs text-on-surface-variant">{iv.student_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4"><span className="px-2 py-1 bg-primary-container/10 rounded-md text-xs font-medium">{iv.domain}</span></td>
                      <td className="py-3 px-4 capitalize text-on-surface-variant">{iv.difficulty}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-secondary-container rounded-full" style={{ width: `${(iv.answered_count / Math.max(iv.questions_count, 1)) * 100}%` }}></div>
                          </div>
                          <span className="text-xs text-on-surface-variant">{iv.answered_count}/{iv.questions_count}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${iv.total_score >= 70 ? 'text-green-600' : iv.total_score >= 50 ? 'text-orange-600' : 'text-red-600'}`}>
                          {Math.round(iv.total_score)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          iv.status === 'completed' ? 'bg-green-100 text-green-700' :
                          iv.status === 'terminated' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>{iv.status}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-medium ${iv.tab_switches >= 2 ? 'text-red-600' : iv.tab_switches >= 1 ? 'text-orange-600' : 'text-on-surface-variant'}`}>
                          {iv.tab_switches}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-on-surface-variant text-xs">{new Date(iv.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {interviews.length === 0 && (
                    <tr><td colSpan={8} className="py-10 text-center text-on-surface-variant">No interviews found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
