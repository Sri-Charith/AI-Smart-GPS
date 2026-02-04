import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, Building2, Loader2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const HODSignup = () => {
    const [formData, setFormData] = useState({ deptId: '', name: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/signup', { role: 'department', id: formData.deptId, ...formData });
            localStorage.setItem('departmentToken', res.data.token);
            localStorage.setItem('departmentData', JSON.stringify(res.data.user));
            navigate('/department/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0c0c14] overflow-hidden relative">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-10 w-full max-w-md z-10 border border-white/10 shadow-2xl relative"
            >
                <div className="text-center mb-10">
                    <Building2 className="text-indigo-400 mx-auto mb-4" size={40} />
                    <h2 className="text-4xl font-bold gradient-text pb-1">HOD Signup</h2>
                    <p className="text-dim mt-2 font-medium">Create departmental administrator account</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">Department ID</label>
                        <input
                            type="text"
                            placeholder="e.g. CSE-DEPT-01"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            value={formData.deptId}
                            onChange={(e) => setFormData({ ...formData, deptId: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">Department Name</label>
                        <input
                            type="text"
                            placeholder="Computer Science"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-300 ml-1">Secret Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm font-medium text-center bg-red-500/10 py-3 rounded-xl">{error}</p>}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl transition-all"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" size={22} /> : <>Register Department <UserPlus size={20} /></>}
                    </motion.button>

                    <div className="text-center mt-6">
                        <p className="text-dim text-sm">Registered? <Link to="/admin/login" className="text-indigo-400 font-bold hover:underline ml-1">Sign In</Link></p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default HODSignup;
