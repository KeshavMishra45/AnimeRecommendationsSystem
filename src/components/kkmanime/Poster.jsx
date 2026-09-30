import { useEffect, useState } from "react";
import { fetchCoverUrl, posterGradient } from "@/lib/kkmanime";
function Poster({ title, className = "card-poster", children }) {
  const [url, setUrl] = useState(title.img ?? null);
  useEffect(() => {
    if (title.img) {
      setUrl(title.img);
      return;
    }
    let alive = true;
    setUrl(null);
    fetchCoverUrl(title.name, title.type).then((u) => {
      if (alive) setUrl(u);
    });
    return () => {
      alive = false;
    };
  }, [title.img, title.name, title.type]);
  return <div
    className={`${className}${url ? " has-image" : ""}`}
    style={{ background: posterGradient(title.hue) }}
  >
      {children}
      <span className="poster-glyph">{title.glyph}</span>
      {url ? <img className="poster-img has-image" loading="lazy" src={url} alt={`${title.name} cover art`} /> : null}
    </div>;
}
export {
  Poster
};
