import { z } from "zod";

/** Nullable trimmed string; empty input becomes null. Rejects objects/arrays at top level. */
export function optStr(max: number) {
  return z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null) return null;
      const s = String(v).trim();
      return s.length === 0 ? null : s.slice(0, max);
    });
}

export const uuidString = z.string().uuid();

const roles = z.enum(["owner", "trainer", "student", "guardian"]);

export const completeSignupBodySchema = z
  .object({
    role: roles,
    fullName: z
      .union([z.string(), z.number()])
      .transform((v) => String(v).trim())
      .pipe(z.string().min(1).max(200)),
    email: z
      .string()
      .max(320)
      .trim()
      .pipe(z.string().email())
      .transform((s) => s.toLowerCase()),
    stableName: optStr(200),
    joinCode: optStr(64),
    userId: z.string().uuid().optional(),
  })
  .strip();

export const checkSignupEmailSchema = z
  .object({
    email: z
      .string()
      .max(320)
      .trim()
      .pipe(z.string().email())
      .transform((s) => s.toLowerCase()),
  })
  .strip();

export const profileUpdateSchema = z
  .object({
    fullName: z.string().max(200).trim().min(1).optional(),
    avatarUrl: z
      .union([z.string().max(2048), z.literal(""), z.null(), z.undefined()])
      .transform((v) => {
        if (v === undefined) return undefined;
        if (v === null || v === "") return null;
        return String(v).trim().slice(0, 2048);
      })
      .optional(),
    onboardingCompleted: z.boolean().optional(),
  })
  .strip()
  .refine(
    (d) =>
      d.fullName !== undefined ||
      d.avatarUrl !== undefined ||
      d.onboardingCompleted !== undefined,
    { message: "No valid updates" }
  );

const enterpriseContactSchema = z
  .object({
    type: z.literal("enterprise"),
    companyLegalName: z.string().max(300).trim().min(1),
    entityType: z.string().max(120).trim().min(1),
    registrationNumber: optStr(120),
    countryOfRegistration: z.string().max(120).trim().min(1),
    addressLine1: z.string().max(500).trim().min(1),
    addressLine2: optStr(500),
    city: z.string().max(120).trim().min(1),
    stateRegion: optStr(120),
    postalCode: z.string().max(32).trim().min(1),
    country: z.string().max(120).trim().min(1),
    vatNumber: optStr(80),
    contactName: z.string().max(200).trim().min(1),
    jobTitle: optStr(120),
    email: z
      .string()
      .max(320)
      .trim()
      .pipe(z.string().email())
      .transform((s) => s.toLowerCase()),
    phone: optStr(40),
    approxHorses: optStr(40),
    approxRiders: optStr(40),
    message: optStr(20_000),
  })
  .strip();

const generalContactSchema = z
  .object({
    type: z.literal("general"),
    name: z.string().max(200).trim().min(1),
    email: z
      .string()
      .max(320)
      .trim()
      .pipe(z.string().email())
      .transform((s) => s.toLowerCase()),
    subject: z.string().max(200).trim().min(1),
    message: z.string().max(20_000).trim().min(1),
  })
  .strip();

export const contactBodySchema = z.discriminatedUnion("type", [
  enterpriseContactSchema,
  generalContactSchema,
]);

export const newsletterSubscribeSchema = z
  .object({
    email: z
      .string()
      .max(320)
      .trim()
      .pipe(z.string().email())
      .transform((s) => s.toLowerCase()),
    fullName: optStr(200),
    stableId: z.union([z.string().uuid(), z.literal(""), z.null(), z.undefined()]).transform((v) =>
      v == null || v === "" ? null : v
    ),
  })
  .strip();

function optionalIntNull(min: number, max: number) {
  return z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null || v === "") return null;
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) return null;
      const i = Math.trunc(n);
      if (i < min || i > max) return null;
      return i;
    });
}

const horseCoreFields = {
  gender: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null) return "Gelding";
      const s = String(v).trim().slice(0, 40);
      return s.length === 0 ? "Gelding" : s;
    }),
  age: optionalIntNull(0, 80),
  breed: optStr(200),
  color: optStr(200),
  markings: optStr(2000),
  height: optionalIntNull(0, 350),
  microchip: optStr(120),
  ueln: optStr(120),
  dateOfBirth: optStr(30),
  registeredName: optStr(300),
  passportNumber: optStr(120),
  feiId: optStr(80),
  studbook: optStr(200),
  horseCategory: optStr(120),
  sireName: optStr(200),
  damName: optStr(200),
  countryOfBirth: optStr(120),
  temperament: optStr(80),
  skillLevel: optStr(80),
  trainingStatus: optStr(80),
  ridingSuitability: optStr(500),
  photoUrl: optStr(2048),
  notes: optStr(20_000),
  owner: optStr(500),
};

export const horsePostSchema = z
  .object({
    name: z
      .union([z.string(), z.number()])
      .transform((v) => String(v).trim())
      .pipe(z.string().min(1).max(200)),
    ...horseCoreFields,
  })
  .strip();

/** PATCH body: all horse fields optional; reject empty object. */
export const horsePatchSchema = horsePostSchema
  .partial()
  .strip()
  .refine((data) => Object.keys(data).length > 0, {
    message: "No fields to update",
  });

export const bookingPostSchema = z
  .object({
    horseId: uuidString,
    riderId: z
      .union([uuidString, z.null(), z.literal(""), z.undefined()])
      .transform((v) => (v == null || v === "" ? null : v)),
    bookingDate: z.string().max(32).trim().min(1),
    startTime: z.string().max(16).trim().min(1),
    endTime: z.string().max(16).trim().min(1),
    notes: optStr(10_000),
    trainerId: z
      .union([uuidString, z.null(), z.literal(""), z.undefined()])
      .transform((v) => (v == null || v === "" ? null : v)),
  })
  .strip();

function optionalDurationMinutes() {
  return z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((v) => {
      if (v == null || v === "") return 0;
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(24 * 60, Math.trunc(n)));
    });
}

export const sessionPostSchema = z
  .object({
    horseId: uuidString,
    punchType: z.string().max(50).optional(),
    duration: optionalDurationMinutes(),
    intensity: z.string().max(40).optional(),
    discipline: z.string().max(40).optional(),
    rider: z.string().max(200).trim().optional().transform((s) => (s === "" ? undefined : s)),
    notes: z.string().max(20_000).trim().optional().transform((s) => (s === "" ? undefined : s)),
  })
  .strip();

export const riderPostSchema = z
  .object({
    name: z
      .union([z.string(), z.number()])
      .transform((v) => String(v).trim())
      .pipe(z.string().min(1).max(200)),
    email: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((v) => {
        if (v == null || v === "") return null;
        const s = String(v).trim().slice(0, 320);
        return s.length === 0 ? null : s;
      })
      .refine((s) => s === null || z.string().email().safeParse(s).success, {
        message: "Invalid email",
      }),
    phone: optStr(50),
    level: optStr(80),
    ridingLevel: optStr(80),
    goals: optStr(5000),
    assigned_trainer_id: z
      .union([uuidString, z.null(), z.literal(""), z.undefined()])
      .transform((v) => (v == null || v === "" ? null : v)),
    notes: optStr(20_000),
    instructor_feedback: optStr(20_000),
    instructorFeedback: optStr(20_000),
  })
  .strip();

export const incidentPostSchema = z
  .object({
    incidentDate: z.string().max(40).trim().min(1),
    horseId: uuidString,
    riderId: z
      .union([uuidString, z.null(), z.literal(""), z.undefined()])
      .transform((v) => (v == null || v === "" ? null : v)),
    riderName: optStr(200),
    description: z.string().max(50_000).trim().min(1),
    witnesses: optStr(20_000),
    location: optStr(500),
    severity: z
      .union([
        z.enum(["minor", "moderate", "serious"]),
        z.literal(""),
        z.null(),
        z.undefined(),
      ])
      .transform((v) => (v == null || v === "" ? null : v)),
    followUpNotes: optStr(20_000),
  })
  .strip();

export const competitionPostSchema = z
  .object({
    eventName: z.string().max(300).trim().min(1),
    eventDate: z.string().max(32).trim().min(1),
    horseId: uuidString,
    location: optStr(300),
    discipline: optStr(200),
    result: optStr(500),
    notes: optStr(10_000),
  })
  .strip();

export const planIdSchema = z
  .object({
    planId: z.enum(["starter", "stable"]),
  })
  .strip();

export const forgotPasswordRequestSchema = z
  .object({
    email: z.string().max(320).trim().pipe(z.string().email()),
  })
  .strip();

export const forgotPasswordConfirmSchema = z
  .object({
    email: z.string().max(320).trim().pipe(z.string().email()),
    code: z
      .union([z.string(), z.number()])
      .transform((v) => String(v).trim().replace(/\D/g, "")),
    newPassword: z.string().max(1024),
  })
  .strip();

export const adminStableCreateSchema = z
  .object({
    name: z.string().max(300).trim().min(1),
  })
  .strip();

const optionalDateString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const s = String(v).trim();
    return s.length === 0 ? null : s;
  })
  .refine(
    (v) => v === undefined || v === null || !Number.isNaN(new Date(v).getTime()),
    { message: "Invalid date" }
  );

export const adminPartnerPatchSchema = z
  .object({
    name: z.string().max(200).trim().min(1).optional(),
    enabled: z.boolean().optional(),
    startsAt: optionalDateString,
    endsAt: optionalDateString,
    destinationUrl: z
      .string()
      .max(2048)
      .trim()
      .optional()
      .refine((v) => {
        if (v === undefined) return true;
        try {
          const url = new URL(v);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      }, "Invalid destinationUrl"),
    promoCode: optStr(120).optional(),
    ctaText: z.string().max(200).trim().min(1).optional(),
  })
  .strip()
  .refine((d) => Object.keys(d).length > 0, {
    message: "No fields to update",
  });

const normalizedBool = z
  .union([z.boolean(), z.string(), z.number(), z.null(), z.undefined()])
  .transform((v) => {
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v === 1;
    if (typeof v === "string") {
      const s = v.trim().toLowerCase();
      return s === "true" || s === "1" || s === "yes";
    }
    return false;
  });

export const noticesSendSchema = z
  .object({
    subject: z.string().max(200).trim().min(1),
    bodyHtml: z.string().max(200_000).trim().min(1),
    sendToStudents: normalizedBool,
    sendToTrainers: normalizedBool,
    sendToGuardians: normalizedBool,
  })
  .strip()
  .refine((d) => d.sendToStudents || d.sendToTrainers || d.sendToGuardians, {
    message: "Select at least one audience",
  });

export const workerPostSchema = z
  .object({
    name: z.string().max(500).trim().min(1),
    email: optStr(320).refine((s) => s === null || z.string().email().safeParse(s).success, {
      message: "Invalid email",
    }),
    phone: optStr(80),
    role: z.string().max(200).trim().min(1),
    notes: optStr(20_000),
  })
  .strip();

export const workerPutSchema = z
  .object({
    name: z.string().max(500).trim().min(1).optional(),
    email: optStr(320)
      .refine((s) => s === null || z.string().email().safeParse(s).success, {
        message: "Invalid email",
      })
      .optional(),
    phone: optStr(80).optional(),
    role: z.string().max(200).trim().min(1).optional(),
    notes: optStr(20_000).optional(),
  })
  .strip()
  .refine((d) => Object.keys(d).length > 0, {
    message: "No valid updates",
  });

export const blockedSlotPostSchema = z
  .object({
    blockedDate: z.string().max(32).trim().min(1),
    startTime: z.string().max(16).trim().min(1),
    endTime: z.string().max(16).trim().min(1),
    reason: optStr(5000),
  })
  .strip();

export const addMemberByIdSchema = z
  .object({
    inviteCode: z
      .union([z.string(), z.number()])
      .transform((v) => String(v).trim().toUpperCase().replace(/\s/g, ""))
      .pipe(z.string().min(1).max(120)),
    memberRole: z.enum(["student", "trainer", "guardian"]),
  })
  .strip();

export const riderHorseAssignmentPostSchema = z
  .object({
    riderId: uuidString,
    horseId: uuidString,
    suitabilityNotes: optStr(5000),
  })
  .strip();

export const bookingPatchSchema = z
  .object({
    action: z.enum(["approve", "decline"]).optional(),
    declinedNotes: optStr(10_000).optional(),
    status: optStr(40).optional(),
    declined_notes: optStr(10_000).optional(),
    bookingDate: optStr(32).optional(),
    startTime: optStr(16).optional(),
    endTime: optStr(16).optional(),
    horseId: z.union([uuidString, z.null(), z.undefined()]).optional(),
    riderId: z.union([uuidString, z.null(), z.undefined()]).optional(),
    trainerId: z.union([uuidString, z.null(), z.undefined()]).optional(),
    notes: optStr(10_000).optional(),
  })
  .strip()
  .refine((d) => Object.keys(d).length > 0, { message: "No updates provided" });

export const healthPostSchema = z
  .object({
    horseId: uuidString,
    type: z.enum(["vet", "vaccination", "deworming", "farrier", "injury"]),
    date: optStr(32),
    description: optStr(20_000),
    cost: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .transform((v) => {
        if (v == null || v === "") return null;
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) ? n : null;
      }),
    nextDue: optStr(32),
    recoveryStatus: optStr(120),
  })
  .strip();

export const healthPutSchema = z
  .object({
    type: optStr(120).optional(),
    date: optStr(32).optional(),
    description: optStr(20_000).optional(),
    cost: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .transform((v) => {
        if (v === undefined) return undefined;
        if (v === null || v === "") return null;
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) ? n : null;
      })
      .optional(),
    nextDue: optStr(32).optional(),
    recoveryStatus: optStr(120).optional(),
  })
  .strip()
  .refine((d) => Object.keys(d).length > 0, { message: "No valid updates" });

export const newsletterSubscriberAddSchema = z
  .object({
    email: z
      .string()
      .max(320)
      .trim()
      .pipe(z.string().email())
      .transform((s) => s.toLowerCase()),
    fullName: optStr(200),
  })
  .strip();

export const newsletterSendSchema = z
  .object({
    subject: z.string().max(200).trim().min(1),
    bodyHtml: z.string().max(200_000).trim().min(1),
  })
  .strip();

export const competitionPutSchema = z
  .object({
    eventName: z.string().max(300).trim().min(1).optional(),
    eventDate: z.string().max(32).trim().min(1).optional(),
    horseId: uuidString.optional(),
    location: optStr(300).optional(),
    discipline: optStr(200).optional(),
    result: optStr(500).optional(),
    notes: optStr(10_000).optional(),
  })
  .strip()
  .refine((d) => Object.keys(d).length > 0, { message: "No valid updates" });

export const incidentPutSchema = z
  .object({
    incidentDate: z.string().max(40).trim().min(1).optional(),
    horseId: uuidString.optional(),
    riderId: z
      .union([uuidString, z.null(), z.literal(""), z.undefined()])
      .transform((v) => (v == null || v === "" ? null : v))
      .optional(),
    riderName: optStr(200).optional(),
    description: z.string().max(50_000).trim().min(1).optional(),
    witnesses: optStr(20_000).optional(),
    location: optStr(500).optional(),
    severity: z
      .union([
        z.enum(["minor", "moderate", "serious"]),
        z.literal(""),
        z.null(),
        z.undefined(),
      ])
      .transform((v) => (v == null || v === "" ? null : v))
      .optional(),
    followUpNotes: optStr(20_000).optional(),
  })
  .strip()
  .refine((d) => Object.keys(d).length > 0, { message: "No valid updates" });

export const notificationMarkReadSchema = z
  .object({
    id: uuidString,
    read: z.literal(true),
  })
  .strip();

export const riderPutSchema = z
  .object({
    name: z.string().max(200).trim().min(1).optional(),
    email: z
      .union([z.string(), z.null(), z.undefined()])
      .transform((v) => {
        if (v == null || v === "") return null;
        const s = String(v).trim().slice(0, 320);
        return s.length === 0 ? null : s;
      })
      .refine((s) => s === null || z.string().email().safeParse(s).success, {
        message: "Invalid email",
      })
      .optional(),
    phone: optStr(50).optional(),
    level: optStr(80).optional(),
    ridingLevel: optStr(80).optional(),
    goals: optStr(5000).optional(),
    assigned_trainer_id: z
      .union([uuidString, z.null(), z.literal(""), z.undefined()])
      .transform((v) => (v == null || v === "" ? null : v))
      .optional(),
    guardian_id: z
      .union([uuidString, z.null(), z.literal(""), z.undefined()])
      .transform((v) => (v == null || v === "" ? null : v))
      .optional(),
    notes: optStr(20_000).optional(),
    instructor_feedback: optStr(20_000).optional(),
    instructorFeedback: optStr(20_000).optional(),
  })
  .strip()
  .refine((d) => Object.keys(d).length > 0, { message: "No valid updates" });

export const horseSessionPrismaPostSchema = z
  .object({
    horseId: z
      .union([z.number(), z.string()])
      .transform((v) => {
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) ? Math.trunc(n) : NaN;
      })
      .refine((n) => Number.isInteger(n) && n > 0, { message: "horseId is required" }),
    punchType: optStr(80),
    duration: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .transform((v) => {
        if (v == null || v === "") return 0;
        const n = typeof v === "number" ? v : Number(v);
        return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
      }),
    intensity: optStr(80),
    discipline: optStr(80),
    rider: optStr(200),
    notes: optStr(20_000),
  })
  .strip();
