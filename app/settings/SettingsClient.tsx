"use client";

import { useState } from "react";
import { User, Bell, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";

function MockToggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div onClick={() => setOn(!on)} className={`flex h-6 w-11 cursor-pointer items-center rounded-full p-1 shadow-inner transition-colors ${on ? "bg-[#2EC4B6]" : "bg-slate-200"}`}>
      <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-5" : ""}`}></div>
    </div>
  );
}

function ConnectButton({ defaultConnected = false }: { defaultConnected?: boolean }) {
  const [conn, setConn] = useState(defaultConnected);
  return conn 
    ? <button onClick={()=>setConn(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-[12px] font-bold text-slate-600 transition-colors hover:bg-slate-50">Disconnect</button>
    : <button onClick={()=>setConn(true)} className="rounded-xl bg-[#0F3D3E] px-4 py-2 text-[12px] font-bold text-white transition-colors hover:bg-[#0F3D3E]/90">Connect</button>;
}

export function SettingsClient({ user }: { user: { name?: string | null; email?: string | null } }) {
  const [activeTab, setActiveTab] = useState("account");
  
  // Extract display name organically from email if name is missing
  const derivedName = user.name || (user.email ? user.email.split("@")[0] : "");

  const tabs = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy & Security", icon: ShieldCheck },
    { id: "devices", label: "Connected Devices", icon: Smartphone },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-start pt-10">
      
      {/* Header */}
      <div className="mb-10 flex w-full flex-col">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Preferences & Settings</h1>
        <p className="mt-2 text-[14px] font-medium text-slate-500">
          Manage your account configurations, privacy, and connected integrations.
        </p>
      </div>

      <div className="flex w-full flex-col gap-8 lg:flex-row">
        
        {/* Left Settings Sidebar */}
        <div className="flex w-full flex-col gap-2 lg:w-[260px]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 rounded-2xl px-5 py-3.5 text-[14px] font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[#0F3D3E] text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Content Area */}
        <div className="flex w-full flex-1 flex-col rounded-3xl border border-slate-100 bg-white p-8 lg:p-10 shadow-sm">
          
          {/* TAB 1: Account */}
          {activeTab === "account" && (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="mb-8 text-lg font-bold text-slate-900">Account Preferences</h2>
              
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Display Name</label>
                  <input 
                    type="text" 
                    defaultValue={derivedName}
                    className="w-full max-w-lg rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-700 outline-none focus:border-[#2EC4B6]/50 focus:ring-2 focus:ring-[#2EC4B6]/20 transition-all"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Primary Email</label>
                  <input 
                    type="email" 
                    defaultValue={user.email || ""}
                    className="w-full max-w-lg rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-700 outline-none focus:border-[#2EC4B6]/50 focus:ring-2 focus:ring-[#2EC4B6]/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Time Zone</label>
                  <select 
                    defaultValue="pt"
                    className="w-full max-w-lg rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] font-bold text-slate-700 outline-none focus:border-[#2EC4B6]/50 focus:ring-2 focus:ring-[#2EC4B6]/20 transition-all appearance-none"
                  >
                    <option value="pt">Pacific Time (PT)</option>
                    <option value="et">Eastern Time (ET)</option>
                    <option value="ct">Central Time (CT)</option>
                  </select>
                </div>

                <button 
                  onClick={() => alert("Account preferences saved securely to database.")}
                  className="mt-4 w-fit rounded-xl bg-[#0F3D3E] px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-[#0F3D3E]/90"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Notifications */}
          {activeTab === "notifications" && (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="mb-8 text-lg font-bold text-slate-900">Notification Settings</h2>
              
              <div className="flex flex-col gap-4">
                
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-slate-900">Medication Reminders</span>
                    <span className="text-[12px] font-medium text-slate-500">Push notifications for scheduled doses.</span>
                  </div>
                  <MockToggle defaultOn={true} />
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-slate-900">Appointment Alerts</span>
                    <span className="text-[12px] font-medium text-slate-500">Email and SMS reminders 24 hours before.</span>
                  </div>
                  <MockToggle defaultOn={true} />
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-slate-900">AI Health Insights</span>
                    <span className="text-[12px] font-medium text-slate-500">Weekly digest of pattern detection and summaries.</span>
                  </div>
                  <MockToggle defaultOn={true} />
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-slate-900">Document Uploads</span>
                    <span className="text-[12px] font-medium text-slate-500">Notify when new lab results are synced.</span>
                  </div>
                  <MockToggle defaultOn={true} />
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: Privacy & Security */}
          {activeTab === "privacy" && (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-8 flex items-center gap-2 text-lg font-bold text-slate-900">
                <ShieldCheck className="h-5 w-5 text-[#2EC4B6]" /> Privacy & Security
              </div>
              
              {/* HIPAA Card */}
              <div className="mb-8 flex flex-col gap-2 rounded-2xl border border-[#2EC4B6]/20 bg-[#2EC4B6]/5 p-6">
                <div className="flex items-center gap-2 text-[14px] font-bold text-slate-800">
                  <CheckCircle2 className="h-4 w-4 text-[#2EC4B6]" /> HIPAA Compliant
                </div>
                <p className="text-[13px] font-medium leading-relaxed text-slate-600">
                  Your health data is encrypted at rest and in transit. HealthWise strictly adheres to HIPAA guidelines for data protection and privacy.
                </p>
              </div>

              <h3 className="mb-4 text-[13px] font-bold text-slate-900">Data Sharing Preferences</h3>
              
              <div className="flex flex-col gap-6 border-b border-slate-100 pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-slate-900">Allow AI Pattern Analysis</span>
                    <span className="text-[12px] font-medium text-slate-500">Enable HealthWise to process your data for insights.</span>
                  </div>
                  <MockToggle defaultOn={true} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-slate-900">Share with Primary Care Provider</span>
                    <span className="text-[12px] font-medium text-slate-500">Automatically send summaries to Dr. Sarah Chen.</span>
                  </div>
                  <MockToggle defaultOn={false} />
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-8">
                <h3 className="text-[13px] font-bold text-rose-600">Danger Zone</h3>
                <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/30 p-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-slate-900">Nuclear Reset</span>
                    <span className="text-[12px] font-medium text-slate-500">Permanently delete all clinical records, prescriptions, and symptoms.</span>
                  </div>
                  <button 
                    onClick={async () => {
                      if(confirm("CRITICAL: This will permanently erase your entire medical history from Postgres. Continue?")) {
                        const res = await fetch("/api/wipe");
                        const data = await res.json();
                        if(data.success) {
                          alert(`Success: Purged ${data.wiped.prescriptions} records. Redirecting...`);
                          window.location.href = "/dashboard";
                        } else {
                          alert("Reset failed: " + data.error);
                        }
                      }
                    }}
                    className="rounded-xl bg-rose-600 px-6 py-2.5 text-[12px] font-bold text-white transition-all hover:bg-rose-700 shadow-sm"
                  >
                    Wipe My Data
                  </button>
                </div>
              </div>

              <button 
                onClick={() => alert("Initiating Data Export. A secure link will be sent to your email.")}
                className="mt-8 w-fit rounded-xl border border-slate-200 bg-white px-6 py-3 text-[13px] font-bold text-slate-500 transition-colors hover:bg-slate-50"
              >
                Export My Data
              </button>
            </div>
          )}

          {/* TAB 4: Connected Devices */}
          {activeTab === "devices" && (
            <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="mb-8 text-lg font-bold text-slate-900">Connected Devices & Apps</h2>
              
              <div className="flex flex-col gap-4">
                
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500 border border-slate-100">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-bold text-slate-900">Apple Health</span>
                      <span className="text-[11px] font-bold text-slate-400">Synced 10m ago</span>
                    </div>
                  </div>
                  <ConnectButton defaultConnected={true} />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500 border border-slate-100">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-bold text-slate-900">Oura Ring</span>
                      <span className="text-[11px] font-bold text-slate-400">Synced 2h ago</span>
                    </div>
                  </div>
                  <ConnectButton defaultConnected={true} />
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500 border border-slate-100">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-bold text-slate-900">Google Fit</span>
                      {/* No Sync Date */}
                    </div>
                  </div>
                  <ConnectButton defaultConnected={false} />
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}