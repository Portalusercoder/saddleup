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
  "w-full px-4 py-3 bg-[#151a17] border border-white/10 text-[#e8ebe6] placeholder:text-white/35 focus:border-[#b8a07a]/65 focus:outline-none rounded-control";
export const authLabelClass =
  "block text-xs uppercase tracking-widest text-white/50 mb-2";
export const authBtnPrimary =
  "w-full py-3 bg-accent text-white font-medium uppercase tracking-wider text-sm hover:opacity-95 transition rounded-control";

export default function AuthShell({ children, footer }: AuthShellProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#0c100e] text-[#e8ebe6] flex">
      <aside className="relative hidden lg:block lg:w-[46%] xl:w-[48%] overflow-hidden">
        <Image
          src="/horseback.jpg"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(12,16,14,0.55) 0%, rgba(12,16,14,0.75) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
          <Link href="/" className="relative z-[1]">
            <TextLogo className="text-[0.8rem] text-white/95" />
          </Link>
          <div className="relative z-[1] max-w-sm">
            <p className="font-serif text-3xl xl:text-4xl text-white/95 leading-tight text-balance">
              {t("home.heroLine1")} {t("home.heroLine2")}
            </p>
            <p className="mt-4 text-sm text-white/55 leading-relaxed">
              {t("home.heroSub")}
            </p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col items-center justify-center p-5 sm:p-8 md:p-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-block lg:hidden mb-8">
            <TextLogo className="text-[0.72rem] text-white/90" />
          </Link>
          <div className="border border-white/10 bg-[#151a17] rounded-control p-7 sm:p-9 md:p-10">
            {children}
          </div>
          {footer}
          <p className="mt-6 text-center">
            <Link
              href="/"
              className="text-white/40 hover:text-white/65 text-xs uppercase tracking-wider transition-colors"
            >
              {t("auth.signup.backHome")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
