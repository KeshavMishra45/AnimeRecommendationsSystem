import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";

import { getPool } from "@/integrations/mysql/db-pool";
import { requireAuth } from "@/integrations/mysql/auth-request.server";

function rowToComment(row) {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    userId: row.user_id,
    username: row.display_name || row.username || "member",
  };
}

/**
 * Node backend: reads comments for a title out of MySQL. Comments are
 * public, so this needs no signed-in session.
 */
export const listComments = createServerFn({ method: "GET" })
  .validator((titleId) => (typeof titleId === "string" ? titleId : String(titleId ?? "")))
  .handler(async ({ data: titleId }) => {
    if (!titleId) return [];
    try {
      const pool = await getPool();
      const [rows] = await pool.query(
        `SELECT c.id, c.body, c.created_at, c.user_id, p.username, p.display_name
         FROM comments c LEFT JOIN profiles p ON p.id = c.user_id
         WHERE c.title_id = ? ORDER BY c.created_at DESC`,
        [titleId],
      );
      return rows.map(rowToComment);
    } catch (err) {
      console.error("[comments] list failed:", err);
      return [];
    }
  });

/**
 * Node backend: inserts a comment as the signed-in user.
 */
export const addComment = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((input) => {
    if (!input || typeof input !== "object") throw new Error("Invalid comment payload");
    const { titleId, titleName, titleType, body } = input;
    const trimmed = typeof body === "string" ? body.trim() : "";
    if (!titleId || !titleName || !titleType) throw new Error("Missing title info");
    if (!trimmed) throw new Error("Comment cannot be empty");
    if (trimmed.length > 2000) throw new Error("Comment is too long");
    return { titleId, titleName, titleType, body: trimmed };
  })
  .handler(async ({ data, context }) => {
    const pool = await getPool();
    const { userId } = context;
    const id = randomUUID();

    await pool.query(
      "INSERT INTO comments (id, user_id, title_id, title_name, title_type, body) VALUES (?, ?, ?, ?, ?, ?)",
      [id, userId, data.titleId, data.titleName, data.titleType, data.body],
    );

    const [rows] = await pool.query(
      `SELECT c.id, c.body, c.created_at, c.user_id, p.username, p.display_name
       FROM comments c LEFT JOIN profiles p ON p.id = c.user_id
       WHERE c.id = ? LIMIT 1`,
      [id],
    );
    return rowToComment(rows[0]);
  });

/**
 * Node backend: deletes one of the signed-in user's own comments.
 */
export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .validator((id) => (typeof id === "string" ? id : String(id ?? "")))
  .handler(async ({ data: id, context }) => {
    if (!id) throw new Error("Missing comment id");
    const pool = await getPool();
    await pool.query("DELETE FROM comments WHERE id = ? AND user_id = ?", [id, context.userId]);
    return { ok: true };
  });
