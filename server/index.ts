import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { seedDatabase } from "./seedData";
import path from "path";
import fs from "fs";

// Simple log function for production
function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration to allow Vercel frontend
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://bonushunter-ai.vercel.app',
    'https://bonushunter-theta.vercel.app', 
    'http://localhost:5000',
    'http://localhost:3000'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin as string)) {
    res.setHeader('Access-Control-Allow-Origin', origin as string);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send();
    return;
  }
  
  next();
});

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

  // Only setup vite in development - completely skip in production
  if (process.env.NODE_ENV === "development") {
    console.log('🔧 Setting up Vite for development...');
    // Dynamically import vite only in development to avoid import.meta issues in production
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    console.log('🚀 Production mode - skipping Vite setup');
    // Production mode - serve built files from dist/public
    console.log('🗂️ Setting up production static file serving...');
    
    // In Railway, we're in the root directory, and dist/public contains the built frontend
    const publicDir = path.join(process.cwd(), 'dist', 'public');
    console.log(`📁 Looking for static files at: ${publicDir}`);
    console.log(`🔍 Current working directory: ${process.cwd()}`);
    
    try {
      if (fs.existsSync(publicDir)) {
        console.log(`✅ Found static files at ${publicDir}`);
        const files = fs.readdirSync(publicDir);
        console.log(`📋 Static files: ${files.join(', ')}`);
        
        // Serve static files
        app.use(express.static(publicDir));
        
        // Catch-all route for SPA
        app.get("*", (_req, res) => {
          const indexPath = path.join(publicDir, 'index.html');
          console.log(`📄 Serving index.html from: ${indexPath}`);
          res.sendFile(indexPath);
        });
        
        console.log('✅ Production static file serving configured successfully');
      } else {
        console.log(`❌ Static files not found at ${publicDir}`);
        console.log('🗂️ Available files in current directory:');
        try {
          const rootFiles = fs.readdirSync(process.cwd());
          console.log(`📋 Root files: ${rootFiles.join(', ')}`);
          
          if (fs.existsSync('dist')) {
            const distFiles = fs.readdirSync('dist');
            console.log(`📋 Dist files: ${distFiles.join(', ')}`);
          }
        } catch (e) {
          console.log('❌ Could not list files');
        }
        
        // API-only fallback
        app.get("*", (_req, res) => {
          res.json({ 
            message: "Bonushunter API is running", 
            status: "ok",
            note: "Frontend files not found - API endpoints available at /api/*"
          });
        });
      }
    } catch (error) {
      console.error('❌ Error setting up static file serving:', error);
      app.get("*", (_req, res) => {
        res.json({ 
          message: "Bonushunter API is running", 
          status: "ok",
          error: "Static file serving failed"
        });
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
