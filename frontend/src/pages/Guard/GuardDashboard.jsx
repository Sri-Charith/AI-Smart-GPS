import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';
import { LogOut, Camera, ShieldCheck, ShieldAlert, Clock, User, CheckCircle2, AlertTriangle, Scan, History, ArrowRight, Zap, Target, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const GuardDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scanResult, setScanResult] = useState(null);
    const [scanLoading, setScanLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'verified'
    const [history, setHistory] = useState([]);
    const navigate = useNavigate();

    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/guard/requests?filter=${activeTab}`);
            setRequests(res.data.requests);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            setStream(mediaStream);
            setCameraActive(true);
        } catch (err) {
            console.error("Camera access denied:", err);
            // alert("Please allow camera access to scan faces.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    useEffect(() => {
        fetchRequests();
        startCamera(); // Auto-start camera on mount
        const interval = setInterval(fetchRequests, 10000);
        return () => {
            clearInterval(interval);
            stopCamera();
        };
    }, [activeTab]);

    const handleLogout = () => {
        localStorage.removeItem('guardToken');
        navigate('/');
    };

    useEffect(() => {
        if (cameraActive && stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [cameraActive, stream]);

    const captureAndVerify = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        setScanLoading(true);
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);

        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
            const file = new File([blob], "scan.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append('image', file);

            const uploadRes = await api.post('/upload/photo', formData);
            const imageUrl = uploadRes.data.imageUrl;

            const verifyRes = await api.post('/guard/verify-face', { scannedImageUrl: imageUrl });
            setScanResult({ success: true, ...verifyRes.data });
            fetchRequests();
            setHistory(prev => [{ ...verifyRes.data, timestamp: new Date().toLocaleTimeString() }, ...prev]);
        } catch (err) {
            setScanResult({ success: false, message: err.response?.data?.message || 'Verification Failed' });
        } finally {
            setScanLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanLoading(true);
        setScanResult(null);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const uploadRes = await api.post('/upload/photo', formData);
            const imageUrl = uploadRes.data.imageUrl;

            const verifyRes = await api.post('/guard/verify-face', { scannedImageUrl: imageUrl });
            setScanResult({ success: true, ...verifyRes.data });

            fetchRequests();
            setHistory(prev => [{ ...verifyRes.data, timestamp: new Date().toLocaleTimeString() }, ...prev]);
        } catch (err) {
            setScanResult({ success: false, message: err.response?.data?.message || 'Verification Failed' });
        } finally {
            setScanLoading(false);
        }
    };

    const markLeft = async (id) => {
        try {
            await api.put(`/guard/mark-left/${id}`);
            fetchRequests();
        } catch (err) {
            alert('Error marking as left');
        }
    };

    return (
        <div className="min-h-screen bg-[#030305] text-white flex flex-col font-sans selection:bg-pink-500/30">
            {/* Ambient Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
                <div className="absolute top-0 right-0 w-[40%] h-[1px] bg-gradient-to-l from-indigo-500 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                <div className="absolute bottom-0 left-0 w-[40%] h-[1px] bg-gradient-to-r from-pink-500 to-transparent shadow-[0_0_20px_rgba(255,0,127,0.5)]" />
            </div>

            {/* Navbar */}
            <header className="fixed top-0 w-full z-40 bg-black/40 backdrop-blur-xl border-b border-white/5 py-4 px-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 neon-bg-pink rounded-xl flex items-center justify-center">
                            <ShieldCheck size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Guard.Dashboard</h1>
                            <p className="text-[9px] font-black text-rose-500/60 tracking-[0.4em] uppercase mt-1 italic animate-pulse">Gatepass Verification</p>
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

                {/* Left Column: AI Scanner HUD */}
                <div className="lg:col-span-5 space-y-10">
                    <div className="glass-morphism rounded-[2.5rem] border-white/5 p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-pink-600/10 blur-[80px] -z-10" />

                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-slate-500 italic">// FACE RECOGNITION</h2>
                                <h3 className="text-xl font-black uppercase tracking-tighter italic">Scan <span className="text-pink-500">Photo</span></h3>
                            </div>
                            <div className="px-4 py-2 bg-pink-500/10 text-pink-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-pink-500/20">
                                SYSTEM ACTIVE
                            </div>
                        </div>

                        {/* Scanner HUD Container */}
                        <div className={`relative aspect-square rounded-[2rem] border-2 border-dashed transition-all duration-700 overflow-hidden ${scanLoading ? 'border-pink-500 shadow-[0_0_40px_rgba(255,0,127,0.2)]' : 'border-white/5'}`}>
                            <canvas ref={canvasRef} className="hidden" />
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                            {cameraActive ? (
                                <div className="w-full h-full relative group">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover contrast-110 brightness-110"
                                    />

                                    {/* Verification Overlay */}
                                    <AnimatePresence>
                                        {scanResult && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                className="absolute inset-0 z-30 flex items-center justify-center p-6"
                                            >
                                                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 w-full shadow-2xl">
                                                    {scanResult.success ? (
                                                        <div className="text-center space-y-4">
                                                            <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden mx-auto border-2 border-emerald-500">
                                                                <img src={scanResult.imageUrl} className="w-full h-full object-cover" alt="Entity" />
                                                            </div>
                                                            <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">{scanResult.name}</h3>
                                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none underline underline-offset-4">ACCESS GRANTED</p>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center space-y-4">
                                                            <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
                                                                <ShieldAlert className="text-rose-500" size={32} />
                                                            </div>
                                                            <h3 className="text-lg font-black text-rose-500 uppercase italic tracking-tighter">ACCESS DENIED</h3>
                                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{scanResult.message}</p>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => setScanResult(null)}
                                                        className="mt-6 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
                                                    >
                                                        DISMISS
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {!scanResult && !scanLoading && (
                                        <>
                                            {/* Targeting Reticle */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <div className="w-64 h-64 border border-pink-500/30 rounded-full animate-pulse relative">
                                                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-pink-500" />
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-pink-500" />
                                                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1 h-4 bg-pink-500" />
                                                    <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1 h-4 bg-pink-500" />
                                                </div>
                                            </div>

                                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />

                                            {/* Scanning Line Animation */}
                                            <motion.div
                                                animate={{ top: ['10%', '90%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="absolute left-[10%] right-[10%] h-0.5 bg-pink-500 shadow-[0_0_15px_pink] z-10"
                                            />

                                            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-20 px-10">
                                                <button
                                                    onClick={captureAndVerify}
                                                    className="flex-1 py-5 neon-bg-pink text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                                                >
                                                    <Camera size={18} />
                                                    Analyze Face
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {scanLoading && (
                                        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-6">
                                            <div className="relative w-24 h-24">
                                                <div className="absolute inset-0 border-4 border-pink-500/10 rounded-full" />
                                                <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                                                <Scan className="absolute inset-0 m-auto text-pink-500 animate-pulse" size={32} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500 animate-pulse italic">Processing Scan...</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                                    <Loader2 className="animate-spin text-pink-500" size={48} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Initializing Video Feed...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* HUD Terminal Log */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-6">
                            <Target size={14} className="text-indigo-500" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Verification.Log</h3>
                        </div>
                        <div className="bg-black/40 glass-morphism border-white/5 rounded-[2rem] p-6 h-64 overflow-y-auto space-y-4 font-mono scrollbar-hide">
                            {history.length === 0 ? (
                                <div className="h-full flex items-center justify-center italic text-slate-800 text-[10px] font-bold uppercase tracking-[0.3em]">System Standby - No Activity</div>
                            ) : (
                                history.map((h, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={i}
                                        className="flex items-start gap-4 text-[10px] p-4 bg-white/[0.02] rounded-2xl border border-white/5"
                                    >
                                        <span className="text-slate-700">[{h.timestamp}]</span>
                                        <span className={h.success ? 'text-emerald-500' : 'text-rose-500'}>
                                            {h.success ? `>>> VERIFIED: ${h.name.toUpperCase()} (ID: ${h.studentId})` : `>>> FAILED: ${h.message.toUpperCase()}`}
                                        </span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Students List */}
                <div className="lg:col-span-7 space-y-10">
                    <div className="flex items-center justify-between px-6">
                        <div className="flex gap-10">
                            {['active', 'checked'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`text-[10px] font-black uppercase tracking-[0.5em] transition-all border-b-2 pb-2 italic ${activeTab === tab ? 'text-white border-indigo-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}
                                >
                                    {tab === 'active' ? 'Approved Students' : 'Exit History'}
                                </button>
                            ))}
                        </div>
                        <div className="hidden sm:flex items-center gap-3 bg-white/[0.02] px-6 py-3 rounded-2xl border border-white/5">
                            <Clock size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Shift: Active</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(n => <div key={n} className="h-28 bg-white/5 rounded-[2rem] border border-white/5 animate-pulse" />)}
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="glass-morphism rounded-[2.5rem] border-white/5 py-32 text-center opacity-40">
                                <Scan size={64} className="mx-auto text-slate-800 mb-6" strokeWidth={1} />
                                <h4 className="text-xs font-black text-slate-600 uppercase tracking-[0.5em] italic">No gatepasses found</h4>
                            </div>
                        ) : (
                            requests.map((req, idx) => (
                                <motion.div
                                    key={req._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group glass-morphism border-white/5 hover:border-indigo-500/30 rounded-[2.5rem] p-6 flex items-center justify-between transition-all relative overflow-hidden"
                                >
                                    <div className="flex items-center gap-8 relative z-10">
                                        <div className="w-20 h-20 rounded-[1.25rem] overflow-hidden border border-white/5 shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-500">
                                            <img src={req.student?.imageUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black tracking-tighter uppercase italic group-hover:text-indigo-400 transition-colors">{req.student?.name}</h4>
                                            <div className="flex items-center gap-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2">
                                                <span className="text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{req.student?.studentId}</span>
                                                <span className="text-slate-800">//</span>
                                                <span className="text-slate-600 italic font-medium">Out: {req.reason}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 relative z-10">
                                        {activeTab === 'checked' ? (
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-emerald-500 uppercase tracking-widest leading-none">Status: EXITED</p>
                                                    <p className="text-[10px] font-black text-slate-500 mt-2 uppercase">Time: {req.leftAt ? new Date(req.leftAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                    <ShieldCheck size={20} />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-lg font-black tracking-tighter italic leading-none">{req.time}</p>
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">ETA EXIT</p>
                                                </div>
                                                <div className="w-[1px] h-12 bg-white/5 hidden sm:block" />
                                                <button
                                                    onClick={() => markLeft(req._id)}
                                                    className="px-10 py-4 bg-indigo-600 hover:bg-black text-white hover:text-indigo-400 border border-transparent hover:border-indigo-500/50 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]"
                                                >
                                                    Confirm Exit
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    {/* Decorative HUD background item */}
                                    <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-indigo-600/5 blur-2xl group-hover:bg-indigo-600/10 transition-all" />
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default GuardDashboard;
