// middleware.ts — No auth needed for local development
// This is a passthrough middleware that does nothing
import { NextResponse } from "next/server";

export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
