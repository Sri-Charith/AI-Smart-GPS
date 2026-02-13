import { useState, useEffect } from 'react';
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

    // Reset form when role changes
    useEffect(() => {
        setFormData({ id: '', password: '', name: '', branch: '', year: '', section: '' });
        setError('');
    }, [role]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const trimmedFormData = Object.keys(formData).reduce((acc, key) => {
                acc[key] = typeof formData[key] === 'string' ? formData[key].trim() : formData[key];
                return acc;
            }, {});

            const payload = { role, ...trimmedFormData };
            const { data } = await api.post('/auth/login', payload);

            // Clear old tokens for other roles to prevent collision
            ['admin', 'student', 'department', 'guard'].forEach(r => {
                localStorage.removeItem(`${r}Token`);
                localStorage.removeItem(`${r}Data`);
            });

            localStorage.setItem(`${role}Token`, data.token);
            localStorage.setItem(`${role}Data`, JSON.stringify(data.user));

            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'student') navigate('/student/dashboard');
            else if (role === 'department') navigate('/department/dashboard');
            else if (role === 'guard') navigate('/guard/dashboard');

        } catch (err) {
            setError(err.response?.data?.message || 'Verification Error - Status 401');
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
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#030305] overflow-hidden relative selection:bg-indigo-500/30">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-600/5 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-4xl glass-morphism rounded-[2.5rem] flex flex-col md:flex-row shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/5"
            >
                {/* Left Sidebar - Role Selection */}
                <div className="md:w-72 bg-white/[0.02] p-8 border-r border-white/5 flex flex-col gap-3">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 neon-bg-indigo rounded-lg flex items-center justify-center">
                                <Shield className="text-white" size={16} />
                            </div>
                            <span className="text-lg font-black tracking-tighter uppercase italic">SmartGate <span className="text-indigo-500">AI</span></span>
                        </div>
                        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">User Login</h2>
                    </div>

                    {roles.map((r) => (
                        <button
                            key={r.id}
                            onClick={() => { setRole(r.id); setError(''); }}
                            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${role === r.id
                                ? 'neon-bg-indigo text-white shadow-xl'
                                : 'text-slate-500 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <r.icon size={18} />
                            {r.label}
                        </button>
                    ))}
                </div>

                {/* Right Form Area */}
                <div className="flex-1 p-12 relative overflow-hidden">
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-2">Welcome <span className="text-indigo-500">Back</span></h2>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Select Role: <span className="text-white">{roles.find(r => r.id === role).label}</span></p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                                    {role === 'admin' ? 'Admin ID' : role === 'student' ? 'Student ID' : role === 'department' ? 'HOD ID' : 'Guard ID'}
                                </label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder={`Enter ${role.charAt(0).toUpperCase() + role.slice(1)} ID`}
                                        style={{ paddingLeft: '4rem' }}
                                        className="w-full bg-black/40 border border-white/5 rounded-[1.25rem] py-4 text-white font-bold tracking-widest text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-800"
                                        value={formData.id}
                                        onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        style={{ paddingLeft: '4rem' }}
                                        className="w-full bg-black/40 border border-white/5 rounded-[1.25rem] py-4 text-white font-bold tracking-widest text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Shield size={14} />
                                {error}
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full neon-bg-indigo py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <>Login <ChevronRight size={18} /></>}
                        </motion.button>
                    </form>

                    {role === 'admin' && (
                        <div className="mt-8 text-center">
                            <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest">
                                New Admin Account?
                                <Link to="/admin/signup" className="text-indigo-400 ml-2 hover:underline">
                                    Register here
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
