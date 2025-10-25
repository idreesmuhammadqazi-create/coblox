/**
 * Notification Model (SQLite version)
 */

import getDB from '../sqlite.js';
import { nanoid } from 'nanoid';

export type NotificationType = 'friend_request' | 'world_invite' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data: any;
  createdAt: number;
}

export interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

/**
 * Create a new notification
 */
export function createNotification(input: NotificationInput): Notification {
  const db = getDB();

  const id = nanoid();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO notifications (id, user_id, type, title, message, read, data, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?)
  `);

  stmt.run(
    id,
    input.userId,
    input.type,
    input.title,
    input.message,
    input.data ? JSON.stringify(input.data) : null,
    now
  );

  return getNotificationById(id)!;
}

/**
 * Get notification by ID
 */
export function getNotificationById(id: string): Notification | null {
  const db = getDB();

  const stmt = db.prepare(`
    SELECT id, user_id as userId, type, title, message,
           read, data, created_at as createdAt
    FROM notifications
    WHERE id = ?
  `);

  const row: any = stmt.get(id);

  if (!row) return null;

  return {
    ...row,
    read: Boolean(row.read),
    data: row.data ? JSON.parse(row.data) : {},
  };
}

/**
 * Get all notifications for a user
 */
export function getUserNotifications(userId: string, limit: number = 50): Notification[] {
  const db = getDB();

  const stmt = db.prepare(`
    SELECT id, user_id as userId, type, title, message,
           read, data, created_at as createdAt
    FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `);

  const rows: any[] = stmt.all(userId, limit);

  return rows.map(row => ({
    ...row,
    read: Boolean(row.read),
    data: row.data ? JSON.parse(row.data) : {},
  }));
}

/**
 * Get unread notifications for a user
 */
export function getUnreadNotifications(userId: string): Notification[] {
  const db = getDB();

  const stmt = db.prepare(`
    SELECT id, user_id as userId, type, title, message,
           read, data, created_at as createdAt
    FROM notifications
    WHERE user_id = ? AND read = 0
    ORDER BY created_at DESC
  `);

  const rows: any[] = stmt.all(userId);

  return rows.map(row => ({
    ...row,
    read: Boolean(row.read),
    data: row.data ? JSON.parse(row.data) : {},
  }));
}

/**
 * Mark notification as read
 */
export function markNotificationAsRead(id: string): boolean {
  const db = getDB();

  const stmt = db.prepare(`
    UPDATE notifications
    SET read = 1
    WHERE id = ?
  `);

  const result = stmt.run(id);
  return result.changes > 0;
}

/**
 * Mark all notifications as read for a user
 */
export function markAllNotificationsAsRead(userId: string): number {
  const db = getDB();

  const stmt = db.prepare(`
    UPDATE notifications
    SET read = 1
    WHERE user_id = ? AND read = 0
  `);

  const result = stmt.run(userId);
  return result.changes;
}

/**
 * Delete notification
 */
export function deleteNotification(id: string): boolean {
  const db = getDB();

  const stmt = db.prepare('DELETE FROM notifications WHERE id = ?');
  const result = stmt.run(id);

  return result.changes > 0;
}

/**
 * Delete all notifications for a user
 */
export function deleteUserNotifications(userId: string): number {
  const db = getDB();

  const stmt = db.prepare('DELETE FROM notifications WHERE user_id = ?');
  const result = stmt.run(userId);

  return result.changes;
}

/**
 * Get notification count for a user
 */
export function getNotificationCount(userId: string, unreadOnly: boolean = false): number {
  const db = getDB();

  const query = unreadOnly
    ? 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
    : 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?';

  const stmt = db.prepare(query);
  const row: any = stmt.get(userId);

  return row?.count || 0;
}

export default {
  createNotification,
  getNotificationById,
  getUserNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteUserNotifications,
  getNotificationCount,
};
