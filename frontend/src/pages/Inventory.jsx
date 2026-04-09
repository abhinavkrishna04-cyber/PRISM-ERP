import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, Filter, Download } from 'lucide-react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import PermissionGate from '../components/PermissionGate';
import { useAuth } from '../context/AuthContext';

export default function Inventory() {
    const { hasPermission } = useAuth();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formError, setFormError] = useState("");

    const columns = [
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Product Name' },
        { key: 'category', label: 'Category', render: (item) => (
            <StatusBadge variant="violet">{item.category}</StatusBadge>
        )},
        { key: 'quantity', label: 'In Stock', render: (item) => (
            <span className={item.quantity < 20 ? "text-red-400 font-bold" : ""}>
                {item.quantity} units
            </span>
        )},
        { key: 'price', label: 'Price (Unit)', render: (item) => `$${Number(item.price).toLocaleString()}` },
        { key: 'last_updated', label: 'Last Sync', render: (item) => new Date(item.last_updated).toLocaleDateString() },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/inventory');
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
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
        const itemData = Object.fromEntries(formData.entries());

        try {
            if (selectedItem) {
                await axios.put(`/api/inventory/${selectedItem.id}`, itemData);
            } else {
                await axios.post('/api/inventory', itemData);
            }
            fetchData();
            setIsModalOpen(false);
        } catch (error) {
            setFormError(error.response?.data?.message || "Failed to save item");
        }
    };

    const handleDelete = async (item) => {
        if (window.confirm(`Are you sure you want to remove ${item.name}?`)) {
            try {
                await axios.delete(`/api/inventory/${item.id}`);
                fetchData();
            } catch (error) {
                alert("Failed to delete item");
            }
        }
    };

    const permissions = {
        can_view: hasPermission('Inventory', 'view'),
        can_add: hasPermission('Inventory', 'add'),
        can_edit: hasPermission('Inventory', 'edit'),
        can_delete: hasPermission('Inventory', 'delete'),
        can_copy: hasPermission('Inventory', 'copy'),
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
                        <Package className="w-8 h-8 text-prism-cyan" />
                        Component Inventory
                    </h1>
                    <p className="text-gray-500 text-sm">Real-time stock tracking and SKU management</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="glass-card px-4 h-10 text-sm text-gray-400 flex items-center gap-2 hover:bg-white/5 transition-colors">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <PermissionGate module="Inventory" action="add">
                        <button 
                            onClick={() => { setSelectedItem(null); setIsModalOpen(true); }}
                            className="bg-prism-violet text-white px-4 h-10 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-prism-glow hover:brightness-110 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Add Component
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
                    onEdit={(item) => { setSelectedItem(item); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    onCopy={(item) => { 
                        setSelectedItem({ ...item, id: null, sku: `${item.sku}-COPY` }); 
                        setIsModalOpen(true); 
                    }}
                />
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                title={selectedItem?.id ? "Modify Lifecycle Record" : "Enroll New Component"}
                footer={
                    <>
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 border border-white/10 rounded-lg hover:bg-white/5">
                            Cancel
                        </button>
                        <button form="inventory-form" className="bg-prism-violet text-white px-6 py-2 rounded-lg text-sm font-semibold">
                            {selectedItem?.id ? "Update System" : "Finalize Enrollment"}
                        </button>
                    </>
                }
            >
                <form id="inventory-form" onSubmit={handleSave} className="space-y-4">
                    {formError && <p className="text-red-400 text-xs bg-red-400/10 p-2 rounded">{formError}</p>}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">SKU Identity</label>
                            <input name="sku" defaultValue={selectedItem?.sku} className="prism-input w-full h-11 text-sm pl-4" required placeholder="PRM-001" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Category</label>
                            <select name="category" defaultValue={selectedItem?.category} className="prism-input w-full h-11 text-sm pl-4 pr-4 bg-prism-bg">
                                <option>Hardware</option>
                                <option>Networking</option>
                                <option>Storage</option>
                                <option>Security</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Module Name</label>
                        <input name="name" defaultValue={selectedItem?.name} className="prism-input w-full h-11 text-sm pl-4" required placeholder="Quantum Processor v2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Quantity</label>
                            <input name="quantity" type="number" defaultValue={selectedItem?.quantity} className="prism-input w-full h-11 text-sm pl-4" required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 uppercase font-bold ml-1">Unit Valuation ($)</label>
                            <input name="price" type="number" step="0.01" defaultValue={selectedItem?.price} className="prism-input w-full h-11 text-sm pl-4" required />
                        </div>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}
