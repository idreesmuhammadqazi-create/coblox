/**
 * Notification Model (SQLite version with sql.js)
 */

import { run, get, all } from '../sqlite.js';
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
  const id = nanoid();
  const now = Date.now();

  run(
    `INSERT INTO notifications (id, user_id, type, title, message, read, data, created_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
    [
      id,
      input.userId,
      input.type,
      input.title,
      input.message,
      input.data ? JSON.stringify(input.data) : null,
      now
    ]
  );

  return getNotificationById(id)!;
}

/**
 * Get notification by ID
 */
export function getNotificationById(id: string): Notification | null {
  const row: any = get(
    `SELECT id, user_id as userId, type, title, message,
            read, data, created_at as createdAt
     FROM notifications
     WHERE id = ?`,
    [id]
  );

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
  const rows: any[] = all(
    `SELECT id, user_id as userId, type, title, message,
            read, data, created_at as createdAt
     FROM notifications
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ?`,
    [userId, limit]
  );

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
  const rows: any[] = all(
    `SELECT id, user_id as userId, type, title, message,
            read, data, created_at as createdAt
     FROM notifications
     WHERE user_id = ? AND read = 0
     ORDER BY created_at DESC`,
    [userId]
  );

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
  try {
    run(`UPDATE notifications SET read = 1 WHERE id = ?`, [id]);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Mark all notifications as read for a user
 */
export function markAllNotificationsAsRead(userId: string): number {
  try {
    // Get count before update
    const count = getNotificationCount(userId, true);
    run(`UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0`, [userId]);
    return count;
  } catch (error) {
    return 0;
  }
}

/**
 * Delete notification
 */
export function deleteNotification(id: string): boolean {
  try {
    run('DELETE FROM notifications WHERE id = ?', [id]);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Delete all notifications for a user
 */
export function deleteUserNotifications(userId: string): number {
  try {
    // Get count before deletion
    const count = getNotificationCount(userId);
    run('DELETE FROM notifications WHERE user_id = ?', [userId]);
    return count;
  } catch (error) {
    return 0;
  }
}

/**
 * Get notification count for a user
 */
export function getNotificationCount(userId: string, unreadOnly: boolean = false): number {
  const query = unreadOnly
    ? 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0'
    : 'SELECT COUNT(*) as count FROM notifications WHERE user_id = ?';

  const row: any = get(query, [userId]);

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
