import { testimonial } from "@/lib/content";
import CornerTicks from "@/components/CornerTicks";

// Pull-quote card - fin.ai's customer-story signature surface: corner
// registration marks, a serif quote with one phrase run through an orange
// highlighter, a grayscale headshot, name + role. All copy/image here is
// placeholder - swap `testimonial` in lib/content.ts for the real thing.
export default function TestimonialCard() {
  const [before, after] = testimonial.quote.includes(testimonial.highlight)
    ? testimonial.quote.split(testimonial.highlight)
    : [testimonial.quote, ""];

  return (
    <div className="tick-frame quote-card mx-auto max-w-[520px]">
      <CornerTicks />

      <p className="mono-label text-[var(--stone-text)]">
        {testimonial.wordmark}
      </p>

      <p className="display mt-6 text-[22px] leading-[1.35] text-[var(--ink)] sm:text-[26px]">
        &ldquo;{before}
        {after && <span className="quote-mark">{testimonial.highlight}</span>}
        {after}&rdquo;
      </p>

      <div className="mt-8 flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-[13px] font-medium"
          style={{ background: "var(--faint)", color: "var(--mute)" }}
          aria-hidden
        >
          {testimonial.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </span>
        <div>
          <p className="text-[14px] font-medium text-[var(--ink)]">
            {testimonial.name}
          </p>
          <p className="text-[13px] text-[var(--mute)]">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}
