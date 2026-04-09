import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, TrendingUp, PieChart, BarChart3, Calendar } from 'lucide-react';
import axios from 'axios';
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    Title, 
    Tooltip, 
    Legend, 
    ArcElement 
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    BarElement,
    ArcElement,
    Title, 
    Tooltip, 
    Legend
);

export default function Reports() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/reports/financials');
            setData(res.data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const lineChartData = {
        labels: data?.monthly.map(m => m.month) || [],
        datasets: [
            {
                label: 'Income',
                data: data?.monthly.map(m => m.income) || [],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Expense',
                data: data?.monthly.map(m => m.expense) || [],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
            }
        ]
    };

    const pieChartData = {
        labels: data?.categories.map(c => c.category) || [],
        datasets: [{
            data: data?.categories.map(c => c.total) || [],
            backgroundColor: [
                '#8b5cf6', '#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'
            ],
            borderWidth: 0,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: { color: '#9ca3af', font: { size: 10 }, usePointStyle: true }
            },
            tooltip: {
                backgroundColor: '#000000CC',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#6b7280' } },
            y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#6b7280' } }
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-prism-cyan" />
                        Executive Analytics
                    </h1>
                    <p className="text-gray-500 text-sm">Strategic data aggregation and financial visualization</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="glass-card px-4 h-10 text-sm text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Last 6 Months
                    </button>
                    <button className="bg-prism-violet text-white px-4 h-10 rounded-lg text-sm font-semibold flex items-center gap-2">
                        <Download className="w-4 h-4" /> Detailed Export
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass-card h-80 animate-pulse bg-white/5" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Financial Performance Line Chart */}
                    <div className="glass-card p-6 h-[400px] border border-white/5 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                Growth Trends
                            </h3>
                        </div>
                        <div className="flex-1">
                            <Line data={lineChartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Category Breakdown Pie Chart */}
                    <div className="glass-card p-6 h-[400px] border border-white/5 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
                                <PieChart className="w-4 h-4 text-prism-violet" />
                                Allocation Distribution
                            </h3>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-64 h-64">
                                <Pie data={pieChartData} options={{ ...chartOptions, scales: null }} />
                            </div>
                        </div>
                    </div>

                    {/* Transaction Volume Bar Chart */}
                    <div className="glass-card p-6 h-[400px] border border-white/5 flex flex-col lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-semibold flex items-center gap-2 text-sm">
                                <BarChart3 className="w-4 h-4 text-prism-cyan" />
                                Net Flow Analysis
                            </h3>
                        </div>
                        <div className="flex-1">
                            <Bar 
                                data={{
                                    labels: data?.monthly.map(m => m.month) || [],
                                    datasets: [{
                                        label: 'Net Balance',
                                        data: data?.monthly.map(m => m.income - m.expense) || [],
                                        backgroundColor: '#8b5cf6',
                                        borderRadius: 6,
                                    }]
                                }} 
                                options={chartOptions} 
                            />
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
