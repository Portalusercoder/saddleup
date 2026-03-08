"use client";

interface ProfileAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-20 h-20 text-2xl",
};

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ProfileAvatar({
  avatarUrl,
  name,
  size = "md",
  className = "",
}: ProfileAvatarProps) {
  const sizeClass = sizes[size];

  return (
    <div
      className={`flex-shrink-0 rounded-full overflow-hidden bg-black/10 flex items-center justify-center font-medium text-black/90 ${sizeClass} ${className}`}
      title={name ?? "Profile"}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name ?? "Profile"}
          className="w-full h-full object-cover object-center"
        />
      ) : (
        <span className="select-none" aria-hidden>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
