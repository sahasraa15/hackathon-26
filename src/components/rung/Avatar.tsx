import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  student: "bg-[#e5ccff] text-[#2a2438]",
  faculty: "bg-[#ffffc5] text-[#2a2438] ring-1 ring-black/5",
  industry: "bg-[#ffe2c5] text-[#2a2438]",
};

export function Avatar({
  initials,
  role = "student",
  size = "md",
  ring,
  className,
}: {
  initials: string;
  role?: "student" | "faculty" | "industry";
  size?: "sm" | "md" | "lg" | "xl";
  ring?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        tones[role],
        size === "sm" && "size-8 text-xs",
        size === "md" && "size-10 text-sm",
        size === "lg" && "size-12 text-base",
        size === "xl" && "size-16 text-xl",
        ring && "ring-2 ring-[#e5ccff] ring-offset-2 ring-offset-[#fffcf0]",
        className,
      )}
    >
      {initials}
    </div>
  );
}
