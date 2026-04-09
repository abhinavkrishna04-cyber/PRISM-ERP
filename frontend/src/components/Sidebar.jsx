import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
    LayoutDashboard, 
    PackageSearch, 
    CircleDollarSign, 
    Users, 
    FileText, 
    Puzzle, 
    UserCog, 
    ShieldAlert, 
    ShieldCheck,
    Settings 
} from "lucide-react";

export default function Sidebar() {
    const location = useLocation();
    const { user, permissions } = useAuth();

    const hasPermission = (moduleName, action = 'view') => {
        if (user?.role === 'Admin') return true;
        const perm = permissions.find(p => p.module === moduleName);
        return perm ? perm[`can_${action}`] : false;
    };

    const navItems = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/", module: "Dashboard" },
        { name: "Inventory", icon: PackageSearch, path: "/inventory", module: "Inventory" },
        { name: "Finance", icon: CircleDollarSign, path: "/finance", module: "Finance" },
        { name: "Employees", icon: Users, path: "/employees", module: "Employees" },
        { name: "Reports", icon: FileText, path: "/reports", module: "Reports" },
        { name: "Modules", icon: Puzzle, path: "/modules", module: "Modules" },
        { name: "Approvals", icon: ShieldCheck, path: "/approvals", module: "Approvals" },
        { name: "User Management", icon: UserCog, path: "/users", module: "User Management" },
        { name: "Roles & Permissions", icon: ShieldCheck, path: "/roles", module: "User Management" },
        { name: "Security Logs", icon: ShieldAlert, path: "/logs", module: "Security Logs" },
        { name: "Settings", icon: Settings, path: "/settings", module: "Settings" },
    ].filter(item => {
        if (item.module === "Dashboard") return true;
        return hasPermission(item.module, 'view');
    });

    return (
        <aside className="w-64 glass-panel h-screen flex flex-col border-r-0 rounded-none border-r border-prism-border sticky top-0">
            <div className="h-16 flex items-center px-6 border-b border-prism-border/50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-prism-violet to-prism-cyan flex items-center justify-center shadow-prism-glow">
                        <span className="text-white font-bold text-lg leading-none pt-0.5">P</span>
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
                        PRISM ERP
                    </span>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 group
                                ${isActive 
                                    ? "bg-prism-violet/15 text-prism-cyan border border-prism-violet/30 shadow-[inset_0_0_10px_rgba(139,92,246,0.1)]" 
                                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                                }`
                            }
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-prism-cyan" : "text-gray-400 group-hover:text-prism-violet"}`} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    );
}
