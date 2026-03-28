"use client";

import { useMemo } from "react";

interface DetailedOrganChartProps {
  prescriptions: Array<{
    illnessName: string;
  }>;
}

type BodySystem = "respiratory" | "digestive" | "neurological" | "musculoskeletal" | "cardiovascular" | "immunesystem";

const illnessToSystemMap: Record<string, BodySystem> = {
  "common cold": "respiratory",
  "bronchitis": "respiratory",
  "asthma": "respiratory",
  "cough": "respiratory",
  "flu": "respiratory",
  "pneumonia": "respiratory",
  "tonsillitis": "immunesystem", // Thymus / Lymph
  
  "headache": "neurological",
  "migraine": "neurological",
  
  "stomach ache": "digestive",
  "diarrhea": "digestive",
  "food poisoning": "digestive",
  "gastritis": "digestive",
  "ulcer": "digestive",
  "acid reflux": "digestive",
  
  "muscle pain": "musculoskeletal",
  "joint pain": "musculoskeletal",
  "arthritis": "musculoskeletal",
  
  "hypertension": "cardiovascular",
  "heart palpitations": "cardiovascular",
};

export function DetailedOrganChart({ prescriptions }: DetailedOrganChartProps) {
  const systemCounts = useMemo(() => {
    const counts: Record<BodySystem, number> = {
      respiratory: 0,
      digestive: 0,
      neurological: 0,
      musculoskeletal: 0,
      cardiovascular: 0,
      immunesystem: 0,
    };

    prescriptions.forEach((p) => {
      const illness = p.illnessName.toLowerCase().trim();
      const system = illnessToSystemMap[illness];
      if (system) {
        counts[system]++;
      } else {
        if (illness.includes("head") || illness.includes("migraine")) counts.neurological++;
        else if (illness.includes("cough") || illness.includes("throat") || illness.includes("lung")) counts.respiratory++;
        else if (illness.includes("stomach") || illness.includes("belly") || illness.includes("gut")) counts.digestive++;
        else if (illness.includes("pain") || illness.includes("muscle") || illness.includes("joint")) counts.musculoskeletal++;
        else if (illness.includes("heart") || illness.includes("blood")) counts.cardiovascular++;
      }
    });

    return counts;
  }, [prescriptions]);

  // Color mapping logic for realistic organs
  const getFill = (count: number, healthyColor: string, affectedColor: string = "#ef4444") => {
    if (count === 0) return healthyColor; // Healthy/Faded Medical illustration color
    if (count === 1) return "#f97316"; // Warning / Orange (Occasional)
    return affectedColor; // Severe / Red (Frequent)
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div className="w-full mb-6">
        <h3 className="text-xl font-semibold tracking-tight text-slate-900">Patient Internal Anatomy</h3>
        <p className="mt-1 text-sm text-slate-500">Highlighting physiological stress regions based on medical history</p>
      </div>

      <div className="relative flex h-[500px] w-full max-w-[350px] items-center justify-center">
        {/* Anatomical Vectors */}
        <svg viewBox="0 0 400 600" className="h-full w-full drop-shadow-md" preserveAspectRatio="xMidYMid meet">
          
          {/* Base Silhouette (Flesh tone / Faded base) */}
          <path 
            d="M 150 40 C 150 10, 180 0, 200 0 C 220 0, 250 10, 250 40 C 250 60, 240 80, 220 90 C 240 100, 280 110, 310 130 C 350 160, 360 220, 360 300 C 360 380, 370 450, 370 500 C 370 520, 350 540, 330 540 C 310 540, 290 520, 290 500 C 290 450, 280 300, 260 300 C 260 350, 270 450, 270 500 C 270 550, 260 600, 240 600 C 220 600, 210 550, 210 500 L 210 400 L 190 400 L 190 500 C 190 550, 180 600, 160 600 C 140 600, 130 550, 130 500 C 130 450, 140 350, 140 300 C 120 300, 110 450, 110 500 C 110 520, 90 540, 70 540 C 50 540, 30 520, 30 500 C 30 450, 40 380, 40 300 C 40 220, 50 160, 90 130 C 120 110, 160 100, 180 90 C 160 80, 150 60, 150 40 Z" 
            fill="#fcd5ce" // Soft skin / generic base
            stroke="#fbc4ab"
            strokeWidth="3"
            opacity="0.6"
          />

          <g className="organs">
            {/* THYROID / THROAT */}
            <path 
              d="M 190 100 C 190 95, 200 90, 200 90 C 200 90, 210 95, 210 100 C 220 105, 215 115, 205 115 C 200 115, 200 125, 200 125 C 200 125, 200 115, 195 115 C 185 115, 180 105, 190 100 Z"
              fill={getFill(systemCounts.immunesystem, "#fef08a")} // Healthy yellow, turns red if immune issues
              stroke="#facc15"
              strokeWidth="2"
              className="transition-colors duration-700 ease-in-out"
            />
            
            <path d="M 197 125 L 197 150 M 203 125 L 203 150" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="3 3"/>

            {/* RESPIRATORY (LUNGS) */}
            <g className="transition-colors duration-700 ease-in-out" opacity="0.95">
              {/* Right Lung (Viewer's Left) */}
              <path 
                d="M 190 145 C 160 135, 120 150, 110 200 C 100 250, 110 290, 140 300 C 170 300, 190 270, 190 220 Z" 
                fill={getFill(systemCounts.respiratory, "#fca5a5")} 
                style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" }}
              />
              {/* Left Lung (Viewer's Right) - Cardiac Notch */}
              <path 
                d="M 210 145 C 240 135, 280 150, 290 200 C 300 250, 290 290, 260 300 C 230 300, 230 260, 210 250 C 200 240, 210 220, 210 220 Z" 
                fill={getFill(systemCounts.respiratory, "#fca5a5")} 
                style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" }}
              />
            </g>

            {/* CARDIOVASCULAR (HEART) */}
            <path 
              d="M 210 210 C 210 190, 180 190, 190 220 C 180 230, 210 270, 230 260 C 250 240, 250 200, 230 210 C 230 210, 220 205, 210 210 Z"
              fill={getFill(systemCounts.cardiovascular, "#dc2626")} // Always somewhat red, brightens if affected
              stroke="#991b1b"
              strokeWidth="1.5"
              className="transition-colors duration-700 ease-in-out"
              style={{ filter: "drop-shadow(2px 4px 6px rgba(153,27,27,0.3))" }}
            />

            {/* DIGESTIVE SYSTEM */}
            <g className="transition-colors duration-700 ease-in-out">
              {/* Liver */}
              <path 
                d="M 110 300 C 110 280, 150 270, 220 280 C 250 285, 260 300, 250 310 C 200 350, 120 330, 110 300 Z"
                fill={getFill(systemCounts.digestive, "#991b1b")} // Dark Maroon
                style={{ filter: "drop-shadow(0px 4px 8px rgba(0,0,0,0.2))" }}
              />
              
              {/* Stomach */}
              <path 
                d="M 210 285 C 260 275, 290 290, 280 320 C 270 340, 220 360, 210 330 C 200 300, 210 290, 210 285 Z"
                fill={getFill(systemCounts.digestive, "#f87171")} // Soft Red/Pink
                style={{ filter: "drop-shadow(0px 3px 6px rgba(0,0,0,0.15))" }}
                opacity="0.95"
              />

              {/* Large Intestine Framework */}
              <path 
                d="M 130 400 L 130 350 C 130 330, 150 320, 180 330 L 220 330 C 250 320, 270 330, 270 350 L 270 400 C 270 420, 250 430, 220 430 L 200 450 L 180 430 C 150 430, 130 420, 130 400 Z"
                fill="none"
                stroke={getFill(systemCounts.digestive, "#b91c1c")}
                strokeWidth="16"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
                style={{ filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.2))" }}
              />
              
              {/* Small Intestines (Coils inside large intestine) */}
              <path 
                d="M 150 360 Q 170 340, 190 370 T 230 350 T 250 380 T 210 400 T 170 410 T 150 390 Z"
                fill="none"
                stroke={getFill(systemCounts.digestive, "#fca5a5")}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            
            {/* Bladder / Urinary */}
            <circle 
              cx="200" 
              cy="470" 
              r="14" 
              fill={getFill(systemCounts.digestive, "#fde047", "#f59e0b")} // Light yellow base
              className="transition-colors duration-700 ease-in-out"
              opacity="0.9"
            />
          </g>
        </svg>

        {/* Floating Health Status Overlays */}
        {systemCounts.respiratory > 0 && (
          <div className="absolute top-[30%] left-0 translate-x-4">
            <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm border border-orange-100 backdrop-blur-sm">
              <div className={`h-2 w-2 rounded-full ${systemCounts.respiratory > 1 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
              <span className="text-xs font-medium text-slate-700">Respiratory Issue</span>
            </div>
          </div>
        )}
        
        {systemCounts.digestive > 0 && (
          <div className="absolute top-[60%] right-0 -translate-x-4">
            <div className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm border border-orange-100 backdrop-blur-sm">
              <div className={`h-2 w-2 rounded-full ${systemCounts.digestive > 1 ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
              <span className="text-xs font-medium text-slate-700">Digestive Stress</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-6 rounded-xl bg-slate-50 border border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-slate-200 shadow-sm" />
          <span className="text-sm font-medium text-slate-600">Base / Healthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-orange-400 shadow-sm" />
          <span className="text-sm font-medium text-slate-600">Minor Irritation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-500 shadow-sm animate-pulse" />
          <span className="text-sm font-medium text-slate-600">Chronic Area</span>
        </div>
      </div>
    </div>
  );
}
