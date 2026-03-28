"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, Activity, User, MapPin, Moon, Apple } from "lucide-react";

// Google SVG Icon component
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export function AuthForm() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    userId: "",
    age: 25,
    city: "",
    allergies: "",
    sleepHours: 7,
    dietType: "vegetarian",
    activityLevel: "moderate",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegister) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            allergies: formData.allergies.split(",").map((a) => a.trim()).filter(Boolean),
          }),
        });

        const data = await res.json();
        if (!data.success) {
          setError(data.error?.message || "Registration failed: " + JSON.stringify(data.error));
          setLoading(false);
          return;
        }

        const signInRes = await signIn("credentials", {
          userId: formData.userId,
          redirect: false,
        });

        if (signInRes?.error) {
          setError("Registration succeeded but login failed");
        } else {
          router.push("/dashboard");
        }
      } else {
        const res = await signIn("credentials", {
          userId: formData.userId,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid user ID");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Mobile Logo (Visible only on small screens) */}
      <div className="mb-10 flex flex-col items-center justify-center lg:hidden">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0F3D3E] text-[#2EC4B6] shadow-lg">
          <Activity className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#0F3D3E]">ImmunoTrace</h1>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          {isRegister ? "Create Profile" : "Welcome Back"}
        </h2>
        <p className="mt-2 text-[15px] font-medium text-slate-500">
          {isRegister 
            ? "Enter your details to configure your personal intelligence baseline." 
            : "Enter your secure ID to access your health memory."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* User ID Input */}
        <div className="group relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-[#2EC4B6]">
            <User className="h-5 w-5 transition-colors" />
          </div>
          <input
            type="text"
            required
            value={formData.userId}
            onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
            className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-12 pr-4 text-[15px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#2EC4B6] focus:bg-white focus:ring-4 focus:ring-[#2EC4B6]/10"
            placeholder="Secure User ID"
          />
        </div>

        {isRegister && (
          <div className="flex flex-col gap-5 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="group relative">
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 px-4 text-[15px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#2EC4B6] focus:bg-white focus:ring-4 focus:ring-[#2EC4B6]/10"
                  placeholder="Age"
                />
              </div>
              
              <div className="group relative">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-[#2EC4B6]">
                   <MapPin className="h-4 w-4 transition-colors" />
                 </div>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-10 pr-4 text-[15px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#2EC4B6] focus:bg-white focus:ring-4 focus:ring-[#2EC4B6]/10"
                  placeholder="City"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-[#2EC4B6]">
                   <Moon className="h-4 w-4 transition-colors" />
                 </div>
                <input
                  type="number"
                  required
                  min={0}
                  max={24}
                  step={0.5}
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) })}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-10 pr-4 text-[15px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#2EC4B6] focus:bg-white focus:ring-4 focus:ring-[#2EC4B6]/10"
                  placeholder="Sleep Hrs"
                />
              </div>
              
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-[#2EC4B6]">
                   <Apple className="h-4 w-4 transition-colors" />
                 </div>
                <select
                  value={formData.dietType}
                  onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                  className="appearance-none block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-10 pr-10 text-[15px] font-medium text-slate-900 outline-none transition-all hover:border-slate-300 hover:bg-white focus:border-[#2EC4B6] focus:bg-white focus:ring-4 focus:ring-[#2EC4B6]/10"
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </div>
              </div>
            </div>

            <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-[#2EC4B6]">
                   <Activity className="h-4 w-4 transition-colors" />
                 </div>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                className="appearance-none block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 pl-10 pr-10 text-[15px] font-medium text-slate-900 outline-none transition-all hover:border-slate-300 hover:bg-white focus:border-[#2EC4B6] focus:bg-white focus:ring-4 focus:ring-[#2EC4B6]/10"
              >
                <option value="low">Low Activity Level</option>
                <option value="moderate">Moderate Activity Level</option>
                <option value="high">High Activity Level</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              </div>
            </div>

            <div className="group relative">
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-4 px-4 text-[15px] font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-[#2EC4B6] focus:bg-white focus:ring-4 focus:ring-[#2EC4B6]/10"
                placeholder="Allergies (e.g. Pollen, Dust, Nuts)"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-[#0F3D3E] py-4 text-[15px] font-bold text-white shadow-xl shadow-[#0F3D3E]/10 transition-all hover:-translate-y-1 hover:bg-[#0c3132] hover:shadow-2xl hover:shadow-[#0F3D3E]/20 disabled:opacity-70 disabled:hover:translate-y-0"
        >
          {loading ? "Authenticating..." : isRegister ? "Initialize Profile" : "Access Console"}
          {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
        </button>

        <div className="relative mt-2 flex items-center py-2">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="shrink-0 px-4 text-xs font-bold uppercase tracking-widest text-slate-400">Or continue with</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-4 text-[15px] font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:opacity-70 disabled:hover:translate-y-0"
        >
          <GoogleIcon />
          Google Account
        </button>
      </form>

      <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
        {isRegister ? "Already registered?" : "New to ImmunoTrace?"}
        <button
          type="button"
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
          className="font-bold text-[#2EC4B6] transition-colors hover:text-[#25A79B]"
        >
          {isRegister ? "Sign In instead" : "Create Account"}
        </button>
      </div>

    </div>
  );
}