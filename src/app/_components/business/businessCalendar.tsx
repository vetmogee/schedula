"use client";
import React from "react";

type Props = {
  employees?: string[];
};

const formatMinutes = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

export default function BusinessCalendar({ employees = ["Alice", "Bob", "Carol", "Dave", "Support"] }: Props) {
  const start = 6 * 60; // 6:00
  const end = 20 * 60; // 20:00
  const slots: number[] = [];
  for (let t = start; t < end; t += 30) slots.push(t);

  return (
    <div className="mx-auto max-w-7xl bg-white shadow-md rounded-xl overflow-hidden text-center">
      <div className="grid" style={{ gridTemplateColumns: `120px repeat(${employees.length}, 1fr)` }}>
        <div className="bg-gray-50 border-b border-gray-400 sticky px-3 py-2 font-semibold">Time</div>
        {employees.map((e) => (
          <div key={e} className="bg-gray-50 border-b border-gray-400 sticky top-0 z-10 px-3 py-2 font-semibold">
            {e}
          </div>
        ))}
      </div>

      <div className="max-h-[72vh] overflow-auto">
        {slots.map((min) => (
          <div
            key={min}
            className="grid border-b border-gray-400"
            style={{ gridTemplateColumns: `120px repeat(${employees.length}, 1fr)`, minHeight: 36, alignItems: "center" }}
          >
            <div className="px-3 py-2 text-gray-500 text-sm font-bold">{formatMinutes(min)}</div>
            {employees.map((emp) => (
              <div key={emp + min} className="p-2 border-l border-gray-400">
                <div className="h-6 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

    