"use client";

import { Pencil, ShieldCheck, HeartPulse, User, MapPin, Phone, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function ProfileClient({ user }: { user: { name?: string | null; email?: string | null; id?: string } }) {
  const fallBackName = user.name || "Patient Profile";
  const initials = fallBackName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "ID";
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-start pt-10">
      
      {/* Header Container */}
      <div className="mb-10 flex w-full items-start justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Patient Profile</h1>
          <p className="mt-2 text-[14px] font-medium text-slate-500">
            Manage your personal details and medical team information.
          </p>
        </div>
        <button 
          onClick={() => alert("Profile properties are modified via the Settings Dashboard. Rerouting... (or use the sidebar)")}
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" /> Edit Profile
        </button>
      </div>

      <div className="flex w-full flex-col gap-6 lg:flex-row">
        
        {/* Left Column (Narrower) */}
        <div className="flex w-full flex-col gap-6 lg:w-[320px]">
          
          {/* Avatar Card */}
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0F3D3E] text-2xl font-bold tracking-widest text-white shadow-sm ring-4 ring-slate-50">
              {initials}
            </div>
            <h2 className="mt-4 text-xl font-bold text-slate-900">{fallBackName}</h2>
            <p className="mt-1 text-[13px] font-medium text-slate-500">Patient ID: {user.id?.substring(0, 8) || "HW-2847"}</p>
            <div className="mt-4 flex items-center gap-1.5 rounded-full bg-[#2EC4B6]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2EC4B6]">
              <ShieldCheck className="h-3.5 w-3.5" /> Fully Verified
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-[14px] font-bold text-slate-700 shadow-sm transition-all hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>

          {/* Basic Biometrics Card */}
          <div className="flex flex-col rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <HeartPulse className="h-4 w-4" /> Basic Biometrics
            </div>
            
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <span className="text-[13px] font-medium text-slate-500">Blood Type</span>
                <span className="text-[14px] font-bold text-rose-500">O Positive</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <span className="text-[13px] font-medium text-slate-500">Height</span>
                <span className="text-[14px] font-bold text-slate-900">5' 6" (168 cm)</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <span className="text-[13px] font-medium text-slate-500">Weight</span>
                <span className="text-[14px] font-bold text-slate-900">142 lbs (64 kg)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-slate-500">Biological Sex</span>
                <span className="text-[14px] font-bold text-slate-900">Female</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Wider) */}
        <div className="flex w-full flex-1 flex-col gap-6">
          
          {/* Personal Information Card */}
          <div className="flex flex-col rounded-3xl border border-slate-100 bg-white p-8 lg:p-10 shadow-sm">
            <div className="mb-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <User className="h-4 w-4" /> Personal Information
            </div>

            <div className="grid gap-x-8 gap-y-8 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Full Name</span>
                <span className="text-[15px] font-bold text-slate-800">{fallBackName}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Date of Birth</span>
                <span className="text-[15px] font-bold text-slate-800">August 14, 1992 (33 yrs)</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
                <span className="text-[15px] font-bold text-slate-800">{user.email || "No email on record"}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Phone Number</span>
                <span className="text-[15px] font-bold text-slate-800">+1 (555) 019-2834</span>
              </div>
              
              <div className="col-span-1 flex flex-col gap-2 sm:col-span-2 mt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Primary Address</span>
                <div className="flex items-center gap-2 text-[15px] font-medium text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400" /> 1248 Magnolia Blvd, Apt 4B, Seattle, WA 98101
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts Card */}
          <div className="flex flex-col rounded-3xl border border-slate-100 bg-white p-8 lg:p-10 shadow-sm">
            <div className="mb-8 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <Phone className="h-4 w-4" /> Emergency Contacts
            </div>

            <div className="flex flex-col gap-4">
              
              {/* Primary Contact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#F8FAFB] p-6 transition-shadow hover:bg-slate-50">
                <div className="flex flex-col gap-1">
                  <span className="text-[15px] font-bold text-slate-900">David Mitchell</span>
                  <span className="text-[13px] font-medium text-slate-500">Husband</span>
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-[15px] font-bold text-slate-900">+1 (555) 019-8832</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Primary</span>
                </div>
              </div>

              {/* Secondary Contact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-[#F8FAFB] p-6 transition-shadow hover:bg-slate-50">
                <div className="flex flex-col gap-1">
                  <span className="text-[15px] font-bold text-slate-900">Eleanor Vance</span>
                  <span className="text-[13px] font-medium text-slate-500">Mother</span>
                </div>
                <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-[15px] font-bold text-slate-900">+1 (555) 019-4411</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Secondary</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
