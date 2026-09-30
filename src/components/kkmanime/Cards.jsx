import { Poster } from "./Poster";
import { explanationSentence } from "@/lib/kkmanime";
function MiniCard({ title, onOpen }) {
  return <article className="mini-card" onClick={() => onOpen(title)}>
      <Poster title={title} className="mini-poster" />
      <p className="mini-name">{title.name}</p>
    </article>;
}
function RecCard({
  rec,
  source,
  onOpen
}) {
  const e = rec.entry;
  return <article className="card" onClick={() => onOpen(e)}>
      <Poster title={e} className="card-poster">
        <span className="match-badge">{rec.percent}% match</span>
      </Poster>
      <div className="card-body">
        <h3>{e.name}</h3>
        <div className="chip-row">
          {e.genres.map((g) => <span className={`chip${rec.sharedGenres.includes(g) ? " shared" : ""}`} key={g}>
              {g}
            </span>)}
        </div>
        <p className="card-why">{explanationSentence(source, rec)}</p>
      </div>
    </article>;
}
export {
  MiniCard,
  RecCard
};
