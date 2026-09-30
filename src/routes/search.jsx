import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { RecCard } from "@/components/kkmanime/Cards";
import { Poster } from "@/components/kkmanime/Poster";
import { Hero } from "@/components/kkmanime/SearchBox";
import { TYPE_PATH } from "@/components/kkmanime/Shell";
import { typeHead } from "@/components/kkmanime/TypePage";
import { useOpenTitle } from "@/components/kkmanime/dialog-context";
import { TYPES, TYPE_META, findEntry, recommend } from "@/lib/kkmanime";
const Route = createFileRoute("/search")({
  validateSearch: (search) => {
    const type = search["type"];
    return {
      q: typeof search["q"] === "string" ? search["q"] : "",
      type: TYPES.includes(type) ? type : "anime"
    };
  },
  head: () => typeHead(
    "Recommendations \u2014 KKMANIME",
    "See titles that echo the anime, manga, manhwa or film you searched, matched by genre and lead-character traits.",
    null,
    { robots: "noindex, follow" }
  ),
  component: SearchPage
});
function SearchPage() {
  const { q, type } = Route.useSearch();
  const openTitle = useOpenTitle();
  const meta = TYPE_META[type];
  const { source, recs } = useMemo(() => {
    const hit = findEntry(q, type);
    return { source: hit, recs: hit ? recommend(hit, type) : [] };
  }, [q, type]);
  return <>
      <Hero type={type} initialQuery={source?.name ?? q} compact />

      <section className="results-section">
        {!source ? <div className="results-head">
            <p className="search-hint">
              We couldn't find "{q}" in our {meta.noun} list yet. Try another title.
            </p>
          </div> : <>
            <div className="results-head">
              <Link to={TYPE_PATH[type]} className="back-btn">
                ← Back
              </Link>
              <p className="eyebrow">Because you searched</p>
              <div className="source-card">
                <Poster title={source} className="card-poster source-poster" />
                <div className="source-info">
                  <h2>{source.name}</h2>
                  <div className="source-chip-row">
                    {source.genres.map((g) => <span className="chip" key={g}>
                        {g}
                      </span>)}
                  </div>
                  <p className="results-meta">
                    Main character: <b>{source.character.name}</b> (
                    {source.character.traits.join(", ")})
                  </p>
                  <button type="button" className="follow-btn" onClick={() => openTitle(source)}>
                    Open details
                  </button>
                </div>
              </div>
            </div>
            <p className="recs-label">Recommended for you</p>
            <div className="cards-grid">
              {recs.map((r) => <RecCard key={r.entry.id} rec={r} source={source} onOpen={openTitle} />)}
            </div>
          </>}
      </section>
    </>;
}
export {
  Route
};
