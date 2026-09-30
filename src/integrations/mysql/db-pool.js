// MySQL connection pool. mysql2 talks raw TCP to your database, so it can
// only ever run on the server. `mysql2/promise` is imported dynamically
// (inside this async function, only called from within server function
// handlers) so bundlers never try to include it in the browser build —
// the same pattern the original code used for its database clients.
let _pool;

export async function getPool() {
  if (_pool) return _pool;

  const host = process.env["DB_HOST"];
  const port = process.env["DB_PORT"] ? Number(process.env["DB_PORT"]) : 3306;
  const user = process.env["DB_USER"];
  const password = process.env["DB_PASSWORD"];
  const database = process.env["DB_NAME"] || "kkmanime";

  if (!host || !user) {
    throw new Error(
      "MySQL is not configured. Set DB_HOST, DB_USER, DB_PASSWORD and DB_NAME in your .env file.",
    );
  }

  const mysql = await import("mysql2/promise");
  _pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: true,
  });
  return _pool;
}
