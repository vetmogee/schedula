import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // Allow up to 10MB for file uploads (we validate 5MB max in code)
    },
  },
};

export default nextConfig;
