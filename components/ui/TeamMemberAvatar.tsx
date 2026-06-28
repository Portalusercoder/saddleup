type TeamMemberAvatarProps = {
  name: string;
  size?: "sm" | "md";
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function TeamMemberAvatar({ name, size = "sm" }: TeamMemberAvatarProps) {
  const dim = size === "md" ? "h-10 w-10 text-sm" : "h-9 w-9 text-xs";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full border border-black/15 bg-black/[0.04] font-medium text-black/70 dark:border-white/20 dark:bg-white/10 dark:text-white/80 ${dim}`}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
