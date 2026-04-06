# JwSkills

一组 Claude Code skill，持续收录。

---

## 核心原理

**[`summon`](skills/summon/)**：名词是思想的压缩包。一句「按 Dieter Rams 十诫设计」胜过几百字描述"克制、功能优先、诚实"。

**[`triple-check`](skills/triple-check/)**：把资深工程师的内心独白（实现 → 压测 → 规范）翻译成强制提示词流程，用 token 换用户的返工精力。

**[`code-review`](skills/code-review/)**：系统化代码审查，6 步流程确保高信噪比——宁可漏报 3 个小毛病，不可误报 1 个不存在的 bug。

---

## Skill 清单

| Skill | 触发 | 文档 |
|-------|------|------|
| `summon` | `/summon <需求>` | [README](skills/summon/README.md) · [设计理念](docs/summon-design-rationale.md) |
| `triple-check` | `/triple-check <任务>` | [README](skills/triple-check/README.md) · [设计理念](docs/triple-check-design-rationale.md) |
| `code-review` | `/code-review` | [README](skills/code-review/README.md) |
| `init-skills` | `/init-skills` | [README](skills/init-skills/README.md) — 一键定制所有技能 |

---

## 安装

```bash
git clone https://github.com/joeyliu6/JwSkills.git
cd JwSkills

# 用户级安装：对所有 Claude Code 会话生效
cp -r skills/* ~/.claude/skills/

# 项目级安装：仅对当前项目生效
cp -r skills/* /path/to/your-project/.claude/skills/
```

## 定制（推荐）

安装后在你的项目中运行一次，AI 会自动扫描技术栈并生成专属规则：

```
/init-skills
```

也可以跳过——首次使用 `/triple-check` 或 `/code-review` 时会提示定制。

---

## 使用示例

输入：

```
/summon 设计一个设置页面，别太花哨
```

AI 响应：

```
> ◈ 召唤阵
>
> ✦ Dieter Rams 十诫 — 克制、功能优先
> ✦ 原研哉的"白" — 留白即力量
> ◇ 不要硅谷独角兽 landing page 风 — 避免紫渐变白大字套路
```

其他命令：

```
/summon --list              # 查看召唤词词典
/triple-check 按设计稿实现  # 进入三轮审慎工作流
/code-review                # 系统代码审查
/init-skills                # 一键定制所有技能
```

---

## 设计哲学

> 好的 Skill = 方向 + AI 自身能力。不要把 Skill 当规范手册来写。

详见 [Skill 设计哲学](docs/skill-design-philosophy.md)。编写新 skill 时也可参考 [Claude 官方 Skill 编写指南](docs/claude-official-skill-guide.md)。

---

## 仓库结构

```
JwSkills/
├── skills/                 # Claude Code skill 实现（持续新增）
│   ├── summon/
│   ├── triple-check/
│   ├── code-review/
│   └── init-skills/
├── docs/                   # 设计理念与参考文档
│   ├── skill-design-philosophy.md
│   ├── claude-official-skill-guide.md
│   ├── summon-design-rationale.md
│   └── triple-check-design-rationale.md
└── examples/               # 项目定制示例
```

---

## License

MIT License. See [LICENSE](LICENSE).
