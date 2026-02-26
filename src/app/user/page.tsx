import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';
import Link from "next/link";

async function requireCustomerUser() {
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

  if (dbUser.role !== "CUSTOMER") {
    redirect("/");
  }

  return { dbUser };
}

export default async function UserBookingsPage() {
  const { dbUser } = await requireCustomerUser();

  const now = new Date();

  // Get all bookings for this customer, ordered by date (upcoming first, then past)
  const bookings = await prisma.booking.findMany({
    where: {
      customerId: dbUser.id,
    },
    include: {
      salon: true,
      employee: true,
      bookingServices: {
        include: {
          service: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // Separate upcoming and past bookings
  const upcomingBookings = bookings.filter((booking) => booking.date >= now);
  const pastBookings = bookings.filter((booking) => booking.date < now);

  const formatDateTime = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] dark:from-background dark:to-background py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-foreground">
            My Bookings
          </h1>
          <Link
            href="/salons"
            className="text-pink-600 hover:text-pink-700 font-medium underline text-sm"
          >
            Browse Salons →
          </Link>
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-foreground">
              Upcoming ({upcomingBookings.length})
            </h2>
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur shadow-md p-6 border border-white/60 dark:border-border hover:shadow-lg transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-1">
                            <Link
                              href={`/salons/${booking.salon.id}`}
                              className="text-pink-600 hover:text-pink-700 underline"
                            >
                              {booking.salon.name}
                            </Link>
                          </h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs font-medium">
                          Upcoming
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700 dark:text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Services:</span>
                          <span>{booking.bookingServices.map((bs) => bs.service.name).join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Categories:</span>
                          <span>{booking.bookingServices.map((bs) => bs.service.category.name).join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Employee:</span>
                          <span>{booking.employee.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Date & Time:</span>
                          <span>{formatDateTime(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Duration:</span>
                          <span>
                            {(() => {
                              const totalMinutes = booking.bookingServices.reduce((total: number, bs) => {
                                const d = new Date(bs.service.duration);
                                // Use UTC methods to avoid timezone issues with Time type
                                return total + d.getUTCHours() * 60 + d.getUTCMinutes();
                              }, 0);
                              const hours = Math.floor(totalMinutes / 60);
                              const minutes = totalMinutes % 60;
                              if (hours === 0) {
                                return `${minutes} min`;
                              }
                              return `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`.trim();
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Price:</span>
                          <span>
                            {booking.salon.currency || "USD"}{" "}
                            {booking.bookingServices.reduce((sum: number, bs) => sum + bs.service.price, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-foreground">
              Past ({pastBookings.length})
            </h2>
            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl bg-white/60 dark:bg-card/60 backdrop-blur shadow-md p-6 border border-white/40 dark:border-border hover:shadow-lg transition-shadow opacity-90"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-foreground mb-1">
                            <Link
                              href={`/salons/${booking.salon.id}`}
                              className="text-pink-600 hover:text-pink-700 underline"
                            >
                              {booking.salon.name}
                            </Link>
                          </h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-muted text-gray-600 dark:text-muted-foreground text-xs font-medium">
                          Completed
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-700 dark:text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Services:</span>
                          <span>{booking.bookingServices.map((bs) => bs.service.name).join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Categories:</span>
                          <span>{booking.bookingServices.map((bs) => bs.service.category.name).join(", ")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Employee:</span>
                          <span>{booking.employee.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Date & Time:</span>
                          <span>{formatDateTime(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Duration:</span>
                          <span>
                            {(() => {
                              const totalMinutes = booking.bookingServices.reduce((total: number, bs) => {
                                const d = new Date(bs.service.duration);
                                // Use UTC methods to avoid timezone issues with Time type
                                return total + d.getUTCHours() * 60 + d.getUTCMinutes();
                              }, 0);
                              const hours = Math.floor(totalMinutes / 60);
                              const minutes = totalMinutes % 60;
                              if (hours === 0) {
                                return `${minutes} min`;
                              }
                              return `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`.trim();
                            })()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Price:</span>
                          <span>
                            {booking.salon.currency || "USD"}{" "}
                            {booking.bookingServices.reduce((sum: number, bs) => sum + bs.service.price, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="rounded-2xl bg-white/80 dark:bg-card/80 backdrop-blur shadow-md p-12 border border-white/60 dark:border-border text-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-foreground mb-2">
              No bookings yet
            </h2>
            <p className="text-gray-600 dark:text-muted-foreground mb-6">
              Start by browsing salons and making your first reservation!
            </p>
            <Link
              href="/salons"
              className="inline-block px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse Salons
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
