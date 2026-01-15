"use client";

import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  selectedDate: Date;
  openMinutes: number;
  totalMinutes: number;
  onBookingClick?: (booking: Booking) => void;
};

// Calculate booking position and height
function getBookingStyle(
  booking: Booking,
  openMinutes: number,
  totalMinutes: number,
) {
  const bookingDate = new Date(booking.date);
  const bookingMinutes = bookingDate.getHours() * 60 + bookingDate.getMinutes();
  const startOffset = bookingMinutes - openMinutes;

  // Sum up all service durations (use UTC methods to avoid timezone issues)
  const durationMinutes = booking.services.reduce((total, service) => {
    const d = new Date(service.duration);
    return total + d.getUTCHours() * 60 + d.getUTCMinutes();
  }, 0);

  const topPercent = (startOffset / totalMinutes) * 100;
  const heightPercent = (durationMinutes / totalMinutes) * 100;

  return {
    top: `${topPercent}%`,
    height: `${heightPercent}%`,
  };
}

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(booking: Booking) {
  const totalMinutes = booking.services.reduce((total, service) => {
    const d = new Date(service.duration);
    // Use UTC methods to avoid timezone issues with Time type
    return total + d.getUTCHours() * 60 + d.getUTCMinutes();
  }, 0);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`.trim();
}

// Check if booking is in the past
function isPastBooking(booking: Booking) {
  const bookingDate = new Date(booking.date);
  const now = new Date();
  return bookingDate.getTime() < now.getTime();
}

export function CalendarEvent({
  bookings,
  employees,
  selectedDate,
  openMinutes,
  totalMinutes,
  onBookingClick,
}: Props) {
  const isMobile = useIsMobile();
  const timeColumnWidth = isMobile ? 56 : 96;

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

  // Get bookings for a specific employee column
  const getBookingsForEmployee = (employeeId: number | null) => {
    return filteredBookings.filter((booking) => {
      if (!employeeId) {
        return !booking.employee;
      }
      return booking.employee?.id === employeeId;
    });
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none z-30 grid col-span-full"
      style={{
        gridTemplateColumns: `${timeColumnWidth}px repeat(${employees.length}, minmax(0, 1fr))`,
        gridColumn: `1 / span ${employees.length + 1}`,
      }}
    >
      {/* Time column - empty, ensures grid alignment */}
      <div className="relative" />
      {employees.map((employee, employeeIndex) => {
        const employeeBookings = getBookingsForEmployee(employee.id);
        // Include unassigned bookings in the first employee column
        const unassignedBookings =
          employeeIndex === 0 ? getBookingsForEmployee(null) : [];
        const allBookings = [...employeeBookings, ...unassignedBookings];

        return (
          <div key={`bookings-${employee.id}`} className="relative">
            {allBookings.map((booking) => {
              const style = getBookingStyle(booking, openMinutes, totalMinutes);
              const bookingDate = new Date(booking.date);
              const timeLabel = formatTime(bookingDate);
              const durationLabel = formatDuration(booking);
              const serviceNames = booking.services
                .map((s) => s.name)
                .join(", ");
              const isPast = isPastBooking(booking);
              const isUnassigned = !booking.employee;

              return (
                <div
                  key={booking.id}
                  onClick={() => onBookingClick?.(booking)}
                  className={`absolute left-1 right-1 pointer-events-auto rounded-md shadow-xl border p-2 overflow-hidden transition-colors cursor-pointer ${
                    isPast
                      ? "bg-gray-500 text-gray-300 hover:bg-gray-600 border-gray-600/50"
                      : "bg-[#ffb5c2] text-gray-900 hover:bg-[#eb9baa] border-gray-200"
                  }`}
                  style={style}
                  title={`${timeLabel} - ${serviceNames} (${durationLabel})${isUnassigned ? " - Unassigned" : ""}${isPast ? " - Past" : ""}`}
                >
                  <div className="text-xs font-semibold truncate">
                    {timeLabel}
                  </div>
                  <div className="text-xs truncate mt-0.5 opacity-95">
                    {serviceNames}
                  </div>
                  {booking.customer.name && (
                    <div className="text-xs mt-0.5 opacity-80 truncate">
                      {booking.customer.name}
                    </div>
                  )}
                  <div className="text-xs mt-0.5 opacity-75">
                    {durationLabel}
                    {isUnassigned && " · Unassigned"}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
