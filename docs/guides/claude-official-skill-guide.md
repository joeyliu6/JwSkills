# Claude Code 官方 Skill 编写指南

> 来源：https://code.claude.com/docs/en/skills
> 存档日期：2026-04-06
> 用途：编写和维护 Koda 时的权威参考

---

## 概述

Skills 扩展 Claude 的能力。创建一个带指令的 `SKILL.md` 文件，Claude 就会将其加入工具箱。Claude 会在相关时自动使用 skill，你也可以用 `/skill-name` 直接调用。

Claude Code skills 遵循 [Agent Skills](https://agentskills.io) 开放标准，跨多个 AI 工具通用。Claude Code 在此基础上扩展了调用控制、子代理执行和动态上下文注入等功能。

> **注意**：自定义命令已合并入 skills。`.claude/commands/deploy.md` 和 `.claude/skills/deploy/SKILL.md` 都会创建 `/deploy`，效果相同。现有的 `.claude/commands/` 文件继续有效。

---

## Skill 目录结构

```
my-skill/
├── SKILL.md           # 主指令（必需）
├── template.md        # 供 Claude 填充的模板（可选）
├── examples/
│   └── sample.md      # 示例输出（可选）
└── scripts/
    └── validate.sh    # Claude 可执行的脚本（可选）
```

### 存放位置与作用域

| 位置 | 路径 | 适用范围 |
|------|------|----------|
| 企业级 | 托管设置 | 组织内所有用户 |
| 个人级 | `~/.claude/skills/<name>/SKILL.md` | 你的所有项目 |
| 项目级 | `.claude/skills/<name>/SKILL.md` | 仅当前项目 |
| 插件级 | `<plugin>/skills/<name>/SKILL.md` | 启用插件的地方 |

**优先级**：企业 > 个人 > 项目。插件使用 `plugin-name:skill-name` 命名空间，不会冲突。

---

## Frontmatter 参考

```yaml
---
name: my-skill
description: What this skill does
disable-model-invocation: true
allowed-tools: Read Grep
---

Your skill instructions here...
```

所有字段均为可选。仅 `description` 为推荐项。

| 字段 | 必需 | 说明 |
|------|------|------|
| `name` | 否 | 显示名称。省略则使用目录名。小写字母、数字和连字符（最长 64 字符） |
| `description` | 推荐 | 做什么、何时使用。Claude 据此判断何时自动应用。**前置关键用途，超过 250 字符会被截断** |
| `argument-hint` | 否 | 自动补全时的参数提示。如 `[issue-number]` |
| `disable-model-invocation` | 否 | 设为 `true` 阻止 Claude 自动加载。用于需手动触发的工作流 |
| `user-invocable` | 否 | 设为 `false` 则从 `/` 菜单隐藏。用于用户不应直接调用的背景知识 |
| `allowed-tools` | 否 | Skill 激活时 Claude 可免审批使用的工具。空格分隔或 YAML 列表 |
| `model` | 否 | Skill 激活时使用的模型 |
| `effort` | 否 | 努力程度。选项：`low`、`medium`、`high`、`max`（仅 Opus） |
| `context` | 否 | 设为 `fork` 在隔离的子代理上下文中运行 |
| `agent` | 否 | `context: fork` 时使用的子代理类型 |
| `hooks` | 否 | 限定于此 skill 生命周期的钩子 |
| `paths` | 否 | Glob 模式，限制 skill 自动激活的文件范围 |
| `shell` | 否 | `bash`（默认）或 `powershell` |

### 字符串替换

| 变量 | 说明 |
|------|------|
| `$ARGUMENTS` | 调用时传入的所有参数 |
| `$ARGUMENTS[N]` | 按索引访问特定参数（从 0 开始） |
| `$N` | `$ARGUMENTS[N]` 的简写 |
| `${CLAUDE_SESSION_ID}` | 当前会话 ID |
| `${CLAUDE_SKILL_DIR}` | SKILL.md 所在目录 |

---

## 两种 Skill 内容类型

### 知识型（Reference）

添加 Claude 在工作中应用的知识——惯例、模式、风格指南、领域知识。内联运行，与对话上下文并行使用。

```yaml
---
name: api-conventions
description: API design patterns for this codebase
---

When writing API endpoints:
- Use RESTful naming conventions
- Return consistent error formats
- Include request validation
```

### 任务型（Task）

给 Claude 逐步指令，用于部署、提交、代码生成等特定动作。通常配合 `disable-model-invocation: true` 防止自动触发。

```yaml
---
name: deploy
description: Deploy the application to production
context: fork
disable-model-invocation: true
---

Deploy the application:
1. Run the test suite
2. Build the application
3. Push to the deployment target
```

---

## 调用控制

| Frontmatter | 用户可调用 | Claude 可调用 | 上下文加载时机 |
|-------------|-----------|--------------|---------------|
| （默认） | 是 | 是 | 描述始终在上下文中，完整内容在调用时加载 |
| `disable-model-invocation: true` | 是 | 否 | 描述不在上下文中，用户调用时加载完整内容 |
| `user-invocable: false` | 否 | 是 | 描述始终在上下文中，调用时加载完整内容 |

---

## 辅助文件

**保持 SKILL.md 在 500 行以内。** 详细参考资料放到单独文件：

```
my-skill/
├── SKILL.md（必需 — 概述和导航）
├── reference.md（详细 API 文档 — 需要时加载）
├── examples.md（使用示例 — 需要时加载）
└── scripts/
    └── helper.py（工具脚本 — 执行，不加载）
```

在 SKILL.md 中引用这些文件，让 Claude 知道它们的内容和加载时机。

---

## 高级模式

### 动态上下文注入

`` !`<command>` `` 语法在 skill 内容发送给 Claude 之前运行 shell 命令，输出替换占位符：

```yaml
---
name: pr-summary
description: Summarize changes in a pull request
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

## Pull request context
- PR diff: !`gh pr diff`
- PR comments: !`gh pr view --comments`
- Changed files: !`gh pr diff --name-only`
```

多行命令使用 ` ```! ` 围栏代码块。

### 子代理执行

添加 `context: fork` 让 skill 在隔离环境中运行。skill 内容成为驱动子代理的 prompt：

```yaml
---
name: deep-research
description: Research a topic thoroughly
context: fork
agent: Explore
---

Research $ARGUMENTS thoroughly:
1. Find relevant files using Glob and Grep
2. Read and analyze the code
3. Summarize findings with specific file references
```

`agent` 字段指定子代理配置：内置代理（`Explore`、`Plan`、`general-purpose`）或 `.claude/agents/` 中的自定义代理。

### 可视化输出

Skills 可以捆绑并运行任何语言的脚本，生成交互式 HTML 等可视化输出。

---

## 权限控制

### 限制工具访问

```yaml
---
name: safe-reader
description: Read files without making changes
allowed-tools: Read Grep Glob
---
```

### 限制 Claude 的 Skill 访问

- **禁用所有 skills**：在权限中拒绝 `Skill` 工具
- **允许/拒绝特定 skills**：`Skill(commit)`（精确匹配）、`Skill(review-pr *)`（前缀匹配）
- **隐藏个别 skill**：frontmatter 中设 `disable-model-invocation: true`

---

## 故障排除

### Skill 不触发

1. 检查 description 是否包含用户自然会说的关键词
2. 用 "What skills are available?" 验证可见性
3. 直接用 `/skill-name` 调用

### Skill 触发太频繁

1. 让 description 更具体
2. 添加 `disable-model-invocation: true`

### Description 被截断

Skill 描述加载到上下文中供 Claude 了解可用选项。预算动态缩放为上下文窗口的 1%，回退 8,000 字符。每条上限 250 字符。可通过 `SLASH_COMMAND_TOOL_CHAR_BUDGET` 环境变量调整。

---

## 相关资源

- [子代理](https://code.claude.com/docs/en/sub-agents)：委派任务给专用代理
- [插件](https://code.claude.com/docs/en/plugins)：打包和分发 skills
- [钩子](https://code.claude.com/docs/en/hooks)：围绕工具事件自动化工作流
- [Memory](https://code.claude.com/docs/en/memory)：管理 CLAUDE.md 持久上下文
- [内置命令](https://code.claude.com/docs/en/commands)：内置 `/` 命令参考
- [权限](https://code.claude.com/docs/en/permissions)：控制工具和 skill 访问
