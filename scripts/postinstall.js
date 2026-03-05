#!/usr/bin/env node

// Color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m'
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

// Only show setup instructions if installed globally or as dependency
const isGlobal = process.env.npm_config_global === 'true';
const isProduction = process.env.NODE_ENV === 'production';

if (isGlobal || isProduction) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('  ✅ Personio MCP Server installed successfully!', colors.bright + colors.green);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.blue);
  log('');
  log('📚 Quick Start:', colors.yellow);
  log('');
  log('  Run the setup wizard to configure Claude Desktop:');
  log('');
  log('    $ personio-mcp-setup', colors.bright);
  log('');
  log('  Or manually configure in your Claude config file:');
  log('  macOS: ~/Library/Application Support/Claude/claude_desktop_config.json');
  log('  Windows: %APPDATA%/Claude/claude_desktop_config.json');
  log('');
  log('📖 Documentation:', colors.yellow);
  log('  https://github.com/NikolaiGoMedicus/personio-mcp-server');
  log('');
  log('🔧 Features:', colors.yellow);
  log('  • 52 HR automation tools');
  log('  • Employee, Absence, Attendance management');
  log('  • Recruiting API & Document Management');
  log('  • 31-test comprehensive test suite');
  log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.blue);
}
