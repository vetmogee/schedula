import { prisma } from "@/lib/prisma";
import SalonListWithSearch from "@/app/_components/salon/SalonListWithSearch";

export default async function SalonsPage() {
  const salons = await prisma.salon.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
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

        <SalonListWithSearch salons={salons} />
      </div>
    </main>
  );
}

