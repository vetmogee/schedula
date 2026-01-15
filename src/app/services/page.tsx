import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase/server";
import { SalonServicesManager } from "../_components/salon/SalonServicesManager";
import {
  createServiceCategory,
  createService,
  updateServiceCategory,
  updateService,
  swapCategoryPosition,
  reorderServices,
} from "../actions/services";

async function requireSalonUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    redirect("/login");
  }

  const { data: authData } = await supabase.auth.getUser(token);
  const authUser = authData?.user;

  if (!authUser) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
  });

  if (!dbUser) {
    redirect("/login");
  }

  if (dbUser.role !== "SALON") {
    redirect("/");
  }

  const salon = await prisma.salon.findUnique({
    where: { userId: authUser.id },
  });

  if (!salon) {
    redirect("/settings");
  }

  return { authUser, salon };
}

export default async function ServicesPage() {
  const { salon } = await requireSalonUser();
  const currency =
    salon.currency && salon.currency.length > 0
      ? salon.currency
      : "USD";

  const rawCategories = await prisma.serviceCategory.findMany({
    where: { salonId: salon.id },
    include: {
      services: true,
    },
    orderBy: { id: "asc" },
  });

  const mappedCategories = rawCategories
    .sort(
      (a, b) =>
        (a.position ?? 0) - (b.position ?? 0) || a.id - b.id
    )
    .map((category) => ({
      id: category.id,
      name: category.name,
      position: category.position ?? 0,
      services: category.services
        .slice()
        .sort(
          (a, b) =>
            (a.position ?? 0) - (b.position ?? 0) || a.id - b.id
        )
        .map((service) => ({
          id: service.id,
          name: service.name,
          price: service.price,
          // Keep duration as "HH:MM" string for the UI (use UTC to avoid timezone issues)
          duration: (() => {
            const d = new Date(service.duration);
            const hours = d.getUTCHours().toString().padStart(2, "0");
            const minutes = d.getUTCMinutes().toString().padStart(2, "0");
            return `${hours}:${minutes}`;
          })(),
          position: service.position ?? 0,
        })),
    }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Services
          </h1>
          <p className="text-gray-700">
            Manage your service categories and services for{" "}
            <span className="font-semibold">{salon.name}</span>.
          </p>
        </header>

        <SalonServicesManager
          categories={mappedCategories}
          currency={currency}
          createCategoryAction={createServiceCategory}
          createServiceAction={createService}
          updateCategoryAction={updateServiceCategory}
          updateServiceAction={updateService}
          swapCategoryPositionAction={swapCategoryPosition}
          reorderServicesAction={reorderServices}
        />
      </div>
    </main>
  );
}


