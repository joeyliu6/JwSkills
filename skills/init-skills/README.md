# /init-skills — 一键定制

> 扫描项目技术栈，自动生成技能专属规则。安装 Koda 后运行一次即可。

## 快速上手

```bash
# 先安装 Koda 技能到你的项目
cp -r skills/* /path/to/your-project/.claude/skills/
```

使用：

```
/init-skills
```

AI 会自动：
1. **扫描** `package.json`、`tsconfig.json`、`CLAUDE.md` 等文件
2. **识别** 项目的框架、语言、UI 库、桌面框架等
3. **生成** `triple-check/project-config.md` 和 `code-review/project-config.md`
4. **输出** 定制结果汇总

## 它定制了什么

| 技能 | 生成文件 | 内容 |
|------|---------|------|
| `triple-check` | `project-config.md` | Round 3 规范审查的项目专属检查项 |
| `code-review` | `project-config.md` | 各优先级的补充检查项 + 项目常见反模式 |
| `summon` | 无 | 开箱即用，无需定制 |

## 支持的技术栈

自动识别并生成对应规则：

- **前端框架**: Vue 3, React, Svelte, Angular
- **语言**: TypeScript (strict), JavaScript, Rust, Python, Go
- **UI 库**: PrimeVue, Ant Design, Element Plus, shadcn
- **桌面框架**: Tauri, Electron
- **后端**: Node.js/Express/Fastify, Rust/Actix, Python/FastAPI/Django
- **项目约定**: 自动从 `CLAUDE.md` 提取编码规范

## 不在列表里的技术栈？

`/init-skills` 会提取 `CLAUDE.md` 中的所有编码约定，不依赖固定映射表。即使你的技术栈不在上面的列表里，只要 `CLAUDE.md` 写了规范，就会被提取为规则。

## 技术栈变更后

重新运行 `/init-skills` 即可。它会检测到技术栈变化并重新生成 `project-config.md`。

即使你忘了重新运行，`/triple-check` 和 `/code-review` 在执行时也会检测技术栈是否一致，不一致时会提示你更新。

## 手动编辑

生成的 `project-config.md` 可随时手动编辑补充。`/init-skills` 重新运行时会覆盖，所以如果有重要的手动补充，建议提交到版本控制。
