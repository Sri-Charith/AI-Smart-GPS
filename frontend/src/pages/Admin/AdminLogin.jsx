import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, User, Shield, Building2, GraduationCap, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [role, setRole] = useState('admin');
    const [formData, setFormData] = useState({
        id: '',
        password: '',
        name: '',
        branch: '',
        year: '',
        section: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = { role, ...formData };
            const { data } = await api.post('/auth/login', payload);

            localStorage.setItem(`${role}Token`, data.token);
            localStorage.setItem(`${role}Data`, JSON.stringify(data.user));

            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'student') navigate('/student/dashboard');
            else if (role === 'department') navigate('/department/dashboard');
            else if (role === 'guard') navigate('/guard/dashboard');

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { id: 'admin', label: 'Admin', icon: User },
        { id: 'student', label: 'Student', icon: GraduationCap },
        { id: 'department', label: 'HOD', icon: Building2 },
        { id: 'guard', label: 'Security', icon: Shield },
    ];

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0c0c14] overflow-hidden relative">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/10 blur-[120px] rounded-full animate-pulse" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card w-full max-w-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl border border-white/5"
            >
                {/* Left Sidebar - Role Selection */}
                <div className="md:w-64 bg-white/5 p-6 border-r border-white/5 flex flex-col gap-2">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 ml-2">Login As</h2>
                    {roles.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => { setRole(r.id); setError(''); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${role === r.id
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <r.icon size={20} />
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* Right Form Area */}
                <div className="flex-1 p-10 relative">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold gradient-text">Welcome Back</h2>
                        <p className="text-dim mt-2">Sign in as <span className="text-white font-bold">{roles.find(r => r.id === role).label}</span> to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                                    {role === 'admin' ? 'Admin Name' : role === 'student' ? 'Student Roll ID' : role === 'department' ? 'Dept ID' : 'Guard ID'}
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-indigo-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder={`Enter ${role} ID`}
                                        style={{ paddingLeft: '3.5rem' }}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {(role === 'student' || role === 'department' || role === 'guard') && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                placeholder="Legal Name"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {role === 'student' && (
                                <div className="grid grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Branch"
                                        className="bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        value={formData.branch}
                                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Year"
                                        className="bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Sec"
                                        className="bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        value={formData.section}
                                        onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Secret Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-indigo-400" size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        style={{ paddingLeft: '3.5rem' }}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-red-400 text-sm font-medium ml-1">{error}</p>}

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Access Account <ChevronRight size={20} /></>}
                        </motion.button>
                    </form>

                    {role === 'admin' && (
                        <div className="mt-8 text-center">
                            <p className="text-dim text-sm">
                                New Administrator?
                                <Link to="/admin/signup" className="text-indigo-400 font-bold hover:underline ml-1">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
