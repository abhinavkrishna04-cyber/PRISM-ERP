import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Edit, Trash2, Copy, Eye } from 'lucide-react';

export default function DataTable({ 
    columns, 
    data, 
    onEdit, 
    onDelete, 
    onCopy, 
    onView,
    loading,
    searchPlaceholder = "Search records...",
    permissions = { can_edit: true, can_delete: true, can_copy: true, can_view: true }
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredData = data.filter(item => 
        Object.values(item).some(val => 
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="flex flex-col h-full">
            {/* Table Header / Toolbar */}
            <div className="flex items-center justify-between mb-4 gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder={searchPlaceholder}
                        className="prism-input w-full pl-10 h-10 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-auto custom-scrollbar glass-card -mx-1">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-white/5 bg-white/5">
                            {columns.map((col) => (
                                <th key={col.key} className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    {col.label}
                                </th>
                            ))}
                            {(onEdit || onDelete || onCopy || onView) && (
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode='wait'>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {columns.map((_, j) => (
                                            <td key={j} className="px-6 py-4">
                                                <div className="h-4 bg-white/5 rounded w-full"></div>
                                            </td>
                                        ))}
                                        <td className="px-6 py-4"><div className="h-4 bg-white/5 rounded w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item, idx) => (
                                    <motion.tr 
                                        key={item.id || idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                                    >
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-6 py-4 text-sm text-gray-300">
                                                {col.render ? col.render(item) : item[col.key]}
                                            </td>
                                        ))}
                                        {(onEdit || onDelete || onCopy || onView) && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 text-gray-500">
                                                    {onView && permissions.can_view && (
                                                        <button onClick={() => onView(item)} className="p-1.5 hover:text-prism-cyan transition-colors" title="View">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {onCopy && permissions.can_copy && (
                                                        <button onClick={() => onCopy(item)} className="p-1.5 hover:text-prism-blue transition-colors" title="Copy">
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {onEdit && permissions.can_edit && (
                                                        <button onClick={() => onEdit(item)} className="p-1.5 hover:text-prism-violet transition-colors" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {onDelete && permissions.can_delete && (
                                                        <button onClick={() => onDelete(item)} className="p-1.5 hover:text-red-400 transition-colors" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-xs text-gray-500">
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} records
                    </p>
                    <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 glass-card hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-gray-400 px-2">Page {currentPage} of {totalPages}</span>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 glass-card hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                    </div>
                </div>
            )}
        </div>
    );
}
