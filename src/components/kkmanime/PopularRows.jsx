import { useEffect, useMemo, useRef, useState } from "react";
import { MiniCard } from "./Cards";
import { useOpenTitle } from "./dialog-context";
import { Decor } from "./Decor";
import { TYPE_META, popularByGenre } from "@/lib/kkmanime";

// Small emblem at the end of every other genre heading (cycled), filling the empty right side of the title line.
const GENRE_ICONS = ["kunai", "fox", "ramen", "eye", "triangle", "strawhat", "pentagram", "shuriken"];

/**
 * One genre shelf. The grid stretches the cards to fill the row; we then measure how many columns fit
 * and drop the last few titles when they would leave a mostly-empty final line (most popular are kept).
 */
function GenreRow({ row, index, onOpen }) {
  const gridRef = useRef(null);
  const [cols, setCols] = useState(0);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const n = getComputedStyle(el).gridTemplateColumns.split(" ").filter(Boolean).length;
      setCols(n);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const total = row.items.length;
  let keep = total;
  if (cols > 0 && total > cols) {
    const full = Math.floor(total / cols) * cols;
    // keep a last, partly filled line only when it is at least half full (never on 2-3 column phones); otherwise drop the stragglers
    keep = total - full >= (cols >= 4 ? Math.ceil(cols / 2) : cols) ? total : full;
  }
  const items = row.items.slice(0, keep);
  const icon = index % 2 === 0 ? GENRE_ICONS[(index / 2) % GENRE_ICONS.length] : null;
  return <div className="genre-row">
      <div className="genre-head">
        <h3 className="genre-title">{row.genre}</h3>
        <span className="genre-rule" aria-hidden="true" />
        {icon ? <img className="genre-icon" src={`/decor/${icon}.webp`} alt="" loading="lazy" decoding="async" /> : null}
      </div>
      <div className="mini-row" ref={gridRef}>
        {items.map((t) => <MiniCard key={t.id} title={t} onOpen={onOpen} />)}
      </div>
    </div>;
}

function PopularRows({ type }) {
  const rows = useMemo(() => popularByGenre(type), [type]);
  const openTitle = useOpenTitle();
  return <section className="popular-section">
      <Decor set="popular" />
      <p className="eyebrow">Trending on KKMANIME</p>
      <h2>{TYPE_META[type].popularTitle}</h2>
      <div>
        {rows.map((row, i) => <GenreRow key={row.genre} row={row} index={i} onOpen={openTitle} />)}
      </div>
    </section>;
}
export {
  PopularRows
};
