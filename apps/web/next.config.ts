import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Skip static prerendering for pages that require runtime services (Convex, BetterAuth)
  // These will be rendered on-demand at request time instead.
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
}

export default nextConfig
