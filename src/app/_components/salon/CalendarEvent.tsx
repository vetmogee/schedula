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

  // Sum up all service durations
  const durationMinutes = getTotalDurationMinutes(booking);

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
  const totalMinutes = getTotalDurationMinutes(booking);
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes > 0 ? ` ${minutes}min` : ""}`.trim();
}

// Calculate total duration in minutes for a booking
function getTotalDurationMinutes(booking: Booking): number {
  return booking.services.reduce((total, service) => {
    const d = new Date(service.duration);
    return total + d.getUTCHours() * 60 + d.getUTCMinutes();
  }, 0);
}

// Determine booking status: 'past', 'current', or 'future'
function getBookingStatus(booking: Booking): 'past' | 'current' | 'future' {
  const bookingStart = new Date(booking.date);
  const now = new Date();
  const durationMinutes = getTotalDurationMinutes(booking);
  
  // Calculate booking end time
  const bookingEnd = new Date(bookingStart);
  bookingEnd.setMinutes(bookingEnd.getMinutes() + durationMinutes);
  
  if (bookingEnd.getTime() < now.getTime()) {
    return 'past'; // Booking has ended
  } else if (bookingStart.getTime() <= now.getTime()) {
    return 'current'; // Booking is currently running
  } else {
    return 'future'; // Booking hasn't started yet
  }
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
              const bookingStatus = getBookingStatus(booking);
              const isUnassigned = !booking.employee;

              // Determine color classes based on booking status
              const getStatusClasses = () => {
                switch (bookingStatus) {
                  case 'past':
                    return "bg-gray-500 text-gray-300 hover:bg-gray-600 border-gray-600/50";
                  case 'current':
                    return "bg-blue-500 text-white hover:bg-blue-600 border-blue-600/50";
                  case 'future':
                    return "bg-[#ffb5c2] text-gray-900 hover:bg-[#eb9baa] border-gray-200";
                }
              };

              const getStatusLabel = () => {
                switch (bookingStatus) {
                  case 'past':
                    return " - Past";
                  case 'current':
                    return " - Currently Running";
                  case 'future':
                    return " - Upcoming";
                }
              };

              return (
                <div
                  key={booking.id}
                  onClick={() => onBookingClick?.(booking)}
                  className={`absolute left-1 right-1 pointer-events-auto rounded-md shadow-xl border p-2 overflow-hidden transition-colors cursor-pointer ${getStatusClasses()}`}
                  style={style}
                  title={`${timeLabel} - ${serviceNames} (${durationLabel})${isUnassigned ? " - Unassigned" : ""}${getStatusLabel()}`}
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
