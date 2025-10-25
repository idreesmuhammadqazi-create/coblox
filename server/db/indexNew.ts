/**
 * Database connection (SQLite version)
 * Simplified database without external MongoDB dependency
 */

export { connectDB, getDB, closeDB } from './sqlite.js';
export * as User from './models/UserSQL.js';
export * as Notification from './models/NotificationSQL.js';
