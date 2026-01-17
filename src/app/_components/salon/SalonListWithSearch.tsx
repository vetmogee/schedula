"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/app/_components/ui/input";

type Salon = {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
};

export default function SalonListWithSearch({ salons }: { salons: Salon[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSalons = useMemo(() => {
    if (!searchQuery.trim()) {
      return salons;
    }

    const query = searchQuery.toLowerCase().trim();
    return salons.filter((salon) =>
      salon.name.toLowerCase().includes(query)
    );
  }, [salons, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="w-full max-w-md">
        <Input
          type="text"
          placeholder="Search salons by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/90 border-white/60 focus-visible:border-gray-300"
        />
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-gray-600">
          {filteredSalons.length === 0
            ? "No salons found matching your search."
            : `Found ${filteredSalons.length} salon${filteredSalons.length !== 1 ? "s" : ""}`}
        </p>
      )}

      {/* Salon List */}
      {filteredSalons.length === 0 ? (
        <div className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-8 border border-white/60 text-center">
          <p className="text-gray-600">
            {searchQuery
              ? "No salons found matching your search."
              : "No salons available yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSalons.map((salon) => (
            <Link
              key={salon.id}
              href={`/salons/${salon.id}`}
              className="rounded-2xl bg-white/80 backdrop-blur shadow-md p-5 border border-white/60 hover:shadow-lg transition-shadow block"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {salon.name}
              </h2>
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
      )}
    </div>
  );
}

