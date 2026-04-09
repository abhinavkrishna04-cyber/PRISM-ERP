import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { UserCheck, UserX, Clock, ShieldCheck, Search, Loader2 } from "lucide-react";

export default function UserApproval() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actioningId, setActioningId] = useState(null);

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    const fetchPendingUsers = async () => {
        try {
            const res = await axios.get("/api/auth/pending-users");
            setPendingUsers(res.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch pending operators.");
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setActioningId(id);
        try {
            await axios.put(`/api/auth/approve-user/${id}`);
            setPendingUsers(pendingUsers.filter(u => u.id !== id));
        } catch (err) {
            setError("Failed to approve operator.");
        }
        setActioningId(null);
    };

    if (loading) return (
        <div className="flex h-96 items-center justify-center">
            <Loader2 className="w-10 h-10 text-prism-cyan animate-spin" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        Operator Approvals <ShieldCheck className="text-prism-cyan w-8 h-8" />
                    </h1>
                    <p className="text-gray-400 mt-1">Review and authorize pending personnel enrollment requests.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-prism-cyan transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search identities..." 
                        className="prism-input pl-10 w-64 h-11"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-sm">
                    {error}
                </div>
            )}

            <div className="glass-card overflow-hidden border border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Operator</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Clearance Email</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Submission Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence mode="popLayout">
                                {pendingUsers.map((user) => (
                                    <motion.tr 
                                        key={user.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="hover:bg-white/[0.02] transition-colors"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-prism-violet/40 to-prism-cyan/40 flex items-center justify-center border border-white/10 text-white font-bold text-sm">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="text-gray-200 font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-gray-400 text-sm font-mono">{user.email}</td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-prism-violet/10 text-prism-violet border border-prism-violet/20">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-gray-400 text-sm flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleApprove(user.id)}
                                                    disabled={actioningId === user.id}
                                                    className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/20 transition-all flex items-center gap-2 font-bold text-xs uppercase"
                                                >
                                                    {actioningId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                                                    Authorize
                                                </button>
                                                <button className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all flex items-center gap-2 font-bold text-xs uppercase">
                                                    <UserX className="w-4 h-4" />
                                                    Deny
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
                
                {pendingUsers.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-white font-bold text-lg">Clearance Queue Empty</h3>
                        <p className="text-gray-500 max-w-sm">No new personnel enrollment requests at this time. All system access is currently accounted for.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
