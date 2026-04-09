import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCog, ShieldCheck, Mail, Calendar, UserCheck } from 'lucide-react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [userRes, roleRes] = await Promise.all([
                axios.get('/api/auth/users'),
                axios.get('/api/roles')
            ]);
            setUsers(userRes.data);
            setRoles(roleRes.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRoleUpdate = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const { role } = Object.fromEntries(formData.entries());

        try {
            await axios.put(`/api/auth/users/${selectedUser.id}/role`, { role });
            fetchData();
            setIsModalOpen(false);
        } catch (error) {
            alert("Failed to update user role");
        }
    };

    const columns = [
        { key: 'name', label: 'Authorized Identity', render: (item) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-prism-cyan/20 flex items-center justify-center text-prism-cyan font-bold text-xs">
                    {item.name.charAt(0)}
                </div>
                <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                        <Mail className="w-3 h-3" /> {item.email}
                    </div>
                </div>
            </div>
        )},
        { key: 'role', label: 'Modular Role', render: (item) => (
            <StatusBadge variant={item.role === 'Admin' ? 'cyan' : 'blue'}>
                {item.role}
            </StatusBadge>
        )},
        { key: 'status', label: 'Security State', render: (item) => (
            <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-xs text-gray-400 capitalize">{item.status}</span>
            </div>
        )},
        { key: 'created_at', label: 'Enrolled', render: (item) => (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()}
            </div>
        )},
    ];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <UserCog className="w-8 h-8 text-prism-violet" />
                        Identity Management
                    </h1>
                    <p className="text-gray-500 text-sm">Staff authorization and role mapping</p>
                </div>
            </div>

            <div className="glass-card p-6 border border-white/5">
                <DataTable 
                    columns={columns} 
                    data={users} 
                    loading={loading}
                    onEdit={(user) => { setSelectedUser(user); setIsModalOpen(true); }}
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title="Reassign Operational Role"
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                            Cancel
                        </button>
                        <button form="role-form" className="bg-prism-violet text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-prism-glow transition-all hover:brightness-110">
                            Save Changes
                        </button>
                    </>
                }
            >
                {selectedUser && (
                    <form id="role-form" onSubmit={handleRoleUpdate} className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-12 h-12 rounded-full bg-prism-violet/20 flex items-center justify-center text-prism-violet font-bold text-lg">
                                {selectedUser.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="text-white font-semibold">{selectedUser.name}</h4>
                                <p className="text-xs text-gray-500">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3" /> Operational Role Assignment
                            </label>
                            <select 
                                name="role" 
                                defaultValue={selectedUser.role} 
                                className="prism-input w-full h-12 text-sm pl-4 pr-10 bg-prism-bg cursor-pointer"
                            >
                                {roles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-gray-600 italic mt-2">
                                Role permissions can be configured in the Roles & Permissions matrix.
                            </p>
                        </div>
                    </form>
                )}
            </Modal>
        </motion.div>
    );
}
