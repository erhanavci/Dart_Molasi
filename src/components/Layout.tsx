import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#101523] text-white">
      <div className="fixed inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(52,211,153,.22),transparent_24%),radial-gradient(circle_at_83%_12%,rgba(251,191,36,.17),transparent_24%),linear-gradient(135deg,#101523_0%,#151a2d_45%,#21162b_100%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/10 to-transparent" />
        <div className="absolute left-[6%] top-[15%] h-24 w-32 animate-float rounded-xl border border-yellow-200/20 bg-yellow-300/10 rotate-[-8deg]" />
        <div className="absolute right-[9%] top-[19%] h-20 w-28 animate-float rounded-xl border border-pink-200/20 bg-pink-400/10 rotate-[10deg] [animation-delay:1.2s]" />
        <div className="absolute bottom-[12%] left-[12%] h-20 w-20 rounded-full border-8 border-emerald-300/20" />
      </div>
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
