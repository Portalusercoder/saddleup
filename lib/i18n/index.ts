import { ar } from "./ar";
import { en } from "./en";
import { resolvePath } from "./resolve";

export type AppLocale = "en" | "ar";

export { en, ar };

export function translate(
  locale: AppLocale,
  path: string,
  vars?: Record<string, string>
): string {
  const primary =
    locale === "ar"
      ? resolvePath(ar as unknown as Record<string, unknown>, path)
      : resolvePath(en as unknown as Record<string, unknown>, path);
  let s =
    primary ??
    resolvePath(en as unknown as Record<string, unknown>, path) ??
    path;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.split(`{${k}}`).join(v);
    }
  }
  return s;
}
