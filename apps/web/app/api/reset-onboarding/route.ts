import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getOptionalUser } from "~/lib/auth/session";

export async function GET(request: NextRequest) {
  const user = await getOptionalUser();
  if (!user) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const cookieStore = await cookies();
  cookieStore.delete("onboarded");

  return NextResponse.redirect(new URL("/onboarding/step-1", request.url));
}
