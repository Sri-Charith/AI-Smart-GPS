import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, User, Loader2, UserPlus } from 'lucide-react';
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
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#0c0c14] overflow-hidden relative">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-10 w-full max-w-md z-10 border border-white/10 shadow-2xl relative"
            >
                <div className="text-center mb-10">
                    <UserPlus className="text-indigo-400 mx-auto mb-4" size={32} />
                    <h2 className="text-4xl font-bold gradient-text pb-1">Admin Registry</h2>
                    <p className="text-dim mt-2 font-medium">Create a new administrator account</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">Admin Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-indigo-400" size={20} />
                            <input
                                type="text"
                                placeholder="Enter your name"
                                style={{ paddingLeft: '3.5rem' }}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-indigo-400" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                style={{ paddingLeft: '3.5rem' }}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && <p className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm text-center font-medium">{error}</p>}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-70 mt-2 shadow-xl shadow-indigo-600/20"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" size={22} /> : 'Register Admin'}
                    </motion.button>

                    <div className="text-center mt-6">
                        <p className="text-dim text-sm">
                            Already an admin? <Link to="/admin/login" className="text-indigo-400 hover:text-indigo-300 font-bold ml-1">Login</Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AdminSignup;
