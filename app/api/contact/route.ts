import { NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const CONTACT_TO = process.env.CONTACT_TO_EMAIL ?? "omarkhuddus@gmail.com";
const RESEND_FROM =
  process.env.RESEND_FROM ?? "Saddle Up Contact <onboarding@resend.dev>";

function formatField(label: string, value: string | undefined): string {
  const v = (value ?? "").trim();
  return v ? `${label}: ${v}` : "";
}

function buildEnterpriseBody(body: Record<string, unknown>): string {
  const lines = [
    "ENTERPRISE ENQUIRY — Custom proposal / multi-stable setup",
    "Next step: Reach out with a tailored demo and pricing for their scale.",
    "---",
    formatField("Company legal name", body.companyLegalName as string),
    formatField("Entity type", body.entityType as string),
    formatField("Registration number", body.registrationNumber as string),
    formatField("Country of registration", body.countryOfRegistration as string),
    formatField("Address line 1", body.addressLine1 as string),
    formatField("Address line 2", body.addressLine2 as string),
    formatField("City", body.city as string),
    formatField("State / region", body.stateRegion as string),
    formatField("Postal code", body.postalCode as string),
    formatField("Country", body.country as string),
    formatField("VAT number", body.vatNumber as string),
    "---",
    formatField("Contact name", body.contactName as string),
    formatField("Job title", body.jobTitle as string),
    formatField("Email", body.email as string),
    formatField("Phone", body.phone as string),
    formatField("Approx. horses", body.approxHorses as string),
    formatField("Approx. riders", body.approxRiders as string),
    "---",
    formatField("Message", body.message as string),
  ].filter(Boolean);
  return lines.join("\n");
}

function buildGeneralBody(body: Record<string, unknown>): string {
  const lines = [
    "New general enquiry from the contact form",
    "---",
    formatField("Name", body.name as string),
    formatField("Email", body.email as string),
    formatField("Subject", body.subject as string),
    "---",
    formatField("Message", body.message as string),
  ].filter(Boolean);
  return lines.join("\n");
}

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

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Contact form is not configured. Please try again later." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as Record<string, unknown>;
    const type = body.type as string | undefined;

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
      const resend = new Resend(apiKey);
      const text = buildEnterpriseBody(body);
      const { error } = await resend.emails.send({
        from: RESEND_FROM,
        to: [CONTACT_TO],
        subject: `[Saddle Up · Enterprise] ${String(body.companyLegalName).slice(0, 50)} — ${String(body.contactName)}`,
        text,
      });
      if (error) {
        console.error("Resend enterprise email error:", error);
        return NextResponse.json(
          { error: "Failed to send message. Please try again." },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true, type: "enterprise" });
    }

    if (type === "general") {
      const { name, email, subject, message } = body;
      if (!name || !email || !subject || !message) {
        return NextResponse.json(
          { error: "Missing required fields: name, email, subject, message" },
          { status: 400 }
        );
      }
      const resend = new Resend(apiKey);
      const text = buildGeneralBody(body);
      const { error } = await resend.emails.send({
        from: RESEND_FROM,
        to: [CONTACT_TO],
        subject: `[Saddle Up] ${String(subject).slice(0, 60)}`,
        text,
      });
      if (error) {
        console.error("Resend general email error:", error);
        return NextResponse.json(
          { error: "Failed to send message. Please try again." },
          { status: 500 }
        );
      }
      return NextResponse.json({ ok: true, type: "general" });
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
