"use client";

import { useState } from "react";
import { Button } from "@/app/_components/ui/button";
import { X } from "lucide-react";

type Service = {
  id: number;
  name: string;
  price: number;
  duration: Date;
  category: {
    name: string;
  };
};

type Props = {
  services: Service[];
  currency: string | null;
  onServicesChange: (selectedServices: Service[]) => void;
};

export function ServiceSelectionMenu({
  services,
  currency,
  onServicesChange,
}: Props) {
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  const formatDuration = (date: Date) => {
    const d = new Date(date);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    if (hours === 0) {
      return `${minutes} min`;
    }
    return `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`.trim();
  };

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);
    let newSelection: Service[];

    if (isSelected) {
      newSelection = selectedServices.filter((s) => s.id !== service.id);
    } else {
      newSelection = [...selectedServices, service];
    }

    setSelectedServices(newSelection);
    onServicesChange(newSelection);
  };

  const removeService = (serviceId: number) => {
    const newSelection = selectedServices.filter((s) => s.id !== serviceId);
    setSelectedServices(newSelection);
    onServicesChange(newSelection);
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const totalDuration = selectedServices.reduce((sum, service) => {
    const d = new Date(service.duration);
    return sum + d.getHours() * 60 + d.getMinutes();
  }, 0);

  const formatTotalDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins} min`;
    }
    return `${hours}h ${mins > 0 ? `${mins}min` : ""}`.trim();
  };

  // Group services by category
  const servicesByCategory = new Map<string, Service[]>();
  services.forEach((service) => {
    const categoryName = service.category.name;
    if (!servicesByCategory.has(categoryName)) {
      servicesByCategory.set(categoryName, []);
    }
    servicesByCategory.get(categoryName)!.push(service);
  });

  return (
    <div className="space-y-4 h-full flex flex-col">
        <h2 className="text-xl font-semibold text-gray-900">Select Services</h2>
      {/* Services List - Scrollable */}
      {isOpen && (
        <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60 flex-1 min-h-0">
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            {Array.from(servicesByCategory.entries()).map(
              ([categoryName, categoryServices]) => (
                <div key={categoryName}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {categoryName}
                  </h3>
                  <div className="space-y-2">
                    {categoryServices.map((service) => {
                      const isSelected = selectedServices.some((s) => s.id === service.id);
                      return (
                        <button
                          key={service.id}
                          onClick={() => toggleService(service)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            isSelected
                              ? "bg-pink-100 border-pink-300"
                              : "bg-pink-50/60 border-pink-100 hover:bg-pink-100"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{service.name}</p>
                              <p className="text-sm text-gray-600">
                                {formatDuration(service.duration)}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900 ml-4">
                              {currency || "USD"} {service.price.toFixed(2)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      )}

    </div>
  );
}

