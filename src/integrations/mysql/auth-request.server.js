// Authentication middleware for TanStack Start server functions.
// IMPORTANT: do not import @tanstack/react-start/server here. This module is
// imported by shared *.functions.js files that are also referenced by the
// client bundle. TanStack Start provides the current Request directly to
// middleware.server(), so we can read the Authorization header from `request`
// without using the server-only getRequest() API.

import jwt from "jsonwebtoken";
import { createMiddleware } from "@tanstack/react-start";

function getJwtSecret() {
  const secret = process.env["JWT_SECRET"];
  if (!secret) {
    throw new Error("JWT_SECRET is not set. Add a long random JWT_SECRET value to your .env file.");
  }
  return secret;
}

function readUserId(request) {
  const authHeader = request?.headers?.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token || token.split(".").length !== 3) {
    return null;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret());
    return payload?.sub ?? null;
  } catch {
    return null;
  }
}

/**
 * Middleware for server functions that must be called by a signed-in user.
 * The Request is supplied directly by TanStack Start middleware, so no
 * server-only request import is required.
 */
export const requireAuth = createMiddleware({ type: "function" }).server(
  async ({ next, request }) => {
    const userId = readUserId(request);

    if (!userId) {
      throw new Error("Unauthorized: Invalid or missing token");
    }

    return next({ context: { userId } });
  },
);

/**
 * Optional authentication middleware.
 *
 * Public server functions can use this when they want to know who the
 * current caller is, without rejecting anonymous visitors.
 */
export const optionalAuth = createMiddleware({ type: "function" }).server(
  async ({ next, request }) => {
    const userId = readUserId(request);
    return next({ context: { optionalUserId: userId } });
  },
);
