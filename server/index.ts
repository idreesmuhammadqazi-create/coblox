import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/sqlite.js";
import authRoutes from "./routes/authSQL.js";
import characterRoutes from "./routes/characterSQL.js";
import notificationRoutes from "./routes/notificationSQL.js";
import friendsRoutes from "./routes/friendsSQL.js";
import worldGenRoutes from "./routes/worldGenSQL.js";
import { initializeMultiplayer } from "./services/multiplayer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Connect to SQLite database
  await connectDB();

  // Initialize multiplayer service with Socket.io
  initializeMultiplayer(server);

  // Parse JSON request bodies
  app.use(express.json());

  // API routes
  app.use('/api', authRoutes);
  app.use('/api', characterRoutes);
  app.use('/api', notificationRoutes);
  app.use('/api', friendsRoutes);
  app.use('/api', worldGenRoutes);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Serve world assets (textures, models, etc.) from client/world directory
  const worldAssetsPath = path.resolve(__dirname, "..", "client", "world");
  app.use('/world', express.static(worldAssetsPath));

  // Handle client-side routing - serve index.html ONLY for navigation requests
  // Skip requests for static assets (files with extensions like .js, .css, .png, etc.)
  app.get("*", (req, res) => {
    const filePath = req.path;
    
    // If the request has a file extension, it's likely a static asset request
    // Let it 404 naturally instead of serving index.html
    const hasExtension = /\.[a-zA-Z0-9]+$/.test(filePath);
    
    if (hasExtension) {
      // Don't serve index.html for asset requests - return 404
      res.status(404).send('Not found');
      return;
    }
    
    // For navigation requests (no extension), serve index.html
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
