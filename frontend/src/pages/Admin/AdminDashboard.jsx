import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
    Users,
    Building2,
    ShieldCheck,
    Plus,
    LogOut,
    Upload,
    Lock,
    User,
    Shield,
    GraduationCap,
    Loader2,
    ChevronRight,
    Activity,
    Skull,
    Zap,
    CheckCircle2,
    Search,
    Pencil,
    Trash2,
    ChevronLeft,
    RefreshCcw,
    AlertTriangle,
    LayoutGrid,
    UserPlus,
    Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [guards, setGuards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [refreshingId, setRefreshingId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();


    // Form States
    const [studentData, setStudentData] = useState({ studentId: '', name: '', branch: '', year: '', section: '', password: '', photo: null });
    const [deptData, setDeptData] = useState({ deptId: '', name: '', password: '', department: '' });
    const [guardData, setGuardData] = useState({ guardId: '', name: '', password: '' });

    // Edit States
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [editingDeptId, setEditingDeptId] = useState(null);
    const [editingGuardId, setEditingGuardId] = useState(null);

    useEffect(() => {
        fetchStudents();
        fetchDepartments();
        fetchGuards();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/admin/students');
            setStudents(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/admin/departments');
            setDepartments(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchGuards = async () => {
        try {
            const res = await api.get('/admin/guards');
            setGuards(res.data);
        } catch (err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/');
    };

    const showSuccess = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleDelete = async (role, id) => {
        if (window.confirm(`Are you sure you want to delete this ${role === 'dept' ? 'HOD' : role}?`)) {
            try {
                const endpoint = role === 'dept' ? `/admin/department/${id}` : `/admin/${role}/${id}`;
                await api.delete(endpoint);
                showSuccess(`${role === 'dept' ? 'HOD' : role.charAt(0).toUpperCase() + role.slice(1)} removed from system.`);
                if (role === 'student') fetchStudents();
                else if (role === 'dept') fetchDepartments();
                else fetchGuards();
            } catch (err) {
                console.error("Delete failed:", err);
                alert(err.response?.data?.message || 'Deletion failed');
            }
        }
    };


    const handleRefreshEmbedding = async (studentId) => {
        setRefreshingId(studentId);
        console.log(`🔄 Triggering AI Re-analysis for student: ${studentId}`);
        try {
            const res = await api.post(`/admin/student/${studentId}/refresh-embedding`);
            console.log("✅ AI Analysis response:", res.data);
            showSuccess('AI Face Data recalibrated successfully.');
            await fetchStudents(); // Ensure we wait for the refetch
        } catch (err) {
            console.error("❌ AI Refresh failed:", err);
            alert(err.response?.data?.message || 'Failed to refresh AI data');
        } finally {
            setRefreshingId(null);
        }
    };

    const startEditStudent = (student) => {
        setEditingStudentId(student._id);
        setStudentData({
            studentId: student.studentId,
            name: student.name,
            branch: student.branch,
            year: student.year,
            section: student.section,
            password: '',
            photo: null
        });
        setActiveTab('add-student');
    };

    const startEditDept = (dept) => {
        setEditingDeptId(dept._id);
        setDeptData({ deptId: dept.deptId, name: dept.name, password: '', department: dept.department || '' });
        setActiveTab('add-dept');
    };

    const startEditGuard = (guard) => {
        setEditingGuardId(guard._id);
        setGuardData({ guardId: guard.guardId, name: guard.name, password: '' });
        setActiveTab('add-guard');
    };

    const handleSubmitStudent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData();
        Object.keys(studentData).forEach(key => {
            if (studentData[key]) formData.append(key, studentData[key]);
        });

        try {
            if (editingStudentId) {
                await api.put(`/admin/student/${editingStudentId}`, formData);
                showSuccess('Student profile updated.');
            } else {
                await api.post('/admin/add-student', formData);
                showSuccess('New student added.');
            }
            setStudentData({ studentId: '', name: '', branch: '', year: '', section: '', password: '', photo: null });
            setEditingStudentId(null);
            fetchStudents();
            setActiveTab('view-students');
        } catch (err) { alert(err.response?.data?.message || 'Registration failed.'); }
        finally { setSubmitting(false); }
    };

    const handleSubmitDept = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingDeptId) {
                await api.put(`/admin/department/${editingDeptId}`, deptData);
                showSuccess('HOD record updated.');
            } else {
                await api.post('/admin/add-department', deptData);
                showSuccess('New HOD added successfully.');
            }
            setDeptData({ deptId: '', name: '', password: '', department: '' });
            setEditingDeptId(null);
            fetchDepartments();
            setActiveTab('view-depts');
        } catch (err) { alert('Failed to add HOD.'); }
        finally { setSubmitting(false); }
    };

    const handleSubmitGuard = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingGuardId) {
                await api.put(`/admin/guard/${editingGuardId}`, guardData);
                showSuccess('Guard record updated.');
            } else {
                await api.post('/admin/add-guard', guardData);
                showSuccess('New guard added successfully.');
            }
            setGuardData({ guardId: '', name: '', password: '' });
            setEditingGuardId(null);
            fetchGuards();
            setActiveTab('view-guards');
        } catch (err) { alert('Failed to add guard.'); }
        finally { setSubmitting(false); }
    };

    const tabs = [
        { id: 'overview', name: 'Dashboard Overview', icon: LayoutGrid },
        { id: 'view-students', name: 'Student List', icon: Users },
        { id: 'add-student', name: editingStudentId ? 'Edit Student' : 'Add Student', icon: UserPlus },
        { id: 'view-depts', name: 'HOD List', icon: Building2 },
        { id: 'add-dept', name: editingDeptId ? 'Edit HOD' : 'Add HOD', icon: Building },
        { id: 'view-guards', name: 'Guard List', icon: ShieldCheck },
        { id: 'add-guard', name: editingGuardId ? 'Edit Guard' : 'Add Guard', icon: Shield },
    ];

    const OverviewCard = ({ title, count, icon: Icon, color }) => {
        const themes = {
            indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500 shadow-indigo-500/5',
            pink: 'bg-pink-500/10 border-pink-500/20 text-pink-500 shadow-pink-500/5',
            emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-emerald-500/5',
            cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 shadow-cyan-500/5'
        };

        return (
            <motion.div
                whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.1)' }}
                className={`p-10 rounded-[2.5rem] border ${themes[color]} group relative overflow-hidden transition-all`}
            >
                <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transform scale-[3] transition-all duration-500">
                    <Icon size={40} />
                </div>
                <div className="relative z-10 flex flex-col gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 leading-none italic">// {title}</span>
                    <span className="text-6xl font-black tracking-tighter leading-none italic">{count}</span>
                    <div className="flex items-center gap-2 mt-2">
                        <Activity size={12} className="animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Database Connection Active</span>
                    </div>
                </div>
            </motion.div>
        );
    };

    const TableHeader = ({ title, children, icon: Icon }) => (
        <div className="glass-morphism rounded-[2.5rem] border-white/5 overflow-hidden">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 neon-bg-indigo rounded-xl flex items-center justify-center">
                        <Icon size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black italic tracking-tighter uppercase">{title}</h2>
                        <p className="text-[9px] font-black text-slate-600 tracking-[0.3em] uppercase mt-1 italic">// System Log: v2.4.0</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input
                            placeholder="SEARCH..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all placeholder:text-slate-800"
                        />
                    </div>
                </div>

            </div>
            <div className="p-4 overflow-x-auto">
                {children}
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#030305] text-white selection:bg-indigo-500/30">
            {/* Sidebar HUD */}
            <aside className="w-80 glass-morphism m-6 mr-0 flex flex-col p-8 rounded-[2.5rem] border-white/5 sticky top-6 h-[calc(100vh-3rem)] overflow-y-auto z-50">
                <div className="mb-12 px-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 neon-bg-emerald rounded-2xl flex items-center justify-center">
                            <Skull size={24} className="text-black" />
                        </div>
                        <div>
                            <span className="text-xl font-black tracking-tighter uppercase italic leading-none">Root.Access</span>
                            <p className="text-[9px] font-black text-emerald-500/60 tracking-[0.4em] uppercase mt-1 italic animate-pulse">Alpha Privilege</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest ${activeTab === tab.id
                                ? 'neon-bg-indigo text-white shadow-xl translate-x-1'
                                : 'text-slate-500 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.name}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-8 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all font-black text-[10px] uppercase tracking-widest"
                    >
                        <LogOut size={18} />
                        Terminate.Session
                    </button>
                </div>
            </aside>

            {/* Main HUD Module */}
            <main className="flex-1 p-10 overflow-y-auto relative">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <header className="mb-12 relative flex justify-between items-end">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                <Zap size={14} className="text-indigo-400 fill-indigo-400" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Admin Section</span>
                            </div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                                {tabs.find(t => t.id === activeTab)?.name}
                            </h1>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700">Protocol // {new Date().toLocaleDateString()}</p>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 mt-1">Status // Core.Stable</p>
                        </div>
                    </header>

                    {/* Notifications */}
                    <AnimatePresence>
                        {successMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, x: '-50%' }}
                                animate={{ opacity: 1, y: 0, x: '-50%' }}
                                exit={{ opacity: 0, y: -20, x: '-50%' }}
                                className="fixed top-12 left-1/2 z-50 px-8 py-4 bg-emerald-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-4"
                            >
                                <CheckCircle2 size={18} />
                                {successMessage}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Dynamic Content */}
                    <div className="relative">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                                <OverviewCard title="Students" count={students.length} icon={Users} color="indigo" />
                                <OverviewCard title="HODs" count={departments.length} icon={Building2} color="pink" />
                                <OverviewCard title="Guards" count={guards.length} icon={ShieldCheck} color="emerald" />
                                <OverviewCard title="Total Users" count={students.length + departments.length + guards.length} icon={Activity} color="cyan" />
                            </div>
                        )}

                        {activeTab === 'view-students' && (
                            <TableHeader title="Entity Records" icon={Users}>
                                <table className="w-full text-left border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-6">
                                            <th className="pb-4 pl-6">Student</th>
                                            <th className="pb-4">Branch</th>
                                            <th className="pb-4">Year/Sec</th>
                                            <th className="pb-4">AI Status</th>
                                            <th className="pb-4 pr-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="space-y-4">
                                        {students.filter(s =>
                                            s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            s.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            s.branch?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map((s, idx) => (


                                            <motion.tr
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={s._id}
                                                className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-3xl transition-all group"
                                            >
                                                <td className="py-6 px-6 first:rounded-l-[2rem]">
                                                    <div className="flex items-center gap-4">
                                                        <img src={s.imageUrl} className="w-14 h-14 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10" alt="" />
                                                        <div>
                                                            <div className="text-sm font-black italic tracking-tight">{s.name}</div>
                                                            <div className="text-[10px] font-bold text-indigo-400 tracking-widest mt-0.5">{s.studentId}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="text-xs font-black uppercase tracking-widest text-slate-400">{s.branch}</td>
                                                <td className="text-xs font-black uppercase tracking-widest text-slate-400">{s.year} - {s.section}</td>
                                                <td className="py-6">
                                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${(s.embedding && Array.isArray(s.embedding) && s.embedding.length > 0) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                                        {(s.embedding && Array.isArray(s.embedding) && s.embedding.length > 0) ? (
                                                            <><CheckCircle2 size={10} /> Face Ready</>
                                                        ) : (
                                                            <><AlertTriangle size={10} /> Missing Data</>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-6 px-6 last:rounded-r-[2rem] text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => handleRefreshEmbedding(s._id)}
                                                            disabled={refreshingId === s._id}
                                                            title="Refresh AI Face Data"
                                                            className={`p-3 rounded-xl transition-all ${refreshingId === s._id ? 'bg-white/5 text-slate-600' : 'bg-white/5 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400'}`}
                                                        >
                                                            {refreshingId === s._id ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                                                        </button>
                                                        <button onClick={() => startEditStudent(s)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><Pencil size={18} /></button>
                                                        <button onClick={() => handleDelete('student', s._id)} className="p-3 bg-white/5 hover:bg-rose-500/10 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableHeader>
                        )}

                        {activeTab === 'add-student' && (
                            <div className="glass-morphism rounded-[2.5rem] border-white/5 p-12 max-w-4xl mx-auto relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[100px] -z-10" />

                                <div className="flex items-center justify-between mb-12">
                                    <h3 className="text-2xl font-black italic tracking-tighter lg:text-3xl uppercase">
                                        {editingStudentId ? 'Edit Student Details' : 'Add New Student'}
                                    </h3>
                                    {editingStudentId && (
                                        <button
                                            onClick={() => { setEditingStudentId(null); setStudentData({ studentId: '', name: '', branch: '', year: '', section: '', password: '', photo: null }); setActiveTab('view-students'); }}
                                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline"
                                        >
                                            <ChevronLeft size={14} /> Cancel
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSubmitStudent} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Student ID</label>
                                            <input
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-800"
                                                placeholder="ENT_ROLL_ID"
                                                value={studentData.studentId}
                                                onChange={e => setStudentData({ ...studentData, studentId: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Student Name</label>
                                            <input
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-800"
                                                placeholder="FULL NAME"
                                                value={studentData.name}
                                                onChange={e => setStudentData({ ...studentData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Branch</label>
                                            <input
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-800"
                                                placeholder="E.G. CSE, ECE"
                                                value={studentData.branch}
                                                onChange={e => setStudentData({ ...studentData, branch: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Year</label>
                                                <input
                                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-800"
                                                    placeholder="YEAR"
                                                    value={studentData.year}
                                                    onChange={e => setStudentData({ ...studentData, year: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Section</label>
                                                <input
                                                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-800"
                                                    placeholder="SECTION"
                                                    value={studentData.section}
                                                    onChange={e => setStudentData({ ...studentData, section: e.target.value })}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Access Key</label>
                                            <input
                                                type="password"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-800"
                                                placeholder="••••••••"
                                                value={studentData.password}
                                                onChange={e => setStudentData({ ...studentData, password: e.target.value })}
                                                required={!editingStudentId}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Student Photo</label>
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    id="img-upload"
                                                    onChange={e => setStudentData({ ...studentData, photo: e.target.files[0] })}
                                                />
                                                <label
                                                    htmlFor="img-upload"
                                                    className="flex items-center gap-4 w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] cursor-pointer hover:bg-white/5 transition-all text-slate-500"
                                                >
                                                    <Upload size={14} /> {studentData.photo ? studentData.photo.name : 'UPLOAD STUDENT PHOTO'}
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-5 neon-bg-indigo text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] italic flex items-center justify-center gap-4 shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/30 transition-all disabled:opacity-50 mt-8"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : editingStudentId ? 'Update Student' : 'Add Student'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'view-depts' && (
                            <TableHeader title="HOD Records" icon={Building2}>
                                <table className="w-full text-left border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-6">
                                            <th className="pb-4 pl-6">HOD Name</th>
                                            <th className="pb-4">Department ID</th>
                                            <th className="pb-4">Dept Name</th>
                                            <th className="pb-4">Access Level</th>
                                            <th className="pb-4 pr-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="space-y-4">
                                        {departments.filter(d =>
                                            d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            d.deptId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            d.department?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map((d, idx) => (


                                            <motion.tr
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={d._id}
                                                className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-3xl transition-all group"
                                            >
                                                <td className="py-6 px-6 first:rounded-l-[2rem] font-black uppercase italic text-sm tracking-tight">{d.name}</td>
                                                <td className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{d.deptId}</td>
                                                <td className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.department}</td>
                                                <td className="text-xs font-black uppercase tracking-widest text-slate-600 text-[8px] italic tracking-[0.2em]">// [ Level.02 ]</td>
                                                <td className="py-6 px-6 last:rounded-r-[2rem] text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button onClick={() => startEditDept(d)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><Pencil size={18} /></button>
                                                        <button onClick={() => handleDelete('dept', d._id)} className="p-3 bg-white/5 hover:bg-rose-500/10 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableHeader>
                        )}

                        {activeTab === 'add-dept' && (
                            <div className="glass-morphism rounded-[2.5rem] border-white/5 p-12 max-w-2xl mx-auto relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-pink-600/5 blur-[100px] -z-10" />
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-12">
                                    {editingDeptId ? 'Edit HOD Account' : 'Add New HOD'}
                                </h3>
                                <form onSubmit={handleSubmitDept} className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Department ID</label>
                                        <input
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-slate-800"
                                            placeholder="DEP_DESIGNATION_ID"
                                            value={deptData.deptId}
                                            onChange={e => setDeptData({ ...deptData, deptId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// HOD Name</label>
                                        <input
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-slate-800"
                                            placeholder="FULL NAME"
                                            value={deptData.name}
                                            onChange={e => setDeptData({ ...deptData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Department (Branch)</label>
                                        <input
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-slate-800"
                                            placeholder="E.G. CSE, ECE"
                                            value={deptData.department}
                                            onChange={e => setDeptData({ ...deptData, department: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Password</label>
                                        <input
                                            type="password"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-pink-500/20 transition-all placeholder:text-slate-800"
                                            placeholder="••••••••"
                                            value={deptData.password}
                                            onChange={e => setDeptData({ ...deptData, password: e.target.value })}
                                            required={!editingDeptId}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-5 neon-bg-pink text-white rounded-3xl font-black text-xs uppercase tracking-[0.4em] italic shadow-xl shadow-pink-500/10 hover:shadow-pink-500/30 transition-all disabled:opacity-50 mt-8"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : editingDeptId ? 'Update HOD' : 'Add HOD'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'view-guards' && (
                            <TableHeader title="Guard Records" icon={ShieldCheck}>
                                <table className="w-full text-left border-separate border-spacing-y-4">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-6">
                                            <th className="pb-4 pl-6">Guard Name</th>
                                            <th className="pb-4">Guard ID</th>
                                            <th className="pb-4">Status</th>
                                            <th className="pb-4 pr-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="space-y-4">
                                        {guards.filter(g =>
                                            g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            g.guardId?.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map((g, idx) => (


                                            <motion.tr
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                key={g._id}
                                                className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-3xl transition-all group"
                                            >
                                                <td className="py-6 px-6 first:rounded-l-[2rem] font-black uppercase italic text-sm tracking-tight text-white">{g.name}</td>
                                                <td className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{g.guardId}</td>
                                                <td className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500/60 italic animate-pulse">// SURVEILLANCE_ACTIVE</td>
                                                <td className="py-6 px-6 last:rounded-r-[2rem] text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                        <button onClick={() => startEditGuard(g)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"><Pencil size={18} /></button>
                                                        <button onClick={() => handleDelete('guard', g._id)} className="p-3 bg-white/5 hover:bg-rose-500/10 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </TableHeader>
                        )}

                        {activeTab === 'add-guard' && (
                            <div className="glass-morphism rounded-[2.5rem] border-white/5 p-12 max-w-2xl mx-auto relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/5 blur-[100px] -z-10" />
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-12">
                                    {editingGuardId ? 'Edit Guard Account' : 'Add New Guard'}
                                </h3>
                                <form onSubmit={handleSubmitGuard} className="space-y-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Guard ID</label>
                                        <input
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-800"
                                            placeholder="SNT_BADGE_ID"
                                            value={guardData.guardId}
                                            onChange={e => setGuardData({ ...guardData, guardId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Guard Name</label>
                                        <input
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-800"
                                            placeholder="FULL NAME"
                                            value={guardData.name}
                                            onChange={e => setGuardData({ ...guardData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 italic">// Password</label>
                                        <input
                                            type="password"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black tracking-[0.2em] outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-800"
                                            placeholder="••••••••"
                                            value={guardData.password}
                                            onChange={e => setGuardData({ ...guardData, password: e.target.value })}
                                            required={!editingGuardId}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-5 neon-bg-emerald text-black rounded-3xl font-black text-xs uppercase tracking-[0.4em] italic shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 mt-8"
                                    >
                                        {submitting ? <Loader2 className="animate-spin" /> : editingGuardId ? 'Update Guard' : 'Add Guard'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
