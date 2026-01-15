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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleServicesChange = (_selectedServices: Service[]) => {
    // Handle selected services - can be extended to save to state or make booking
  };

  return (
    <ServiceSelectionMenu
      services={services}
      currency={currency}
      onServicesChange={handleServicesChange}
    />
  );
}

