import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { motion } from "framer-motion";
import { Activity, CircleDollarSign, Package, ShieldAlert, Clock } from "lucide-react";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, chartRes, logRes] = await Promise.all([
                axios.get('/api/reports/dashboard'),
                axios.get('/api/reports/financials'),
                axios.get('/api/logs')
            ]);
            setStats(statsRes.data);
            setChartData(chartRes.data);
            setLogs(logRes.data.slice(0, 5));
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const performanceData = {
        labels: chartData?.monthly.map(m => m.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Revenue',
                data: chartData?.monthly.map(m => m.income) || [0, 0, 0, 0, 0, 0],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Expenses',
                data: chartData?.monthly.map(m => m.expense) || [0, 0, 0, 0, 0, 0],
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: { color: '#94a3b8', font: { size: 10 } }
            },
            tooltip: {
                backgroundColor: '#000000CC',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#64748b' }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#64748b' }
            }
        }
    };

    const statCards = [
        { label: "Total Revenue", value: `$${Number(stats?.revenue || 0).toLocaleString()}`, icon: CircleDollarSign, color: "text-prism-cyan" },
        { label: "Inventory Units", value: stats?.inventoryCount || "0", icon: Package, color: "text-prism-violet" },
        { label: "Staff Registry", value: stats?.employeeCount || "0", icon: Activity, color: "text-prism-blue" },
        { label: "Threat Alerts", value: stats?.securityAlerts || "0", icon: ShieldAlert, color: "text-red-400" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Operational Command</h1>
                    <p className="text-gray-500 text-sm">Real-time enterprise orchestration and intelligence</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono bg-white/5 px-3 py-1 rounded-full border border-white/5">
                    <Clock className="w-3 h-3" />
                    SYNCED: {new Date().toLocaleTimeString()}
                </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={stat.label} 
                        className="glass-card p-6 flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div>
                            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-white mt-2">
                                {loading ? "..." : stat.value}
                            </h3>
                        </div>
                        <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} border border-white/5 shadow-inner`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                {/* Chart Section */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 glass-card p-6 h-[400px] border border-white/5 flex flex-col"
                >
                    <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-widest text-gray-500">System Performance Flow</h3>
                    <div className="flex-1">
                        <Line data={performanceData} options={options} />
                    </div>
                </motion.div>

                {/* Recent Security Logs */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-card p-6 flex flex-col border border-white/5"
                >
                    <h3 className="text-sm font-semibold text-white mb-6 uppercase tracking-widest text-gray-500">Live Surveillance</h3>
                    <div className="flex-1 space-y-4">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => <div key={i} className="h-10 bg-white/5 animate-pulse rounded" />)
                        ) : logs.length > 0 ? (
                            logs.map((log) => (
                                <div key={log.id} className="flex items-center gap-3 pb-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] -mx-2 px-2 transition-colors rounded-lg">
                                    <div className={`w-2 h-2 rounded-full ${log.action.includes('DELETE') ? 'bg-red-500' : 'bg-prism-cyan'}`}></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-gray-200 font-medium truncate">{log.action} in {log.module}</p>
                                        <p className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-600 font-mono">{log.ip_address}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-10">No recent activity detected.</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
