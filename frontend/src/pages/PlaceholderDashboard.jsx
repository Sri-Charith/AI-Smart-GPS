export default function PlaceholderDashboard({ title }) {
    return (
        <div className="min-h-screen bg-[#0c0c14] flex items-center justify-center text-white p-10">
            <div className="glass-card p-20 text-center">
                <h1 className="text-5xl font-bold gradient-text mb-4">{title}</h1>
                <p className="text-slate-400 text-xl font-medium">Dashboard coming soon...</p>
                <button
                    onClick={() => { localStorage.clear(); window.location.href = '/admin/login'; }}
                    className="mt-10 bg-white/5 border border-white/10 px-8 py-3 rounded-xl hover:bg-white/10 transition-all font-bold"
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
}
