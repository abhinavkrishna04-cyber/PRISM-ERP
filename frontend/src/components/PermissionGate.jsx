import { useAuth } from "../context/AuthContext";

/**
 * PermissionGate
 * @param {string} module - The module name (matches database Modules table)
 * @param {string} action - 'view' | 'add' | 'edit' | 'delete' | 'copy'
 */
export default function PermissionGate({ module, action = "view", children, fallback = null }) {
    const { permissions, user } = useAuth();
    
    // Admins have all permissions
    if (user?.role === 'Admin') return children;

    const modulePermission = permissions.find(p => p.module === module);
    
    if (!modulePermission) return fallback;

    const permissionKey = `can_${action}`;
    if (modulePermission[permissionKey]) {
        return children;
    }

    return fallback;
}
