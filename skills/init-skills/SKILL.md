---
name: init-skills
description: 一键定制所有 JwSkills 技能。扫描项目技术栈（package.json、CLAUDE.md 等），自动填充 triple-check 和 code-review 的项目专属规则。安装技能后运行一次即可。
---

# Init Skills - 一键定制

**扫描你的项目，自动生成技能专属规则。**

---

## 触发

用户输入 `/init-skills` 时执行。

---

## 执行流程

### Step 1: 扫描项目

读取以下文件（不存在则跳过）：

| 文件 | 提取信息 |
|------|----------|
| `CLAUDE.md` | 项目约定、编码规范、架构约束 — **最有价值的来源** |
| `package.json` | 框架、UI 库、语言、构建工具 |
| `tsconfig.json` / `jsconfig.json` | TypeScript 配置 |
| `Cargo.toml` | Rust 项目依赖 |
| `.eslintrc*` / `eslint.config.*` / `biome.json` | 已有 lint 规则（避免重复） |
| 文件扩展名分布 | `.vue` / `.tsx` / `.rs` / `.py` 等 |

### Step 2: 输出检测摘要

```
## 检测到的技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript (strict)
- **UI 库**: PrimeVue
- ...
```

扫不到关键信息时，**询问用户**，不要猜。

### Step 3: 生成 project-config.md

为 triple-check 和 code-review 各生成一份 `project-config.md`，写入对应技能目录。

---

## 生成指引

### 核心原则：方向而非枷锁

**不要写出一长串死板规则。** 好的 config 应该是：
- 告诉 AI "这个项目用 Vue 3，关注响应性问题"
- 而不是 "检查 ref 是否被解构、检查 watch 的 flush 时机、检查 computed 是否有副作用、检查..."

AI 已经知道 Vue 3 的常见陷阱。config 的作用是**指方向**，让 AI 知道该关注什么领域，而不是把每条具体规则都列出来。

**每个 config 目标 5-10 条高层指引，不超过 15 条。**

### 规则来源优先级

1. **CLAUDE.md 中的项目约定**（最高价值 — 这些是 AI 自己推断不出来的）
   - 禁止项："不要用 X"、"禁止 X"
   - 约定："命名用 camelCase"、"CSS 用变量"
   - 架构约束："不要跨层调用"
   - 依赖约束："UI 用 PrimeVue"

2. **技术栈的核心关注点**（一句话概括，不展开细节）
   - Vue 3 → "关注响应性正确性和组件清理"
   - React → "关注 hooks 依赖完整性和闭包问题"
   - TypeScript strict → "关注类型安全，避免 any 逃逸"
   - Tauri → "IPC 命令参数不可信，需校验"
   - Rust → "关注 unsafe 块安全性和所有权"

3. **linter 未覆盖的盲区**（检查 eslint/biome 配置后，只补充它们管不到的）

### 不要做的事

- 不要重复 linter 已覆盖的规则
- 不要列出 AI 凭自身知识就知道的通用最佳实践
- 不要为没检测到的技术栈生成规则

---

## project-config.md 格式

### triple-check/project-config.md

```markdown
---
generated: {{日期}}
tech-stack: {{检测到的技术栈，逗号分隔}}
---

# Triple-Check 项目定制规则

> 由 /init-skills 自动生成。可手动编辑。

## Round 3 规范审查 — 项目专属关注点

以下内容在 Round 3 规范审查时**追加到通用检查表之后**。

| 关注点 | 说明 |
|--------|------|
| {{从 CLAUDE.md 提取的约定}} | {{简要说明}} |
| {{技术栈核心关注点}} | {{简要说明}} |
| ... | ... |
```

### code-review/project-config.md

```markdown
---
generated: {{日期}}
tech-stack: {{检测到的技术栈，逗号分隔}}
---

# Code Review 项目定制规则

> 由 /init-skills 自动生成。可手动编辑。

## 补充检查项

按优先级（安全 > 正确性 > 性能 > 可维护性）列出：

- {{从 CLAUDE.md 提取的约束}}
- {{技术栈核心关注点}}
- ...
```

---

## Step 4: 输出汇总

```markdown
## Skills 定制完成

| 技能 | 文件 | 关注点 |
|------|------|--------|
| triple-check | `project-config.md` | N 条 |
| code-review | `project-config.md` | N 条 |

**技术栈**: {{列表}}

⚠️ 请花 30 秒扫一眼生成的规则，确认符合项目实际。
💡 技术栈变更后重新运行 `/init-skills` 即可更新。
```

---

## 重复运行

已存在 `project-config.md` 时：
- 询问用户是否要重新生成（会覆盖现有文件）
- 如果用户有手动编辑过的内容，提醒备份
