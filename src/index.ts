#!/usr/bin/env node

/**
 * Main Entry Point
 * 
 * Detects mode and routes to appropriate handler:
 * - MCP STDIO mode: When run without arguments or with --stdio flag
 * - CLI mode: When run with command-line arguments
 */

import { DevEnvSetupServer } from './mcp-server.js';

// Check if running in MCP STDIO mode
const args = process.argv.slice(2);
const isMCPMode = args.length === 0 || args.includes('--stdio') || args.includes('--mcp');

if (isMCPMode) {
  // Run in MCP STDIO mode
  const server = new DevEnvSetupServer();
  server.run().catch(console.error);
} else {
  // Run in CLI mode - dynamically import to avoid loading CLI dependencies in MCP mode
  import('./cli.js').then(() => {
    // CLI module handles its own execution via commander
  }).catch((error) => {
    console.error('Failed to start CLI:', error);
    process.exit(1);
  });
}
