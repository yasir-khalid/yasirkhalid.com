// The four corner registration marks used on every fin.ai emphasis panel
// (quote cards, stat panels, the closing CTA). Pair with the `.tick-frame`
// class on the containing element.
export default function CornerTicks() {
  return (
    <>
      <span className="tick-frame__tick left-3 top-3" aria-hidden />
      <span className="tick-frame__tick right-3 top-3" aria-hidden />
      <span className="tick-frame__tick left-3 bottom-3" aria-hidden />
      <span className="tick-frame__tick right-3 bottom-3" aria-hidden />
    </>
  );
}
