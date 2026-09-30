import { useMemo } from "react";
import { MiniCard } from "./Cards";
import { useOpenTitle } from "./dialog-context";
import { Decor } from "./Decor";
import { LETTERS, TYPE_META, azList } from "@/lib/kkmanime";
function AZBrowser({
  type,
  letter,
  onLetter
}) {
  const list = useMemo(() => azList(type, letter), [type, letter]);
  const openTitle = useOpenTitle();
  return <section className="az-section">
      <Decor set="az" />
      <p className="eyebrow">Full Catalog</p>
      <h2>{TYPE_META[type].label} A–Z</h2>
      <div className="az-letter-bar">
        {LETTERS.map((l) => <button
    key={l}
    type="button"
    className={`az-letter${letter === l ? " active" : ""}`}
    onClick={() => onLetter(l)}
  >
            {l}
          </button>)}
      </div>
      <div className="az-results mini-row">
        {list.length ? list.map((t) => <MiniCard key={t.id} title={t} onOpen={openTitle} />) : <p className="side-note">Nothing under “{letter}” yet.</p>}
      </div>
    </section>;
}
export {
  AZBrowser
};
