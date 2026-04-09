import { Bell, Search, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Topbar() {
    const { user, logout } = useAuth();
    return (
        <header className="h-16 glass-panel border-b border-l-0 rounded-none border-b-prism-border flex items-center justify-between px-6 sticky top-0 z-10">
            {/* Search Bar */}
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search anything..." 
                    className="prism-input w-full pl-10 h-10 text-sm"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
                <button className="relative p-2 text-gray-400 hover:text-prism-cyan transition-colors rounded-full hover:bg-white/5">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse"></span>
                </button>
                
                <div className="flex items-center gap-3 pl-4 border-l border-prism-border/50">
                    <div className="text-right hidden md:block">
                        <div className="text-sm font-medium text-gray-200">{user?.name || "Employee"}</div>
                        <div className="text-xs text-prism-violet">{user?.role || "Authentication Active"}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-prism-border flex items-center justify-center shadow-prism-glow">
                        <User className="w-5 h-5 text-gray-400" />
                    </div>
                    
                    <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={logout}
                        title="Log Out"
                        className="ml-2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-pink-500/10 text-gray-400 hover:text-pink-500 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        </header>
    );
}
