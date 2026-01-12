import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
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
    include: {
      salon: true,
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  const isSalon = dbUser.role === "SALON";

  if (!isSalon) {
    // Non-salon users can be redirected to home for now
    redirect("/");
  }

  const salon = dbUser.salon;

  if (!salon) {
    // Salon user without a salon record should complete settings first
    redirect("/settings");
  }

  const now = new Date();

  const [todayCount, weekCount, upcomingBookings, recentBookings] =
    await Promise.all([
      prisma.booking.count({
        where: {
          salonId: salon.id,
          date: {
            gte: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              0,
              0,
              0,
            ),
            lt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() + 1,
              0,
              0,
              0,
            ),
          },
        },
      }),
      prisma.booking.count({
        where: {
          salonId: salon.id,
          date: {
            gte: now,
            lt: new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate() + 7,
              23,
              59,
              59,
              999,
            ),
          },
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma.booking.findMany as any)({
        where: {
          salonId: salon.id,
          date: {
            gte: now,
          },
        },
        include: {
          customer: true,
          employee: true,
          bookingServices: {
            include: {
              service: true,
            },
          },
        },
        orderBy: { date: "asc" },
        take: 10,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma.booking.findMany as any)({
        where: {
          salonId: salon.id,
          date: {
            lt: now,
          },
        },
        include: {
          customer: true,
          employee: true,
          bookingServices: {
            include: {
              service: true,
            },
          },
        },
        orderBy: { date: "desc" },
        take: 10,
      }),
    ]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Salon Dashboard
          </h1>
          <p className="text-gray-700">
            Welcome back{dbUser.name ? `, ${dbUser.name}` : ""}. Manage your
            bookings, availability, and salon details from here.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-5 border border-white/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">
              Today&apos;s Bookings
            </p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{todayCount}</p>
            <p className="mt-1 text-xs text-gray-500">
              {todayCount === 0
                ? "You don't have any bookings for today yet."
                : "Great work – here are your appointments for today."}
            </p>
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-5 border border-white/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">
              Upcoming Week
            </p>
            <p className="mt-3 text-3xl font-bold text-gray-900">{weekCount}</p>
            <p className="mt-1 text-xs text-gray-500">
              {weekCount === 0
                ? "Once customers start booking, you'll see upcoming appointments here."
                : "You have clients booked in the next 7 days."}
            </p>
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-5 border border-white/60">
            <p className="text-xs font-semibold uppercase tracking-wide text-pink-500">
              Profile completeness
            </p>
            <p className="mt-3 text-3xl font-bold text-gray-900">40%</p>
            <p className="mt-1 text-xs text-gray-500">
              Add services, opening hours, and photos to complete your salon
              profile.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1.5fr]">
          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
            <h2 className="text-lg font-semibold text-gray-900">
              Upcoming appointments
            </h2>
            {upcomingBookings.length === 0 ? (
              <>
                <p className="mt-2 text-sm text-gray-600">
                  You don&apos;t have any upcoming appointments yet. When
                  customers book with your salon, they&apos;ll appear in this
                  list.
                </p>
                <div className="mt-4 rounded-xl border border-dashed border-pink-200 bg-pink-50/60 px-4 py-6 text-center text-sm text-pink-700">
                  Appointment management will appear here once booking is
                  enabled.
                </div>
              </>
            ) : (
              <ul className="mt-3 divide-y divide-pink-50">
                {upcomingBookings.map((booking: any) => {
                  const date = new Date(booking.date);
                  const dateLabel = date.toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  const timeLabel = date.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <li key={booking.id} className="py-3 flex items-center gap-3">
                      <div className="w-16 text-xs font-semibold text-pink-600 text-right">
                        <div>{dateLabel}</div>
                        <div className="text-[11px] text-gray-500">
                          {timeLabel}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {booking.customer.name ?? "Customer"}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {booking.bookingServices.map((bs: any) => bs.service.name).join(", ")} ·{" "}
                          {booking.employee?.name ?? "Unassigned"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick actions
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-pink-700">
              <li className="rounded-lg bg-pink-50/80 px-3 py-2">
                Configure your opening hours
              </li>
              <li className="rounded-lg bg-pink-50/80 px-3 py-2">
                Add services and pricing
              </li>
              <li className="rounded-lg bg-pink-50/80 px-3 py-2">
                Upload salon photos and description
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
          <h2 className="text-lg font-semibold text-gray-900">
            Booking history
          </h2>
          {recentBookings.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">
              You don&apos;t have any past bookings yet. Once clients start
              visiting your salon, you&apos;ll see their history here.
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-xs uppercase text-gray-500 border-b border-pink-100">
                  <tr>
                    <th className="py-2 pr-4 text-left">Date</th>
                    <th className="py-2 pr-4 text-left">Customer</th>
                    <th className="py-2 pr-4 text-left">Service</th>
                    <th className="py-2 pr-4 text-left">Employee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {recentBookings.map((booking: any) => {
                    const date = new Date(booking.date);
                    const dateLabel = date.toLocaleDateString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const timeLabel = date.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <tr key={booking.id}>
                        <td className="py-2 pr-4 whitespace-nowrap text-gray-800">
                          <div>{dateLabel}</div>
                          <div className="text-xs text-gray-500">
                            {timeLabel}
                          </div>
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap text-gray-800">
                          {booking.customer.name ?? "Customer"}
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap text-gray-800">
                          {booking.bookingServices.map((bs: any) => bs.service.name).join(", ")}
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap text-gray-800">
                          {booking.employee?.name ?? "Unassigned"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}


