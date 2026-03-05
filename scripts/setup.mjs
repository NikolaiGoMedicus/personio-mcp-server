#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';
import { homedir, platform } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function prompt(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${colors.blue}${question}${colors.reset} `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function getClaudeConfigPath() {
  const platformName = platform();

  if (platformName === 'darwin') {
    return join(homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
  } else if (platformName === 'win32') {
    return join(process.env.APPDATA || '', 'Claude', 'claude_desktop_config.json');
  } else {
    // Linux/other
    return join(homedir(), '.config', 'Claude', 'claude_desktop_config.json');
  }
}

function getServerPath() {
  // When installed globally via npm, the build directory is in node_modules
  const globalNodeModules = join(dirname(__dirname), '..');
  const buildPath = join(globalNodeModules, '@gomedicus', 'personio-mcp-server', 'build', 'index.js');

  if (existsSync(buildPath)) {
    return buildPath;
  }

  // Fallback: local development
  return join(dirname(__dirname), 'build', 'index.js');
}

async function setup() {
  log('\n🚀 Personio MCP Server Setup\n', colors.bright);

  // Step 1: Get Personio credentials
  log('Step 1: Personio API Credentials', colors.yellow);
  log('You can find these in your Personio account under Settings > Integrations > API credentials\n');

  const clientId = await prompt('Personio Client ID:');
  if (!clientId) {
    log('❌ Client ID is required', colors.red);
    process.exit(1);
  }

  const clientSecret = await prompt('Personio Client Secret:');
  if (!clientSecret) {
    log('❌ Client Secret is required', colors.red);
    process.exit(1);
  }

  // Step 2: Find Claude Desktop config
  log('\nStep 2: Claude Desktop Configuration', colors.yellow);
  const configPath = getClaudeConfigPath();

  if (!existsSync(configPath)) {
    log(`⚠️  Claude Desktop config not found at: ${configPath}`, colors.red);
    log('\nPlease ensure Claude Desktop is installed and run this setup again.', colors.yellow);
    process.exit(1);
  }

  log(`✓ Found Claude config at: ${configPath}`, colors.green);

  // Step 3: Update Claude config
  log('\nStep 3: Adding MCP Server to Claude', colors.yellow);

  let config;
  try {
    const configContent = readFileSync(configPath, 'utf-8');
    config = JSON.parse(configContent);
  } catch (error) {
    log('⚠️  Could not read Claude config, creating new one', colors.yellow);
    config = {};
  }

  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  const serverPath = getServerPath();

  config.mcpServers.personio = {
    command: 'node',
    args: [serverPath],
    env: {
      PERSONIO_CLIENT_ID: clientId,
      PERSONIO_CLIENT_SECRET: clientSecret
    }
  };

  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2));
    log('✓ Claude Desktop config updated', colors.green);
  } catch (error) {
    log(`❌ Failed to write config: ${error.message}`, colors.red);
    log('\nPlease manually add this configuration to your Claude config:', colors.yellow);
    log(JSON.stringify(config.mcpServers.personio, null, 2));
    process.exit(1);
  }

  // Step 4: Success message
  log('\n✅ Setup complete!', colors.bright + colors.green);
  log('\nNext steps:', colors.yellow);
  log('1. Restart Claude Desktop');
  log('2. The Personio MCP Server will be available in your conversations');
  log('3. Try asking: "List all employees from the Hamburg office"');
  log('\n📚 Documentation: https://github.com/NikolaiGoMedicus/personio-mcp-server');
  log('');
}

setup().catch((error) => {
  log(`\n❌ Setup failed: ${error.message}`, colors.red);
  process.exit(1);
});
