import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, Save, Lock, Unlock, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import Modal from '../components/Modal';

export default function Roles() {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState("");

    const fetchRoles = async () => {
        try {
            const res = await axios.get('/api/roles');
            setRoles(res.data);
            if (res.data.length > 0 && !selectedRole) {
                setSelectedRole(res.data[0]);
            }
        } catch (error) {
            console.error("Failed to fetch roles", error);
        }
    };

    const fetchRolePermissions = async (roleName) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/roles/${roleName}`);
            setPermissions(res.data);
        } catch (error) {
            console.error("Failed to fetch permissions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        if (selectedRole) {
            fetchRolePermissions(selectedRole);
        }
    }, [selectedRole]);

    const togglePermission = async (module_id, action) => {
        const perm = permissions.find(p => p.module_id === module_id);
        if (!perm) return;

        const updatedPerm = {
            ...perm,
            [`can_${action}`]: !perm[`can_${action}`]
        };

        // Aggressively update UI
        setPermissions(prev => prev.map(p => p.module_id === module_id ? updatedPerm : p));

        try {
            await axios.put(`/api/roles/${selectedRole}`, updatedPerm);
        } catch (error) {
            console.error("Failed to update permission", error);
            // Rollback UI on error
            setPermissions(prev => prev.map(p => p.module_id === module_id ? perm : p));
        }
    };

    const handleCreateRole = async () => {
        if (!newRoleName) return;
        try {
            await axios.post('/api/roles', { roleName: newRoleName });
            await fetchRoles();
            setSelectedRole(newRoleName);
            setIsCreateModalOpen(false);
            setNewRoleName("");
        } catch (error) {
            alert("Failed to create role");
        }
    };

    const actionColumns = [
        { key: 'view', label: 'View', icon: Unlock },
        { key: 'add', label: 'Add', icon: Plus },
        { key: 'edit', label: 'Edit', icon: Save },
        { key: 'delete', label: 'Delete', icon: ShieldAlert },
        { key: 'copy', label: 'Copy', icon: ShieldCheck },
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-prism-cyan" />
                        Access Control Matrix
                    </h1>
                    <p className="text-gray-500 text-sm">Define granular operational boundaries per organizational role</p>
                </div>

                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                    {roles.map(role => (
                        <button
                            key={role}
                            onClick={() => setSelectedRole(role)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedRole === role 
                                ? "bg-prism-violet text-white shadow-prism-glow" 
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            {role}
                        </button>
                    ))}
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="p-2 text-gray-500 hover:text-prism-cyan transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="glass-card overflow-hidden border border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/5">
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Module Identity</th>
                            {actionColumns.map(col => (
                                <th key={col.key} className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-center">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {permissions.map((modulePerm) => (
                            <tr key={modulePerm.module_id} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-5">
                                    <span className="text-sm font-semibold text-white">{modulePerm.module}</span>
                                </td>
                                {actionColumns.map(action => (
                                    <td key={action.key} className="px-6 py-5 text-center">
                                        <button 
                                            onClick={() => togglePermission(modulePerm.module_id, action.key)}
                                            disabled={selectedRole === 'Admin'}
                                            className={`w-12 h-6 rounded-full transition-all relative ${
                                                modulePerm[`can_${action.key}`] 
                                                ? "bg-prism-cyan/20 ring-1 ring-prism-cyan/50" 
                                                : "bg-white/5 ring-1 ring-white/10"
                                            } ${selectedRole === 'Admin' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                                                modulePerm[`can_${action.key}`]
                                                ? "right-1 bg-prism-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                                                : "left-1 bg-gray-600"
                                            }`} />
                                        </button>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && (
                    <div className="p-12 text-center text-gray-500 animate-pulse">
                        Synchronizing permissions matrix...
                    </div>
                )}
            </div>

            <Modal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                title="Establish New Organizational Role"
                footer={
                    <button 
                        onClick={handleCreateRole}
                        disabled={!newRoleName}
                        className="bg-prism-violet text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                    >
                        Create Role
                    </button>
                }
            >
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Role Designation</label>
                        <input 
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            className="prism-input w-full h-11 text-sm pl-4" 
                            placeholder="e.g. Supervisor, Auditor" 
                            autoFocus
                        />
                    </div>
                    <p className="text-xs text-gray-500 italic">
                        The new role will be initialized with restricted (view-only) access to all modules.
                    </p>
                </div>
            </Modal>
        </motion.div>
    );
}
