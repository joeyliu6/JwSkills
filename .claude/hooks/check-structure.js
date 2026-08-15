#!/usr/bin/env node
/**
 * Stop hook: 收尾体检。目录堆积 + skill 双目录漂移。
 *
 * 永远 exit 0。Stop 的 exit 2 会阻止对话结束，
 * 检查一旦持续不满足就是死循环——这里只报告。
 *
 * 只报告，不移动文件：自动归类会断相对路径、import 和文档链接，
 * 而且「归类」没有客观标准。
 *
 * 同一份结论只报一次（存指纹到 .claude/.structure-state.json），
 * 否则每轮对话都刷同样的话，两天就被无视了。
 */
const fs = require('fs');
const path = require('path');

const SKIP = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', 'target', 'vendor',
  '__pycache__', '.next', '.nuxt', 'coverage', '.venv', 'venv', '.cache',
]);

function loadConfig(root) {
  const defaults = { maxFilesPerDir: 20, ignore: [] };
  try {
    const raw = fs.readFileSync(path.join(root, '.claude', 'limits.json'), 'utf8');
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

/** 直接子文件数超标的目录 */
function crowdedDirs(root, cfg, dir = root, depth = 0, acc = []) {
  if (depth > 6) return acc;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  const files = entries.filter((e) => e.isFile()).length;
  if (files > cfg.maxFilesPerDir) {
    const rel = path.relative(root, dir).replace(/\\/g, '/') || '.';
    if (!cfg.ignore.some((p) => rel.startsWith(p))) acc.push({ dir: rel, files });
  }
  for (const e of entries) {
    if (e.isDirectory() && !SKIP.has(e.name) && !e.name.startsWith('.')) {
      crowdedDirs(root, cfg, path.join(dir, e.name), depth + 1, acc);
    }
  }
  return acc;
}

/** 同名 skill 在 .claude/skills/ 和 skills/ 之间的差异。两个目录都在才检查。 */
function skillDrift(root) {
  const a = path.join(root, '.claude', 'skills');
  const b = path.join(root, 'skills');
  if (!fs.existsSync(a) || !fs.existsSync(b)) return [];

  const read = (p) => {
    try {
      return fs.readFileSync(p, 'utf8');
    } catch {
      return null;
    }
  };
  const list = (p) => {
    try {
      return fs.readdirSync(p, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
    } catch {
      return [];
    }
  };

  const out = [];
  for (const name of new Set([...list(a), ...list(b)])) {
    const da = path.join(a, name);
    const db = path.join(b, name);
    if (!fs.existsSync(da)) { out.push(`${name}: 只在 skills/ 有`); continue; }
    if (!fs.existsSync(db)) { out.push(`${name}: 只在 .claude/skills/ 有`); continue; }
    // README.md 按约定只存在于发布目录 skills/，不算漂移
    const files = (p) => fs.readdirSync(p).filter((f) => f !== 'README.md').sort();
    const fa = files(da);
    const fb = files(db);
    const missing = fb.filter((f) => !fa.includes(f)).concat(fa.filter((f) => !fb.includes(f)));
    if (missing.length) { out.push(`${name}: 文件不一致（${[...new Set(missing)].join(', ')}）`); continue; }
    const diff = fa.filter((f) => read(path.join(da, f)) !== read(path.join(db, f)));
    if (diff.length) out.push(`${name}: 内容不一致（${diff.join(', ')}）`);
  }
  return out;
}

function main(input) {
  const root = process.env.CLAUDE_PROJECT_DIR || input?.cwd || process.cwd();
  const cfg = loadConfig(root);

  const parts = [];
  for (const { dir, files } of crowdedDirs(root, cfg)) {
    parts.push(`目录 ${dir}/ 有 ${files} 个文件（上限 ${cfg.maxFilesPerDir}），该分子目录了`);
  }
  for (const d of skillDrift(root)) {
    parts.push(`skill 漂移 — ${d}`);
  }
  if (!parts.length) return;

  const report = parts.map((p) => '· ' + p).join('\n');

  // 同一份结论只报一次
  const statePath = path.join(root, '.claude', '.structure-state.json');
  const fingerprint = require('crypto').createHash('sha1').update(report).digest('hex');
  try {
    if (JSON.parse(fs.readFileSync(statePath, 'utf8')).fingerprint === fingerprint) return;
  } catch { /* 没有状态文件就是第一次，照常报 */ }
  try {
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    fs.writeFileSync(statePath, JSON.stringify({ fingerprint }));
  } catch { /* 状态存不下不影响报告 */ }

  process.stdout.write(JSON.stringify({ systemMessage: '结构体检：\n' + report }));
}

let buf = '';
process.stdin.on('data', (c) => (buf += c));
process.stdin.on('end', () => {
  try {
    main(JSON.parse(buf || '{}'));
  } catch { /* 体检失败绝不打断工作 */ }
  process.exit(0);
});
