# JwSkills

一组 Claude Code skill，持续收录。

---

## 核心原理

**[`summon`](skills/summon/)**：名词是思想的压缩包。一句「按 Dieter Rams 十诫设计」胜过几百字描述"克制、功能优先、诚实"。

**[`triple-check`](skills/triple-check/)**：把资深工程师的内心独白（实现 → 压测 → 规范）翻译成强制提示词流程，用 token 换用户的返工精力。

---

## Skill 清单

| Skill | 触发 | 文档 |
|-------|------|------|
| `summon` | `/summon <需求>` | [README](skills/summon/README.md) · [设计理念](docs/summon-design-rationale.md) |
| `triple-check` | `/triple-check <任务>` | [README](skills/triple-check/README.md) · [设计理念](docs/triple-check-design-rationale.md) |

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

---

## 使用示例

输入：

```
/summon 设计一个设置页面，别太花哨
```

AI 响应：

```
🎖 已召唤：
   · Dieter Rams 十诫（克制、功能优先）
   · 原研哉的"白"（留白即力量）
   · [避雷] 不要硅谷独角兽 landing page 风
开始执行...
```

其他命令：

```
/summon --list              # 查看召唤词词典
/triple-check 按设计稿实现  # 进入三轮审慎工作流
```

---

## 仓库结构

```
JwSkills/
├── skills/                 # Claude Code skill 实现（持续新增）
│   ├── summon/
│   └── triple-check/
├── docs/                   # 设计理念与原理分析
└── examples/               # 项目定制示例
```

---

## License

MIT License. See [LICENSE](LICENSE).
