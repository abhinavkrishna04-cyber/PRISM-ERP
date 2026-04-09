import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Lock, Mail, Loader2, Play, User as UserIcon, Building2, Key, ArrowLeft } from "lucide-react";
import loginBg from "../assets/login_bg.png";

const MODES = {
    LOGIN: 'LOGIN',
    SIGNUP: 'SIGNUP',
    FORGOT: 'FORGOT'
};

export default function Login() {
    const [mode, setMode] = useState(MODES.LOGIN);
    const [role, setRole] = useState("Employee");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [testLink, setTestLink] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Multi-tenant additions
    const [allCompanies, setAllCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    
    const { login, register, forgotPassword, getCompanies } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (mode === MODES.SIGNUP) {
            loadCompanies();
        }
    }, [mode]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadCompanies = async () => {
        const result = await getCompanies();
        if (result.success) {
            setAllCompanies(result.data);
            setFilteredCompanies(result.data);
        }
    };

    const handleSearchCompanies = (term) => {
        setCompanyName(term);
        if (role === 'Employee') {
            const filtered = allCompanies.filter(c => 
                c.name.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredCompanies(filtered);
            setIsDropdownOpen(true);
        }
    };

    const selectCompany = (company) => {
        setCompanyName(company.name);
        setIsDropdownOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");
        setTestLink("");
        setIsSubmitting(true);
        
        await new Promise(r => setTimeout(r, 600));

        try {
            if (mode === MODES.LOGIN) {
                const result = await login(email, password);
                if (result.success) navigate("/");
                else setError(result.error);
            } else if (mode === MODES.SIGNUP) {
                const result = await register(name, email, password, role, companyName);
                if (result.success) {
                    if (role === "Employee") {
                        setSuccessMessage("Registration successful! Awaiting admin approval.");
                        setMode(MODES.LOGIN);
                    } else {
                        navigate("/");
                    }
                } else {
                    setError(result.error);
                }
            } else if (mode === MODES.FORGOT) {
                const result = await forgotPassword(email);
                if (result.success) {
                    setSuccessMessage(result.data.message);
                    setTestLink(result.data.test_link);
                } else {
                    setError(result.error);
                }
            }
        } catch (err) {
            setError("Communication failure with secure mainframe.");
        }
        
        setIsSubmitting(false);
    };

    return (
        <div 
            className="min-h-screen bg-prism-bg flex flex-col justify-center items-center relative overflow-hidden bg-cover bg-center"
            style={{ backgroundImage: `url(${loginBg})` }}
        >
            <div className="absolute inset-0 bg-prism-bg/85 backdrop-blur-sm z-0"></div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg px-6 relative z-10"
            >
                <div className="glass-card p-10 border border-white/10 shadow-2xl backdrop-blur-2xl bg-black/50 rounded-3xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-prism-violet to-prism-cyan flex items-center justify-center shadow-prism-glow mb-6">
                            <span className="text-white font-bold text-3xl pt-1">P</span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                            {mode === MODES.LOGIN ? "Welcome Back" : mode === MODES.SIGNUP ? "Create Account" : "Reset Password"}
                        </h2>
                        <p className="text-gray-400 text-center text-sm max-w-xs">
                            {mode === MODES.LOGIN 
                                ? "Sign in to your P.R.I.S.M. ERP account." 
                                : mode === MODES.SIGNUP 
                                    ? "Choose your role and register to get started."
                                    : "Enter your email and we'll send a reset link."}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                            {successMessage && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-500/10 border border-green-500/50 text-green-400 text-xs p-3 rounded-xl text-center flex flex-col gap-2"
                                >
                                    <span>{successMessage}</span>
                                    {testLink && (
                                        <div className="mt-2 text-left bg-black/40 p-2 rounded border border-white/5 overflow-hidden text-ellipsis">
                                            <p className="text-[10px] text-gray-500 mb-1 font-mono uppercase">Internal Reset Link (Testing):</p>
                                            <a href={testLink} target="_blank" rel="noreferrer" className="text-prism-cyan hover:underline break-all">{testLink}</a>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {mode === MODES.SIGNUP && (
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    type="button"
                                    onClick={() => setRole("Employee")}
                                    className={`py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${role === 'Employee' ? 'bg-prism-violet/20 border-prism-violet text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                >
                                    <UserIcon className="w-5 h-5" />
                                    <span className="text-xs font-semibold">Employee</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("Admin")}
                                    className={`py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${role === 'Admin' ? 'bg-prism-cyan/20 border-prism-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                                >
                                    <Lock className="w-5 h-5" />
                                    <span className="text-xs font-semibold">Admin</span>
                                </button>
                            </div>
                        )}

                        <div className="space-y-4">
                            {mode === MODES.SIGNUP && (
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 ml-1">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="prism-input w-full pl-12 h-12 text-sm"
                                            placeholder="Full Name"
                                            required={mode === MODES.SIGNUP}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs text-gray-500 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="prism-input w-full pl-12 h-12 text-sm"
                                        placeholder="you@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            {mode !== MODES.FORGOT && (
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs text-gray-500">Password</label>
                                        {mode === MODES.LOGIN && (
                                            <button 
                                                type="button"
                                                onClick={() => setMode(MODES.FORGOT)}
                                                className="text-[10px] text-prism-violet hover:text-prism-cyan transition-colors font-semibold uppercase tracking-wider"
                                            >
                                                Forgot Password?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="prism-input w-full pl-12 h-12 text-sm"
                                            placeholder="••••••••"
                                            required={mode !== MODES.FORGOT}
                                        />
                                    </div>
                                </div>
                            )}

                            {mode === MODES.SIGNUP && (
                                <div className="space-y-1 relative" ref={dropdownRef}>
                                    <label className="text-xs text-gray-500 ml-1">
                                        {role === 'Admin' ? 'New Company Identity' : 'Associated Company Name'}
                                    </label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input 
                                            type="text" 
                                            value={companyName}
                                            onChange={(e) => handleSearchCompanies(e.target.value)}
                                            onFocus={() => role === 'Employee' && setIsDropdownOpen(true)}
                                            className="prism-input w-full pl-12 h-12 text-sm"
                                            placeholder={role === 'Admin' ? "Cyberdyne Systems" : "Search company..."}
                                            required={mode === MODES.SIGNUP}
                                            autoComplete="off"
                                        />
                                    </div>
                                    
                                    <AnimatePresence>
                                        {role === 'Employee' && isDropdownOpen && filteredCompanies.length > 0 && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-50 w-full mt-1 bg-prism-bg/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
                                            >
                                                {filteredCompanies.map((company) => (
                                                    <button
                                                        key={company.id}
                                                        type="button"
                                                        onClick={() => selectCompany(company)}
                                                        className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/10 hover:text-prism-cyan transition-colors flex items-center justify-between border-b border-white/5 last:border-0"
                                                    >
                                                        <span>{company.name}</span>
                                                        <Play className="w-3 h-3 text-prism-cyan/50" />
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                        {role === 'Employee' && isDropdownOpen && filteredCompanies.length === 0 && companyName && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute z-50 w-full mt-1 bg-prism-bg/95 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center"
                                            >
                                                <p className="text-xs text-gray-500">No matching organizations found.</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {role === 'Employee' && (
                                        <p className="text-[10px] text-gray-600 mt-1 italic pl-1">Note: You must entering an existing company name.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting}
                            type="submit" 
                            className="prism-button w-full h-12 text-base font-bold flex items-center justify-center gap-2 mt-6"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {mode === MODES.LOGIN ? 'Log In' : mode === MODES.SIGNUP ? 'Create Account' : 'Send Reset Link'}
                                    <Play className="w-4 h-4 fill-white" />
                                </>
                            )}
                        </motion.button>
                        
                        <div className="mt-8 text-center flex flex-col gap-3">
                            {mode === MODES.LOGIN ? (
                                <button 
                                    type="button" 
                                    onClick={() => setMode(MODES.SIGNUP)}
                                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    Don't have an account? <span className="text-prism-cyan font-bold underline decoration-prism-cyan/30">Sign Up</span>
                                </button>
                            ) : (
                                <button 
                                    type="button" 
                                    onClick={() => setMode(MODES.LOGIN)}
                                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Login
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
