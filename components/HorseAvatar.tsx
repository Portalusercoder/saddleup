"use client";

interface HorseAvatarProps {
  photoUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-14 h-14 text-xl",
};

export function HorseAvatar({
  photoUrl,
  name,
  size = "md",
  className = "",
}: HorseAvatarProps) {
  const sizeClass = sizes[size];

  return (
    <div
      className={`flex-shrink-0 rounded-full overflow-hidden bg-white/10 flex items-center justify-center ${sizeClass} ${className}`}
      title={name}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover object-center"
        />
      ) : (
        <span className="select-none" aria-hidden>
          🐴
        </span>
      )}
    </div>
  );
}
