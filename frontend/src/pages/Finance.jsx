import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CircleDollarSign, Plus, Download, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import PermissionGate from '../components/PermissionGate';
import { useAuth } from '../context/AuthContext';

export default function Finance() {
    const { hasPermission } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formError, setFormError] = useState("");

    const columns = [
        { key: 'date', label: 'Date', render: (item) => new Date(item.date).toLocaleDateString() },
        { key: 'category', label: 'Category', render: (item) => (
            <StatusBadge variant="blue">{item.category}</StatusBadge>
        )},
        { key: 'type', label: 'Classification', render: (item) => (
            <div className="flex items-center gap-2">
                {item.type === 'Income' ? 
                    <TrendingUp className="w-4 h-4 text-green-400" /> : 
                    <TrendingDown className="w-4 h-4 text-red-400" />
                }
                <span className={item.type === 'Income' ? "text-green-400" : "text-red-400 font-medium"}>
                    {item.type}
                </span>
            </div>
        )},
        { key: 'amount', label: 'Magnitude', render: (item) => (
            <span className="font-mono font-semibold text-white">
                ${Number(item.amount).toLocaleString()}
            </span>
        )},
        { key: 'description', label: 'Description' },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/finance');
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch finance records", error);
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
        const recordData = Object.fromEntries(formData.entries());

        try {
            if (selectedRecord && selectedRecord.id) {
                await axios.put(`/api/finance/${selectedRecord.id}`, recordData);
            } else {
                await axios.post('/api/finance', recordData);
            }
            fetchData();
            setIsModalOpen(false);
        } catch (error) {
            setFormError(error.response?.data?.message || "Failed to save record");
        }
    };

    const handleDelete = async (record) => {
        if (window.confirm(`Are you sure you want to delete this ${record.type} record?`)) {
            try {
                await axios.delete(`/api/finance/${record.id}`);
                fetchData();
            } catch (error) {
                alert("Failed to delete record");
            }
        }
    };

    const permissions = {
        can_view: hasPermission('Finance', 'view'),
        can_add: hasPermission('Finance', 'add'),
        can_edit: hasPermission('Finance', 'edit'),
        can_delete: hasPermission('Finance', 'delete'),
        can_copy: hasPermission('Finance', 'copy'),
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
                        <CircleDollarSign className="w-8 h-8 text-prism-violet" />
                        Financial Ledger
                    </h1>
                    <p className="text-gray-500 text-sm">Revenue monitoring and expense classification</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="glass-card px-4 h-10 text-sm text-gray-400 flex items-center gap-2 hover:bg-white/5 transition-colors">
                        <Download className="w-4 h-4" /> Export Ledger
                    </button>
                    <PermissionGate module="Finance" action="add">
                        <button 
                            onClick={() => { setSelectedRecord(null); setIsModalOpen(true); }}
                            className="bg-prism-violet text-white px-4 h-10 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-prism-glow hover:brightness-110 transition-all"
                        >
                            <Plus className="w-4 h-4" /> New Transaction
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
                    onEdit={(record) => { setSelectedRecord(record); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    onCopy={(record) => { 
                        setSelectedRecord({ ...record, id: null }); 
                        setIsModalOpen(true); 
                    }}
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={selectedRecord?.id ? "Edit Transaction Data" : "Log New Financial Entry"}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">
                            Cancel
                        </button>
                        <button form="finance-form" className="bg-prism-violet text-white px-6 py-2 rounded-lg text-sm font-semibold">
                            {selectedRecord?.id ? "Update Ledger" : "Finalize Log"}
                        </button>
                    </>
                }
            >
                <form id="finance-form" onSubmit={handleSave} className="space-y-4">
                    {formError && <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded">{formError}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Date</label>
                            <input name="date" type="date" defaultValue={selectedRecord?.date?.split('T')[0] || new Date().toISOString().split('T')[0]} className="prism-input w-full h-11 text-sm pl-4 pr-4 bg-prism-bg" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Classification</label>
                            <select name="type" defaultValue={selectedRecord?.type || "Expense"} className="prism-input w-full h-11 text-sm pl-4 pr-4 bg-prism-bg">
                                <option>Income</option>
                                <option>Expense</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Magnitude ($)</label>
                            <input name="amount" type="number" step="0.01" defaultValue={selectedRecord?.amount} className="prism-input w-full h-11 text-sm pl-4" required placeholder="0.00" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Category</label>
                            <input name="category" defaultValue={selectedRecord?.category} className="prism-input w-full h-11 text-sm pl-4" required placeholder="Operations, Sales, etc." />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Description / Notes</label>
                        <textarea name="description" defaultValue={selectedRecord?.description} className="prism-input w-full p-4 h-24 text-sm resize-none bg-prism-bg" placeholder="Additional details..."></textarea>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}
