export default function StatusBadge({ children, variant = "cyan" }) {
    const variants = {
        cyan: "bg-prism-cyan/10 text-prism-cyan border-prism-cyan/20",
        violet: "bg-prism-violet/10 text-prism-violet border-prism-violet/20",
        blue: "bg-prism-blue/10 text-prism-blue border-prism-blue/20",
        green: "bg-green-500/10 text-green-400 border-green-500/20",
        red: "bg-red-500/10 text-red-400 border-red-500/20",
        yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        gray: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };

    return (
        <span className={`px-2 py-0.5 text-[10px] font-medium border rounded-full ${variants[variant] || variants.gray}`}>
            {children}
        </span>
    );
}
