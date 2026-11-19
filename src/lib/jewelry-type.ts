import type Database from "better-sqlite3";
import type { AdminProduct } from "@/shared/admin-types";

type JewelryType = AdminProduct["jewelryType"];

export const jewelryTypeOptions: ReadonlyArray<{ value: JewelryType; label: string }> = [
  { value: "ring", label: "Ring" },
  { value: "earring", label: "Earring" },
  { value: "bracelet", label: "Bracelet" },
  { value: "necklace", label: "Necklace" },
  { value: "loose-stone", label: "Loose Stone" },
];

export function isJewelryType(value: unknown): value is JewelryType {
  return jewelryTypeOptions.some(option => option.value === value);
}

export function inferJewelryType(name: string): JewelryType {
  if (/hoop|drop/i.test(name)) return "earring";
  if (/pendant/i.test(name)) return "necklace";
  if (/cuff|bangle|open band/i.test(name)) return "bracelet";
  return "ring";
}

export function migrateProductJewelryTypes(db: Database.Database) {
  const migrationKey = "product-jewelry-type-v1";
  if (db.prepare("SELECT 1 FROM meta_store WHERE key=?").get(migrationKey)) return;

  db.transaction(() => {
    if (db.prepare("SELECT 1 FROM meta_store WHERE key=?").get(migrationKey)) return;
    const rows = db.prepare("SELECT id, json FROM entity_store WHERE kind='products'").all() as Array<{ id: string; json: string }>;
    // Preserve updated_at: existing collection ordering must not change during this backfill.
    const update = db.prepare("UPDATE entity_store SET json=? WHERE kind='products' AND id=?");
    for (const row of rows) {
      const product = JSON.parse(row.json) as AdminProduct;
      if (product.jewelryType !== undefined) continue;
      update.run(JSON.stringify({ ...product, jewelryType: inferJewelryType(product.name) }), row.id);
    }
    const completedAt = new Date().toISOString();
    db.prepare("INSERT INTO meta_store (key, json, updated_at) VALUES (?, ?, ?)")
      .run(migrationKey, JSON.stringify({ completedAt }), completedAt);
  }).immediate();
}
