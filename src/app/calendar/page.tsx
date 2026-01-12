import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase/server";
import { SalonScheduleCalendar } from "../_components/salon/SalonScheduleCalendar";

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
    include: {
      employees: true,
    },
  });

  if (!salon) {
    redirect("/settings");
  }

  return { salon };
}

export default async function SalonCalendarPage() {
  const { salon } = await requireSalonUser();

  const openingTime =
    (salon as any).openingTime != null
      ? new Date((salon as any).openingTime).toISOString().substring(11, 16)
      : null;
  const closingTime =
    (salon as any).closingTime != null
      ? new Date((salon as any).closingTime).toISOString().substring(11, 16)
      : null;

  const employees = (salon.employees || []).map((employee) => ({
    id: employee.id,
    name: employee.name,
  }));

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Salon calendar
          </h1>
          <p className="text-gray-700 text-sm md:text-base">
            View your team&apos;s availability for today in a column-based calendar,
            with 30-minute time slots from opening to closing hours.
          </p>
        </header>

        <SalonScheduleCalendar
          openingTime={openingTime}
          closingTime={closingTime}
          employees={employees}
        />
      </div>
    </main>
  );
}


