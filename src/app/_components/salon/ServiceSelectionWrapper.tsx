"use client";

import { ServiceSelectionMenu } from "./ServiceSelectionMenu";

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
};

export function ServiceSelectionWrapper({ services, currency }: Props) {
  const handleServicesChange = (selectedServices: Service[]) => {
    // Handle selected services - can be extended to save to state or make booking
    console.log("Selected services:", selectedServices);
  };

  return (
    <ServiceSelectionMenu
      services={services}
      currency={currency}
      onServicesChange={handleServicesChange}
    />
  );
}

