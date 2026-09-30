import { DB as BUILTIN_DB } from "@/data/catalog";

let current = BUILTIN_DB;

export function setCatalog(db) {
  if (db && typeof db === "object") current = db;
}

export function getCatalog() {
  return current;
}
