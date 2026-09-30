import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";

import { getPool } from "@/integrations/mysql/db-pool";
import { requireAuth, optionalAuth } from "@/integrations/mysql/auth-request.server";

/**
 * Node backend: public like info for a title — total count (visible to
 * everyone, including anonymous visitors) plus whether the current caller
 * (if signed in) has already liked it.
 */
export const getLikeInfo = createServerFn({ method: "GET" })
  .middleware([optionalAuth])
  .validator((titleId) => (typeof titleId === "string" ? titleId : String(titleId ?? "")))
  .handler(async ({ data: titleId, context }) => {
    if (!titleId) return { count: 0, likedByMe: false };
    try {
      const pool = await getPool();
      const [countRows] = await pool.query("SELECT COUNT(*) AS n FROM likes WHERE title_id = ?", [titleId]);
      const count = countRows[0]?.n ?? 0;

      const userId = context?.optionalUserId ?? null;
      let likedByMe = false;
      if (userId) {
        const [mine] = await pool.query("SELECT id FROM likes WHERE title_id = ? AND user_id = ? LIMIT 1", [
          titleId,
          userId,
        ]);
        likedByMe = Boolean(mine[0]);
      }

      return { count, likedByMe };
    } catch (err) {
      console.error("[likes] info failed:", err);
      return { count: 0, likedByMe: false };
    }
  });

/**
 * Node backend: likes or unlikes a title for the signed-in user, then
 * returns the fresh total count.
 */
export const toggleLike = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((input) => {
    if (!input || typeof input !== "object") throw new Error("Invalid like payload");
    const { titleId, titleName, titleType } = input;
    if (!titleId || !titleName || !titleType) throw new Error("Missing title info");
    return { titleId, titleName, titleType };
  })
  .handler(async ({ data, context }) => {
    const pool = await getPool();
    const { userId } = context;

    const [existing] = await pool.query("SELECT id FROM likes WHERE user_id = ? AND title_id = ? LIMIT 1", [
      userId,
      data.titleId,
    ]);

    let liked;
    if (existing[0]) {
      await pool.query("DELETE FROM likes WHERE id = ?", [existing[0].id]);
      liked = false;
    } else {
      await pool.query(
        "INSERT INTO likes (id, user_id, title_id, title_name, title_type) VALUES (?, ?, ?, ?, ?)",
        [randomUUID(), userId, data.titleId, data.titleName, data.titleType],
      );
      liked = true;
    }

    const [countRows] = await pool.query("SELECT COUNT(*) AS n FROM likes WHERE title_id = ?", [data.titleId]);
    return { liked, count: countRows[0]?.n ?? 0 };
  });
