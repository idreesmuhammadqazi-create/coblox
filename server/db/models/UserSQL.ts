/**
 * User Model (SQLite version)
 * Simplified user model without Mongoose
 */

import getDB from '../sqlite.js';
import { nanoid } from 'nanoid';

export interface User {
  id: string;
  email: string;
  password: string;
  characterName: string | null;
  avatarAppearance: any | null;
  currentWorld: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface UserInput {
  email: string;
  password: string;
  characterName?: string;
  avatarAppearance?: any;
  currentWorld?: string;
}

/**
 * Create a new user
 */
export function createUser(input: UserInput): User {
  const db = getDB();

  const id = nanoid();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO users (id, email, password, character_name, avatar_appearance, current_world, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    input.email.toLowerCase().trim(),
    input.password,
    input.characterName || null,
    input.avatarAppearance ? JSON.stringify(input.avatarAppearance) : null,
    input.currentWorld || null,
    now,
    now
  );

  return getUserById(id)!;
}

/**
 * Find user by ID
 */
export function getUserById(id: string): User | null {
  const db = getDB();

  const stmt = db.prepare(`
    SELECT id, email, password, character_name as characterName,
           avatar_appearance as avatarAppearance, current_world as currentWorld,
           created_at as createdAt, updated_at as updatedAt
    FROM users
    WHERE id = ?
  `);

  const row: any = stmt.get(id);

  if (!row) return null;

  return {
    ...row,
    avatarAppearance: row.avatarAppearance ? JSON.parse(row.avatarAppearance) : null,
  };
}

/**
 * Find user by email
 */
export function getUserByEmail(email: string): User | null {
  const db = getDB();

  const stmt = db.prepare(`
    SELECT id, email, password, character_name as characterName,
           avatar_appearance as avatarAppearance, current_world as currentWorld,
           created_at as createdAt, updated_at as updatedAt
    FROM users
    WHERE email = ?
  `);

  const row: any = stmt.get(email.toLowerCase().trim());

  if (!row) return null;

  return {
    ...row,
    avatarAppearance: row.avatarAppearance ? JSON.parse(row.avatarAppearance) : null,
  };
}

/**
 * Find user by character name
 */
export function getUserByCharacterName(characterName: string): User | null {
  const db = getDB();

  const stmt = db.prepare(`
    SELECT id, email, password, character_name as characterName,
           avatar_appearance as avatarAppearance, current_world as currentWorld,
           created_at as createdAt, updated_at as updatedAt
    FROM users
    WHERE character_name = ?
  `);

  const row: any = stmt.get(characterName.trim());

  if (!row) return null;

  return {
    ...row,
    avatarAppearance: row.avatarAppearance ? JSON.parse(row.avatarAppearance) : null,
  };
}

/**
 * Update user
 */
export function updateUser(id: string, updates: Partial<UserInput>): User | null {
  const db = getDB();

  const user = getUserById(id);
  if (!user) return null;

  const fields: string[] = [];
  const values: any[] = [];

  if (updates.characterName !== undefined) {
    fields.push('character_name = ?');
    values.push(updates.characterName);
  }

  if (updates.avatarAppearance !== undefined) {
    fields.push('avatar_appearance = ?');
    values.push(updates.avatarAppearance ? JSON.stringify(updates.avatarAppearance) : null);
  }

  if (updates.currentWorld !== undefined) {
    fields.push('current_world = ?');
    values.push(updates.currentWorld);
  }

  if (fields.length === 0) return user;

  // Always update updatedAt
  fields.push('updated_at = ?');
  values.push(Date.now());

  // Add id for WHERE clause
  values.push(id);

  const stmt = db.prepare(`
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  stmt.run(...values);

  return getUserById(id);
}

/**
 * Delete user
 */
export function deleteUser(id: string): boolean {
  const db = getDB();

  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  const result = stmt.run(id);

  return result.changes > 0;
}

/**
 * Get user's friends
 */
export function getUserFriends(userId: string): User[] {
  const db = getDB();

  const stmt = db.prepare(`
    SELECT u.id, u.email, u.character_name as characterName,
           u.avatar_appearance as avatarAppearance, u.current_world as currentWorld,
           u.created_at as createdAt, u.updated_at as updatedAt
    FROM users u
    INNER JOIN friends f ON u.id = f.friend_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `);

  const rows: any[] = stmt.all(userId);

  return rows.map(row => ({
    ...row,
    password: '', // Don't expose password
    avatarAppearance: row.avatarAppearance ? JSON.parse(row.avatarAppearance) : null,
  }));
}

/**
 * Add friend
 */
export function addFriend(userId: string, friendId: string): boolean {
  const db = getDB();

  try {
    const stmt = db.prepare(`
      INSERT INTO friends (id, user_id, friend_id, created_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(nanoid(), userId, friendId, Date.now());
    return true;
  } catch (error) {
    console.error('Failed to add friend:', error);
    return false;
  }
}

/**
 * Remove friend
 */
export function removeFriend(userId: string, friendId: string): boolean {
  const db = getDB();

  const stmt = db.prepare(`
    DELETE FROM friends
    WHERE user_id = ? AND friend_id = ?
  `);

  const result = stmt.run(userId, friendId);
  return result.changes > 0;
}

export default {
  createUser,
  getUserById,
  getUserByEmail,
  getUserByCharacterName,
  updateUser,
  deleteUser,
  getUserFriends,
  addFriend,
  removeFriend,
};
