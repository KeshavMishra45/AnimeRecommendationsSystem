import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TYPE_META } from "@/lib/kkmanime";
import { CutButton } from "./CutButton";

/**
 * Writes the hero's scroll distance (px) into the CSS variable --py.
 * The CSS then moves the village layer fast and the man layer slow
 * (see "HERO (parallax)" in kkmanime.css). No React re-renders on scroll.
 */
function useParallax(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const navH =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navbar-h")) || 0;
      const { top, height } = el.getBoundingClientRect();
      const y = Math.min(Math.max(navH - top, 0), height);
      el.style.setProperty("--py", y.toFixed(1));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref]);
}

/**
 * The man on the cliff, drawn to a <canvas> so his cape and hair can move.
 * The cape is sliced into 2px-step vertical strips (3px wide, overlapping); each strip is shifted up/down by a
 * travelling sine wave that grows toward the cape tip (the shoulder stays pinned).
 * Hair gets a small sideways flutter. Coordinates below are in the source image's pixels
 * (868 x 899). Pauses when off-screen / tab hidden; draws one still frame for reduced motion.
 */
const CAPE = { x0: 185, x1: 600, y0: 80, y1: 400 };   // cape strip zone
const HAIR = { x0: 560, x1: 705, y0: 0, y1: 96 };      // hair strip zone

function ManCanvas() {
  const canvasRef = useRef(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setFailed(true);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let img = new Image();
    let raf = 0;
    let visible = true;
    let disposed = false;
    let t0 = 0;

    const draw = (time) => {
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const t = time / 1000;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, 0, 0);

      // ---- cape ----
      const c = CAPE;
      ctx.clearRect(c.x0 - 30, c.y0 - 30, c.x1 - c.x0 + 30, c.y1 - c.y0 + 30);   // stops exactly at the shoulder/legs so the body is never erased
      const h = c.y1 - c.y0;
      const span = c.x1 - c.x0;
      for (let x = c.x0; x < c.x1; x += 2) {
        const k = (c.x1 - x) / span;              // 0 at shoulder -> 1 at the tip
        const s = k * k * (1.4 - 0.4 * k);        // eased weight, stays 0 near the body
        const dy =
          s * (11 * Math.sin(x / 46 - t * 1.9) +
               4.5 * Math.sin(x / 19 - t * 3.3 + 1.3) +
               6 * Math.sin(t * 0.8));           // ripple + flutter + slow whole-cape swing
        const dx = s * 5 * Math.sin(t * 1.15 + x / 90);
        ctx.drawImage(img, x, c.y0, 3, h, x + dx, c.y0 + dy, 3, h);   // 3px wide on a 2px step: overlap hides seams
      }

      // ---- hair ----
      const r = HAIR;
      ctx.clearRect(r.x0 - 10, r.y0, r.x1 - r.x0 + 20, r.y1 - r.y0);
      const rw = r.x1 - r.x0;
      for (let y = r.y0; y < r.y1; y += 2) {
        const w = Math.pow(1 - y / r.y1, 1.4);    // tips (top) move most, roots stay put
        const dx = w * (4.5 * Math.sin(t * 2.1 + y / 22) + 2.5 * Math.sin(t * 0.9));
        ctx.drawImage(img, r.x0, y, rw, 3, r.x0 + dx, y, rw, 3);
      }
    };

    const loop = (now) => {
      raf = 0;
      if (disposed) return;
      if (!t0) t0 = now;
      draw(now - t0);
      if (visible && !document.hidden) raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(loop);
    };

    img.onload = () => {
      if (disposed) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.imageSmoothingQuality = "high";
      if (reduce) draw(0);
      else start();
    };
    img.onerror = () => {
      if (img.src.endsWith(".webp")) img.src = "/hero/hero-man.png";
      else setFailed(true);
    };
    img.src = "/hero/hero-man.webp";

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !reduce && img.complete) start();
    });
    io.observe(canvas);
    const onVis = () => {
      if (!document.hidden && visible && !reduce && img.complete) start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      img.onload = img.onerror = null;
    };
  }, []);

  if (failed) {
    return <picture>
        <source srcSet="/hero/hero-man.webp" type="image/webp" />
        <img src="/hero/hero-man.png" alt="" decoding="async" />
      </picture>;
  }
  return <canvas ref={canvasRef} width="868" height="899" />;
}

function Hero({ type, initialQuery = "", compact = false }) {
  const meta = TYPE_META[type];
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const inputRef = useRef(null);
  useParallax(heroRef);
  const cut = () => {
    setQuery("");
    inputRef.current?.focus();
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate({ to: "/search", search: { q, type } });
  };
  return <section ref={heroRef} className={`hero hero-parallax${compact ? " is-compact" : ""}`}>
      <div className="hero-scene" aria-hidden="true">
        <div className="px-layer px-bg">
          <picture>
            <source srcSet="/hero/hero-village.webp" type="image/webp" />
            <img src="/hero/hero-village.jpg" alt="" fetchPriority="high" decoding="async" />
          </picture>
        </div>
        <div className="px-layer px-man">
          <ManCanvas />
        </div>
        <div className="hero-scrim" />
      </div>
      <div className="hero-inner">
        <p className="eyebrow">{meta.eyebrow}</p>
        <h1>
          {meta.title}
          <br />
          We'll trace the genre &amp; the soul of its lead.
        </h1>
        <p className="hero-sub">{meta.sub}</p>
        <form className="search-box" onSubmit={onSubmit} autoComplete="off">
          <span className="search-icon">🔎</span>
          <input
    ref={inputRef}
    type="text"
    aria-label="Search titles"
    placeholder={meta.placeholder}
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Escape" && query) {
        e.preventDefault();
        cut();
      }
    }}
  />
          <CutButton visible={query.length > 0} onCut={cut} className="cut-btn-hero" />
          <button type="submit" className="search-btn">
            <span>Recommend</span>
            <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>
    </section>;
}
export {
  Hero
};
