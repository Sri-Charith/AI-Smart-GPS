import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { Lock, User, GraduationCap, Camera, Loader2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentSignup = () => {
    const [formData, setFormData] = useState({
        studentId: '', name: '', branch: '', year: '', section: '', password: ''
    });
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!photo) { setError('Face photo is required'); return; }

        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('role', 'student');
        data.append('id', formData.studentId);
        Object.keys(formData).forEach(key => {
            if (key !== 'studentId') data.append(key, formData[key]);
        });
        data.append('photo', photo);

        try {
            const res = await api.post('/auth/signup', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            localStorage.setItem('studentToken', res.data.token);
            localStorage.setItem('studentData', JSON.stringify(res.data.user));
            navigate('/student/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-6 bg-[#0c0c14] overflow-hidden relative">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-10 w-full max-w-2xl z-10 border border-white/10 shadow-2xl relative"
            >
                <div className="text-center mb-8">
                    <GraduationCap className="text-indigo-400 mx-auto mb-4" size={40} />
                    <h2 className="text-4xl font-bold gradient-text pb-1">Student Enrollment</h2>
                    <p className="text-dim mt-2 font-medium">Create your smart gatepass student account</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Student Roll ID</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                placeholder="e.g. 210003XXXX"
                                value={formData.studentId}
                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Branch</label>
                            <input
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                placeholder="CSE / ECE"
                                value={formData.branch}
                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Year</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    placeholder="3"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Sec</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                                    placeholder="S1"
                                    value={formData.section}
                                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Secret Password</label>
                        <input
                            type="password"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 px-4 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-400 uppercase ml-1">Face Recognition Data</label>
                        <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:bg-indigo-500/5 transition-all cursor-pointer group">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={(e) => setPhoto(e.target.files[0])}
                                accept="image/*"
                                required
                            />
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-3 bg-white/5 rounded-full group-hover:bg-indigo-500/10 transition-colors">
                                    <Camera className="text-slate-400 group-hover:text-indigo-400" size={28} />
                                </div>
                                <p className="text-sm font-semibold">{photo ? photo.name : "Upload face photo"}</p>
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm font-medium text-center bg-red-500/10 py-3 rounded-xl">{error}</p>}

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-70 shadow-xl shadow-indigo-600/20"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" size={22} /> : <>Complete Registration <Upload size={20} /></>}
                    </motion.button>

                    <p className="text-center text-dim text-sm mt-4">
                        Already enrolled? <Link to="/admin/login" className="text-indigo-400 font-bold hover:underline ml-1">Sign In</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};

export default StudentSignup;
