#!/usr/bin/env node
// PreToolUse hook: while .claude/tests.lock exists, block any change to test files
// and any attempt to remove the lock itself. Only the user unlocks (rm in their terminal).

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const lockFile = path.join(projectDir, '.claude', 'tests.lock');

const TEST_FILE = /(\.test\.|\.spec\.|__tests__\/)/;
const LOCK_REF = /tests\.lock/;
const WRITE_OPS = /(>>?\s*\S*(\.test\.|\.spec\.|__tests__\/)|\bsed\s+-i|\btee\b|\bmv\b|\brm\b|\bcp\b|\bperl\s+-p?i|\btruncate\b|\bgit\s+(checkout|restore|stash|reset)\b)/;

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const { tool_name: tool, tool_input: args = {} } = input;

function block(reason) {
  process.stderr.write(`BLOCKED by protect-tests hook: ${reason}\n`);
  process.exit(2);
}

if (!existsSync(lockFile)) process.exit(0);

if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
  const file = args.file_path || args.notebook_path || '';
  if (TEST_FILE.test(file)) {
    block(`tests are locked (.claude/tests.lock). Do not change ${file}. ` +
      'Fix the implementation instead; if the test itself is wrong, stop and tell the user.');
  }
  if (LOCK_REF.test(file)) block('the tests lock can only be changed by the user.');
}

if (tool === 'Bash') {
  const cmd = args.command || '';
  if (LOCK_REF.test(cmd) && !/^\s*touch\s+\S*tests\.lock\s*$/.test(cmd)) {
    block('the tests lock can only be removed by the user.');
  }
  if (TEST_FILE.test(cmd) && WRITE_OPS.test(cmd)) {
    block('this command looks like it modifies test files while tests are locked.');
  }
}

process.exit(0);
