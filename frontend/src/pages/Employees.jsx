import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Download, UserCheck, Briefcase } from 'lucide-react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import PermissionGate from '../components/PermissionGate';
import { useAuth } from '../context/AuthContext';

export default function Employees() {
    const { hasPermission } = useAuth();
    const [data, setData] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formError, setFormError] = useState("");

    const columns = [
        { key: 'name', label: 'Full Identity', render: (item) => (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-prism-violet/20 flex items-center justify-center text-prism-violet font-bold text-xs border border-prism-violet/30">
                    {item.name.charAt(0)}
                </div>
                <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-[10px] text-gray-500">{item.email}</p>
                </div>
            </div>
        )},
        { key: 'role', label: 'Global Role', render: (item) => (
            <StatusBadge variant={item.role === 'Admin' ? 'cyan' : 'blue'}>{item.role}</StatusBadge>
        )},
        { key: 'department', label: 'Department' },
        { key: 'position', label: 'Position' },
        { key: 'join_date', label: 'Enrolled On', render: (item) => new Date(item.join_date).toLocaleDateString() },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const [empRes, userRes] = await Promise.all([
                axios.get('/api/employees'),
                axios.get('/api/auth/profile') // This only gets current user. Need to fetch company users.
            ]);
            setData(empRes.data);
            
            // To add a new employee, we need to pick from active users in the company
            // Let's assume we have an endpoint for that or we just use a simplified add for now
            const companyUsers = await axios.get('/api/auth/pending-users'); // Actually we need active users
            // For now, let's keep it simple until we have a proper "List Active Company Users" endpoint
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setFormError("");
        const formData = new FormData(e.target);
        const employeeData = Object.fromEntries(formData.entries());

        try {
            if (selectedEmployee && selectedEmployee.id) {
                await axios.put(`/api/employees/${selectedEmployee.id}`, employeeData);
            } else {
                // For adding, we'd need a userId. For demo, we just pass what we have.
                await axios.post('/api/employees', employeeData);
            }
            fetchData();
            setIsModalOpen(false);
        } catch (error) {
            setFormError(error.response?.data?.message || "Failed to save employee record");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to remove ${item.name} from the staff directory?`)) {
            try {
                await axios.delete(`/api/employees/${item.id}`);
                fetchData();
            } catch (error) {
                alert("Failed to delete record");
            }
        }
    };

    const permissions = {
        can_view: hasPermission('Employees', 'view'),
        can_add: hasPermission('Employees', 'add'),
        can_edit: hasPermission('Employees', 'edit'),
        can_delete: hasPermission('Employees', 'delete'),
        can_copy: hasPermission('Employees', 'copy'),
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-6 flex flex-col h-[calc(100vh-140px)]"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <Users className="w-8 h-8 text-prism-blue" />
                        Staff Directory
                    </h1>
                    <p className="text-gray-500 text-sm">Personnel hierarchy and organizational mapping</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="glass-card px-4 h-10 text-sm text-gray-400 flex items-center gap-2 hover:bg-white/5 transition-colors">
                        <Download className="w-4 h-4" /> Export Directory
                    </button>
                    <PermissionGate module="Employees" action="add">
                        <button 
                            onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
                            className="bg-prism-violet text-white px-4 h-10 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-prism-glow hover:brightness-110 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Recruit Personnel
                        </button>
                    </PermissionGate>
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-prism-bg rounded-2xl border border-white/5 p-6 glass-card overflow-hidden">
                <DataTable 
                    columns={columns} 
                    data={data} 
                    loading={loading}
                    permissions={permissions}
                    onEdit={(item) => { setSelectedEmployee(item); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={selectedEmployee?.id ? "Modify Personnel Record" : "Enlist New Personnel"}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">
                            Cancel
                        </button>
                        <button form="employee-form" className="bg-prism-violet text-white px-6 py-2 rounded-lg text-sm font-semibold">
                            {selectedEmployee?.id ? "Update Directory" : "Authorize Recruitment"}
                        </button>
                    </>
                }
            >
                <form id="employee-form" onSubmit={handleSave} className="space-y-4">
                    {formError && <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded">{formError}</p>}
                    
                    {!selectedEmployee?.id && (
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Select User Identity ID</label>
                            <input name="userId" type="number" className="prism-input w-full h-11 text-sm pl-4" required placeholder="User System ID (Integer)" />
                            <p className="text-[10px] text-gray-600 italic">User must be pre-registered and active in your organization.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Department</label>
                            <input name="department" defaultValue={selectedEmployee?.department} className="prism-input w-full h-11 text-sm pl-4 pr-4 bg-prism-bg" required placeholder="Engineering, Sales..." />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Position</label>
                            <input name="position" defaultValue={selectedEmployee?.position} className="prism-input w-full h-11 text-sm pl-4 pr-4 bg-prism-bg" required placeholder="Senior Developer, etc." />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Enrollment Date</label>
                            <input name="join_date" type="date" defaultValue={selectedEmployee?.join_date?.split('T')[0] || new Date().toISOString().split('T')[0]} className="prism-input w-full h-11 text-sm pl-4" required />
                        </div>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}
