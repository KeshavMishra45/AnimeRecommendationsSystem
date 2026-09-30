/**
 * Faint anime-weapon / emblem icons that sit *behind* the content below the hero.
 * Deliberately sparse: 1 in the trending header, 3 around the A-Z section, and one katana divider.
 *
 * Each icon is a wrapper (scroll parallax + fade in/out, pure CSS via animation-timeline: view())
 * around an <img> (optional slow spin). Per-icon knobs are CSS variables:
 *   --w   width          --rot  resting rotation   --dy  parallax travel in px (bigger = faster)
 *   --o   peak opacity   --spin slow-spin duration (optional)
 * All styles live under "DECOR" at the bottom of kkmanime.css.
 */
const SETS = {
  // Cards now fill the full width, so icons live in the section header area (right side) and the bottom padding.
  popular: [
    { src: "alchemy", side: "right", x: "3%", y: "10px", w: "clamp(90px, 9vw, 140px)", rot: 0, dy: 26, o: 0.2, spin: "140s" }
  ],
  az: [
    { src: "shuriken", side: "right", x: "3%", y: "12px", w: "clamp(56px, 6vw, 86px)", rot: 0, dy: 24, o: 0.2, spin: "60s" },
    { src: "strawhat", side: "left", x: "3%", y: "auto", b: "4px", w: "clamp(64px, 7vw, 100px)", rot: -8, dy: 20, o: 0.18 },
    { src: "eye", side: "right", x: "3%", y: "auto", b: "8px", w: "clamp(50px, 5.5vw, 78px)", rot: 0, dy: 20, o: 0.18, hideSm: true }
  ]
};

function Decor({ set }) {
  const items = SETS[set] ?? [];
  return <div className="decor" aria-hidden="true">
      {items.map((it) => <span
    key={it.src}
    className={`decor-item${it.hideSm ? " decor-hide-sm" : ""}`}
    style={{
      [it.side]: it.x,
      top: it.y === "auto" ? "auto" : it.y,
      bottom: it.b ?? "auto",
      "--w": it.w,
      "--rot": `${it.rot}deg`,
      "--dy": `${it.dy}px`,
      "--o": it.o,
      ...it.spin ? { "--spin": it.spin } : {}
    }}
  >
          <img
    src={`/decor/${it.src}.webp`}
    alt=""
    loading="lazy"
    decoding="async"
    className={it.spin ? "decor-spin" : undefined}
  />
        </span>)}
    </div>;
}

/** Thin glowing rule with a katana laid across it, between the trending rows and the A-Z catalog. */
function DecorDivider() {
  return <div className="decor-divider" aria-hidden="true">
      <img src="/decor/katana.webp" alt="" loading="lazy" decoding="async" />
    </div>;
}

export {
  Decor,
  DecorDivider
};
