import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { sqliteDatabasePath } from "@/lib/sqlite-storage";
import type { CurrencyRates } from "@/lib/currency";

export type PersistedFxRates = {
  rates: CurrencyRates;
  updatedAt: string;
};

function openFxDatabase(filename: string) {
  mkdirSync(dirname(filename), { recursive: true });
  const db = new Database(filename);
  db.pragma("busy_timeout = 5000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS fx_rates_usd (
      code TEXT PRIMARY KEY,
      rate REAL NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  return db;
}

export function readPersistedFxRates(filename = sqliteDatabasePath()): PersistedFxRates | null {
  const db = openFxDatabase(filename);
  try {
    const rows = db.prepare("SELECT code, rate, updated_at AS updatedAt FROM fx_rates_usd").all() as Array<{
      code: string;
      rate: number;
      updatedAt: string;
    }>;
    if (!rows.length) return null;
    return {
      rates: Object.fromEntries(rows.map(row => [row.code, row.rate])),
      updatedAt: rows.reduce((latest, row) => row.updatedAt > latest ? row.updatedAt : latest, rows[0].updatedAt),
    };
  } finally {
    db.close();
  }
}

export function persistFxRates(rates: CurrencyRates, updatedAt: string, filename = sqliteDatabasePath()) {
  const db = openFxDatabase(filename);
  try {
    const insert = db.prepare(`
      INSERT INTO fx_rates_usd (code, rate, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET rate = excluded.rate, updated_at = excluded.updated_at
    `);
    db.transaction(() => {
      db.prepare("DELETE FROM fx_rates_usd").run();
      for (const [code, rate] of Object.entries(rates)) insert.run(code, rate, updatedAt);
    })();
  } finally {
    db.close();
  }
}
