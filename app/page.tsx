import { AuthForm } from "@/components/AuthForm";
import { Sparkles, Activity, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full bg-white">
      
      {/* Left Pane - Clinical Branding (Hidden on Mobile) */}
      <div className="relative hidden w-[55%] flex-col justify-between overflow-hidden bg-[#0F3D3E] p-12 text-white lg:flex">
        
        {/* Background Visual Depth (Grain & Glows) */}
        <div className="absolute -left-[20%] -top-[10%] h-[800px] w-[800px] rounded-full bg-[#2EC4B6]/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[#000000]/40 blur-[100px]" />
        
        {/* Top Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2EC4B6]/20 text-[#2EC4B6]">
            <Activity className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ImmunoTrace</span>
        </div>

        {/* Massive Typographic Hero */}
        <div className="relative z-10 my-auto flex flex-col pt-20">
          <p className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#2EC4B6] backdrop-blur-md">
            <Sparkles className="h-4 w-4" /> Cognitive Health Memory
          </p>
          
          <h1 className="text-[5rem] font-medium leading-[0.95] tracking-tight text-white">
            Beyond
            <br />
            <span className="text-slate-400">Records.</span>
          </h1>
          
          <p className="mt-8 max-w-md text-lg font-medium leading-relaxed text-slate-300">
            Your proactive Immunity Coach bridging the gap between historical clinical data and daily physiological wellness.
          </p>
        </div>

        {/* Bottom Trust Indicators */}
        <div className="relative z-10 flex items-center gap-6 border-t border-white/10 pt-8 mt-12">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <ShieldCheck className="h-5 w-5 text-[#2EC4B6]" /> HIPAA Compliant
          </div>
          <div className="h-1 w-1 rounded-full bg-white/20" />
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <Activity className="h-5 w-5 text-[#2EC4B6]" /> End-to-End Encryption
          </div>
        </div>
      </div>

      {/* Right Pane - Authentication Form */}
      <div className="relative flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-[45%]">
        <div className="w-full max-w-[420px]">
          <AuthForm />
        </div>
      </div>
      
    </div>
  );
}