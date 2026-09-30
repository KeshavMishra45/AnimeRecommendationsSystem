import { useState } from "react";
import { AZBrowser } from "./AZBrowser";
import { PopularRows } from "./PopularRows";
import { Hero } from "./SearchBox";
import { DecorDivider } from "./Decor";
function TypePage({ type }) {
  const [letter, setLetter] = useState("A");
  return <>
      <Hero type={type} />
      <PopularRows type={type} />
      <DecorDivider />
      <AZBrowser type={type} letter={letter} onLetter={setLetter} />
    </>;
}
function typeHead(title, description, path, extra = {}) {
  const meta = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    { property: "og:site_name", content: "KKMANIME" },
    { property: "og:locale", content: "en_US" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description }
  ];
  const links = [];
  if (path) {
    meta.push({ property: "og:url", content: path });
    links.push({ rel: "canonical", href: path });
  }
  if (extra.keywords) meta.push({ name: "keywords", content: extra.keywords });
  if (extra.robots) {
    const idx = meta.findIndex((m) => m.name === "robots");
    if (idx >= 0) meta[idx] = { name: "robots", content: extra.robots };
  }
  return { meta, links };
}

export {
  TypePage,
  typeHead
};
