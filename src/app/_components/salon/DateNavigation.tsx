"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/app/_components/ui/calendar";
import { Button } from "@/app/_components/ui/button";

type Props = {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
};

export function DateNavigation({ selectedDate, onDateChange }: Props) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
    setIsCalendarOpen(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(date);
      setIsCalendarOpen(false);
    }
  };

  const formatDateDisplay = (date: Date) => {
    return format(date, "dd.MM.yyyy");
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      {/* Left Arrow */}
      <Button
        variant="outline"
        size="icon"
        onClick={goToPreviousDay}
        className="h-9 w-9 border-gray-300 hover:bg-pink-50 hover:border-pink-300"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Date Button with Calendar Popover */}
      <div className="relative">
        <Button
          variant="outline"
          onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          className="h-9 px-4 border-gray-300 hover:bg-pink-50 hover:border-pink-300 flex items-center gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="text-sm font-medium">{formatDateDisplay(selectedDate)}</span>
        </Button>

        {/* Calendar Popover */}
        {isCalendarOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsCalendarOpen(false)}
            />
            <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="rounded-md"
              />
              <div className="mt-2 pt-2 border-t border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="w-full text-sm"
                >
                  Go to Today
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Arrow */}
      <Button
        variant="outline"
        size="icon"
        onClick={goToNextDay}
        className="h-9 w-9 border-gray-300 hover:bg-pink-50 hover:border-pink-300"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

