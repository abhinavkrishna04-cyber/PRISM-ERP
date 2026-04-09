import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { Lock, Loader2, Play, Key, CheckCircle } from "lucide-react";
import loginBg from "../assets/login_bg.png";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match matching.");
            return;
        }
        
        setError("");
        setIsSubmitting(true);
        
        try {
            await axios.post("/api/auth/reset-password", { token, newPassword: password });
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired recovery token.");
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md px-6 relative z-10"
            >
                <div className="glass-card p-10 border border-white/10 shadow-2xl backdrop-blur-2xl bg-black/50 rounded-3xl text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-prism-violet to-prism-cyan flex items-center justify-center shadow-prism-glow mx-auto mb-6">
                        <Key className="text-white w-8 h-8" />
                    </div>
                    
                    {success ? (
                        <div className="space-y-4">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex justify-center"
                            >
                                <CheckCircle className="w-12 h-12 text-green-500" />
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white">Reset Successful</h2>
                            <p className="text-sm text-gray-400">Your secure passkey has been recalibrated. Redirecting to authorization conduit...</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">New Passkey</h2>
                            <p className="text-sm text-gray-400 mb-8">Enter your new encrypted credentials for system access.</p>

                            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl text-center">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 ml-1">New Passkey</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="prism-input w-full pl-12 h-12 text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 ml-1">Confirm New Passkey</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="prism-input w-full pl-12 h-12 text-sm"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    disabled={isSubmitting || !token}
                                    type="submit" 
                                    className="prism-button w-full h-12 text-base font-bold flex items-center justify-center gap-2 mt-6"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            Update Passkey <Play className="w-4 h-4 fill-white" />
                                        </>
                                    )}
                                </motion.button>
                                
                                {!token && (
                                    <p className="text-[10px] text-red-400 mt-2 text-center">Error: Security token missing from transmission.</p>
                                )}
                            </form>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
