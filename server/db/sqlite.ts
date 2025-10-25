/**
 * SQLite Database Connection
 * Simplified database without external dependencies
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync, mkdirSync } from 'fs';

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
let db: Database.Database | null = null;

/**
 * Get database connection (singleton)
 */
export function getDB(): Database.Database {
  if (!db) {
    db = new Database(dbPath, { verbose: console.log });

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    // Performance optimizations
    db.pragma('journal_mode = WAL'); // Write-Ahead Logging for better concurrency
    db.pragma('synchronous = NORMAL'); // Balance between safety and speed

    console.log(`SQLite database connected at: ${dbPath}`);
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

    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database schema:', error);
    throw error;
  }
}

/**
 * Connect to database (for compatibility with old MongoDB code)
 */
export async function connectDB(): Promise<void> {
  try {
    getDB();
    initDB();
    console.log('Database connected and initialized');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

/**
 * Close database connection
 */
export function closeDB(): void {
  if (db) {
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
