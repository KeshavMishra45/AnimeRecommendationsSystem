import { getCatalog } from "@/lib/catalog-store";
const HUES = {
  orange: ["#ff8a3d", "#c94f0e"],
  gold: ["#ffd166", "#b8860b"],
  crimson: ["#ff4d6d", "#8c0327"],
  noir: ["#5c6494", "#0d1428"],
  emerald: ["#3ddc97", "#0f5c3f"],
  teal: ["#3dd6d6", "#0e5c5c"],
  steel: ["#9db4ff", "#3a4b8c"],
  blood: ["#e63946", "#5c0a10"],
  violet: ["#a78bfa", "#4c1d95"],
  cyan: ["#4be3ff", "#0f5c8c"],
  rose: ["#ff8fb3", "#8c1d4a"],
  lavender: ["#c7b6ff", "#4a3b8c"],
  peach: ["#ffb38a", "#b8551e"],
  amber: ["#ffb703", "#8c5a00"],
  indigo: ["#7b8cff", "#241d8c"],
  wine: ["#c93d5a", "#4a0d1e"]
};
const TYPE_META = {
  anime: {
    noun: "anime",
    label: "Anime",
    icon: "\u{1F3AC}",
    eyebrow: "Anime Recommendation Engine",
    title: "Tell us one title you love.",
    sub: "Type an anime you've already watched \u2014 KKMANIME reads its genres and its main character's traits, then finds what truly echoes it.",
    placeholder: "e.g. Naruto, Attack on Titan, Demon Slayer...",
    popularTitle: "Popular Anime, by Genre"
  },
  manga: {
    noun: "manga",
    label: "Manga",
    icon: "\u{1F4D6}",
    eyebrow: "Manga Recommendation Engine",
    title: "Tell us one manga you love.",
    sub: "Type a manga you've already read \u2014 KKMANIME reads its genres and its protagonist's traits, then finds what truly echoes it.",
    placeholder: "e.g. Berserk, Chainsaw Man, Solo Leveling...",
    popularTitle: "Popular Manga, by Genre"
  },
  manhwa: {
    noun: "manhwa",
    label: "Manhwa",
    icon: "\u{1F4D7}",
    eyebrow: "Manhwa Recommendation Engine",
    title: "Tell us one manhwa you love.",
    sub: "Type a manhwa you've already read \u2014 KKMANIME reads its genres and its protagonist's traits, then finds what truly echoes it.",
    placeholder: "e.g. Omniscient Reader, Lookism, Tower of God...",
    popularTitle: "Popular Manhwa, by Genre"
  },
  movie: {
    noun: "title",
    label: "Movies & Series",
    icon: "\u{1F39E}\uFE0F",
    eyebrow: "Movies & Series Recommendation Engine",
    title: "Tell us one movie or series you love.",
    sub: "Type a film or series you've already watched \u2014 KKMANIME reads its genres and its lead character's traits, then finds what truly echoes it.",
    placeholder: "e.g. Your Name, Spirited Away, Cowboy Bebop...",
    popularTitle: "Popular Movies & Series, by Genre"
  }
};
const TYPES = ["anime", "manga", "manhwa", "movie"];
const LETTERS = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const GENRE_ORDER = [
  "Action",
  "Drama",
  "Fantasy",
  "Comedy",
  "Adventure",
  "Romance",
  "Slice of Life",
  "Thriller",
  "Horror",
  "Sci-Fi",
  "Mystery",
  "Supernatural",
  "Sports"
];
const norm = (s) => s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, "");
function editDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}
const fuzzyThreshold = (len) => len <= 4 ? 1 : len <= 8 ? 2 : 3;
function fuzzyFindEntry(q, list) {
  const qWords = q.split(/\s+/).filter((w) => w.length > 2);
  let best = null;
  let bestDist = Infinity;
  list.forEach((e) => {
    const nameNorm = norm(e.name);
    const whole = editDistance(q, nameNorm);
    if (whole <= fuzzyThreshold(Math.max(q.length, nameNorm.length)) && whole < bestDist) {
      best = e;
      bestDist = whole;
    }
    const nameWords = nameNorm.split(/\s+/);
    qWords.forEach(
      (qw) => nameWords.forEach((nw) => {
        if (nw.length <= 2) return;
        const d = editDistance(qw, nw);
        if (d <= fuzzyThreshold(Math.max(qw.length, nw.length)) && d < bestDist) {
          best = e;
          bestDist = d;
        }
      })
    );
  });
  return best;
}
function entriesOf(type) {
  return (getCatalog()[type] || []).map((e) => ({ ...e, type }));
}
function findEntry(query, type) {
  const q = norm(query);
  if (!q) return null;
  const list = entriesOf(type);
  let hit = list.find((e) => norm(e.name) === q);
  if (hit) return hit;
  hit = list.find((e) => norm(e.name).includes(q) || q.includes(norm(e.name)));
  if (hit) return hit;
  const qWords = q.split(/\s+/);
  hit = list.find((e) => qWords.some((w) => w.length > 2 && norm(e.name).includes(w)));
  if (hit) return hit;
  return fuzzyFindEntry(q, list);
}
function recommend(source, type) {
  const list = entriesOf(type).filter((e) => e.id !== source.id);
  const maxScore = source.genres.length * 2 + source.character.traits.length * 1.5;
  return list.map((e) => {
    const sharedGenres = e.genres.filter((g) => source.genres.includes(g));
    const sharedTraits = e.character.traits.filter((t) => source.character.traits.includes(t));
    let score = sharedGenres.length * 2 + sharedTraits.length * 1.5;
    if (e.genres[0] === source.genres[0]) score += 1;
    return { entry: e, sharedGenres, sharedTraits, score, percent: 0 };
  }).filter((r) => r.score > 0).sort((a, b) => b.score - a.score || Number(b.entry.popular) - Number(a.entry.popular)).slice(0, 6).map((r) => ({ ...r, percent: Math.min(100, Math.round(r.score / maxScore * 100)) }));
}
function explanationSentence(source, r) {
  const parts = [];
  if (r.sharedGenres.length) parts.push(`both live in ${r.sharedGenres.join(" & ")}`);
  if (r.sharedTraits.length)
    parts.push(
      `${r.entry.character.name} shares a ${r.sharedTraits.join(", ").toLowerCase()} streak with ${source.character.name}`
    );
  if (!parts.length) parts.push(`it sits close in tone to ${source.name}`);
  return `Recommended because ${parts.join(" \u2014 and ")}.`;
}
function popularByGenre(type) {
  const list = entriesOf(type);
  const map = /* @__PURE__ */ new Map();
  list.forEach(
    (e) => e.genres.forEach((g) => {
      const items = map.get(g) || [];
      items.push(e);
      map.set(g, items);
    })
  );
  return [...map.entries()].map(([genre, items]) => ({
    genre,
    items: items.sort((a, b) => Number(b.popular) - Number(a.popular)).slice(0, 14)
  })).filter((row) => row.items.length >= 2).sort((a, b) => {
    const ar = GENRE_ORDER.indexOf(a.genre);
    const br = GENRE_ORDER.indexOf(b.genre);
    return (ar < 0 ? GENRE_ORDER.length : ar) - (br < 0 ? GENRE_ORDER.length : br);
  }).slice(0, 10);
}
function azList(type, letter) {
  return entriesOf(type).filter((e) => letter === "#" ? !/^[a-z]/i.test(e.name) : e.name.toUpperCase().startsWith(letter)).sort((a, b) => a.name.localeCompare(b.name));
}
const posterGradient = (hue) => {
  const [c1, c2] = HUES[hue] || HUES["steel"];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
};
const coverCache = /* @__PURE__ */ new Map();
let queueTail = Promise.resolve();
function queueFetch(task) {
  const run = queueTail.then(task);
  queueTail = run.then(
    () => new Promise((r) => setTimeout(r, 380)),
    () => new Promise((r) => setTimeout(r, 380))
  );
  return run;
}
async function fetchCoverUrl(name, type) {
  const key = `${type}:${name}`;
  const cached = coverCache.get(key);
  if (cached !== void 0) return cached;
  return queueFetch(async () => {
    const again = coverCache.get(key);
    if (again !== void 0) return again;
    try {
      const endpoint = type === "manga" || type === "manhwa" ? "manga" : "anime";
      const res = await fetch(
        `https://api.jikan.moe/v4/${endpoint}?q=${encodeURIComponent(name)}&limit=1&sfw=true`
      );
      if (!res.ok) throw new Error("jikan");
      const json = await res.json();
      const img = json.data?.[0]?.images;
      const url = img?.["webp"]?.large_image_url || img?.["jpg"]?.large_image_url || null;
      coverCache.set(key, url);
      return url;
    } catch {
      coverCache.set(key, null);
      return null;
    }
  });
}
export {
  HUES,
  LETTERS,
  TYPES,
  TYPE_META,
  azList,
  entriesOf,
  explanationSentence,
  fetchCoverUrl,
  findEntry,
  norm,
  popularByGenre,
  posterGradient,
  recommend
};
