import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase/server";
import { SalonServicesManager } from "../_components/salon/SalonServicesManager";

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

export async function createServiceCategory(formData: FormData) {
  "use server";

  const name = (formData.get("name") || "").toString().trim();

  if (!name) {
    return;
  }

  const { authUser, salon } = await requireSalonUser();

  const existingCount = await prisma.serviceCategory.count({
    where: { salonId: salon.id },
  });

  await prisma.serviceCategory.create({
    data: {
      name,
      userId: authUser.id,
      salonId: salon.id,
      position: existingCount,
    },
  });

  revalidatePath("/services");
}

export async function createService(formData: FormData) {
  "use server";

  const name = (formData.get("name") || "").toString().trim();
  const priceRaw = (formData.get("price") || "").toString().trim();
  const durationRaw = (formData.get("duration") || "").toString().trim();
  const categoryIdRaw = (formData.get("categoryId") || "").toString().trim();

  if (!name || !priceRaw || !durationRaw || !categoryIdRaw) {
    return;
  }

  const price = parseFloat(priceRaw);
  const categoryId = parseInt(categoryIdRaw, 10);

  if (Number.isNaN(price) || Number.isNaN(categoryId)) {
    return;
  }

  // Expecting durationRaw like "01:30" → convert to a Date stored as time
  // Use UTC to avoid timezone issues
  const [hours, minutes] = durationRaw.split(":").map(Number);
  const duration = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));

  const { salon } = await requireSalonUser();

  const existingCount = await prisma.service.count({
    where: { salonId: salon.id, categoryId },
  });

  await prisma.service.create({
    data: {
      name,
      price,
      duration,
      categoryId,
      salonId: salon.id,
      position: existingCount,
    },
  });

  revalidatePath("/services");
}

export async function updateServiceCategory(formData: FormData) {
  "use server";

  const idRaw = (formData.get("id") || "").toString().trim();
  const name = (formData.get("name") || "").toString().trim();

  const id = parseInt(idRaw, 10);
  if (!id || !name) {
    return;
  }

  const { salon } = await requireSalonUser();

  await prisma.serviceCategory.updateMany({
    where: { id, salonId: salon.id },
    data: { name },
  });

  revalidatePath("/services");
}

export async function updateService(formData: FormData) {
  "use server";

  const idRaw = (formData.get("id") || "").toString().trim();
  const name = (formData.get("name") || "").toString().trim();
  const priceRaw = (formData.get("price") || "").toString().trim();
  const durationRaw = (formData.get("duration") || "").toString().trim();

  const id = parseInt(idRaw, 10);
  const price = parseFloat(priceRaw);

  if (!id || !name || Number.isNaN(price) || !durationRaw) {
    return;
  }

  // Use UTC to avoid timezone issues
  const [hours, minutes] = durationRaw.split(":").map(Number);
  const duration = new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
  const { salon } = await requireSalonUser();

  await prisma.service.updateMany({
    where: { id, salonId: salon.id },
    data: {
      name,
      price,
      duration,
    },
  });

  revalidatePath("/services");
}

export async function swapCategoryPosition(formData: FormData) {
  "use server";

  const idRaw = (formData.get("id") || "").toString().trim();
  const direction = (formData.get("direction") || "").toString().trim(); // "up" | "down"

  const id = parseInt(idRaw, 10);
  if (!id || (direction !== "up" && direction !== "down")) {
    return;
  }

  const { salon } = await requireSalonUser();

  const categories = await prisma.serviceCategory.findMany({
    where: { salonId: salon.id },
    orderBy: [{ id: "asc" }],
  });

  const index = categories.findIndex((c) => c.id === id);
  if (index === -1) return;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= categories.length) return;

  const current = categories[index];
  const other = categories[targetIndex];

  await prisma.$transaction([
    prisma.serviceCategory.update({
      where: { id: current.id },
      data: { position: other.position },
    }),
    prisma.serviceCategory.update({
      where: { id: other.id },
      data: { position: current.position },
    }),
  ]);

  revalidatePath("/services");
}

export async function swapServicePosition(formData: FormData) {
  "use server";

  const idRaw = (formData.get("id") || "").toString().trim();
  const categoryIdRaw = (formData.get("categoryId") || "").toString().trim();
  const direction = (formData.get("direction") || "").toString().trim(); // "up" | "down"

  const id = parseInt(idRaw, 10);
  const categoryId = parseInt(categoryIdRaw, 10);

  if (
    !id ||
    !categoryId ||
    (direction !== "up" && direction !== "down")
  ) {
    return;
  }

  const { salon } = await requireSalonUser();

  const services = await prisma.service.findMany({
    where: { salonId: salon.id, categoryId },
    orderBy: [{ id: "asc" }],
  });

  const index = services.findIndex((s) => s.id === id);
  if (index === -1) return;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= services.length) return;

  const current = services[index];
  const other = services[targetIndex];

  await prisma.$transaction([
    prisma.service.update({
      where: { id: current.id },
      data: { position: other.position },
    }),
    prisma.service.update({
      where: { id: other.id },
      data: { position: current.position },
    }),
  ]);

  revalidatePath("/services");
}

export async function reorderServices(formData: FormData) {
  "use server";

  const categoryIdRaw = (formData.get("categoryId") || "").toString().trim();
  const orderedIdsRaw = (formData.get("orderedIds") || "").toString().trim();

  const categoryId = parseInt(categoryIdRaw, 10);
  if (!categoryId || !orderedIdsRaw) {
    return;
  }

  let orderedIds: number[];
  try {
    orderedIds = JSON.parse(orderedIdsRaw);
  } catch {
    return;
  }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return;
  }

  const { salon } = await requireSalonUser();

  const services = await prisma.service.findMany({
    where: { salonId: salon.id, categoryId },
    orderBy: [{ id: "asc" }],
  });

  const idsSet = new Set(services.map((s) => s.id));
  if (!orderedIds.every((id) => idsSet.has(id))) {
    return;
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.service.update({
        where: { id },
        data: { position: index },
      })
    )
  );

  revalidatePath("/services");
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


