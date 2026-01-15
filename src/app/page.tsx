import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getNextUpcomingBooking, getRandomSalons } from "./actions/bookings";
import AboutUs from "./_components/home/aboutus";
import UpcomingBookingBanner from "./_components/home/UpcomingBookingBanner";
import ExploreSalons from "./_components/home/ExploreSalons";

// Mark this route as dynamic since it uses cookies
export const dynamic = 'force-dynamic';

async function getCurrentCustomer() {
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

    if (!dbUser || dbUser.role !== "CUSTOMER") {
      return null;
    }

    return dbUser;
  } catch (error) {
    console.error("Error getting current customer:", error);
    return null;
  }
}

export default async function Home() {
  const customer = await getCurrentCustomer();
  
  // Fetch upcoming booking and random salons only if user is a customer
  const [bookingResult, salonsResult] = customer
    ? await Promise.all([
        getNextUpcomingBooking(),
        getRandomSalons(6),
      ])
    : [null, null];

  const upcomingBooking = bookingResult?.ok ? bookingResult.booking : null;
  const salons = salonsResult?.ok ? salonsResult.salons : [];

  return (
    <div className="bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Show about section only when customer is NOT logged in */}
        {!customer && <AboutUs />}

        {/* Show upcoming booking banner only for customers with upcoming bookings */}
        {customer && upcomingBooking && (
          <UpcomingBookingBanner booking={upcomingBooking} />
        )}

        {/* Show explore salons section only for customers */}
        {customer && <ExploreSalons salons={salons} />}

      </div>
    </div>
  );
}
