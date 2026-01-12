"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";

type Booking = {
  id: number;
  date: Date;
  employeeId: number;
  services: {
    duration: Date;
  }[];
};

type Props = {
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedEmployeeId: number | null;
  openingTime: string | null;
  closingTime: string | null;
  bookings: Booking[];
  onDateSelect: (date: Date | null) => void;
  onTimeSelect: (time: string | null) => void;
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

export function DateTimeSelection({
  selectedDate,
  selectedTime,
  selectedEmployeeId,
  openingTime,
  closingTime,
  bookings,
  onDateSelect,
  onTimeSelect,
}: Props) {
  const [openMinutes, closeMinutes] = useMemo(() => {
    const open = parseTimeToMinutes(openingTime) ?? 9 * 60;
    const close = parseTimeToMinutes(closingTime) ?? 17 * 60;
    if (close <= open) {
      return [open, open + 8 * 60];
    }
    return [open, close];
  }, [openingTime, closingTime]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let t = openMinutes; t < closeMinutes; t += 30) {
      slots.push(minutesToLabel(t));
    }
    return slots;
  }, [openMinutes, closeMinutes]);

  // Check if a time slot is unavailable (booked, in the past, or beyond maximum booking date)
  const isTimeSlotUnavailable = (time: string, date: Date | null, employeeId: number | null) => {
    if (!date || !employeeId) return true; // If no date or employee selected, mark as unavailable

    const now = new Date();
    const [hours, minutes] = time.split(":").map(Number);
    const slotDateTime = new Date(date);
    slotDateTime.setHours(hours, minutes, 0, 0);

    // Check if time is in the past (only for today - future dates are always valid time-wise)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(date);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    // Only check for past times if the selected date is today
    if (selectedDateOnly.getTime() === today.getTime() && slotDateTime < now) {
      return true;
    }

    // Check if date is beyond maximum booking date (1 month ahead)
    const maxDate = new Date(now);
    maxDate.setMonth(now.getMonth() + 1);
    maxDate.setHours(23, 59, 59, 999);
    
    if (date > maxDate) {
      return true;
    }

    // Check if time slot is booked for the selected employee
    const slotEndTime = new Date(slotDateTime);
    slotEndTime.setMinutes(slotEndTime.getMinutes() + 30); // 30-minute slots

    return bookings.some((booking) => {
      if (booking.employeeId !== employeeId) return false;

      const bookingDate = new Date(booking.date);
      // Check if booking is on the same date
      if (bookingDate.toDateString() !== date.toDateString()) return false;

      const bookingEndTime = new Date(bookingDate);
      // Sum up all service durations
      const totalDurationMinutes = booking.services.reduce((total, service) => {
        const d = new Date(service.duration);
        return total + d.getHours() * 60 + d.getMinutes();
      }, 0);
      bookingEndTime.setMinutes(bookingEndTime.getMinutes() + totalDurationMinutes);

      // Check if the time slot overlaps with the booking
      // Overlap occurs if: slotStart < bookingEnd AND slotEnd > bookingStart
      return slotDateTime < bookingEndTime && slotEndTime > bookingDate;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate maximum booking date (1 month from today)
  const maxBookingDate = new Date(today);
  maxBookingDate.setMonth(today.getMonth() + 1);
  maxBookingDate.setHours(23, 59, 59, 999);

  // Generate date options from today up to 1 month ahead
  const dateOptions = useMemo(() => {
    const options: { value: string; label: string; date: Date }[] = [];
    const currentDate = new Date(today);
    
    while (currentDate <= maxBookingDate) {
      const value = currentDate.toISOString().split("T")[0];
      const label = format(currentDate, "dd.MM.yyyy");
      options.push({ value, label, date: new Date(currentDate) });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return options;
  }, [today, maxBookingDate]);

  const selectedDateValue = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : undefined;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Date & Time</h3>
      
      {/* Date Selection */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Date</h4>
        <Select
          value={selectedDateValue}
          onValueChange={(value) => {
            const option = dateOptions.find((opt) => opt.value === value);
            onDateSelect(option ? option.date : null);
          }}
        >
          <SelectTrigger className="w-full bg-white/80">
            <SelectValue placeholder="Select a date" />
          </SelectTrigger>
          <SelectContent>
            {dateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Time</h4>
          {!selectedEmployeeId && (
            <p className="text-sm text-gray-500 text-center">
              Please select an employee first
            </p>
          )}
          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-4 border border-white/60">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
              {timeSlots.map((time) => {
                const isSelected = selectedTime === time;
                const isUnavailable = !selectedEmployeeId || isTimeSlotUnavailable(time, selectedDate, selectedEmployeeId);
                return (
                  <button
                    key={time}
                    onClick={() => !isUnavailable && onTimeSelect(isSelected ? null : time)}
                    disabled={isUnavailable}
                    className={`p-2 rounded-lg border-2 transition-all text-sm ${
                      isUnavailable
                        ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
                        : isSelected
                        ? "bg-pink-100 border-pink-500 font-semibold text-pink-900"
                        : "bg-white border-gray-200 hover:border-pink-300 hover:bg-pink-50/60 text-gray-900"
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
          {selectedTime && (
            <p className="text-sm text-gray-600 text-center">
              Selected time: {selectedTime}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

