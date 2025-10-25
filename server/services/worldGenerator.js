/**
 * Procedural World Generator
 * Generates Minecraft-style terrain on-the-fly without storing world files
 * Reduces deployment size from 662MB to near-zero
 */

import { createNoise2D } from '../../node_modules/simplex-noise/dist/esm/simplex-noise.js';
import { nanoid } from 'nanoid';

// Noise generator for terrain (will be seeded)
let noise2D = null;

/**
 * Initialize world generator with seed
 * @param {string} seed - World seed for consistent generation
 */
export function initGenerator(seed = 'default') {
  // Create seeded random function
  const seedNumber = hashCode(seed);
  noise2D = createNoise2D(() => {
    const x = Math.sin(seedNumber++) * 10000;
    return x - Math.floor(x);
  });
}

/**
 * Hash string to number for seeding
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Generate a chunk of terrain
 * @param {number} chunkX - Chunk X coordinate
 * @param {number} chunkZ - Chunk Z coordinate
 * @param {object} options - Generation options
 * @returns {object} Generated chunk data
 */
export function generateChunk(chunkX, chunkZ, options = {}) {
  const {
    size = 16,           // Chunk size (16x16 standard)
    height = 256,        // World height
    seaLevel = 64,       // Sea level
    scale = 0.02,        // Noise scale (smaller = more varied)
    octaves = 4,         // Detail levels
    persistence = 0.5,   // Detail falloff
  } = options;

  const blocks = [];

  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      const worldX = chunkX * size + x;
      const worldZ = chunkZ * size + z;

      // Generate terrain height using multi-octave noise
      let terrainHeight = 0;
      let amplitude = 1;
      let frequency = scale;
      let maxValue = 0;

      for (let i = 0; i < octaves; i++) {
        terrainHeight += noise2D(worldX * frequency, worldZ * frequency) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }

      // Normalize to height range
      terrainHeight = (terrainHeight / maxValue + 1) / 2; // 0-1
      const height = Math.floor(terrainHeight * 40 + seaLevel - 20); // 44-84 range

      // Generate blocks vertically
      for (let y = 0; y < Math.min(height, 256); y++) {
        let blockType;

        if (y === height - 1 && height > seaLevel) {
          blockType = 'grass'; // Top layer above water
        } else if (y > height - 4 && height > seaLevel) {
          blockType = 'dirt'; // Dirt layer
        } else if (y === 0) {
          blockType = 'bedrock'; // Bottom layer
        } else {
          blockType = 'stone'; // Everything else
        }

        blocks.push({
          x: worldX,
          y: y,
          z: worldZ,
          type: blockType
        });
      }

      // Add water for areas below sea level
      if (height < seaLevel) {
        for (let y = height; y < seaLevel; y++) {
          blocks.push({
            x: worldX,
            y: y,
            z: worldZ,
            type: 'water'
          });
        }
      }
    }
  }

  return {
    chunkX,
    chunkZ,
    blocks,
    generated: true,
    timestamp: Date.now()
  };
}

/**
 * Generate spawn structures (trees, buildings, etc.)
 * @param {number} chunkX - Chunk X coordinate
 * @param {number} chunkZ - Chunk Z coordinate
 * @returns {array} Structure blocks
 */
export function generateStructures(chunkX, chunkZ) {
  const structures = [];

  // Simple tree generation (one tree per chunk, randomly placed)
  const treeRandom = hashCode(`tree_${chunkX}_${chunkZ}`) / 1000000;

  if (treeRandom % 1 > 0.7) { // 30% chance of tree
    const treeX = chunkX * 16 + Math.floor((treeRandom * 13) % 13) + 2;
    const treeZ = chunkZ * 16 + Math.floor((treeRandom * 17) % 13) + 2;

    // Get ground height (simplified - in real implementation query terrain)
    const groundY = 64 + Math.floor((noise2D(treeX * 0.02, treeZ * 0.02) + 1) * 10);

    // Tree trunk
    for (let y = groundY; y < groundY + 5; y++) {
      structures.push({ x: treeX, y, z: treeZ, type: 'log' });
    }

    // Tree leaves (simple sphere)
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = 0; dy <= 3; dy++) {
        for (let dz = -2; dz <= 2; dz++) {
          if (Math.abs(dx) + Math.abs(dz) <= 2 || dy > 1) {
            structures.push({
              x: treeX + dx,
              y: groundY + 4 + dy,
              z: treeZ + dz,
              type: 'leaves'
            });
          }
        }
      }
    }
  }

  return structures;
}

/**
 * Generate biome data for chunk
 * @param {number} chunkX - Chunk X coordinate
 * @param {number} chunkZ - Chunk Z coordinate
 * @returns {string} Biome type
 */
export function getBiome(chunkX, chunkZ) {
  const biomeNoise = noise2D(chunkX * 0.001, chunkZ * 0.001);

  if (biomeNoise < -0.3) return 'ocean';
  if (biomeNoise < 0) return 'plains';
  if (biomeNoise < 0.3) return 'forest';
  if (biomeNoise < 0.6) return 'hills';
  return 'mountains';
}

/**
 * Create a new world with generated spawn area
 * @param {string} name - World name
 * @param {string} seed - World seed
 * @returns {object} World metadata
 */
export function createWorld(name, seed = null) {
  const worldSeed = seed || nanoid(10);
  initGenerator(worldSeed);

  // Pre-generate spawn chunks (3x3 around origin)
  const spawnChunks = [];
  for (let x = -1; x <= 1; x++) {
    for (let z = -1; z <= 1; z++) {
      const chunk = generateChunk(x, z);
      const structures = generateStructures(x, z);
      spawnChunks.push({
        ...chunk,
        structures
      });
    }
  }

  return {
    id: nanoid(),
    name,
    seed: worldSeed,
    spawnX: 0,
    spawnY: 70,
    spawnZ: 0,
    spawnChunks,
    generated: true,
    createdAt: Date.now()
  };
}

// Initialize with default seed on load
initGenerator('blockverse-default');

export default {
  initGenerator,
  generateChunk,
  generateStructures,
  getBiome,
  createWorld
};
