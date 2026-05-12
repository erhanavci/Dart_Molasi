import type { HTMLAttributes } from "react";

export default function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.075] p-5 shadow-2xl shadow-slate-950/30 backdrop-blur-xl ${className}`}
      {...props}
    />
  );
}
