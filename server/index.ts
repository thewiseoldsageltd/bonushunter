import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seedData";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Seed database in production (after routes are set up)
  if (process.env.NODE_ENV === 'production') {
    console.log('🌱 Seeding database in production...');
    try {
      await seedDatabase();
      console.log('✅ Database seeded successfully');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      // Continue anyway - app can still work without seeded data
    }
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('🚨 Request error:', err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    // Production static file serving - fixed paths for Railway
    console.log('🗂️ Setting up production static file serving...');
    const staticPath = path.resolve('./public');
    console.log(`📁 Serving static files from: ${staticPath}`);
    
    try {
      if (fs.existsSync(staticPath)) {
        app.use(express.static(staticPath));
        app.use("*", (_req, res) => {
          res.sendFile(path.join(staticPath, "index.html"));
        });
        console.log('✅ Static file serving configured');
      } else {
        console.log('❌ Static files not found, serving API only');
        // Fallback: serve a simple message for frontend requests
        app.get("*", (_req, res) => {
          res.json({ message: "Bonushunter API is running", status: "ok" });
        });
      }
    } catch (error) {
      console.error('❌ Error setting up static files:', error);
      app.get("*", (_req, res) => {
        res.json({ message: "Bonushunter API is running", status: "ok" });
      });
    }
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server started successfully on port ${port}`);
    console.log(`📍 Health check available at: http://0.0.0.0:${port}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Railway PORT: ${process.env.PORT}`);
    log(`serving on port ${port}`);
  });

  server.on('error', (error) => {
    console.error('❌ Server error:', error);
  });
})();
