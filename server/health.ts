// Simple health check endpoint for Railway
export function setupHealthCheck(app: any) {
  app.get('/health', (_req: any, res: any) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
}