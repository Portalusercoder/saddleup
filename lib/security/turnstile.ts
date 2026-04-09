export async function verifyTurnstileToken(args: {
  token: string;
  remoteIp?: string | null;
}): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return false;
  }

  const token = args.token.trim();
  if (!token) return false;

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (args.remoteIp) form.set("remoteip", args.remoteIp);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
        cache: "no-store",
      }
    );
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export function getTurnstileTokenFromRequest(req: Request, bodyToken?: string): string {
  const headerToken = req.headers.get("cf-turnstile-response");
  if (headerToken && headerToken.trim()) return headerToken.trim();
  return (bodyToken ?? "").trim();
}
