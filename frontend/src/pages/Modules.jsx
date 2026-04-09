import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Puzzle, CheckCircle2, XCircle, Info, Settings } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Modules() {
    const { user } = useAuth();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchModules = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/modules');
            setModules(res.data);
        } catch (error) {
            console.error("Failed to fetch modules", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, []);

    const handleToggle = async (id, currentStatus) => {
        if (user?.role !== 'Admin') return;
        try {
            await axios.put(`/api/modules/${id}/toggle`, { is_active: !currentStatus });
            setModules(prev => prev.map(m => m.id === id ? { ...m, is_active: !currentStatus } : m));
        } catch (error) {
            alert("Failed to toggle module");
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <Puzzle className="w-8 h-8 text-prism-violet shadow-prism-glow" />
                        Modular Orchestration
                    </h1>
                    <p className="text-gray-500 text-sm">Control the operational scope of the P.R.I.S.M. ecosystem</p>
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] text-gray-500 font-mono">
                    ACTIVE MODULES: {modules.filter(m => m.is_active).length} / {modules.length}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card h-48 animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {modules.map((module, idx) => (
                        <motion.div 
                            key={module.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`glass-card p-6 border transition-all duration-300 flex flex-col justify-between ${
                                module.is_active 
                                ? "border-white/10 bg-white/5" 
                                : "border-red-500/20 bg-red-500/[0.02] grayscale opacity-70"
                            }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <Settings className={`w-6 h-6 ${module.is_active ? 'text-prism-cyan' : 'text-gray-600'}`} />
                                </div>
                                <div className="flex items-center gap-2">
                                    {module.is_active ? (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                                            <CheckCircle2 className="w-3 h-3" /> ONLINE
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-full border border-red-400/20">
                                            <XCircle className="w-3 h-3" /> OFFLINE
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">{module.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10">{module.description}</p>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                {user?.role === 'Admin' && (
                                    <button 
                                        onClick={() => handleToggle(module.id, module.is_active)}
                                        className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${
                                            module.is_active 
                                            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30" 
                                            : "bg-green-400/20 text-green-400 hover:bg-green-400/30 border border-green-400/30"
                                        }`}
                                    >
                                        {module.is_active ? "DEACTIVATE MODULE" : "ACTIVATE MODULE"}
                                    </button>
                                )}
                                <button className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">
                                    <Info className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
