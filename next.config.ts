import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig = (phase: string): NextConfig => ({
  // Keep the running development server separate from production test builds.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next" : ".next-production",
  outputFileTracingRoot: __dirname
});

export default nextConfig;
