"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { DateNavigation } from "./DateNavigation";
import { CalendarEvent } from "./CalendarEvent";
import { BookingDetailsModal } from "./BookingDetailsModal";

type Employee = {
  id: number;
  name: string;
};

type Booking = {
  id: number;
  date: Date;
  services: {
    name: string;
    duration: Date;
    price?: number;
  }[];
  employee: {
    id: number;
    name: string;
  } | null;
  customer: {
    name: string | null;
  };
};

type Props = {
  openingTime: string | null;
  closingTime: string | null;
  employees: Employee[];
  bookings?: Booking[];
  currency?: string | null;
};

type TimeSlot = {
  label: string;
  absoluteMinutes: number;
  isClosed: boolean;
};

const DAY_START = 0;
const DAY_END = 24 * 60; // 1440
const TOTAL_DAY_MINUTES = DAY_END - DAY_START;

function parseTimeToMinutes(time: string | null): number | null {
  if (!time) return null;
  const [h, m] = time.split(":").map((v) => parseInt(v, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function minutesToLabel(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function CalendarUser({
  openingTime,
  closingTime,
  employees,
  bookings = [],
  currency = "USD",
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fallback to typical 9–17 if not configured or invalid
  const [openMinutes, closeMinutes] = useMemo(() => {
    const open = parseTimeToMinutes(openingTime) ?? 9 * 60;
    const close = parseTimeToMinutes(closingTime) ?? 17 * 60;
    if (close <= open) {
      return [open, open + 8 * 60];
    }
    return [open, close];
  }, [openingTime, closingTime]);

  // Build 24-hour time slots with closed/open flag
  const timeSlots: TimeSlot[] = useMemo(() => {
    const slots: TimeSlot[] = [];
    for (let t = DAY_START; t < DAY_END; t += 30) {
      slots.push({
        label: minutesToLabel(t),
        absoluteMinutes: t,
        isClosed: t < openMinutes || t >= closeMinutes,
      });
    }
    return slots;
  }, [openMinutes, closeMinutes]);

  const [nowMinutesFromMidnight, setNowMinutesFromMidnight] = useState<number | null>(null);

  useEffect(() => {
    function updateNow() {
      const now = new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateOnly = new Date(selectedDate);
      selectedDateOnly.setHours(0, 0, 0, 0);

      if (selectedDateOnly.getTime() !== today.getTime()) {
        setNowMinutesFromMidnight(null);
        return;
      }

      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      setNowMinutesFromMidnight(currentMinutes);
    }

    updateNow();
    const id = setInterval(updateNow, 60 * 1000);
    return () => clearInterval(id);
  }, [selectedDate]);

  // Auto-scroll to opening time (with a small offset before it)
  const hasScrolled = useRef(false);
  useEffect(() => {
    if (hasScrolled.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    // Wait a tick for the DOM to be ready
    requestAnimationFrame(() => {
      const scrollTarget = Math.max(0, openMinutes - 30); // 30 min before open
      const scrollFraction = scrollTarget / TOTAL_DAY_MINUTES;
      const scrollTop = scrollFraction * container.scrollHeight;
      container.scrollTop = scrollTop;
      hasScrolled.current = true;
    });
  }, [openMinutes]);

  const hasEmployees = employees.length > 0;
  const timeColumnWidth = isMobile ? 56 : 96;
  const SLOT_HEIGHT = 48; // h-12 = 3rem = 48px

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
        <h2 className="text-xl font-semibold text-gray-900 dark:text-foreground">{getDateLabel()}</h2>
        <DateNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} />
      </header>

      {!hasEmployees ? (
        <div className="rounded-2xl px-4 py-6 text-center text-sm text-pink-700 dark:text-primary">
          This salon doesn&apos;t have any employees yet.
        </div>
      ) : (
        <div className="rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur shadow-md border border-white/60 dark:border-border p-4">
          {/* Sticky header row */}
          <div
            className="grid text-sm"
            style={{
              gridTemplateColumns: `${timeColumnWidth}px repeat(${employees.length}, minmax(0, 1fr))`,
            }}
          >
            <div className={`h-10 ${isMobile ? "pr-2" : "pr-9"} flex items-center justify-end text-xs font-semibold text-gray-500 dark:text-muted-foreground`}>
              Time
            </div>
            {employees.map((employee) => (
              <div
                key={employee.id}
                className="h-10 px-3 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-foreground"
              >
                {employee.name}
              </div>
            ))}
          </div>

          {/* Scrollable calendar body */}
          <div
            ref={scrollContainerRef}
            className="relative overflow-y-auto"
            style={{ maxHeight: isMobile ? "60vh" : "70vh" }}
          >
            <div className="relative">
              {/* vertical grid lines across the whole schedule */}
              <div
                className="pointer-events-none absolute inset-0 grid"
                style={{
                  gridTemplateColumns: `${timeColumnWidth}px repeat(${employees.length}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: employees.length + 1 }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-full ${
                      index === 0
                        ? "border-r-2 border-gray-300/90 dark:border-gray-600"
                        : "border-l-2 border-gray-200/90 dark:border-gray-600/80"
                    }`}
                  />
                ))}
              </div>

              {/* Container for rows */}
              <div
                className="relative z-10 grid"
                style={{
                  gridTemplateColumns: `${timeColumnWidth}px repeat(${employees.length}, minmax(0, 1fr))`,
                }}
              >
                {timeSlots.map((slot, index) => (
                  <Fragment key={slot.label}>
                    <div
                      className={`${isMobile ? "pr-2" : "pr-9"} pb-5 text-right text-xs ${
                        slot.isClosed
                          ? "text-gray-400 dark:text-gray-600"
                          : "text-gray-500 dark:text-muted-foreground"
                      }`}
                    >
                      {slot.label}
                    </div>
                    {employees.map((employee) => (
                      <div
                        key={`${slot.label}-${employee.id}`}
                        className={`border-t border-l h-12 transition-colors ${
                          index === 0 ? "border-t-gray-300 dark:border-t-gray-600" : ""
                        } ${
                          slot.isClosed
                            ? "bg-gray-200/80 dark:bg-gray-800/60 border-gray-300 dark:border-gray-700"
                            : "border-gray-200 dark:border-gray-600 hover:bg-pink-50/60 dark:hover:bg-gray-600/30"
                        }`}
                      />
                    ))}
                  </Fragment>
                ))}
                
                {/* Booking blocks overlay – uses midnight-based coordinates */}
                {bookings.length > 0 && (
                  <CalendarEvent
                    bookings={bookings}
                    employees={employees}
                    selectedDate={selectedDate}
                    openMinutes={DAY_START}
                    totalMinutes={TOTAL_DAY_MINUTES}
                    onBookingClick={(booking) => {
                      setSelectedBooking(booking);
                      setIsModalOpen(true);
                    }}
                  />
                )}
              </div>

              {/* current time indicator */}
              {nowMinutesFromMidnight !== null && (
                <div
                  className="pointer-events-none absolute inset-x-0 z-20"
                  style={{
                    top: `${(nowMinutesFromMidnight / TOTAL_DAY_MINUTES) * 100}%`,
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
      )}

      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        currency={currency}
      />
    </section>
  );
}

