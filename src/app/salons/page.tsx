import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SalonsPage() {
  const salons = await prisma.salon.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#ffb5c2] to-[#fdd7de] py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Salons
          </h1>
          <p className="text-gray-700">
            Browse all available salons and find the perfect one for you.
          </p>
        </header>

        {salons.length === 0 ? (
          <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-8 border border-white/60 text-center">
            <p className="text-gray-600">No salons available yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {salons.map((salon) => (
              <Link
                key={salon.id}
                href={`/salons/${salon.id}`}
                className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-5 border border-white/60 hover:shadow-lg transition-shadow block"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {salon.name}
                </h2>
                {salon.address && (
                  <p className="text-sm text-gray-700 mb-1">
                    {salon.address}
                  </p>
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
        )}
      </div>
    </main>
  );
}

