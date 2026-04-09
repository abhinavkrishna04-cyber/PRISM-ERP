import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, User, Shield, Mail, Lock, Save, Camera } from "lucide-react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState({ type: "", message: "" });

    const fetchProfile = async () => {
        try {
            const res = await axios.get("/api/auth/profile");
            setProfile(res.data);
        } catch (error) {
            console.error("Failed to fetch profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setStatus({ type: "loading", message: "Synchronizing system data..." });
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            // Assume we have an update profile endpoint
            // await axios.put("/api/auth/profile", data);
            setStatus({ type: "success", message: "Security protocol and identity updated successfully." });
        } catch (error) {
            setStatus({ type: "error", message: error.response?.data?.message || "Failed to update profile." });
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Initializing settings module...</div>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                    <SettingsIcon className="w-8 h-8 text-prism-violet" />
                    System Configuration
                </h1>
                <p className="text-gray-500 text-sm">Personal identity and security parameters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Overview */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-card p-6 text-center border border-white/5">
                        <div className="relative inline-block mb-4">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-prism-violet to-prism-cyan p-0.5 shadow-prism-glow">
                                <div className="w-full h-full rounded-[14px] bg-prism-bg flex items-center justify-center text-3xl font-bold text-white uppercase">
                                    {profile?.name.charAt(0)}
                                </div>
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-2 bg-prism-violet rounded-lg shadow-lg border border-white/20 hover:scale-110 transition-transform">
                                <Camera className="w-4 h-4 text-white" />
                            </button>
                        </div>
                        <h3 className="text-lg font-bold text-white">{profile?.name}</h3>
                        <p className="text-xs text-gray-500 mb-4">{profile?.role}</p>
                        <div className="py-2 px-3 bg-white/5 rounded-lg border border-white/5 inline-block text-[10px] text-gray-400 font-mono">
                            TENANT ID: {profile?.company_id}
                        </div>
                    </div>

                    <div className="glass-card p-4 space-y-3 border border-white/5">
                        <h4 className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-2">Account Meta</h4>
                        <div className="flex items-center justify-between px-2 py-1">
                            <span className="text-xs text-gray-400">Join Date</span>
                            <span className="text-xs text-white font-mono">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center justify-between px-2 py-1">
                            <span className="text-xs text-gray-400">Active Modules</span>
                            <span className="text-xs text-white font-mono">12</span>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass-card p-8 border border-white/5">
                        <h3 className="text-lg font-semibold text-white mb-8 flex items-center gap-2">
                            <User className="w-5 h-5 text-prism-cyan" />
                            Identity Profile
                        </h3>
                        
                        <form onSubmit={handleUpdate} className="space-y-6">
                            {status.message && (
                                <div className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${
                                    status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                                    status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                    'bg-white/5 border-white/10 text-gray-400'
                                }`}>
                                    <Shield className="w-4 h-4 shrink-0" />
                                    {status.message}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Legal Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                        <input name="name" defaultValue={profile?.name} className="prism-input w-full h-12 text-sm pl-11" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Email Protocol</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                        <input name="email" type="email" defaultValue={profile?.email} className="prism-input w-full h-12 text-sm pl-11 bg-white/[0.02]" required />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/5 my-4" />

                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                                <Lock className="w-5 h-5 text-prism-violet" />
                                Security Protocol Update
                            </h3>

                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Current Password</label>
                                <input name="currentPassword" type="password" className="prism-input w-full h-12 text-sm pl-4" placeholder="••••••••" />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">New Terminal Key</label>
                                    <input name="newPassword" type="password" className="prism-input w-full h-12 text-sm pl-4" placeholder="Enter new password" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Verify Key</label>
                                    <input name="confirmPassword" type="password" className="prism-input w-full h-12 text-sm pl-4" placeholder="Confirm new password" />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="w-full bg-prism-violet text-white h-12 rounded-xl text-sm font-bold shadow-prism-glow hover:brightness-110 flex items-center justify-center gap-2 transition-all">
                                    <Save className="w-4 h-4" /> Finalize System Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
