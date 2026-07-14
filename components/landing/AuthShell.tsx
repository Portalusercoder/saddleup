"use client";

import Image from "next/image";
import Link from "next/link";
import TextLogo from "@/components/brand/TextLogo";
import { useLanguage } from "@/components/providers/LanguageProvider";

type AuthShellProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export const authFormClass =
  "w-full px-4 py-3.5 bg-transparent border-b border-white/15 text-mist placeholder:text-white/35 focus:border-brass/70 focus:outline-none rounded-none transition-colors";
export const authLabelClass =
  "block text-[0.65rem] uppercase tracking-[0.2em] text-white/45 mb-3";
export const authBtnPrimary =
  "w-full py-3.5 min-h-[48px] mt-2 bg-paddock text-base font-medium uppercase tracking-[0.12em] text-sm hover:opacity-95 transition rounded-control su-focus-ring disabled:opacity-50";

export default function AuthShell({ children, footer }: AuthShellProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-base text-mist flex">
      <aside className="relative hidden lg:block lg:w-[52%] overflow-hidden">
        <Image
          src="/horseback.jpg"
          alt=""
          fill
          priority
          sizes="52vw"
          className="object-cover object-[center_35%]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, rgba(12,16,14,0.72) 0%, rgba(12,16,14,0.35) 55%, rgba(12,16,14,0.15) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-between p-12 xl:p-16">
          <Link href="/" className="relative z-[1] su-focus-ring rounded-control w-fit">
            <TextLogo className="text-[0.85rem] text-white/95" />
          </Link>
          <div className="relative z-[1] max-w-md">
            <p className="font-serif text-4xl xl:text-5xl text-white leading-[1.05] text-balance tracking-tight">
              {t("home.heroLine1")}
              <br />
              {t("home.heroLine2")}
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 md:p-14">
        <div className="w-full max-w-[22rem]">
          <Link href="/" className="inline-block lg:hidden mb-10 su-focus-ring rounded-control">
            <TextLogo className="text-[0.72rem] text-white/90" />
          </Link>
          <div className="space-y-1">{children}</div>
          {footer}
          <p className="mt-10 text-center">
            <Link
              href="/"
              className="text-white/35 hover:text-white/60 text-[0.65rem] uppercase tracking-[0.18em] transition-colors su-focus-ring rounded-sm"
            >
              {t("auth.signup.backHome")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
