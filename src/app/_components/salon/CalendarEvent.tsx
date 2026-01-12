"use client";

import { useMemo, useState } from "react";
import { DateNavigation } from "./DateNavigation";

type Booking = {
  id: number;
  date: Date;
  services: {
    name: string;
    duration: Date;
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
  bookings: Booking[];
  employees: { id: number; name: string }[];
  openingTime: string | null;
  closingTime: string | null;
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

export function CalendarEvent({
  bookings,
  employees,
  openingTime,
  closingTime,
}: Props) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const [openMinutes, closeMinutes] = useMemo(() => {
    const open = parseTimeToMinutes(openingTime) ?? 9 * 60;
    const close = parseTimeToMinutes(closingTime) ?? 17 * 60;
    if (close <= open) {
      return [open, open + 8 * 60];
    }
    return [open, close];
  }, [openingTime, closingTime]);

  const totalMinutes = closeMinutes - openMinutes;

  // Filter bookings for the selected date
  const filteredBookings = useMemo(() => {
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    return bookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === selectedDateOnly.getTime();
    });
  }, [bookings, selectedDate]);

  // Sort bookings by time
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }, [filteredBookings]);

  // Calculate booking position and height
  const getBookingStyle = (booking: Booking) => {
    const bookingDate = new Date(booking.date);
    const bookingMinutes = bookingDate.getHours() * 60 + bookingDate.getMinutes();
    const startOffset = bookingMinutes - openMinutes;
    
    // Sum up all service durations
    const durationMinutes = booking.services.reduce((total, service) => {
      const d = new Date(service.duration);
      return total + d.getHours() * 60 + d.getMinutes();
    }, 0);
    
    const topPercent = (startOffset / totalMinutes) * 100;
    const heightPercent = (durationMinutes / totalMinutes) * 100;

    return {
      top: `${topPercent}%`,
      height: `${heightPercent}%`,
    };
  };

  // Get employee column index
  const getEmployeeColumn = (employeeId: number | null) => {
    if (!employeeId) return 0;
    const index = employees.findIndex((e) => e.id === employeeId);
    return index >= 0 ? index + 1 : 0;
  };

  const getDateLabel = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    if (selectedDateOnly.getTime() === today.getTime()) {
      return "Today's Bookings";
    }
    return "Bookings";
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {getDateLabel()}
        </h2>
        <DateNavigation selectedDate={selectedDate} onDateChange={setSelectedDate} />
        
        {sortedBookings.length === 0 ? (
          <p className="text-gray-600 text-sm mt-4">
            No bookings scheduled for this date.
          </p>
        ) : (
          <div className="space-y-2 mt-4">
            {sortedBookings.map((booking) => {
              const bookingDate = new Date(booking.date);
              const timeLabel = bookingDate.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              });

              const totalDurationMinutes = booking.services.reduce((total, service) => {
                const d = new Date(service.duration);
                return total + d.getHours() * 60 + d.getMinutes();
              }, 0);
              const durationLabel =
                totalDurationMinutes < 60
                  ? `${totalDurationMinutes} min`
                  : `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60 > 0 ? `${totalDurationMinutes % 60}min` : ""}`.trim();

              return (
                <div
                  key={booking.id}
                  className="p-3 rounded-lg bg-pink-50/60 border border-pink-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {timeLabel} - {booking.services.map((s) => s.name).join(", ")}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {booking.employee?.name || "Unassigned"} ·{" "}
                        {durationLabel}
                      </p>
                      {booking.customer.name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Customer: {booking.customer.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

