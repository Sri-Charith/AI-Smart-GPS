import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { LogOut, CheckCircle2, XCircle, Clock, Search, History, Filter, User, ChevronRight, AlertCircle, Camera, ShieldCheck, Zap, LayoutGrid, ListTodo, MessageSquare, Send } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const HODDashboard = () => {
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('All');
    const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'history'
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionMessage, setActionMessage] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState('');
    const navigate = useNavigate();


    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/department/requests');
            const allReqs = res.data.requests;
            setRequests(allReqs);

            setStats({
                total: allReqs.length,
                pending: allReqs.filter(r => r.status === 'Pending').length,
                approved: allReqs.filter(r => r.status === 'Approved' || r.status === 'Left Campus').length,
                rejected: allReqs.filter(r => r.status === 'Rejected').length
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const formatTime12h = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const handleAction = async (id, status) => {
        setSelectedRequest(id);
        setPendingStatus(status);
        setActionMessage('');
        setIsModalOpen(true);
    };

    const confirmAction = async () => {
        try {
            const endpoint = pendingStatus === 'Approved' ? `/department/approve/${selectedRequest}` : `/department/reject/${selectedRequest}`;
            await api.put(endpoint, { message: actionMessage });
            setIsModalOpen(false);
            fetchRequests();
        } catch (err) {
            alert('Error updating request status');
        }
    };


    const handleLogout = () => {
        localStorage.removeItem('departmentToken');
        navigate('/');
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.student?.studentId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'All' ? true : req.status === filter;

        if (activeTab === 'requests') {
            return matchesSearch && req.status === 'Pending';
        } else {
            return matchesSearch && matchesFilter && req.status !== 'Pending';
        }
    });

    return (
        <div className="min-h-screen bg-[#030305] text-white selection:bg-indigo-500/30">
            {/* HUD Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-10">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-600/20 blur-[120px] rounded-full" />
            </div>

            {/* Navbar */}
            <header className="fixed top-0 w-full z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 py-4 px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 neon-bg-indigo rounded-xl flex items-center justify-center">
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">HOD.Dashboard</h1>
                            <p className="text-[9px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1 italic">HOD Control Center</p>
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

            <main className="max-w-7xl mx-auto pt-32 pb-20 px-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard title="Pending" value={stats.pending} color="amber" icon={<Clock size={20} />} />
                    <StatCard title="Approved" value={stats.approved} color="emerald" icon={<CheckCircle2 size={20} />} />
                    <StatCard title="Rejected" value={stats.rejected} color="rose" icon={<XCircle size={20} />} />
                    <StatCard title="Total" value={stats.total} color="indigo" icon={<History size={20} />} />
                </div>

                {/* Main HUD Module */}
                <div className="glass-morphism rounded-[2.5rem] border-white/5 overflow-hidden">
                    <div className="p-10 border-b border-white/5 space-y-8">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            {/* Tab Switcher */}
                            <div className="flex p-1.5 bg-white/[0.02] rounded-[1.5rem] border border-white/5 w-fit">
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'neon-bg-indigo text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <ListTodo size={14} />
                                    New Requests
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'history' ? 'neon-bg-indigo text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
                                >
                                    <History size={14} />
                                    Past Requests
                                </button>
                            </div>

                            {/* Filters & Search */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 flex-1 lg:max-w-2xl">
                                <div className="relative flex-1 w-full">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search student name or ID..."
                                        className="w-full pl-14 pr-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-[10px] font-black tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-800"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {activeTab === 'history' && (
                                    <div className="relative w-full sm:w-auto">
                                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                                        <select
                                            className="w-full sm:w-auto pl-10 pr-8 py-4 bg-black/40 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                                            value={filter}
                                            onChange={(e) => setFilter(e.target.value)}
                                        >
                                            <option value="All">ALL STATUS</option>
                                            <option value="Approved">APPROVED</option>
                                            <option value="Rejected">REJECTED</option>
                                            <option value="Left Campus">EXITED</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Entity List */}
                    <div className="p-6 lg:p-10">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(n => <div key={n} className="h-24 bg-white/5 rounded-3xl animate-pulse" />)}
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="py-32 text-center opacity-40">
                                <Zap size={64} className="mx-auto text-slate-800 mb-6" strokeWidth={1} />
                                <h3 className="text-xs font-black uppercase tracking-[0.5em] italic">No records found</h3>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredRequests.map((req, idx) => (
                                    <motion.div
                                        key={req._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group p-6 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all relative overflow-hidden"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
                                            {/* Entity Badge */}
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/5 shadow-2xl">
                                                        <img
                                                            src={req.student?.imageUrl || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop"}
                                                            alt="Entity"
                                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                                        />
                                                    </div>
                                                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl border-4 border-[#030305] flex items-center justify-center shadow-lg ${req.status === 'Pending' ? 'bg-amber-500' : 'bg-indigo-500'
                                                        }`}>
                                                        <User size={14} className="text-black" />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-black uppercase tracking-tighter italic group-hover:text-indigo-400 transition-colors">{req.student?.name}</h3>
                                                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[8px] font-black uppercase tracking-widest">{req.student?.branch}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        <span>ID: {req.student?.studentId}</span>
                                                        <span className="text-slate-800">//</span>
                                                        <span>{req.date} @ {formatTime12h(req.time)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Intel */}
                                            <div className="flex-1 lg:pl-10 lg:border-l border-white/5">
                                                <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-lg italic">
                                                    "{req.reason}"
                                                </p>
                                            </div>

                                            {/* Command Actions */}
                                            <div className="flex items-center gap-4">
                                                {req.status === 'Pending' ? (
                                                    <div className="flex gap-4 w-full sm:w-auto">
                                                        <button
                                                            onClick={() => handleAction(req._id, 'Approved')}
                                                            className="flex-1 sm:flex-none px-10 py-4 neon-bg-indigo hover:bg-black text-white hover:text-indigo-400 border border-transparent hover:border-indigo-500/50 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/10"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(req._id, 'Rejected')}
                                                            className="flex-1 sm:flex-none px-10 py-4 bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 border border-white/5 hover:border-rose-500/30 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className={`px-8 py-3 rounded-2xl border text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-3 ${req.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                        req.status === 'Rejected' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                                                            'bg-cyan-500/10 border-cyan-500/20 text-cyan-500'
                                                        }`}>
                                                        {req.status === 'Approved' && <CheckCircle2 size={12} />}
                                                        {req.status === 'Rejected' && <XCircle size={12} />}
                                                        {req.status === 'Left Campus' && <LogOut size={12} />}
                                                        {req.status}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Decorative Corner */}
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/5 to-transparent pointer-events-none" />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Action Modal */}
                <AnimatePresence>
                    {isModalOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsModalOpen(false)}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-lg glass-morphism rounded-[2.5rem] border border-white/10 p-10 shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />

                                <div className="relative z-10 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${pendingStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {pendingStatus === 'Approved' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black uppercase tracking-tighter italic">
                                                Confirm {pendingStatus}
                                            </h2>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">
                                                Add an optional message for the student
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1 italic">// HOD Message</label>
                                        <div className="relative">
                                            <MessageSquare className="absolute left-5 top-5 text-slate-600" size={18} />
                                            <textarea
                                                placeholder="Enter reason or instructions..."
                                                className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 pl-14 pr-6 text-xs font-bold tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-800 min-h-[120px] resize-none"
                                                value={actionMessage}
                                                onChange={(e) => setActionMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-white/5"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmAction}
                                            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl ${pendingStatus === 'Approved'
                                                    ? 'neon-bg-indigo text-white shadow-indigo-600/20'
                                                    : 'bg-rose-600 text-white shadow-rose-600/20 hover:bg-rose-700 font-bold'
                                                }`}
                                        >
                                            <Send size={14} />
                                            Submit {pendingStatus}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>

        </div>
    );
};

const StatCard = ({ title, value, color, icon }) => {
    const theme = {
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
        rose: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
        indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
    };

    return (
        <motion.div
            whileHover={{ y: -5, borderColor: 'rgba(255,255,255,0.1)' }}
            className={`p-8 rounded-[2.5rem] border ${theme[color]} relative overflow-hidden group transition-all`}
        >
            <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transform scale-[3] transition-all duration-500">
                {icon}
            </div>
            <div className="relative z-10 flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 leading-none">{title}</span>
                <span className="text-5xl font-black tracking-tighter leading-none">{value}</span>
            </div>
        </motion.div>
    );
};

export default HODDashboard;
