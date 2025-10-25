/**
 * SQLite Database Connection using sql.js
 * Pure JavaScript implementation - no native bindings required!
 */

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const dbPath = process.env.DB_PATH || join(__dirname, '../../data/blockverse.db');
const schemaPath = join(__dirname, '../../data/schema.sql');

// Ensure data directory exists
const dataDir = dirname(dbPath);
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
let db: SqlJsDatabase | null = null;
let SQL: any = null;

/**
 * Save database to disk
 */
function saveDatabase(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

/**
 * Get database connection (singleton)
 */
export function getDB(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

/**
 * Initialize database schema
 */
export function initDB(): void {
  const database = getDB();

  try {
    // Read and execute schema
    const schema = readFileSync(schemaPath, 'utf8');
    database.exec(schema);

    // Save after schema initialization
    saveDatabase();

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

/**
 * Connect to database
 */
export async function connectDB(): Promise<void> {
  try {
    // Initialize sql.js - use local WASM file from node_modules
    SQL = await initSqlJs({
      // Point to local WASM file included in sql.js package
      locateFile: (file: string) => {
        // In Node.js, use the WASM file from node_modules
        return join(__dirname, '../../node_modules/sql.js/dist', file);
      }
    });

    // Load existing database or create new one
    if (existsSync(dbPath)) {
      const buffer = readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log(`SQLite database loaded from: ${dbPath}`);
    } else {
      db = new SQL.Database();
      console.log('Created new SQLite database');

      // Initialize schema for new database
      initDB();
    }

    // Set up auto-save on changes (save every 5 seconds if changes made)
    setInterval(() => {
      if (db) {
        saveDatabase();
      }
    }, 5000);

    console.log('Database connected and initialized');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

/**
 * Execute a query that returns no results (INSERT, UPDATE, DELETE, etc.)
 */
export function run(sql: string, params: any[] = []): void {
  const database = getDB();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  stmt.step();
  stmt.free();
  saveDatabase(); // Save after modification
}

/**
 * Execute a query and return a single row
 */
export function get(sql: string, params: any[] = []): any {
  const database = getDB();
  const stmt = database.prepare(sql);
  stmt.bind(params);

  let result = null;
  if (stmt.step()) {
    const columns = stmt.getColumnNames();
    const values = stmt.get();
    result = {};
    columns.forEach((col, idx) => {
      result[col] = values[idx];
    });
  }

  stmt.free();
  return result;
}

/**
 * Execute a query and return all rows
 */
export function all(sql: string, params: any[] = []): any[] {
  const database = getDB();
  const stmt = database.prepare(sql);
  stmt.bind(params);

  const results: any[] = [];
  const columns = stmt.getColumnNames();

  while (stmt.step()) {
    const values = stmt.get();
    const row: any = {};
    columns.forEach((col, idx) => {
      row[col] = values[idx];
    });
    results.push(row);
  }

  stmt.free();
  return results;
}

/**
 * Close database connection
 */
export function closeDB(): void {
  if (db) {
    saveDatabase(); // Final save before closing
    db.close();
    db = null;
    console.log('Database connection closed');
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  closeDB();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDB();
  process.exit(0);
});

export default getDB;
