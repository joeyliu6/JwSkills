#!/usr/bin/env node
/**
 * PostToolUse hook: 代码文件行数上限。
 * 超标时 stderr 写提示并 exit 2 —— 文件已经写入了，拦不住，
 * 但 stderr 会喂回给 AI，它会接着拆分。
 *
 * 只查代码文件（白名单）。markdown / 数据 / 生成物一律放行——
 * 用黑名单会误伤 .csv fixture、.sql dump、快照文件。
 */
const fs = require('fs');
const path = require('path');

const CODE_EXT = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte',
  '.py', '.rs', '.go', '.java', '.kt', '.swift', '.cs', '.rb', '.php',
  '.c', '.h', '.cpp', '.hpp', '.cc', '.m', '.mm',
  '.scala', '.ex', '.exs', '.dart', '.lua', '.sh', '.ps1', '.sql',
]);

const SKIP_DIR = /(^|[\\/])(node_modules|dist|build|out|target|vendor|\.git|__pycache__|\.next|\.nuxt|coverage)([\\/]|$)/;

function loadConfig(projectDir) {
  const defaults = { default: 500, byExtension: {}, ignore: [] };
  try {
    const raw = fs.readFileSync(path.join(projectDir, '.claude', 'limits.json'), 'utf8');
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

function main(input) {
  const filePath = input?.tool_input?.file_path;
  if (!filePath) return 0;

  const ext = path.extname(filePath).toLowerCase();
  if (!CODE_EXT.has(ext)) return 0;
  if (SKIP_DIR.test(filePath)) return 0;

  const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const cfg = loadConfig(projectDir);

  const rel = path.relative(projectDir, filePath).replace(/\\/g, '/') || filePath;
  if (cfg.ignore.some((p) => rel.startsWith(p))) return 0;

  let lines;
  try {
    lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
  } catch {
    return 0; // 文件读不到就不管，hook 不该因为自己的问题打断工作
  }

  const limit = cfg.byExtension[ext] ?? cfg.default;
  if (lines <= limit) return 0;

  process.stderr.write(
    `${rel} 已经 ${lines} 行，超过 ${limit} 行上限。\n` +
    `按职责拆分成多个文件后再继续，不要留到以后。\n` +
    `确实不该拆（生成物、大型字面量表等），把路径加进 .claude/limits.json 的 ignore。\n`
  );
  return 2;
}

let buf = '';
process.stdin.on('data', (c) => (buf += c));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(buf);
  } catch {
    process.exit(0); // 输入解析不了就放行，绝不因为 hook 自身故障阻断开发
  }
  process.exit(main(input));
});
