import * as SQLite from "expo-sqlite";

export type ScanRecord = {
  id: number;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  imageUri: string;
  status: "snake" | "not_snake";
  snakeKey: string | null;
  name: string;
  venomType: string;
  confidence: number;
};

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initialized = false;

export const getDb = (): SQLite.SQLiteDatabase => {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync("snake_scans.db");
  }
  return dbInstance;
};

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = getDb();

  if (!initialized) {
    console.log("SQLITE: initializing database...");

    db.execSync(`
      CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        imageUri TEXT,
        status TEXT NOT NULL,
        snakeKey TEXT,
        name TEXT NOT NULL,
        venomType TEXT NOT NULL,
        confidence REAL NOT NULL
      );
    `);

    initialized = true;
    console.log("SQLITE: database ready");
  }

  return db;
};

export const getAllScans = async (): Promise<ScanRecord[]> => {
  const db = await initDatabase();
  console.log("SQLITE: reading scans with sync query...");

  const rows = db.getAllSync<ScanRecord>(
    "SELECT * FROM scans ORDER BY timestamp DESC",
  );

  console.log("SQLITE: scans read =", rows.length);
  return rows;
};

export const insertScan = async (
  scanData: Omit<ScanRecord, "id" | "timestamp">,
): Promise<void> => {
  const db = await initDatabase();
  console.log("SQLITE: inserting scan with sync query...");

  db.runSync(
    `INSERT INTO scans
    (timestamp, latitude, longitude, imageUri, status, snakeKey, name, venomType, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      new Date().toISOString(),
      scanData.latitude,
      scanData.longitude,
      scanData.imageUri,
      scanData.status,
      scanData.snakeKey,
      scanData.name,
      scanData.venomType,
      scanData.confidence,
    ],
  );

  console.log("SQLITE: insert done");
};

export const deleteScan = async (id: number): Promise<void> => {
  const db = await initDatabase();
  console.log("SQLITE: deleting scan id =", id);

  db.runSync(`DELETE FROM scans WHERE id = ?`, [id]);

  console.log("SQLITE: delete done");
};
