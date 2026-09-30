import { createServerFn } from "@tanstack/react-start";

import { DB as BUILTIN_DB } from "@/data/catalog";
import { getPool } from "@/integrations/mysql/db-pool";

const TYPES = ["anime", "manga", "manhwa", "movie"];

function rowToEntry(row) {
  return {
    id: row.id,
    name: row.name,
    img: row.img ?? undefined,
    genres: row.genres ?? [],
    character: {
      name: row.character_name ?? "",
      traits: row.character_traits ?? [],
    },
    desc: row.description ?? "",
    glyph: row.glyph ?? "",
    hue: row.hue ?? "steel",
    popular: Boolean(row.popular),
  };
}

/**
 * Node backend: reads the catalog out of MySQL and merges it with the
 * built-in seed catalog. Rows added with SQL show up automatically; a row
 * sharing an id with a built-in entry overrides it.
 */
export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const db = {};
  for (const type of TYPES) db[type] = [...(BUILTIN_DB[type] ?? [])];

  try {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT * FROM titles ORDER BY sort_order ASC");

    for (const row of rows) {
      const list = db[row.type];
      if (!list) continue;
      const entry = rowToEntry(row);
      const existing = list.findIndex((e) => e.id === entry.id);
      if (existing >= 0) list[existing] = entry;
      else list.push(entry);
    }
  } catch (err) {
    console.error("[catalog] falling back to built-in catalog:", err);
  }

  return db;
});
