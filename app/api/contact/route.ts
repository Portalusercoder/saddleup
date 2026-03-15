import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`contact:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const body = await req.json();
    const { type } = body;

    if (type === "enterprise") {
      const {
        companyLegalName,
        entityType,
        countryOfRegistration,
        addressLine1,
        city,
        postalCode,
        country,
        contactName,
        email,
      } = body;
      if (
        !companyLegalName ||
        !entityType ||
        !countryOfRegistration ||
        !addressLine1 ||
        !city ||
        !postalCode ||
        !country ||
        !contactName ||
        !email
      ) {
        return NextResponse.json(
          { error: "Missing required enterprise fields" },
          { status: 400 }
        );
      }
      // TODO: store in DB or send email (e.g. Resend)
      return NextResponse.json({ ok: true });
    }

    if (type === "general") {
      const { name, email, subject, message } = body;
      if (!name || !email || !subject || !message) {
        return NextResponse.json(
          { error: "Missing required fields: name, email, subject, message" },
          { status: 400 }
        );
      }
      // TODO: store in DB or send email
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { error: "Invalid type: use 'enterprise' or 'general'" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
