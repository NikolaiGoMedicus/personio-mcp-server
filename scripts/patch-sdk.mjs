#!/usr/bin/env node
/**
 * Patches MCP SDK 1.27.1 bug in Server.setRequestHandler()
 *
 * Bug: The method literal extraction uses `v4Def?.value` but Zod v4 stores
 * literals as `values: [...]` (array). The SDK's own `getLiteralValue()` handles
 * this correctly, but `Server.setRequestHandler()` does inline extraction that
 * misses the array format.
 *
 * Fix: Replace the inline extraction with a call to `getLiteralValue()`.
 *
 * This patch is idempotent and will be a no-op once the SDK fixes the bug.
 * Tracking: https://github.com/modelcontextprotocol/typescript-sdk/issues/XXX
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sdkBase = join(__dirname, '..', 'node_modules', '@modelcontextprotocol', 'sdk', 'dist');

// --- ESM patch ---
const esmPath = join(sdkBase, 'esm', 'server', 'index.js');
// --- CJS patch ---
const cjsPath = join(sdkBase, 'cjs', 'server', 'index.js');

const PATCH_MARKER = '/* patched:getLiteralValue */';

function patchEsm(filePath) {
  if (!existsSync(filePath)) {
    console.log(`[patch-sdk] ESM file not found, skipping: ${filePath}`);
    return false;
  }

  let code = readFileSync(filePath, 'utf8');

  if (code.includes(PATCH_MARKER)) {
    console.log('[patch-sdk] ESM already patched, skipping.');
    return true;
  }

  // 1. Add getLiteralValue to import
  const oldImport = `import { getObjectShape, isZ4Schema, safeParse } from './zod-compat.js';`;
  const newImport = `import { getObjectShape, isZ4Schema, safeParse, getLiteralValue } from './zod-compat.js'; ${PATCH_MARKER}`;

  if (!code.includes(oldImport)) {
    // Check if getLiteralValue is already imported (SDK fixed it)
    if (code.includes('getLiteralValue') && code.includes("from './zod-compat.js'")) {
      console.log('[patch-sdk] ESM: getLiteralValue already imported, SDK may have fixed the bug.');
      return true;
    }
    console.log('[patch-sdk] ESM: Could not find expected import line. SDK may have changed.');
    return false;
  }

  code = code.replace(oldImport, newImport);

  // 2. Replace inline extraction block with getLiteralValue call
  const oldExtraction = `        // Extract literal value using type-safe property access
        let methodValue;
        if (isZ4Schema(methodSchema)) {
            const v4Schema = methodSchema;
            const v4Def = v4Schema._zod?.def;
            methodValue = v4Def?.value ?? v4Schema.value;
        }
        else {
            const v3Schema = methodSchema;
            const legacyDef = v3Schema._def;
            methodValue = legacyDef?.value ?? v3Schema.value;
        }`;
  const newExtraction = `        const methodValue = getLiteralValue(methodSchema); ${PATCH_MARKER}`;

  if (!code.includes(oldExtraction)) {
    console.log('[patch-sdk] ESM: Could not find extraction block. SDK may have changed.');
    return false;
  }

  code = code.replace(oldExtraction, newExtraction);
  writeFileSync(filePath, code, 'utf8');
  console.log('[patch-sdk] ESM patched successfully.');
  return true;
}

function patchCjs(filePath) {
  if (!existsSync(filePath)) {
    console.log(`[patch-sdk] CJS file not found, skipping: ${filePath}`);
    return false;
  }

  let code = readFileSync(filePath, 'utf8');

  if (code.includes(PATCH_MARKER)) {
    console.log('[patch-sdk] CJS already patched, skipping.');
    return true;
  }

  // In CJS, the extraction uses (0, zod_compat_js_1.isZ4Schema) style
  const oldExtraction = `        // Extract literal value using type-safe property access
        let methodValue;
        if ((0, zod_compat_js_1.isZ4Schema)(methodSchema)) {
            const v4Schema = methodSchema;
            const v4Def = v4Schema._zod?.def;
            methodValue = v4Def?.value ?? v4Schema.value;
        }
        else {
            const v3Schema = methodSchema;
            const legacyDef = v3Schema._def;
            methodValue = legacyDef?.value ?? v3Schema.value;
        }`;
  const newExtraction = `        const methodValue = (0, zod_compat_js_1.getLiteralValue)(methodSchema); ${PATCH_MARKER}`;

  if (!code.includes(oldExtraction)) {
    console.log('[patch-sdk] CJS: Could not find extraction block. SDK may have changed.');
    return false;
  }

  code = code.replace(oldExtraction, newExtraction);
  writeFileSync(filePath, code, 'utf8');
  console.log('[patch-sdk] CJS patched successfully.');
  return true;
}

// Run patches
console.log('[patch-sdk] Checking MCP SDK for known Zod v4 literal extraction bug...');
const esmOk = patchEsm(esmPath);
const cjsOk = patchCjs(cjsPath);

if (esmOk && cjsOk) {
  console.log('[patch-sdk] Done.');
} else {
  console.log('[patch-sdk] Some patches could not be applied. The server may not work correctly.');
  console.log('[patch-sdk] Try updating @modelcontextprotocol/sdk to a newer version.');
}
