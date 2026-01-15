import Link from "next/link";

type Salon = {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
};

export default function ExploreSalons({ salons }: { salons: Salon[] }) {
  if (salons.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
        Explore Salons
      </h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {salons.map((salon) => (
          <Link
            key={salon.id}
            href={`/salons/${salon.id}`}
            className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-5 border border-white/60 hover:shadow-lg transition-shadow block"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {salon.name}
            </h3>
            {salon.address && (
              <p className="text-sm text-gray-700 mb-1">{salon.address}</p>
            )}
            {salon.city && (
              <p className="text-sm text-gray-600">{salon.city}</p>
            )}
            {!salon.address && !salon.city && (
              <p className="text-xs text-gray-500 italic">
                No location information available
              </p>
            )}
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link
          href="/salons"
          className="inline-block px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition-colors"
        >
          View All Salons →
        </Link>
      </div>
    </div>
  );
}

