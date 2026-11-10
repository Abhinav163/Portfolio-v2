import { cn, parseHighlights } from "@/lib/utils";

/** Renders `**highlighted**` segments from the profile data in the accent color. */
export function RichText({ text, className, highlightClassName }: { text: string; className?: string; highlightClassName?: string }) {
  return (
    <span className={className}>
      {parseHighlights(text).map((segment, i) =>
        segment.highlight ? (
          <strong key={i} className={cn("font-semibold text-fg", highlightClassName)}>
            {segment.value}
          </strong>
        ) : (
          <span key={i}>{segment.value}</span>
        ),
      )}
    </span>
  );
}
