import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { LogOut, Send, Clock, Trash2, CheckCircle2, XCircle, ShieldCheck, Shield, GraduationCap, History, Info, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const StudentDashboard = () => {
    const [student, setStudent] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reason, setReason] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
        fetchRequests();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/students/dashboard');
            setStudent(res.data.student);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/gatepass/status');
            setRequests(res.data.requests);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('studentToken');
        navigate('/');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await api.post('/gatepass/request', { reason, date, time });
            setMessage({ type: 'success', text: 'Gate pass request submitted successfully.' });
            setReason(''); setDate(''); setTime('');
            fetchRequests();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Submission failed.' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Cancel this request?')) return;
        try {
            await api.delete(`/gatepass/delete/${id}`);
            fetchRequests();
        } catch (err) {
            alert('Failed to abort request.');
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'Approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            case 'Left Campus': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
            default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={14} />;
            case 'Approved': return <CheckCircle2 size={14} />;
            case 'Rejected': return <XCircle size={14} />;
            case 'Left Campus': return <LogOut size={14} />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#030305] text-white selection:bg-indigo-500/30">
            {/* Background HUD Layer */}
            <div className="fixed inset-0 pointer-events-none opacity-20">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                <div className="absolute top-1/2 left-0 w-1 h-32 bg-indigo-500 -translate-y-1/2" />
                <div className="absolute top-1/2 right-0 w-1 h-32 bg-pink-500 -translate-y-1/2" />
            </div>

            {/* Navbar */}
            <header className="fixed top-0 w-full z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 py-4 px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 neon-bg-indigo rounded-xl flex items-center justify-center">
                            <GraduationCap size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Student.Dashboard</h1>
                            <p className="text-[9px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1 italic">Manage your gatepasses</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="p-3 text-slate-500 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto pt-32 pb-20 px-6 grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Profile HUD */}
                <aside className="lg:col-span-4 space-y-8">
                    <div className="glass-morphism rounded-[2.5rem] p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 blur-3xl group-hover:bg-indigo-600/20 transition-all" />

                        <div className="relative z-10 space-y-8 text-center sm:text-left">
                            <div className="relative inline-block mx-auto sm:mx-0">
                                <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                                    <img
                                        src={student?.imageUrl || "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop"}
                                        alt="Student"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-black rounded-xl border-4 border-[#030305] flex items-center justify-center">
                                    <ShieldCheck size={20} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase italic">{student?.name || "Loading..."}</h2>
                                    <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mt-1">Status: Verified</p>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-white/5">
                                    <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enrollment</span>
                                        <span className="text-xs font-black tracking-widest">{student?.studentId}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</span>
                                        <span className="text-xs font-black tracking-widest">{student?.branch} - {student?.section}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Academic Year</span>
                                        <span className="text-xs font-black tracking-widest">Year {student?.year}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-morphism rounded-[2.5rem] p-8 border-cyan-500/10 border italic text-xs leading-relaxed text-slate-500 font-medium">
                        <span className="text-cyan-400 font-black not-italic tracking-widest uppercase mr-2">Info//</span>
                        All campus exit requests must be authorized by your Department Head. Ensure you have your face verified at the main portal upon exit.
                    </div>
                </aside>

                {/* Primary Content HUD */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Request Unit */}
                    <div className="glass-morphism rounded-[2.5rem] p-10 border-indigo-500/5 border relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center">
                                <Send size={16} />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter italic">Request <span className="text-pink-500">Gate Pass</span></h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">// Reason</label>
                                    <input
                                        type="text"
                                        placeholder="REASON FOR EXIT"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-800"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">// Date</label>
                                        <input
                                            type="date"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">// Time</label>
                                        <input
                                            type="time"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-4 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-5 neon-bg-indigo hover:bg-black text-white hover:text-indigo-400 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-indigo-600/10 border border-transparent hover:border-indigo-500/30 flex items-center justify-center gap-3"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Submit Request</>}
                            </button>
                        </form>

                        {message.text && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-8 p-6 rounded-2xl border font-black text-[10px] uppercase tracking-widest flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                                    }`}
                            >
                                <Info size={16} />
                                {message.text}
                            </motion.div>
                        )}
                    </div>

                    {/* Log Unit */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-3 font-black text-xs uppercase tracking-[0.4em] text-slate-600 italic">
                                <History size={14} />
                                Request History
                            </div>
                            <button onClick={fetchRequests} className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">
                                // Refresh
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(n => <div key={n} className="h-28 bg-white/5 rounded-[2rem] border border-white/5 animate-pulse" />)}
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="glass-morphism rounded-[2.5rem] py-20 text-center border-white/5">
                                <History size={48} className="mx-auto text-slate-800 mb-6" strokeWidth={1} />
                                <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest italic">No Requests Found</h3>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {requests.map((req, idx) => (
                                    <motion.div
                                        key={req._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="glass-morphism rounded-[2rem] p-6 hover:bg-white/[0.04] border border-white/5 transition-all group overflow-hidden relative"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border font-black ${getStatusStyles(req.status)} shadow-lg`}>
                                                    {getStatusIcon(req.status)}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black tracking-tighter uppercase italic group-hover:text-indigo-400 transition-colors uppercase">{req.reason}</h4>
                                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">
                                                        Timecode: <span className="text-slate-400">{req.date} @ {req.time}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyles(req.status)}`}>
                                                    {req.status}
                                                </div>
                                                {req.status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleDelete(req._id)}
                                                        className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {/* HUD Line Decoration */}
                                        <div className="absolute top-0 right-0 w-24 h-[1px] bg-gradient-to-l from-indigo-500/20 to-transparent" />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
