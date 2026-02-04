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
    Loader2,
    CheckCircle2,
    LayoutDashboard,
    Search,
    RefreshCw,
    UserPlus,
    Building,
    Shield,
    Pencil,
    Trash2,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Data States
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [guards, setGuards] = useState([]);

    // Form States
    const [studentData, setStudentData] = useState({
        studentId: '', name: '', year: '', branch: '', section: '', password: '', photo: null
    });
    const [deptData, setDeptData] = useState({ deptId: '', name: '', password: '' });
    const [guardData, setGuardData] = useState({ guardId: '', name: '', password: '' });

    const [searchTerm, setSearchTerm] = useState('');

    // Edit States
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        if (activeTab === 'view-students') fetchStudents();
        if (activeTab === 'view-depts') fetchDepartments();
        if (activeTab === 'view-guards') fetchGuards();
        if (activeTab === 'overview') {
            fetchStudents();
            fetchDepartments();
            fetchGuards();
        }
        // Reset editing state when switching tabs
        if (!activeTab.includes('add')) {
            setIsEditing(false);
            setEditId(null);
        }
    }, [activeTab]);

    const fetchStudents = async () => {
        setFetching(true);
        try {
            const res = await api.get('/admin/students');
            setStudents(res.data);
        } catch (err) {
            setError('Failed to fetch students');
        } finally {
            setFetching(false);
        }
    };

    const fetchDepartments = async () => {
        setFetching(true);
        try {
            const res = await api.get('/admin/departments');
            setDepartments(res.data);
        } catch (err) {
            setError('Failed to fetch departments');
        } finally {
            setFetching(false);
        }
    };

    const fetchGuards = async () => {
        setFetching(true);
        try {
            const res = await api.get('/admin/guards');
            setGuards(res.data);
        } catch (err) {
            setError('Failed to fetch guards');
        } finally {
            setFetching(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/admin/login');
    };

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    // Generic Delete Handler
    const handleDelete = async (role, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
        setFetching(true);
        try {
            await api.delete(`/admin/${role}/${id}`);
            showSuccess(`${role.charAt(0).toUpperCase() + role.slice(1)} deleted successfully!`);
            if (role === 'student') fetchStudents();
            if (role === 'department') fetchDepartments();
            if (role === 'guard') fetchGuards();
        } catch (err) {
            setError(`Failed to delete ${role}`);
        } finally {
            setFetching(false);
        }
    };

    // Edit Initiation Handlers
    const startEditStudent = (student) => {
        setStudentData({
            studentId: student.studentId,
            name: student.name,
            year: student.year,
            branch: student.branch,
            section: student.section,
            password: '', // Don't show old hash
            photo: null
        });
        setIsEditing(true);
        setEditId(student._id);
        setActiveTab('add-student');
    };

    const startEditDept = (dept) => {
        setDeptData({
            deptId: dept.deptId,
            name: dept.name,
            password: ''
        });
        setIsEditing(true);
        setEditId(dept._id);
        setActiveTab('add-dept');
    };

    const startEditGuard = (guard) => {
        setGuardData({
            guardId: guard.guardId,
            name: guard.name,
            password: ''
        });
        setIsEditing(true);
        setEditId(guard._id);
        setActiveTab('add-guard');
    };

    const handleSubmitStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const formData = new FormData();
        Object.keys(studentData).forEach(key => {
            if (key === 'photo') {
                if (studentData[key]) formData.append('photo', studentData[key]);
            } else if (key === 'password') {
                if (studentData[key]) formData.append(key, studentData[key]);
            } else {
                formData.append(key, studentData[key]);
            }
        });

        try {
            if (isEditing) {
                await api.put(`/admin/student/${editId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showSuccess('Student updated successfully!');
            } else {
                await api.post('/admin/add-student', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                showSuccess('Student added successfully!');
            }
            setStudentData({ studentId: '', name: '', year: '', branch: '', section: '', password: '', photo: null });
            setIsEditing(false);
            setEditId(null);
            fetchStudents(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} student`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitDept = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isEditing) {
                await api.put(`/admin/department/${editId}`, deptData);
                showSuccess('Department updated successfully!');
            } else {
                await api.post('/admin/add-department', deptData);
                showSuccess('Department added successfully!');
            }
            setDeptData({ deptId: '', name: '', password: '' });
            setIsEditing(false);
            setEditId(null);
            fetchDepartments(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} department`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitGuard = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isEditing) {
                await api.put(`/admin/guard/${editId}`, guardData);
                showSuccess('Guard updated successfully!');
            } else {
                await api.post('/admin/add-guard', guardData);
                showSuccess('Guard added successfully!');
            }
            setGuardData({ guardId: '', name: '', password: '' });
            setIsEditing(false);
            setEditId(null);
            fetchGuards(); // Refresh list
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} guard`);
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'overview', name: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'view-students', name: 'All Students', icon: Users },
        { id: 'view-depts', name: 'Departments', icon: Building2 },
        { id: 'view-guards', name: 'Security Guards', icon: ShieldCheck },
        { id: 'add-student', name: 'Register Student', icon: UserPlus },
        { id: 'add-dept', name: 'Add Department', icon: Building },
        { id: 'add-guard', name: 'Add Guard', icon: Shield },
    ];

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredDepts = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.deptId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredGuards = guards.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.guardId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const OverviewCard = ({ title, count, icon: Icon, color }) => (
        <motion.div
            whileHover={{ y: -5 }}
            className="glass-card p-6 border border-white/5 flex items-center justify-between"
        >
            <div>
                <p className="text-slate-400 font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold">{count}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${color}`}>
                <Icon size={28} className="text-white" />
            </div>
        </motion.div>
    );

    const TableHeader = ({ title, children }) => (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-indigo-500/50 w-64"
                    />
                </div>
                <button
                    onClick={() => {
                        if (activeTab.includes('student')) fetchStudents();
                        if (activeTab.includes('dept')) fetchDepartments();
                        if (activeTab.includes('guard')) fetchGuards();
                    }}
                    className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                    <RefreshCw size={20} className={fetching ? 'animate-spin' : ''} />
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-[#0c0c14] text-white">
            {/* Sidebar */}
            <aside className="w-72 glass-card m-4 mr-0 flex flex-col p-6 rounded-3xl border border-white/5 sticky top-4 h-[calc(100vh-2rem)] overflow-y-auto">
                <div className="flex items-center gap-3 mb-10 px-2 pt-2">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-600/20">
                        <LayoutDashboard size={24} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Admin CMS</h2>
                </div>

                <nav className="flex-1 space-y-1.5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Main</p>
                    {tabs.slice(0, 4).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === tab.id
                                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.name}
                        </button>
                    ))}

                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">Management</p>
                    {tabs.slice(4).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === tab.id
                                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.name}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    className="mt-8 flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-medium text-sm"
                >
                    <LogOut size={18} />
                    Logout Account
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-8">
                        <div className="flex items-center gap-4 mb-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-400 text-xs font-bold tracking-wider uppercase">Administrative Portal</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            {tabs.find(t => t.id === activeTab)?.name}
                        </h1>
                    </header>

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

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <OverviewCard title="Total Students" count={students.length} icon={Users} color="bg-blue-600" />
                                        <OverviewCard title="Departments" count={departments.length} icon={Building2} color="bg-purple-600" />
                                        <OverviewCard title="Security Guards" count={guards.length} icon={ShieldCheck} color="bg-indigo-600" />
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div className="glass-card p-6 border border-white/5">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold">Recent Students</h3>
                                                <button onClick={() => setActiveTab('view-students')} className="text-indigo-400 text-sm hover:underline">View All</button>
                                            </div>
                                            <div className="space-y-4">
                                                {students.slice(0, 5).map(student => (
                                                    <div key={student._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-indigo-600/20 overflow-hidden border border-white/10">
                                                                <img src={student.imageUrl} alt="" className="h-full w-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-sm">{student.name}</p>
                                                                <p className="text-xs text-slate-500">{student.studentId}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-slate-500 px-2 py-1 rounded bg-white/5">{student.branch}</span>
                                                    </div>
                                                ))}
                                                {students.length === 0 && <p className="text-center text-slate-500 py-4">No students registered yet.</p>}
                                            </div>
                                        </div>

                                        <div className="glass-card p-6 border border-white/5">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-bold">Active Departments</h3>
                                                <button onClick={() => setActiveTab('view-depts')} className="text-indigo-400 text-sm hover:underline">View All</button>
                                            </div>
                                            <div className="space-y-4">
                                                {departments.slice(0, 5).map(dept => (
                                                    <div key={dept._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded bg-purple-600/20">
                                                                <Building2 size={16} className="text-purple-400" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-sm">{dept.name}</p>
                                                                <p className="text-xs text-slate-500">{dept.deptId}</p>
                                                            </div>
                                                        </div>
                                                        <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold">ACTIVE</span>
                                                    </div>
                                                ))}
                                                {departments.length === 0 && <p className="text-center text-slate-500 py-4">No departments found.</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'view-students' && (
                                <div className="glass-card p-8 border border-white/5">
                                    <TableHeader title="Student Records" />
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/10 text-slate-400 text-sm">
                                                    <th className="pb-4 font-semibold">Student</th>
                                                    <th className="pb-4 font-semibold">ID</th>
                                                    <th className="pb-4 font-semibold">Year/Branch</th>
                                                    <th className="pb-4 font-semibold">Section</th>
                                                    <th className="pb-4 font-semibold">Status</th>
                                                    <th className="pb-4 font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {filteredStudents.map((student) => (
                                                    <tr key={student._id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-indigo-500/30 group-hover:border-indigo-500 transition-colors">
                                                                    <img src={student.imageUrl} className="h-full w-full object-cover" alt="" />
                                                                </div>
                                                                <span className="font-semibold">{student.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 text-slate-400 font-mono text-sm">{student.studentId}</td>
                                                        <td className="py-4">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm">{student.branch}</span>
                                                                <span className="text-xs text-slate-500">{student.year}{student.year == 1 ? 'st' : student.year == 2 ? 'nd' : student.year == 3 ? 'rd' : 'th'} Year</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4">{student.section}</td>
                                                        <td className="py-4">
                                                            <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">ACTIVE</span>
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => startEditStudent(student)}
                                                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
                                                                >
                                                                    <Pencil size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete('student', student._id)}
                                                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {filteredStudents.length === 0 && (
                                            <div className="text-center py-20 text-slate-500">
                                                No students found matching your search.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'view-depts' && (
                                <div className="glass-card p-8 border border-white/5">
                                    <TableHeader title="Registered Departments" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredDepts.map((dept) => (
                                            <div key={dept._id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                                                <div className="p-3 w-fit rounded-xl bg-purple-600/20 mb-4 group-hover:bg-purple-600 transition-colors">
                                                    <Building2 className="text-purple-400 group-hover:text-white" size={24} />
                                                </div>
                                                <h3 className="text-xl font-bold mb-1">{dept.name}</h3>
                                                <p className="text-slate-500 text-sm mb-4">{dept.deptId}</p>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEditDept(dept)}
                                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-indigo-400 transition-colors"
                                                            title="Edit Department"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('department', dept._id)}
                                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-red-500 transition-colors"
                                                            title="Delete Department"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Authorized</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {filteredDepts.length === 0 && (
                                        <div className="text-center py-20 text-slate-500">
                                            No departments found.
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'view-guards' && (
                                <div className="glass-card p-8 border border-white/5">
                                    <TableHeader title="Security Personnel" />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredGuards.map((guard) => (
                                            <div key={guard._id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all group">
                                                <div className="p-3 w-fit rounded-xl bg-indigo-600/20 mb-4 group-hover:bg-indigo-600 transition-colors">
                                                    <ShieldCheck className="text-indigo-400 group-hover:text-white" size={24} />
                                                </div>
                                                <h3 className="text-xl font-bold mb-1">{guard.name}</h3>
                                                <p className="text-slate-500 text-sm mb-4">{guard.guardId}</p>
                                                <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => startEditGuard(guard)}
                                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-indigo-400 transition-colors"
                                                            title="Edit Guard"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('guard', guard._id)}
                                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-red-500 transition-colors"
                                                            title="Delete Guard"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">On Duty</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {filteredGuards.length === 0 && (
                                        <div className="text-center py-20 text-slate-500">
                                            No guards registered yet.
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'add-student' && (
                                <div className="glass-card p-10 border border-white/5 shadow-2xl">
                                    <div className="mb-10 text-center relative">
                                        {isEditing && (
                                            <button
                                                onClick={() => { setIsEditing(false); setEditId(null); setStudentData({ studentId: '', name: '', year: '', branch: '', section: '', password: '', photo: null }); }}
                                                className="absolute right-0 top-0 p-2 hover:bg-white/10 rounded-full text-slate-400"
                                                title="Cancel Edit"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                        <h2 className="text-3xl font-bold mb-2">{isEditing ? 'Update Student' : 'Student Registration'}</h2>
                                        <p className="text-slate-400">{isEditing ? `Modifying details for ${studentData.name}` : 'Add a new student to the system with biometrics.'}</p>
                                    </div>
                                    <form onSubmit={handleSubmitStudent} className="space-y-8 max-w-3xl mx-auto">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-300 ml-1">Student ID</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                    placeholder="210003XXXX"
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
                                                <label className="text-sm font-semibold text-slate-300 ml-1">
                                                    {isEditing ? 'New Password (Leave blank to keep current)' : 'Login Password'}
                                                </label>
                                                <input
                                                    type="password"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                    placeholder="••••••••"
                                                    value={studentData.password}
                                                    onChange={e => setStudentData({ ...studentData, password: e.target.value })}
                                                    required={!isEditing}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">
                                                {isEditing ? 'Update Photo (Optional)' : 'Biometric Verification Profile'}
                                            </label>
                                            <div className="relative group border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer">
                                                <input
                                                    type="file"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={e => setStudentData({ ...studentData, photo: e.target.files[0] })}
                                                    accept="image/*"
                                                    required={!isEditing}
                                                />
                                                <div className="flex flex-col items-center">
                                                    <div className="p-4 bg-white/5 rounded-full mb-4 group-hover:bg-indigo-500/10 transition-colors">
                                                        <Upload className="text-slate-400 group-hover:text-indigo-400" size={32} />
                                                    </div>
                                                    <p className="text-white font-semibold text-lg">
                                                        {studentData.photo ? studentData.photo.name : isEditing ? 'Select new photo to update' : 'Click to upload portrait photo'}
                                                    </p>
                                                    <p className="text-sm text-slate-500 mt-1">Maximum file size 5MB (JPG/PNG)</p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className={`w-full ${isEditing ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-70`}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> {isEditing ? 'Save Changes' : 'Complete Registration'}</>}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'add-dept' && (
                                <div className="glass-card p-10 border border-white/5 shadow-2xl max-w-2xl mx-auto">
                                    <div className="mb-10 text-center relative">
                                        {isEditing && (
                                            <button
                                                onClick={() => { setIsEditing(false); setEditId(null); setDeptData({ deptId: '', name: '', password: '' }); }}
                                                className="absolute right-0 top-0 p-2 hover:bg-white/10 rounded-full text-slate-400"
                                                title="Cancel Edit"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                        <h2 className="text-3xl font-bold mb-2">{isEditing ? 'Update Department' : 'New Department'}</h2>
                                        <p className="text-slate-400">{isEditing ? `Editing ${deptData.name}` : 'Register a new academic or administrative department.'}</p>
                                    </div>
                                    <form onSubmit={handleSubmitDept} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Department ID</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                placeholder="CSE-HOD-01"
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
                                                placeholder="Computer Science & Engineering"
                                                value={deptData.name}
                                                onChange={e => setDeptData({ ...deptData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">
                                                {isEditing ? 'New Password (Leave blank to keep current)' : 'Access Password'}
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                placeholder="••••••••"
                                                value={deptData.password}
                                                onChange={e => setDeptData({ ...deptData, password: e.target.value })}
                                                required={!isEditing}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className={`w-full ${isEditing ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-70 mt-4`}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> {isEditing ? 'Save Changes' : 'Create Department'}</>}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'add-guard' && (
                                <div className="glass-card p-10 border border-white/5 shadow-2xl max-w-2xl mx-auto">
                                    <div className="mb-10 text-center relative">
                                        {isEditing && (
                                            <button
                                                onClick={() => { setIsEditing(false); setEditId(null); setGuardData({ guardId: '', name: '', password: '' }); }}
                                                className="absolute right-0 top-0 p-2 hover:bg-white/10 rounded-full text-slate-400"
                                                title="Cancel Edit"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                        <h2 className="text-3xl font-bold mb-2">{isEditing ? 'Update Guard' : 'New Security Personnel'}</h2>
                                        <p className="text-slate-400">{isEditing ? `Editing ${guardData.name}` : 'Add a security officer to the campus gate monitoring team.'}</p>
                                    </div>
                                    <form onSubmit={handleSubmitGuard} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Guard Designation ID</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                placeholder="SEC-GUARD-MAIN-01"
                                                value={guardData.guardId}
                                                onChange={e => setGuardData({ ...guardData, guardId: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                placeholder="Security Officer Name"
                                                value={guardData.name}
                                                onChange={e => setGuardData({ ...guardData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-300 ml-1">
                                                {isEditing ? 'New Password (Leave blank to keep current)' : 'Access Password'}
                                            </label>
                                            <input
                                                type="password"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                                placeholder="••••••••"
                                                value={guardData.password}
                                                onChange={e => setGuardData({ ...guardData, password: e.target.value })}
                                                required={!isEditing}
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className={`w-full ${isEditing ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-bold py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 transition-all disabled:opacity-70 mt-4`}
                                            disabled={loading}
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <><Plus size={20} /> {isEditing ? 'Save Changes' : 'Register Personnel'}</>}
                                        </button>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
