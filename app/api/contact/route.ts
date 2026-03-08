import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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
