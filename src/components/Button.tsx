import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: ReactNode;
}

export default function Button({ className = "", variant = "primary", icon, children, ...props }: ButtonProps) {
  const variants = {
    primary: "bg-emerald-400 text-slate-950 shadow-neon hover:bg-emerald-300",
    secondary: "bg-white/10 text-white hover:bg-white/[0.16] border border-white/10",
    ghost: "bg-transparent text-slate-200 hover:bg-white/10",
    danger: "bg-rose-500/90 text-white shadow-rose hover:bg-rose-400"
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition duration-200 hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
