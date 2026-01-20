"use client";

import { useState, useTransition } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/app/_components/ui/sheet";
import { ServiceSelectionMenu } from "./ServiceSelection";
import { EmployeeSelection } from "./EmployeeSelection";
import { DateTimeSelection } from "./DateTimeSelection";
import { Button } from "@/app/_components/ui/button";
import { X } from "lucide-react";
import { format } from "date-fns";
import { createBookingAction } from "@/app/actions/bookings";
import { toast } from "sonner";

type Service = {
  id: number;
  name: string;
  price: number;
  duration: Date;
  category: {
    name: string;
  };
};

type Employee = {
  id: number;
  name: string;
};

type Booking = {
  id: number;
  date: Date;
  employeeId: number;
  services: {
    duration: Date;
  }[];
};

type Props = {
  services: Service[];
  employees: Employee[];
  currency: string | null;
  openingTime: string | null;
  closingTime: string | null;
  bookings: Booking[];
  salonId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReservationModal({
  services,
  employees,
  currency,
  openingTime,
  closingTime,
  bookings,
  salonId,
  isOpen,
  onOpenChange,
}: Props) {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleServicesChange = (newSelectedServices: Service[]) => {
    setSelectedServices(newSelectedServices);
  };

  const handleCreateReservation = () => {
    if (!canCreateReservation) return;

    startTransition(async () => {
      const result = await createBookingAction({
        salonId,
        employeeId: selectedEmployeeId!,
        serviceIds: selectedServices.map((s) => s.id),
        date: selectedDate!,
        time: selectedTime!,
      });

      if (result.ok) {
        toast.success("Reservation created successfully!");
        // Close modal after creating reservation
        onOpenChange(false);
        // Reset selections
        setSelectedServices([]);
        setSelectedEmployeeId(null);
        setSelectedDate(null);
        setSelectedTime(null);
      } else {
        toast.error(result.error || "Failed to create reservation");
      }
    });
  };

  const canCreateReservation = 
    selectedServices.length > 0 && 
    selectedEmployeeId !== null && 
    selectedDate !== null && 
    selectedTime !== null;

  // Calculate totals
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => {
    const d = new Date(service.duration);
    // Use UTC methods to avoid timezone issues with Time type
    return sum + d.getUTCHours() * 60 + d.getUTCMinutes();
  }, 0);

  const formatDuration = (date: Date) => {
    const d = new Date(date);
    // Use UTC methods to avoid timezone issues with Time type
    const hours = d.getUTCHours();
    const minutes = d.getUTCMinutes();
    if (hours === 0) {
      return `${minutes} min`;
    }
    return `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`.trim();
  };

  const formatTotalDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins} min`;
    }
    return `${hours}h ${mins > 0 ? `${mins}min` : ""}`.trim();
  };

  const removeService = (serviceId: number) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== serviceId));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-5/6 sm:max-w-2xl flex flex-col p-0">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-6 pb-4">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold text-gray-900">
                Create Reservation
              </SheetTitle>
              <SheetDescription>
                Select the services you&apos;d like to book and choose your preferred time.
              </SheetDescription>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-5 space-y-6 pb-4">
            {/* Employee Selection */}
            <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
              <EmployeeSelection
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                onEmployeeSelect={setSelectedEmployeeId}
              />
            </div>

            {/* Date & Time Selection */}
            <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
              <DateTimeSelection
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                selectedEmployeeId={selectedEmployeeId}
                openingTime={openingTime}
                closingTime={closingTime}
                bookings={bookings}
                selectedServices={selectedServices}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedTime}
                disabled={selectedServices.length === 0}
              />
            </div>

            {/* Service Selection */}
            <ServiceSelectionMenu
              services={services}
              currency={currency}
              onServicesChange={handleServicesChange}
            />
          </div>

          {/* Fixed Bottom Section - Selected Services and Totals */}
          {selectedServices.length > 0 && (
            <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg z-10 px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">
                  Selected Services ({selectedServices.length})
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {selectedEmployeeId && employees.find((e) => e.id === selectedEmployeeId) && (
                    <span>
                      Employee: <span className="font-medium text-gray-900">
                        {employees.find((e) => e.id === selectedEmployeeId)?.name}
                      </span>
                    </span>
                  )}
                  {selectedDate && selectedTime && (
                    <span>
                      {format(selectedDate, "dd.MM.yyyy")} at {selectedTime}
                    </span>
                  )}
                </div>
              </div>
              <div className={`space-y-2 mb-3 ${selectedServices.length > 4 ? 'max-h-[120px] overflow-y-auto pr-2' : ''}`}>
                {selectedServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-pink-50/60 border border-pink-100"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{service.name}</p>
                      <p className="text-xs text-gray-600">
                        {formatDuration(service.duration)} · {currency || "USD"}{" "}
                        {service.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeService(service.id)}
                      className="ml-2 p-1 hover:bg-pink-200 rounded transition-colors"
                      aria-label="Remove service"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-pink-200 mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Duration:</span>
                  <span className="font-medium text-gray-900">
                    {formatTotalDuration(totalDuration)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Price:</span>
                  <span className="font-semibold text-gray-900">
                    {currency || "USD"} {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              {canCreateReservation && (
                <Button
                  onClick={handleCreateReservation}
                  disabled={isPending}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Creating..." : "Create Reservation"}
                </Button>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

