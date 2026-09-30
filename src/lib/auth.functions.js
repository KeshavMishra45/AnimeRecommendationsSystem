import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";

import { getPool } from "@/integrations/mysql/db-pool";
import { hashPassword, verifyPassword, signToken } from "@/integrations/mysql/auth-middleware";
import { requireAuth } from "@/integrations/mysql/auth-request.server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function loadUserAndProfile(pool, userId) {
  const [rows] = await pool.query(
    `SELECT u.id, u.email, u.phone, p.username, p.display_name, p.avatar_url
     FROM users u LEFT JOIN profiles p ON p.id = u.id
     WHERE u.id = ? LIMIT 1`,
    [userId],
  );
  const row = rows[0];
  if (!row) return null;
  return {
    user: { id: row.id, email: row.email, phone: row.phone },
    profile: { id: row.id, username: row.username, display_name: row.display_name, avatar_url: row.avatar_url },
  };
}

/**
 * Node backend: creates a user + profile row and returns a signed-in session.
 */
export const signUp = createServerFn({ method: "POST" })
  .validator((input) => {
    if (!input || typeof input !== "object") throw new Error("Invalid signup payload");
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    const username = typeof input.username === "string" ? input.username.trim() : "";
    if (!EMAIL_RE.test(email)) throw new Error("Enter a valid email address");
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
    if (!username) throw new Error("Username is required");
    return { email, password, username };
  })
  .handler(async ({ data }) => {
    const pool = await getPool();
    const [existingEmail] = await pool.query("SELECT id FROM users WHERE email = ? LIMIT 1", [data.email]);
    if (existingEmail[0]) throw new Error("An account with that email already exists");
    const [existingUsername] = await pool.query("SELECT id FROM profiles WHERE username = ? LIMIT 1", [
      data.username,
    ]);
    if (existingUsername[0]) throw new Error("That username is taken");

    const userId = randomUUID();
    const passwordHash = await hashPassword(data.password);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)", [
        userId,
        data.email,
        passwordHash,
      ]);
      await conn.query("INSERT INTO profiles (id, username, display_name) VALUES (?, ?, ?)", [
        userId,
        data.username,
        data.username,
      ]);
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const token = signToken(userId);
    const loaded = await loadUserAndProfile(pool, userId);
    return { token, ...loaded };
  });

/**
 * Node backend: verifies email + password and returns a signed-in session.
 */
export const signIn = createServerFn({ method: "POST" })
  .validator((input) => {
    if (!input || typeof input !== "object") throw new Error("Invalid login payload");
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    if (!email || !password) throw new Error("Email and password are required");
    return { email, password };
  })
  .handler(async ({ data }) => {
    const pool = await getPool();
    const [rows] = await pool.query("SELECT id, password_hash FROM users WHERE email = ? LIMIT 1", [data.email]);
    const row = rows[0];
    if (!row) throw new Error("Invalid email or password");
    const ok = await verifyPassword(data.password, row.password_hash);
    if (!ok) throw new Error("Invalid email or password");

    const token = signToken(row.id);
    const loaded = await loadUserAndProfile(pool, row.id);
    return { token, ...loaded };
  });

/**
 * Node backend: returns the signed-in caller's user + profile, or null.
 */
export const getMe = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const pool = await getPool();
    return (await loadUserAndProfile(pool, context.userId)) ?? { user: null, profile: null };
  });
