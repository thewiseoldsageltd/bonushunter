#!/usr/bin/env node

/**
 * Simple keepalive script to prevent Replit server from sleeping
 * Can be run externally via cron job or other monitoring service
 */

const SERVER_URL = process.env.KEEPALIVE_URL || 'https://your-replit-url.replit.dev';

async function ping() {
  try {
    const response = await fetch(`${SERVER_URL}/keepalive`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${new Date().toISOString()} - Server alive, uptime: ${data.uptime}s`);
    } else {
      console.log(`❌ ${new Date().toISOString()} - Server responded with error: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ ${new Date().toISOString()} - Failed to reach server:`, error.message);
  }
}

// Run immediately
ping();

// If this script is run directly (not imported), set up interval
if (require.main === module) {
  const interval = parseInt(process.env.PING_INTERVAL) || 300000; // Default 5 minutes
  console.log(`🔄 Starting keepalive pings every ${interval / 1000} seconds`);
  setInterval(ping, interval);
}

module.exports = { ping };