# Hook 契约与参考实现

下面的契约是 AI 推断不出来的部分，**必须照搬**。参考实现是 Node 版，
项目没有 Node 就翻译成 python / pwsh / bash，但退出码语义和 stdin 格式一个字都不能改。

---

## 契约

hook 从 **stdin 读一个 JSON**，靠**退出码**表态。

```json
{ "session_id": "...", "cwd": "...", "hook_event_name": "PostToolUse",
  "tool_name": "Write", "tool_input": { "file_path": "..." } }
```

| 退出码 | 含义 |
|--------|------|
| 0 | 放行。stdout 若是 JSON，`systemMessage` 字段会显示给用户 |
| 2 | 阻断。`PostToolUse` 阶段文件**已经写完了**，拦不住写入，但 stderr 会喂回给 AI |
| 其他 | 非阻断错误，动作照常继续 |

两个关键点：

- **`PostToolUse` 的 exit 2 不撤销写入。** 它的作用是让 AI 看到 stderr 然后接着去拆分。
  想在写之前拦是做不到的——那时内容还没生成完。
- **`Stop` 的 exit 2 会阻止对话结束。** 结构检查一旦持续不满足就是死循环，所以永远 exit 0。

路径占位符 `${CLAUDE_PROJECT_DIR}` 会展开成项目根目录，同时也作为环境变量传给脚本。

---

## .claude/settings.json

用 **exec form**（`command` + `args`）而不是 shell form，避免 Windows / macOS / Linux 的 shell 差异。
装进 `.claude/settings.json`（可提交进 git），**不要装进 `settings.local.json`**——那个不进版本控制，换台机器就没了。

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/check-file-size.js"]
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/check-structure.js"]
          }
        ]
      }
    ]
  }
}
```

项目已有 `settings.json` 时**合并 hooks 字段，不要整份重写**。

调试：`CLAUDE_DEBUG=hooks` 启动可以看到 hook 的实际调用和输出。

---

## .claude/hooks/check-file-size.js

```javascript
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
```

---

## .claude/hooks/check-structure.js

```javascript
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
```

`skillDrift` 只在项目同时有 `.claude/skills/` 和 `skills/` 两个目录时才做事
（JwSkills 仓库自己的双目录场景）。普通项目里它静默跳过。

顺带把 `.claude/.structure-state.json` 加进 `.gitignore`——它是本机状态，不该进版本控制。

---

## 装完必须验

别装完就宣布完成，这两个脚本一旦静默失效，用户要过很久才发现：

```bash
# 1. 超标代码文件 → 期望 exit 2 且 stderr 可读
echo '{"tool_name":"Write","tool_input":{"file_path":"<超过上限的代码文件绝对路径>"}}' \
  | node .claude/hooks/check-file-size.js; echo "exit=$?"

# 2. 超长 markdown → 期望 exit 0 静默放行
echo '{"tool_name":"Write","tool_input":{"file_path":"<很长的 .md 绝对路径>"}}' \
  | node .claude/hooks/check-file-size.js; echo "exit=$?"

# 3. 结构体检 → 期望 exit 0
echo '{}' | node .claude/hooks/check-structure.js; echo "exit=$?"
```

Windows 上注意：Git Bash 的 `$PWD` 是 `/c/...` 形式，Node 读不了，
手工验的时候用 Windows 原生路径（`C:/...`），否则脚本会走「文件读不到就放行」的分支，
看起来像通过了其实根本没执行到检查。
