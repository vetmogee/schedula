"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { ReservationModal } from "./ReservationModal";
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
  currentUser: {
    id: string;
    role: "CUSTOMER" | "SALON";
  } | null;
};

export function ReservationButton({ services, employees, currency, openingTime, closingTime, bookings, salonId, currentUser }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (!currentUser || currentUser.role !== "CUSTOMER") {
      toast.error("Please log in to create reservation");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        onClick={handleOpenModal}
        className="w-full bg-black hover:bg-gray-700 text-white font-semibold py-6 text-lg"
      >
        Create Reservation
      </Button>
      <ReservationModal
        services={services}
        employees={employees}
        currency={currency}
        openingTime={openingTime}
        closingTime={closingTime}
        bookings={bookings}
        salonId={salonId}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}

