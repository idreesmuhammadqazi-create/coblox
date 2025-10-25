/**
 * Friends Routes (SQLite version)
 */

import { Router, Request, Response } from 'express';
import * as UserModel from '../db/models/UserSQL.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/friends/playing - Get list of friends currently playing in worlds
router.get('/friends/playing', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Get the user's friends
    const friends = UserModel.getUserFriends(userId);

    // Filter friends to only those currently in a world (currentWorld is not null)
    const friendsPlaying = friends
      .filter(friend => friend.currentWorld !== null)
      .map(friend => ({
        id: friend.id,
        characterName: friend.characterName,
        currentWorld: friend.currentWorld,
        avatarAppearance: friend.avatarAppearance,
      }));

    return res.status(200).json({
      success: true,
      friends: friendsPlaying,
    });
  } catch (error) {
    console.error('❌ Error fetching friends playing:', error);
    return res.status(500).json({ success: false, error: 'Something went wrong, please try again' });
  }
});

export default router;
