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
            icon: <Cpu className="text-indigo-400" size={24} />,
            title: "AI Verification",
            description: "Advanced face recognition and document verification for maximum security."
        },
        {
            icon: <ShieldCheck className="text-emerald-400" size={24} />,
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
        { label: "Verification Speed", value: "< 2s" },
        { label: "Accuracy Rate", value: "99.9%" },
        { label: "Active Users", value: "5k+" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen w-full bg-[#0c0c14] overflow-hidden relative selection:bg-indigo-500/30">
            {/* Background Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/5 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-pink-600/5 blur-[150px] rounded-full" />
            <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full shadow-2xl" />

            {/* Navigation */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0c0c14]/80 backdrop-blur-xl border-b border-white/10 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <Shield className="text-white" size={24} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white">SmartGate</span>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/admin/login')}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-full shadow-lg shadow-indigo-600/20 transition-all font-bold"
                    >
                        Login / Signup
                    </motion.button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col items-center text-center max-w-5xl mx-auto"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-semibold mb-10"
                        >
                            <Zap size={16} className="fill-indigo-400" />
                            <span className="tracking-wide uppercase text-[10px]">Next-Gen Security Infrastructure</span>
                        </motion.div>

                        <motion.h1
                            variants={itemVariants}
                            className="text-5xl md:text-8xl font-bold leading-[0.95] mb-10 bg-gradient-to-b from-white via-white to-white/30 bg-clip-text text-transparent px-4"
                        >
                            Automated AI Smart Gate Pass and <br />
                            <span className="gradient-text">Identity Verification System</span> <br />
                            <span className="text-3xl md:text-5xl opacity-80 font-medium tracking-tight mt-4 block">for Secure Campus Access</span>
                        </motion.h1>

                        <motion.p
                            variants={itemVariants}
                            className="text-xl text-slate-400 mb-14 max-w-3xl leading-relaxed"
                        >
                            Revolutionizing institutional security with seamless AI-powered verification,
                            instant digital gate passes, and comprehensive real-time campus monitoring.
                        </motion.p>

                        <motion.div
                            variants={itemVariants}
                            className="flex flex-col items-center gap-5 mb-24"
                        >
                            <button
                                onClick={() => navigate('/admin/login')}
                                className="px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(79,70,229,0.3)] transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Get Started Now
                                <ArrowRight size={22} />
                            </button>
                        </motion.div>

                        {/* Stats Section */}
                        <motion.div
                            variants={itemVariants}
                            className="grid grid-cols-3 gap-8 md:gap-20 mb-32 p-8 rounded-3xl bg-white/[0.02] border border-white/5"
                        >
                            {stats.map((stat, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <span className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</span>
                                    <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">{stat.label}</span>
                                </div>
                            ))}
                        </motion.div>

                        {/* Features Grid */}
                        <motion.div
                            variants={containerVariants}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left"
                        >
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    variants={itemVariants}
                                    whileHover={{ y: -10 }}
                                    className="glass-card p-10 group transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <CheckCircle2 size={60} />
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-inner">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-4">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed text-lg">{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </main>

            {/* Footer-like bottom area */}
            <div className="py-20 text-center border-t border-white/5 mt-20">
                <p className="text-slate-500 text-sm font-medium">© 2026 SmartGate Security Systems. All Rights Reserved.</p>
            </div>
        </div>
    );
};

export default LandingPage;
