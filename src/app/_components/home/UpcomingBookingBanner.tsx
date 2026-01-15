import Link from "next/link";
import { format } from "date-fns";

type Booking = {
  id: number;
  date: Date;
  salon: {
    id: number;
    name: string;
    currency: string | null;
  };
  employee: {
    id: number;
    name: string;
  };
  bookingServices: Array<{
    service: {
      id: number;
      name: string;
      price: number;
      duration: Date;
      category: {
        name: string;
      };
    };
  }>;
};

export default function UpcomingBookingBanner({ booking }: { booking: Booking }) {
  const formatDateTime = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
  };

  const totalPrice = booking.bookingServices.reduce(
    (sum, bs) => sum + bs.service.price,
    0
  );

  const totalMinutes = booking.bookingServices.reduce((total, bs) => {
    const d = new Date(bs.service.duration);
    // Use UTC methods to avoid timezone issues with Time type
    return total + d.getUTCHours() * 60 + d.getUTCMinutes();
  }, 0);

  const formatDuration = () => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) {
      return `${minutes} min`;
    }
    return `${hours}h ${minutes > 0 ? `${minutes}min` : ""}`.trim();
  };

  return (
    <div className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
              Upcoming Booking
            </span>
          </div>
          <h2 className="text-xl font-bold mb-2">
            {booking.bookingServices.map((bs) => bs.service.name).join(", ")}
          </h2>
          <div className="space-y-1 text-sm opacity-90">
            <p>
              <span className="font-medium">Salon:</span> {booking.salon.name}
            </p>
            <p>
              <span className="font-medium">Date & Time:</span> {formatDateTime(booking.date)}
            </p>
            <p>
              <span className="font-medium">Employee:</span> {booking.employee.name}
            </p>
            <p>
              <span className="font-medium">Duration:</span> {formatDuration()}
            </p>
            <p>
              <span className="font-medium">Price:</span> {booking.salon.currency || "USD"}{" "}
              {totalPrice.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/salons/${booking.salon.id}`}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
          >
            View Salon
          </Link>
          <Link
            href="/user"
            className="px-4 py-2 bg-white text-pink-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            View All Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}

