/** Preference for optional site "treats" (browser storage often called cookies). */
export const TREATS_STORAGE_KEY = "saddleup_treats_consent";

export type TreatsChoice = "all" | "essential";

export function readTreatsConsent(): TreatsChoice | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TREATS_STORAGE_KEY);
  if (raw === "all" || raw === "essential") return raw;
  return null;
}

export function writeTreatsConsent(choice: TreatsChoice) {
  localStorage.setItem(TREATS_STORAGE_KEY, choice);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("saddleup:treats-consent-changed"));
  }
}

/** Use before loading non-essential scripts (analytics, marketing). */
export function treatsAllowOptional(): boolean {
  return readTreatsConsent() === "all";
}
