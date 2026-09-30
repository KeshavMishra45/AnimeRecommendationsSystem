import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AZBrowser } from "@/components/kkmanime/AZBrowser";
import { TYPE_PATH } from "@/components/kkmanime/Shell";
import { typeHead } from "@/components/kkmanime/TypePage";
import { Link } from "@tanstack/react-router";
import { LETTERS, TYPES, TYPE_META } from "@/lib/kkmanime";
const Route = createFileRoute("/catalog")({
  validateSearch: (search) => {
    const type = search["type"];
    const letter = String(search["letter"] ?? "A").toUpperCase();
    return {
      type: TYPES.includes(type) ? type : "anime",
      letter: LETTERS.includes(letter) ? letter : "A"
    };
  },
  head: () => typeHead(
    "Full Catalog A\u2013Z \u2014 KKMANIME",
    "Browse every anime, manga, manhwa and film in the KKMANIME catalog alphabetically.",
    "/catalog",
    { keywords: "anime catalog, manga list a-z, manhwa list, anime movie list" }
  ),
  component: CatalogPage
});
function CatalogPage() {
  const { type, letter } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  return <section className="popular-section">
      <p className="eyebrow">Browse everything</p>
      <h2>Catalog A–Z</h2>
      <div className="type-tab-bar">
        {TYPES.map((t) => <Link
    key={t}
    to="/catalog"
    search={{ type: t, letter }}
    className={`type-tab${type === t ? " active" : ""}`}
  >
            {TYPE_META[t].label}
          </Link>)}
        <Link to={TYPE_PATH[type]} className="type-tab">
          Recommend {TYPE_META[type].label} →
        </Link>
      </div>
      <AZBrowser
    type={type}
    letter={letter}
    onLetter={(l) => navigate({ search: { type, letter: l } })}
  />
    </section>;
}
export {
  Route
};
