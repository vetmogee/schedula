"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { DateNavigation } from "./DateNavigation";

type Employee = {
  id: number;
  name: string;
};

type Props = {
  openingTime: string | null;
  closingTime: string | null;
  employees: Employee[];
};

type TimeSlot = {
  label: string;
  minutesFromOpen: number;
};

function parseTimeToMinutes(time: string | null): number | null {
  if (!time) return null;
  const [h, m] = time.split(":").map((v) => parseInt(v, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function minutesToLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function CalendarUser({
  openingTime,
  closingTime,
  employees,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  // Fallback to typical 9–17 if not configured or invalid
  const [openMinutes, closeMinutes] = useMemo(() => {
    const open = parseTimeToMinutes(openingTime) ?? 9 * 60;
    const close = parseTimeToMinutes(closingTime) ?? 17 * 60;
    if (close <= open) {
      // Ensure at least some range
      return [open, open + 8 * 60];
    }
    return [open, close];
  }, [openingTime, closingTime]);

  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let t = openMinutes; t < closeMinutes; t += 30) {
      slots.push({
        label: minutesToLabel(t),
        minutesFromOpen: t - openMinutes,
      });
    }
    return slots;
  }, [openMinutes, closeMinutes]);

  const totalMinutes = closeMinutes - openMinutes;

  const [nowMinutesFromOpen, setNowMinutesFromOpen] = useState<number | null>(
    null,
  );

  useEffect(() => {
    function updateNow() {
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);

      // Only show current time indicator if viewing today
      if (selectedDateOnly.getTime() !== today.getTime()) {
        setNowMinutesFromOpen(null);
        return;
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const delta = currentMinutes - openMinutes;
      if (delta < 0 || delta > totalMinutes) {
        setNowMinutesFromOpen(null);
      } else {
        setNowMinutesFromOpen(delta);
      }
    }

    updateNow();
    const id = setInterval(updateNow, 60 * 1000);
    return () => clearInterval(id);
  }, [openMinutes, totalMinutes, selectedDate]);

  const hasEmployees = employees.length > 0;

  const getDateLabel = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    if (selectedDateOnly.getTime() === today.getTime()) {
      return "Today's schedule";
    }
    return "Schedule";
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">{getDateLabel()}</h2>
        <DateNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </header>

      {!hasEmployees ? (
        <div className="rounded-2xl px-4 py-6 text-center text-sm text-pink-700">
          This salon doesn&apos;t have any employees yet.
        </div>
      ) : (
        <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/60 shadow-sm p-4">
          <div className="relative">
            <div
              className="grid text-sm"
              style={{
                gridTemplateColumns: `96px repeat(${employees.length}, minmax(0, 1fr))`,
              }}
            >
              {/* header row */}
              <div className="h-10 pr-9 flex items-center justify-end text-xs font-semibold text-gray-500 sticky top-0 bg-white/90 z-30">
                Time
              </div>
              {employees.map((employee) => (
                <div
                  key={employee.id}
                  className="h-10 px-3 flex items-center justify-center text-xs font-semibold text-gray-700 sticky top-0 bg-white/90 z-30"
                >
                  {employee.name}
                </div>
              ))}

              {/* rows - scrollable container limited to 6 hours */}
              <div
                className="relative col-span-full overflow-y-auto max-h-[36rem]"
                style={{
                  gridColumn: `1 / span ${employees.length + 1}`,
                }}
              >
                {/* vertical grid lines across the whole schedule */}
                <div
                  className="pointer-events-none absolute grid"
                  style={{
                    gridTemplateColumns: `96px repeat(${employees.length}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: employees.length + 1 }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-full ${
                        index === 0
                          ? "border-r-2 border-gray-300/90"
                          : "border-l-2 border-gray-200/90"
                      }`}
                    />
                  ))}
                </div>

                {/* Container for rows */}
                <div
                  className="relative z-10 grid"
                  style={{
                    gridTemplateColumns: `96px repeat(${employees.length}, minmax(0, 1fr))`,
                  }}
                >
                  {timeSlots.map((slot, index) => (
                    <Fragment key={slot.label}>
                      <div
                        className="pr-9 pb-5 text-right text-xs text-gray-500"
                      >
                        {slot.label}
                      </div>
                      {employees.map((employee) => (
                        <div
                          key={`${slot.label}-${employee.id}`}
                          className={`border-t border-l border-gray-200 h-12 hover:bg-pink-50/60 transition-colors ${
                            index === 0 ? "border-t-gray-300" : ""
                          }`}
                        />
                      ))}
                    </Fragment>
                  ))}
                </div>

                {/* current time indicator – positioned relative to the rows area */}
                {nowMinutesFromOpen !== null && totalMinutes > 0 && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-20"
                    style={{
                      top: `${(nowMinutesFromOpen / totalMinutes) * 100}%`,
                    }}
                  >
                    <div className="relative">
                      <div className="h-px w-full bg-red-500" />
                      <div className="absolute -left-1 -translate-y-1/2 h-2 w-2 rounded-full bg-red-500" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

