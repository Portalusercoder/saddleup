"use client";

import Image from "next/image";

const SIZE_CLASS = { sm: "w-9", md: "w-12", lg: "w-[62px]" } as const;

export interface HorseLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

/**
 * Brand horse silhouette from /public/brand/horse-loader.png with gallop animation.
 */
export default function HorseLoader({
  size = "md",
  className = "",
  label = "Loading",
}: HorseLoaderProps) {
  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      <span
        className="inline-block animate-horse-gallop opacity-95"
        style={{ transformOrigin: "50% 85%" }}
      >
        <Image
          src="/brand/horse-loader.png"
          alt=""
          width={1268}
          height={1264}
          className={`${SIZE_CLASS[size]} h-auto mix-blend-multiply dark:mix-blend-normal dark:invert`}
          priority={false}
        />
      </span>
    </span>
  );
}
