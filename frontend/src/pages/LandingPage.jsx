import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Users, ArrowRight, Shield, Lock, Bell, Zap, Monitor, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const LandingPage = () => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: <Cpu className="text-cyan-400" size={24} />,
            title: "AI Verification",
            description: "Advanced face recognition and document verification for maximum security."
        },
        {
            icon: <ShieldCheck className="text-indigo-400" size={24} />,
            title: "Smart Gate Pass",
            description: "Automated gate pass generation with QR code and real-time tracking."
        },
        {
            icon: <Users className="text-pink-400" size={24} />,
            title: "Campus Access",
            description: "Streamlined entry for students, staff, and visitors with instant notifications."
        }
    ];

    const stats = [
        { label: "Verification Speed", value: "< 2s", color: "text-cyan-400" },
        { label: "Accuracy Rate", value: "99.9%", color: "text-indigo-400" },
        { label: "Active Users", value: "5k+", color: "text-pink-400" },
    ];

    return (
        <div className="min-h-screen w-full bg-[#030305] overflow-hidden relative selection:bg-indigo-500/30">
            {/* Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-pink-600/10 blur-[150px] rounded-full" />
            <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-cyan-600/10 blur-[120px] rounded-full" />

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/50 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 neon-bg-indigo rounded-xl flex items-center justify-center">
                            <Shield className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white uppercase italic [word-spacing:0.5rem]">
  Automated <span className="text-indigo-500">AI</span> Smart Gate Pass System
</span>

                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/admin/login')}
                        className="flex items-center gap-2 neon-bg-indigo text-white px-8 py-2.5 rounded-full transition-all font-black text-xs uppercase tracking-widest"
                    >
                        Access Portal
                    </motion.button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-48 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center max-w-5xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-black uppercase tracking-[0.2em] mb-10 text-indigo-400">
                            <Zap size={14} className="fill-indigo-400" />
                            Security Protocol V2.4 Active
                        </div>

                        <h1 className="text-6xl md:text-9xl font-black leading-[0.85] mb-10 tracking-tighter text-white uppercase italic">
                            Next-Gen <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-pink-500 to-cyan-500">Security</span> <br />
                            <span className="text-4xl md:text-6xl opacity-40 font-black italic">Intelligence System</span>
                        </h1>

                        <p className="text-xl text-slate-400 mb-14 max-w-2xl leading-relaxed font-medium">
                            Revolutionizing institutional security with seamless <span className="text-indigo-400">AI-powered verification</span> and instant biometric gate passes.
                        </p>

                        <div className="flex flex-col md:flex-row items-center gap-6 mb-24">
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99, 102, 241, 0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/admin/login')}
                                className="px-12 py-5 neon-bg-indigo text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 transition-all"
                            >
                                Get Started
                                <ArrowRight size={20} />
                            </motion.button>
                        </div>

                        {/* Stats Section */}
                        <div className="grid grid-cols-3 gap-8 md:gap-20 mb-32 p-12 rounded-[2.5rem] glass-morphism border-white/5 w-full max-w-4xl">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className={`text-4xl md:text-5xl font-black tracking-tighter mb-2 ${stat.color}`}>{stat.value}</span>
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -10, borderColor: "rgba(99, 102, 241, 0.3)" }}
                                    className="p-10 rounded-[2.5rem] glass-morphism border-white/5 group transition-all"
                                >
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{feature.title}</h3>
                                    <p className="text-slate-500 leading-relaxed font-medium">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </main>

            <footer className="py-20 text-center border-t border-white/5 mt-20 opacity-40">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">System Core: 2026.V4.0 // SmartGate AI</p>
            </footer>
        </div>
    );
};

export default LandingPage;
