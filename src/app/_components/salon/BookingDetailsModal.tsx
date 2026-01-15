"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/_components/ui/sheet";

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
  booking: Booking | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
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

function formatServiceDuration(duration: Date) {
  const d = new Date(duration);
  // Use UTC methods to avoid timezone issues with Time type
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  if (hours === 0) {
    return `${minutes} min`;
  }
  return `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`.trim();
}

export function BookingDetailsModal({ booking, isOpen, onOpenChange }: Props) {
  if (!booking) return null;

  const bookingDate = new Date(booking.date);
  const isPast = bookingDate.getTime() < new Date().getTime();

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-5/6 sm:max-w-lg flex flex-col p-0">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900">
                Booking Details
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 space-y-6 pb-6">
            {/* Date & Time */}
            <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-pink-500 mb-3">
                Date & Time
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(bookingDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Time:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatTime(bookingDate)}
                  </span>
                </div>
                {isPast && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                      Past Booking
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Customer */}
            {booking.customer.name && (
              <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-pink-500 mb-3">
                  Customer
                </h3>
                <p className="text-sm font-medium text-gray-900">
                  {booking.customer.name}
                </p>
              </div>
            )}

            {/* Employee */}
            <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-pink-500 mb-3">
                Employee
              </h3>
              <p className="text-sm font-medium text-gray-900">
                {booking.employee?.name ?? "Unassigned"}
              </p>
            </div>

            {/* Services */}
            <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-pink-500 mb-3">
                Services ({booking.services.length})
              </h3>
              <div className="space-y-3">
                {booking.services.map((service, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-pink-50/60 border border-pink-100"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {service.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Duration: {formatServiceDuration(service.duration)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-pink-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Duration:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDuration(booking)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

