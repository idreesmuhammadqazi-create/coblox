/**
 * Authentication Routes (SQLite version)
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as UserModel from '../db/models/UserSQL.js';
import { generateToken } from '../utils/jwt.js';

const router = Router();

// POST /api/auth/register - Register a new user
router.post('/auth/register', async (req: Request, res: Response) => {
  console.log('🔵 Registration attempt:', { email: req.body.email });

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Invalid email format:', email);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      console.log('❌ Password too short');
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const existingUser = UserModel.getUserByEmail(email);
    if (existingUser) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = UserModel.createUser({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    console.log('✅ User created successfully:', newUser.email);

    // Generate JWT token
    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
    });

    console.log('✅ Token generated, sending response');
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        characterName: newUser.characterName || null,
      },
    });
  } catch (error) {
    console.error('❌ Error during registration:', error);
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});

// POST /api/auth/login - Login existing user
router.post('/auth/login', async (req: Request, res: Response) => {
  console.log('🔵 Login attempt:', { email: req.body.email });

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const user = UserModel.getUserByEmail(email);
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    console.log('✅ Login successful:', user.email);
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        characterName: user.characterName || null,
      },
    });
  } catch (error) {
    console.error('❌ Error during login:', error);
    return res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});

export default router;
