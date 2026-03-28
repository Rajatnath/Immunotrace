"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, Plus, Calendar as CalendarIcon, MapPin, Clock } from "lucide-react";

export function CalendarClient({ initialHistory = [] }: { initialHistory?: any[] }) {
  // Convert live DB history logs into calendar events.
  const dynamicEvents = initialHistory.map(record => {
    // Generate deterministic time slot
    const dbDate = new Date(record.recordedDate);
    const day = dbDate.getDate();
    // Use the exact date format needed by the cell matcher (YYYY-M-D)
    const formattedDate = `${dbDate.getFullYear()}-${dbDate.getMonth() + 1}-${day}`;
    
    return {
      id: record.id,
      title: record.illnessName || record.diagnosis || "Health Event",
      date: formattedDate, // Match format (e.g. "2026-3-12")
      time: "10:00 AM",
      location: record.source === "AI" ? "AI Pipeline" : "External Provider",
      type: record.source === "AI" ? "primary" : "secondary"
    };
  });

  const EVENTS = dynamicEvents.length > 0 ? dynamicEvents : [
    {
      id: 1,
      title: "Annual Physical Checkup",
      date: "2026-3-12",
      time: "09:00 AM",
      location: "Dr. Sarah Chen Office",
      type: "primary", // darker teal
    }
  ];
  
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-start pt-10">
      
      {/* Header Container */}
      <div className="mb-10 flex w-full items-start justify-between">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Schedule & Calendar</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Manage appointments, medication schedules, and historical events.
          </p>
        </div>
        <button 
          onClick={() => alert("The 'New Event' scheduler requires backend time coordination and is reserved for Phase 2.")}
          className="flex items-center gap-2 rounded-2xl bg-[#0F3D3E] px-6 py-3 font-bold text-white transition-all hover:bg-[#0F3D3E]/90"
        >
          <Plus className="h-5 w-5" /> New Event
        </button>
      </div>

      <div className="flex w-full flex-col gap-8 lg:flex-row">
        
        {/* Left: Huge Calendar Grid */}
        <div className="flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">March 2026</h2>
            <div className="flex gap-2">
              <button 
                onClick={() => alert("Month navigation is restricted to the current active log cycle in the Prototype.")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => alert("Month navigation is restricted to the current active log cycle in the Prototype.")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border-t border-slate-100">
            
            {/* Day Headers */}
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
              <div key={day} className="py-4 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {day}
              </div>
            ))}

            {/* Empty slots for start of month (March 1st is Monday in this mock) */}
            <div className="min-h-32 border-b border-r border-slate-100 p-2"></div>
            
            {/* Day 1 - 4 */}
            {[1,2,3,4].map((date) => (
              <div key={date} className="min-h-32 border-b border-r border-slate-100 p-3 last:border-r-0">
                <span className="text-sm font-bold text-slate-700">{date}</span>
              </div>
            ))}
            
            {/* Day 5 (Has Rx) */}
            <div className="flex min-h-32 flex-col gap-1 border-b border-r border-slate-100 p-3">
              <span className="text-sm font-bold text-slate-700">5</span>
              <div className="mt-1 truncate rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                Start Rx
              </div>
            </div>

            {/* Day 6 */}
            <div className="min-h-32 border-b border-slate-100 p-3">
              <span className="text-sm font-bold text-slate-700">6</span>
            </div>

            {/* Row 2 */}
            {[7,8,9,10,11].map((date) => (
              <div key={date} className="min-h-32 border-b border-r border-slate-100 p-3">
                <span className="text-sm font-bold text-slate-700">{date}</span>
              </div>
            ))}

            {/* Day 12 */}
            <div className="flex min-h-32 flex-col gap-1 border-b border-r border-slate-100 p-3 relative bg-[#2EC4B6]/5">
               <span className="text-sm font-bold text-slate-700">12</span>
               <div className="mt-1 truncate rounded bg-[#2EC4B6]/20 px-2 py-1 text-[10px] font-bold text-[#0F3D3E]">
                 10:00 AM Dr. ...
               </div>
            </div>

            {/* Day 13 */}
            <div className="min-h-32 border-b border-slate-100 p-3">
              <span className="text-sm font-bold text-slate-700">13</span>
            </div>

            {/* Row 3 */}
            <div className="min-h-32 border-b border-r border-slate-100 p-3">
              <span className="text-sm font-bold text-slate-700">14</span>
            </div>
            
            <div className="flex min-h-32 flex-col gap-1 border-b border-r border-slate-100 p-3 relative bg-amber-50/50">
               <span className="text-sm font-bold text-slate-700">15</span>
               <div className="mt-1 truncate rounded bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
                 Throat Pain
               </div>
            </div>

            {[16,17,18,19,20].map((date) => (
              <div key={date} className="min-h-32 border-b border-r border-slate-100 p-3 last:border-r-0">
                <span className="text-sm font-bold text-slate-700">{date}</span>
              </div>
            ))}

            {/* Row 4 */}
            <div className="min-h-32 border-b border-r border-slate-100 p-3">
              <span className="text-sm font-bold text-slate-700">21</span>
            </div>

            <div className="flex min-h-32 flex-col gap-1 border-b border-r border-slate-100 p-3 relative bg-[#2EC4B6]/5">
               <span className="text-sm font-bold text-slate-700">22</span>
               <div className="mt-1 truncate rounded bg-[#2EC4B6]/20 px-2 py-1 text-[10px] font-bold text-[#0F3D3E]">
                 2:00 PM PT S...
               </div>
            </div>

            {[23,24,25,26,27].map((date) => (
              <div key={date} className="min-h-32 border-b border-r border-slate-100 p-3 last:border-r-0 animate-in fade-in fill-mode-both" style={{ animationDelay: `${date * 20}ms`, animationDuration: '400ms' }}>
                <span className="text-sm font-bold text-slate-700">{date}</span>
              </div>
            ))}

            {/* Row 5 */}
            <div className="flex min-h-32 flex-col gap-1 border-b border-r border-slate-100 p-3 relative bg-[#0F3D3E] text-white">
               <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-[#0F3D3E]">
                 28
               </div>
               <div className="mt-2 truncate rounded bg-white/20 px-2 py-1 text-[10px] font-bold text-white">
                 9:00 AM Foll...
               </div>
            </div>

            {[29,30,31].map((date) => (
              <div key={date} className="min-h-32 border-b border-r border-slate-100 p-3 last:border-r-0">
                <span className="text-sm font-bold text-slate-700">{date}</span>
              </div>
            ))}

            {/* Padding bottom empty cells */}
            <div className="min-h-32 border-b border-r border-slate-100 p-3"></div>
            <div className="min-h-32 border-b border-slate-100 p-3"></div>

          </div>
        </div>

        {/* Right Sidebar: Upcoming */}
        <div className="flex w-full lg:w-[350px] flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <CalendarIcon className="h-4 w-4" /> Upcoming
          </div>

          <div className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-5 transition-shadow hover:shadow-sm">
              <h3 className="text-[15px] font-bold text-slate-900">Follow up Appointment</h3>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <MapPin className="h-4 w-4" /> Dr. Sarah Chen
              </div>
              <div className="mt-1 flex w-fit items-center gap-1.5 rounded-full border border-[#2EC4B6]/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2EC4B6]">
                <Clock className="h-3.5 w-3.5" /> Tomorrow, 9:00 AM
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-5 transition-shadow hover:shadow-sm">
              <h3 className="text-[15px] font-bold text-slate-900">Physical Therapy</h3>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <MapPin className="h-4 w-4" /> City Health Clinic
              </div>
              <div className="mt-1 flex w-fit items-center gap-1.5 rounded-full border border-[#2EC4B6]/20 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2EC4B6]">
                <Clock className="h-3.5 w-3.5" /> Apr 2, 2:00 PM
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
