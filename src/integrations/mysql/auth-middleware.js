// Password hashing + JWT signing, replacing Supabase Auth. Unlike
// auth-request.server.js, nothing in this file needs `getRequest()` or any
// other `@tanstack/react-start/server` export, so it's safe for it to be
// imported by shared `*.functions.js` files that client components also
// import — it never pulls a server-only import into the client bundle.
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const TOKEN_TTL = "30d";

function getJwtSecret() {
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add a long random JWT_SECRET value to your .env file.");
  }
  return secret;
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(userId) {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: TOKEN_TTL });
}
