/**
 * World Generation Routes
 * API endpoints for procedural world generation
 */

import express, { Request, Response } from 'express';
import { initGenerator, generateChunk, generateStructures, createWorld } from '../services/worldGenerator.js';

const router = express.Router();

/**
 * GET /api/world-gen/chunk/:x/:z
 * Generate a chunk at coordinates
 */
router.get('/world-gen/chunk/:x/:z', (req: Request, res: Response) => {
  try {
    const chunkX = parseInt(req.params.x, 10);
    const chunkZ = parseInt(req.params.z, 10);
    const seed = (req.query.seed as string) || 'blockverse-default';

    if (isNaN(chunkX) || isNaN(chunkZ)) {
      return res.status(400).json({ error: 'Invalid chunk coordinates' });
    }

    // Initialize generator with seed
    initGenerator(seed);

    // Generate chunk
    const chunk = generateChunk(chunkX, chunkZ);
    const structures = generateStructures(chunkX, chunkZ);

    res.json({
      success: true,
      chunk: {
        ...chunk,
        structures
      }
    });
  } catch (error) {
    console.error('Chunk generation error:', error);
    res.status(500).json({ error: 'Failed to generate chunk' });
  }
});

/**
 * POST /api/world-gen/create
 * Create a new procedurally generated world
 */
router.post('/world-gen/create', (req: Request, res: Response) => {
  try {
    const { name, seed } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'World name is required' });
    }

    const world = createWorld(name, seed);

    res.json({
      success: true,
      world
    });
  } catch (error) {
    console.error('World creation error:', error);
    res.status(500).json({ error: 'Failed to create world' });
  }
});

/**
 * GET /api/world-gen/info/:worldId
 * Get world metadata (for now just returns seed info)
 */
router.get('/world-gen/info/:worldId', (req: Request, res: Response) => {
  try {
    const worldId = req.params.worldId;

    // For now, return basic info
    // In a real implementation, you'd store world metadata in the database
    res.json({
      success: true,
      world: {
        id: worldId,
        name: worldId,
        seed: worldId, // Use worldId as seed for consistency
        type: 'procedural',
        spawnX: 0,
        spawnY: 70,
        spawnZ: 0
      }
    });
  } catch (error) {
    console.error('World info error:', error);
    res.status(500).json({ error: 'Failed to get world info' });
  }
});

export default router;
