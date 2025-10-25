/**
 * Procedural World - Infinite terrain generation
 * Uses server-side API to generate chunks on demand
 */

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";

interface Block {
  x: number;
  y: number;
  z: number;
  type: string;
}

interface Chunk {
  chunkX: number;
  chunkZ: number;
  blocks: Block[];
  structures: Block[];
}

export default function ProceduralWorld() {
  const [, setLocation] = useLocation();
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState("blockverse-demo");

  // Load spawn chunks on mount
  useEffect(() => {
    loadSpawnChunks();
  }, []);

  const loadSpawnChunks = async () => {
    setLoading(true);
    try {
      // Load 3x3 chunks around origin
      const chunkPromises = [];
      for (let x = -1; x <= 1; x++) {
        for (let z = -1; z <= 1; z++) {
          chunkPromises.push(loadChunk(x, z));
        }
      }
      const loadedChunks = await Promise.all(chunkPromises);
      setChunks(loadedChunks.filter(Boolean) as Chunk[]);
      toast.success(`Loaded ${loadedChunks.length} chunks with procedural generation!`);
    } catch (error) {
      console.error("Failed to load chunks:", error);
      toast.error("Failed to load world chunks");
    } finally {
      setLoading(false);
    }
  };

  const loadChunk = async (x: number, z: number): Promise<Chunk | null> => {
    try {
      const response = await axios.get(`/api/world-gen/chunk/${x}/${z}`, {
        params: { seed }
      });
      return response.data.chunk;
    } catch (error) {
      console.error(`Failed to load chunk ${x},${z}:`, error);
      return null;
    }
  };

  const getBlockStats = () => {
    const totalBlocks = chunks.reduce((sum, chunk) => sum + chunk.blocks.length, 0);
    const totalStructures = chunks.reduce((sum, chunk) => sum + (chunk.structures?.length || 0), 0);
    return { totalBlocks, totalStructures };
  };

  const { totalBlocks, totalStructures } = getBlockStats();

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1a1f3a] via-[#0a0e27] to-[#050810] text-white">
      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Procedural World</h1>
            <p className="text-sm text-gray-400">Infinite terrain generation</p>
          </div>
        </div>
        <Button
          onClick={() => setLocation("/home")}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          Back to Home
        </Button>
      </div>

      {/* Content */}
      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        {/* World Info */}
        <div className="bg-[#0d1230] border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">World Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-gray-400 text-sm">Seed</div>
              <div className="text-white font-mono text-lg">{seed}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Chunks Loaded</div>
              <div className="text-white font-mono text-lg">{chunks.length}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Total Blocks</div>
              <div className="text-white font-mono text-lg">{totalBlocks.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Structures</div>
              <div className="text-white font-mono text-lg">{totalStructures}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-[#0d1230] border border-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">Actions</h2>
          <div className="flex gap-4">
            <Button
              onClick={loadSpawnChunks}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Generating..." : "Regenerate Chunks"}
            </Button>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="World seed"
                className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
              />
              <Button
                onClick={loadSpawnChunks}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Apply Seed
              </Button>
            </div>
          </div>
        </div>

        {/* Chunk Grid Visualization */}
        <div className="bg-[#0d1230] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">Chunk Map (Top View)</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-400">Generating chunks...</div>
          ) : chunks.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="inline-grid grid-cols-3 gap-2 p-4">
                {[-1, 0, 1].map((z) => (
                  [-1, 0, 1].map((x) => {
                    const chunk = chunks.find(c => c.chunkX === x && c.chunkZ === z);
                    return (
                      <div
                        key={`${x},${z}`}
                        className="w-32 h-32 bg-gray-900 border border-gray-700 rounded-lg p-2 flex flex-col justify-between"
                      >
                        <div>
                          <div className="text-xs text-gray-500">Chunk</div>
                          <div className="text-sm font-mono text-white">{x},{z}</div>
                        </div>
                        {chunk && (
                          <div className="text-xs text-gray-400">
                            {chunk.blocks.length} blocks
                            {chunk.structures?.length > 0 && (
                              <div className="text-green-400">
                                🌲 {chunk.structures.length} structures
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No chunks loaded. Click "Regenerate Chunks" to start.
            </div>
          )}
        </div>

        {/* Feature Info */}
        <div className="mt-6 bg-[#0d1230] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-green-400">✨ Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Infinite Generation:</strong> Chunks generated on-demand using Simplex noise</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Seeded Worlds:</strong> Same seed = same world every time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Zero Storage:</strong> No world files needed - pure procedural generation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span><strong>Structure Generation:</strong> Trees and features spawn naturally</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
