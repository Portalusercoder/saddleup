"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useProfile } from "@/components/providers/ProfileProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import {
  getMobileFabActions,
  getMobileTabBarItems,
} from "@/lib/dashboard/nav-config";

const liquidSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 28,
  mass: 0.75,
};

const softSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
  mass: 0.9,
};

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useProfile();
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const items = getMobileTabBarItems(profile?.role);
  const fabActions = getMobileFabActions(profile?.role);
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheetOpen]);

  const primaryAddHref =
    profile?.role === "student"
      ? "/dashboard/bookings"
      : profile?.role === "guardian"
        ? "/dashboard/guardian"
        : "/dashboard/horses?add=1";

  const transition = reduceMotion ? { duration: 0 } : liquidSpring;
  const sheetTransition = reduceMotion ? { duration: 0.15 } : softSpring;

  return (
    <>
      <div
        className="md:hidden fixed inset-x-0 bottom-0 z-[70] pointer-events-none px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        aria-label={t("navSection.sidebarAria")}
      >
        <div className="pointer-events-auto flex items-center gap-2.5 max-w-md mx-auto">
          <nav className="flex-1 min-w-0">
            <ul className="su-dock-liquid relative flex items-center justify-between gap-1 rounded-full bg-[#1a1a1a]/95 backdrop-blur-md border border-white/10 px-2 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
              {items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href} className="relative flex-1 min-w-0">
                    <Link
                      href={item.href}
                      aria-label={t(item.labelPath)}
                      aria-current={active ? "page" : undefined}
                      className={`relative z-[1] flex items-center justify-center min-h-[48px] rounded-full transition-colors su-focus-ring ${
                        active ? "text-white" : "text-white/45 hover:text-white/80"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="su-dock-liquid-blob"
                          className="su-dock-liquid-blob absolute inset-1.5 rounded-full bg-white/14"
                          transition={transition}
                          aria-hidden
                        />
                      )}
                      <motion.span
                        className="relative z-[1] flex items-center justify-center"
                        animate={
                          reduceMotion
                            ? undefined
                            : active
                              ? { scale: 1.08, y: 0 }
                              : { scale: 0.95, y: 0 }
                        }
                        transition={transition}
                      >
                        {item.icon}
                      </motion.span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <motion.button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="shrink-0 w-14 h-14 rounded-full bg-[#8e8e93] text-white flex items-center justify-center shadow-[0_12px_40px_rgba(0,0,0,0.45)] su-focus-ring"
            aria-label={t("navSection.openQuickActions")}
            aria-expanded={sheetOpen}
            whileTap={reduceMotion ? undefined : { scale: 0.9 }}
            animate={
              reduceMotion
                ? undefined
                : sheetOpen
                  ? { scale: 0.92, opacity: 0.7 }
                  : { scale: 1, opacity: 1 }
            }
            transition={transition}
          >
            <motion.span
              animate={reduceMotion ? undefined : { rotate: sheetOpen ? 45 : 0 }}
              transition={transition}
              className="flex"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
              </svg>
            </motion.span>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {sheetOpen && (
          <div className="md:hidden fixed inset-0 z-[80]">
            <motion.button
              type="button"
              className="absolute inset-0 bg-black/60"
              aria-label={t("common.close")}
              onClick={() => setSheetOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
            />
            <div className="absolute inset-x-0 bottom-0 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-10">
              <div className="max-w-md mx-auto flex items-end gap-2.5">
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  aria-label={t("navSection.quickActionsTitle")}
                  className="flex-1 rounded-[1.75rem] bg-[#141414]/95 backdrop-blur-xl border border-white/10 p-4 shadow-2xl origin-bottom"
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.92, borderRadius: 40 }}
                  animate={{ opacity: 1, y: 0, scale: 1, borderRadius: 28 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.94, borderRadius: 36 }}
                  transition={sheetTransition}
                >
                  <div className="grid grid-cols-4 gap-3">
                    {fabActions.map((action, i) => (
                      <motion.div
                        key={action.href}
                        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          ...sheetTransition,
                          delay: reduceMotion ? 0 : 0.03 * i,
                        }}
                      >
                        <Link
                          href={action.href}
                          onClick={() => setSheetOpen(false)}
                          className="flex flex-col items-center gap-2 min-h-[44px] su-focus-ring rounded-xl"
                        >
                          <span className="w-14 h-14 rounded-2xl bg-white/[0.08] border border-white/10 text-white flex items-center justify-center">
                            {action.icon}
                          </span>
                          <span className="text-[0.65rem] text-white/80 text-center leading-tight px-0.5">
                            {t(action.labelPath)}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                    {(profile?.role === "owner" || profile?.role === "trainer") && (
                      <motion.button
                        type="button"
                        onClick={() => {
                          setSheetOpen(false);
                          router.push(primaryAddHref);
                        }}
                        className="flex flex-col items-center gap-2 min-h-[44px] su-focus-ring rounded-xl"
                        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.85 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          ...sheetTransition,
                          delay: reduceMotion ? 0 : 0.03 * fabActions.length,
                        }}
                      >
                        <span className="w-14 h-14 rounded-2xl bg-white text-black flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v14M5 12h14" />
                          </svg>
                        </span>
                        <span className="text-[0.65rem] text-white/80 text-center leading-tight px-0.5">
                          {t("navSection.quickAdd")}
                        </span>
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                <motion.button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="shrink-0 w-14 h-14 mb-1 rounded-full bg-[#1a1a1a] border border-white/15 text-white flex items-center justify-center shadow-xl su-focus-ring"
                  aria-label={t("common.close")}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.6, rotate: -40 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.7, rotate: 20 }}
                  transition={sheetTransition}
                  whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
