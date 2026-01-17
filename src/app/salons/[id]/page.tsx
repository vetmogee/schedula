import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CalendarUser } from "@/app/_components/salon/CalendarUser";
import { ReservationButton } from "@/app/_components/salon/ReservationButton";
import { SalonGallery } from "@/app/_components/salon/SalonGallery";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase/server";

interface SalonDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const { data: authData } = await supabase.auth.getUser(token);
    const authUser = authData?.user;

    if (!authUser) {
      return null;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: authUser.id },
    });

    return dbUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export default async function SalonDetailPage({ params }: SalonDetailPageProps) {
  const { id } = await params;
  const salonId = parseInt(id, 10);

  if (isNaN(salonId)) {
    notFound();
  }

  const salon = await prisma.salon.findUnique({
    where: { id: salonId },
    include: {
      services: {
        include: {
          category: true,
        },
        orderBy: {
          position: "asc",
        },
      },
      employees: {
        orderBy: {
          name: "asc",
        },
      },
      categories: {
        orderBy: {
          position: "asc",
        },
      },
      bookings: {
        include: {
          bookingServices: {
            include: {
              service: true,
            },
          },
          employee: true,
          customer: true,
        },
        orderBy: {
          date: "asc",
        },
      },
      pictures: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!salon) {
    notFound();
  }

  // Format time for display
  const formatTime = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openingTime = formatTime(salon.openingTime);
  const closingTime = formatTime(salon.closingTime);

  // Format time for calendar components (HH:mm format)
  const openingTimeForCalendar = salon.openingTime
    ? new Date(salon.openingTime).toISOString().substring(11, 16)
    : null;
  const closingTimeForCalendar = salon.closingTime
    ? new Date(salon.closingTime).toISOString().substring(11, 16)
    : null;

  // Group services by category, maintaining category order
  const servicesByCategory = new Map<string, typeof salon.services>();
  salon.categories.forEach((category) => {
    servicesByCategory.set(category.name, []);
  });
  
  salon.services.forEach((service) => {
    const categoryName = service.category.name;
    const existing = servicesByCategory.get(categoryName) || [];
    existing.push(service);
    servicesByCategory.set(categoryName, existing);
  });

  // Get current user for authentication check
  const currentUser = await getCurrentUser();

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/salons"
            className="text-pink-600 hover:text-pink-700 font-medium underline text-sm"
          >
            ← Back to Salons
          </Link>
        </div>

        <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {salon.name}
          </h1>

          {salon.description && (
            <p className="text-gray-700 mb-6">{salon.description}</p>
          )}

          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {(salon.address || salon.city) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Location
                </h3>
                <p className="text-gray-900">
                  {salon.address && <span>{salon.address}</span>}
                  {salon.address && salon.city && <span>, </span>}
                  {salon.city && <span>{salon.city}</span>}
                </p>
              </div>
            )}

            {salon.phone && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Phone
                </h3>
                <p className="text-gray-900">{salon.phone.toString()}</p>
              </div>
            )}

            {(openingTime || closingTime) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Hours
                </h3>
                <p className="text-gray-900">
                  {openingTime && closingTime
                    ? `${openingTime} - ${closingTime}`
                    : openingTime || closingTime || "Not specified"}
                </p>
              </div>
            )}

            {salon.currency && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Currency
                </h3>
                <p className="text-gray-900">{salon.currency}</p>
              </div>
            )}
          </div>
        </div>

        {/* Salon Pictures Section */}
        <SalonGallery
          pictures={salon.pictures.map((picture) => {
            // Convert Buffer to base64 data URL in Server Component
            const base64 = Buffer.from(picture.data).toString("base64");
            // Normalize mimeType: handle variations and default to PNG/JPEG/JPG
            let mimeType = picture.mimeType || "image/png";
            // Normalize common variations
            if (mimeType === "image/jpg") {
              mimeType = "image/jpeg";
            }
            // Default to PNG if mimeType is not a recognized image format
            if (!mimeType.startsWith("image/")) {
              mimeType = "image/png";
            }
            const dataUrl = `data:${mimeType};base64,${base64}`;
            return {
              id: picture.id,
              dataUrl,
            };
          })}
          salonName={salon.name}
        />

        {salon.services.length === 0 && salon.employees.length === 0 && (
          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60 text-center">
            <p className="text-gray-600">
              This salon hasn&apos;t added any services or employees yet.
            </p>
          </div>
        )}

        {/* Calendar and Create Reservation Button */}
        <div className="grid gap-6">
          {/* Calendar User Component - Left */}
          {salon.employees.length > 0 ? (
            <div>
              <CalendarUser
                openingTime={openingTimeForCalendar}
                closingTime={closingTimeForCalendar}
                employees={salon.employees.map((e) => ({
                  id: e.id,
                  name: e.name,
                }))}
                bookings={salon.bookings.map((b) => ({
                  id: b.id,
                  date: b.date,
                  services: b.bookingServices.map((bs) => ({
                    name: bs.service.name,
                    duration: bs.service.duration,
                  })),
                  employee: b.employee
                    ? {
                        id: b.employee.id,
                        name: b.employee.name,
                      }
                    : null,
                  customer: {
                    name: b.customer.name,
                  },
                }))}
              />
            </div>
          ) : (
            <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-6 border border-white/60">
              <p className="text-gray-600">No employees available.</p>
            </div>
          )}

          {/* Create Reservation Button - Right */}
          {salon.services.length > 0 && (
            <div className="flex items-center justify-center">
              <ReservationButton
                services={salon.services}
                employees={salon.employees.map((e) => ({
                  id: e.id,
                  name: e.name,
                }))}
                currency={salon.currency}
                openingTime={openingTimeForCalendar}
                closingTime={closingTimeForCalendar}
                bookings={salon.bookings.map((b) => ({
                  id: b.id,
                  date: b.date,
                  employeeId: b.employee.id,
                  services: b.bookingServices.map((bs) => ({
                    duration: bs.service.duration,
                  })),
                }))}
                salonId={salonId}
                currentUser={currentUser ? { id: currentUser.id, role: currentUser.role } : null}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

