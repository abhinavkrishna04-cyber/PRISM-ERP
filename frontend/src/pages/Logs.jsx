import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Cpu, Globe, Clock, User } from 'lucide-react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

export default function Logs() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: 'timestamp', label: 'Event Time', render: (item) => (
            <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-3 h-3" />
                {new Date(item.timestamp).toLocaleString()}
            </div>
        )},
        { key: 'user_name', label: 'Principal', render: (item) => (
            <div className="flex items-center gap-2">
                <User className="w-3 h-3 text-prism-violet" />
                <span className="text-white font-medium">{item.user_name || 'System'}</span>
            </div>
        )},
        { key: 'module', label: 'Source Module', render: (item) => (
            <div className="flex items-center gap-2">
                <Cpu className="w-3 h-3 text-prism-cyan" />
                <span className="text-gray-300">{item.module}</span>
            </div>
        )},
        { key: 'action', label: 'Action Protocol', render: (item) => (
            <StatusBadge variant={item.action.includes('DELETE') ? 'red' : item.action.includes('CREATE') ? 'green' : 'gray'}>
                {item.action}
            </StatusBadge>
        )},
        { key: 'ip_address', label: 'Network Origin', render: (item) => (
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
                <Globe className="w-3 h-3" />
                {item.ip_address}
            </div>
        )},
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/logs');
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-prism-cyan shadow-prism-glow" />
                        DLP Security Protocol Logs
                    </h1>
                    <p className="text-gray-500 text-sm">Real-time surveillance of system operations and data flow</p>
                </div>

                <div className="flex items-center gap-2 px-4 py-2 glass-card border-green-500/20 text-green-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" /> MONITORING ACTIVE
                </div>
            </div>

            <div className="glass-card p-6 border border-white/5">
                <DataTable 
                    columns={columns} 
                    data={data} 
                    loading={loading}
                    searchPlaceholder="Trace specific Protocol ID or IP..."
                />
            </div>
        </motion.div>
    );
}
