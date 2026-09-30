import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";

import { getPool } from "@/integrations/mysql/db-pool";
import { requireAuth } from "@/integrations/mysql/auth-request.server";

/**
 * Node backend: lists the signed-in user's followed titles out of MySQL.
 * requireAuth verifies the bearer JWT, so this only ever reads the caller's
 * own rows.
 */
export const listFollows = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    try {
      const pool = await getPool();
      const [rows] = await pool.query(
        "SELECT id, title_id, title_name, title_type, created_at FROM follows WHERE user_id = ? ORDER BY created_at DESC",
        [context.userId],
      );
      return rows.map((row) => ({
        id: row.id,
        titleId: row.title_id,
        titleName: row.title_name,
        titleType: row.title_type,
        createdAt: row.created_at,
      }));
    } catch (err) {
      console.error("[follows] list failed:", err);
      return [];
    }
  });

/**
 * Node backend: follows or unfollows a title for the signed-in user.
 */
export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((input) => {
    if (!input || typeof input !== "object") throw new Error("Invalid follow payload");
    const { titleId, titleName, titleType } = input;
    if (!titleId || !titleName || !titleType) throw new Error("Missing title info");
    return { titleId, titleName, titleType };
  })
  .handler(async ({ data, context }) => {
    const pool = await getPool();
    const { userId } = context;

    const [existing] = await pool.query("SELECT id FROM follows WHERE user_id = ? AND title_id = ? LIMIT 1", [
      userId,
      data.titleId,
    ]);

    if (existing[0]) {
      await pool.query("DELETE FROM follows WHERE id = ?", [existing[0].id]);
      return { following: false };
    }

    await pool.query(
      "INSERT INTO follows (id, user_id, title_id, title_name, title_type) VALUES (?, ?, ?, ?, ?)",
      [randomUUID(), userId, data.titleId, data.titleName, data.titleType],
    );
    return { following: true };
  });
