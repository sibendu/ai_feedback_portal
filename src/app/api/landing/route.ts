import { NextResponse } from "next/server";

import { getLandingContentResponse } from "@/features/landing/content";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(getLandingContentResponse());
}
