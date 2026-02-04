import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    Users,
    Building2,
    ShieldCheck,
    Plus,
    LogOut,
    Upload,
    Loader2,
    CheckCircle2,
    LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('student');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Form States
    const [studentData, setStudentData] = useState({
        studentId: '', name: '', year: '', branch: '', section: '', password: '', photo: null
    });
    const [deptData, setDeptData] = useState({ deptId: '', name: '', password: '' });
    const [guardData, setGuardData] = useState({ guardId: '', name: '', password: '' });

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
    };

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleSubmitStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData();
        Object.keys(studentData).forEach(key => {
            if (key === 'photo') formData.append('photo', studentData[key]);
            else formData.append(key, studentData[key]);
        });

        try {
            await api.post('/admin/add-student', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showSuccess('Student added successfully!');
            setStudentData({ studentId: '', name: '', year: '', branch: '', section: '', password: '', photo: null });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add student');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDept = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/admin/add-department', deptData);
            showSuccess('Department added successfully!');
            setDeptData({ deptId: '', name: '', password: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add department');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitGuard = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/admin/add-guard', guardData);
            showSuccess('Guard added successfully!');
            setGuardData({ guardId: '', name: '', password: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add guard');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'student', name: 'Add Student', icon: Users },
        { id: 'dept', name: 'Add Department', icon: Building2 },
        { id: 'guard', name: 'Add Guard', icon: ShieldCheck },
    ];

    return (
        <div className="flex min-h-screen bg-[#0c0c14] text-white">
            {/* Sidebar */}
            <aside className="w-72 glass-card m-4 mr-0 flex flex-col p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-3 mb-10 px-2">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <LayoutDashboard size={24} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Admin CMS</h2>
                </div>

                <nav className="flex-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${activeTab === tab.id
                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(79,70,229,0.1)]'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon size={20} className={activeTab === tab.id ? 'text-indigo-400' : 'text-slate-500'} />
                            {tab.name}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-8 flex items-center gap-3 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-medium"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-10">
                        <h1 className="text-4xl font-extrabold mb-3 tracking-tight">
                            {activeTab === 'student' ? 'Register Student' : activeTab === 'dept' ? 'New Department' : 'New Security Guard'}
                        </h1>
                        <div className="h-1.5 w-20 bg-indigo-600 rounded-full mb-4"></div>
                        <p className="text-slate-400 text-lg">Manage access control and authorized personnel.</p>
                    </header>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass-card p-10 border border-white/5 shadow-2xl"
                        >
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-8 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3 font-medium"
                                >
                                    <CheckCircle2 size={24} />
                                    {success}
                                </motion.div>
                            )}

                            {error && (
                                <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium">
                                    {error}
                                </div>
                            )}

                            {activeTab === 'student' && (
                                <form onSubmit={handleSubmitStudent} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Student ID</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                placeholder="e.g. 210003XXXX"
                                                value={studentData.studentId}
                                                onChange={e => setStudentData({ ...studentData, studentId: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                placeholder="John Doe"
                                                value={studentData.name}
                                                onChange={e => setStudentData({ ...studentData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Year</label>
                                            <select
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                                                value={studentData.year}
                                                onChange={e => setStudentData({ ...studentData, year: e.target.value })}
                                                required
                                            >
                                                <option value="" className="bg-[#0c0c14]">Select Year</option>
                                                <option value="1" className="bg-[#0c0c14]">1st Year</option>
                                                <option value="2" className="bg-[#0c0c14]">2nd Year</option>
                                                <option value="3" className="bg-[#0c0c14]">3rd Year</option>
                                                <option value="4" className="bg-[#0c0c14]">4th Year</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Branch</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                placeholder="CSE"
                                                value={studentData.branch}
                                                onChange={e => setStudentData({ ...studentData, branch: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Section</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                placeholder="S1"
                                                value={studentData.section}
                                                onChange={e => setStudentData({ ...studentData, section: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                                            <input
                                                type="password"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                placeholder="••••••••"
                                                value={studentData.password}
                                                onChange={e => setStudentData({ ...studentData, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 ml-1">Face Photo Recognition Upload</label>
                                        <div className="relative group border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer">
                                            <input
                                                type="file"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                onChange={e => setStudentData({ ...studentData, photo: e.target.files[0] })}
                                                accept="image/*"
                                                required
                                            />
                                            <div className="flex flex-col items-center">
                                                <div className="p-4 bg-white/5 rounded-full mb-4 group-hover:bg-indigo-500/10 transition-colors">
                                                    <Upload className="text-slate-400 group-hover:text-indigo-400" size={32} />
                                                </div>
                                                <p className="text-white font-semibold text-lg">
                                                    {studentData.photo ? studentData.photo.name : 'Select student photo'}
                                                </p>
                                                <p className="text-sm text-slate-500 mt-1">Supports JPG, PNG (Max 5MB)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-70"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Register Student</>}
                                    </button>
                                </form>
                            )}

                            {activeTab === 'dept' && (
                                <form onSubmit={handleSubmitDept} className="space-y-6 max-w-2xl mx-auto">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 ml-1">Department ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            placeholder="e.g. CSE-DEPT-01"
                                            value={deptData.deptId}
                                            onChange={e => setDeptData({ ...deptData, deptId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 ml-1">Department Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            placeholder="Computer Science"
                                            value={deptData.name}
                                            onChange={e => setDeptData({ ...deptData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 ml-1">Login Password</label>
                                        <input
                                            type="password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            placeholder="••••••••"
                                            value={deptData.password}
                                            onChange={e => setDeptData({ ...deptData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-70 mt-4"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Create Department</>}
                                    </button>
                                </form>
                            )}

                            {activeTab === 'guard' && (
                                <form onSubmit={handleSubmitGuard} className="space-y-6 max-w-2xl mx-auto">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 ml-1">Guard ID</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            placeholder="e.g. GUARD-NORTH-01"
                                            value={guardData.guardId}
                                            onChange={e => setGuardData({ ...guardData, guardId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 ml-1">Guard Name</label>
                                        <input
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            placeholder="Security Officer"
                                            value={guardData.name}
                                            onChange={e => setGuardData({ ...guardData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 ml-1">Login Password</label>
                                        <input
                                            type="password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                            placeholder="••••••••"
                                            value={guardData.password}
                                            onChange={e => setGuardData({ ...guardData, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-70 mt-4"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> Register Guard</>}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
