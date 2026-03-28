"use client";

import { useMemo } from "react";
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getMonth, getYear, isSameDay } from "date-fns";

interface HeatmapData {
  date: Date;
  count: number;
  illness?: string;
}

interface ImmunityHeatmapProps {
  prescriptions: Array<{
    recordedDate: string;
    illnessName: string;
  }>;
}

function getColor(count: number): string {
  if (count === 0) return "bg-slate-100";
  if (count === 1) return "bg-orange-200";
  if (count === 2) return "bg-orange-400";
  return "bg-orange-600";
}

export function ImmunityHeatmap({ prescriptions }: ImmunityHeatmapProps) {
  const heatmapData = useMemo(() => {
    const months: HeatmapData[][] = [];
    const today = new Date();

    for (let i = 5; i >= 0; i--) {
      const targetDate = subMonths(today, i);
      const monthStart = startOfMonth(targetDate);
      const monthEnd = endOfMonth(targetDate);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

      const monthData = days.map((day) => {
        const matchingPrescriptions = prescriptions.filter((p) =>
          isSameDay(new Date(p.recordedDate), day)
        );

        return {
          date: day,
          count: matchingPrescriptions.length,
          illness: matchingPrescriptions[0]?.illnessName,
        };
      });

      months.push(monthData);
    }

    return months;
  }, [prescriptions]);

  const monthLabels = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(today, 5 - i);
      return format(date, "MMM yyyy");
    });
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Immunity Heatmap</h3>
      <p className="text-sm text-slate-500">Your sickness patterns over the last 6 months</p>

      <div className="mt-4 space-y-2">
        {monthLabels.map((label, monthIndex) => (
          <div key={label} className="flex items-center gap-2">
            <span className="w-20 text-xs text-slate-500">{label}</span>
            <div className="flex flex-1 flex-wrap gap-1">
              {heatmapData[monthIndex]?.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`h-3 w-3 rounded-sm ${getColor(day.count)} transition-colors hover:ring-2 hover:ring-orange-400`}
                  title={day.count > 0 ? `${format(day.date, "MMM d")}: ${day.illness}` : format(day.date, "MMM d")}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-slate-100" />
          <span>No data</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-orange-200" />
          <span>1 illness</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-orange-400" />
          <span>2 illnesses</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-sm bg-orange-600" />
          <span>3+ illnesses</span>
        </div>
      </div>
    </div>
  );
}