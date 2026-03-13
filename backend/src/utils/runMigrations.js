require("dotenv").config();

const fs = require("fs/promises");
const path = require("path");

const { pool } = require("../config/database");

async function runMigrations() {
  const migrationsDir = path.resolve(__dirname, "../../../db/migrations");
  const files = (await fs.readdir(migrationsDir)).filter((file) => file.endsWith(".sql")).sort();

  for (const file of files) {
    const sql = await fs.readFile(path.join(migrationsDir, file), "utf8");
    console.log(`Running migration: ${file}`);
    await pool.query(sql);
  }

  await pool.end();
}

runMigrations().catch((error) => {
  console.error("Migration failed", error);
  process.exitCode = 1;
});
