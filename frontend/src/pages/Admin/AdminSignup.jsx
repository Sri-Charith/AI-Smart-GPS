import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, User, Loader2, UserPlus, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSignup = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/signup', {
                role: 'admin',
                id: name.trim(),
                password: password.trim()
            });
            localStorage.setItem('adminToken', data.token);
            localStorage.setItem('adminData', JSON.stringify(data.user));
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Access Initialization Failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#030305] overflow-hidden relative selection:bg-indigo-500/30">
            {/* HUD Elements */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-morphism p-10 lg:p-14 w-full max-w-lg z-10 border-white/5 shadow-2xl relative rounded-[3rem] overflow-hidden"
            >
                {/* HUD Corner Decoration */}
                <div className="absolute top-0 right-0 w-24 h-[1px] bg-gradient-to-l from-indigo-500/20 to-transparent" />
                <div className="absolute top-0 right-0 w-[1px] h-24 bg-gradient-to-b from-indigo-500/20 to-transparent" />

                <div className="text-center mb-12">
                    <div className="w-16 h-16 neon-bg-indigo rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                        <Zap size={14} className="text-indigo-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400">Admin Section</span>
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none">Admin <span className="text-indigo-500">Registry</span></h2>
                    <p className="text-[10px] font-black text-slate-500 tracking-[0.4em] uppercase mt-4 italic">// Create a new administrator account</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">// Admin ID</label>
                        <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Identifier"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-xs font-black tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-800"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 ml-1 italic">// Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-xs font-black tracking-widest text-white outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-800"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        className="w-full neon-bg-indigo hover:bg-black text-white hover:text-indigo-400 font-black py-5 rounded-2xl flex items-center justify-center gap-4 transition-all disabled:opacity-50 mt-4 shadow-xl shadow-indigo-600/10 border border-transparent hover:border-indigo-500/30 uppercase text-xs tracking-[0.3em] italic"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" size={22} /> : 'Register Admin'}
                    </button>

                    <div className="text-center mt-10">
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">
                            Already an Admin? <Link to="/admin/login" className="text-indigo-400 hover:text-white transition-colors ml-2 shadow-[0_0_10px_rgba(99,102,241,0.2)] pb-0.5 border-b border-indigo-400/30">Login here</Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminSignup;
