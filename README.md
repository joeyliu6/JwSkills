# JwSkills

一组 Claude Code skill，持续收录。

---

## 核心原理

**[`summon`](skills/summon/)**：名词是思想的压缩包。一句「按 Dieter Rams 十诫设计」胜过几百字描述"克制、功能优先、诚实"。

**[`triple-check`](skills/triple-check/)**：把资深工程师的内心独白（实现 → 压测 → 规范）翻译成强制提示词流程，用 token 换用户的返工精力。

**[`code-review`](skills/code-review/)**：系统化代码审查，6 步流程确保高信噪比——宁可漏报 3 个小毛病，不可误报 1 个不存在的 bug。

**[`kaihui`](skills/kaihui/)**：工作流编排器。把"该从哪些角度、用什么工具、按什么顺序处理问题"的经验固化成可复用的 workflow 模板，逐步评判推进。

**[`code-simplifier`](skills/code-simplifier/)**：代码简化器。聚焦"让代码更易读，同时一个行为都不变"。核心价值不在于教 AI 怎么简化（它已经会），而在于告诉它什么不能动——防御性代码、有意重复、隐式契约。

---

## Skill 清单

| Skill | 触发 | 说明 |
|-------|------|------|
| `summon` | `/summon <需求>` | 召唤词词典，用思想名词定方向 · [设计理念](docs/summon-design-rationale.md) |
| `triple-check` | `/triple-check <任务>` | 三遍自纠，高质量实现 · [设计理念](docs/triple-check-design-rationale.md) |
| `code-review` | `/code-review` | 系统代码审查，高信噪比 PR review |
| `plan-before-code` | `/plan-before-code <任务>` | 先设计后编码，三阶段审核 · [设计理念](docs/plan-before-code-design-rationale.md) |
| `kaihui` | `/kaihui <任务>` | 工作流编排器，串联技能和视角 · [设计理念](docs/kaihui-design-rationale.md) |
| `init-skills` | `/init-skills` | 一键定制所有技能，扫描技术栈生成专属规则 |
| `code-simplifier` | `/code-simplifier` | 代码简化器，保功能砍冗余防过度抽象 |
| `create-skill` | `/create-skill` | 引导式创建新 skill，采访 + 生成 + 哲学自检 |

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

```
/summon 设计一个设置页面，别太花哨
```

```
> ◈ 召唤阵
>
> ✦ Dieter Rams 十诫 — 克制、功能优先
> ✦ 原研哉的"白" — 留白即力量
> ◇ 不要硅谷独角兽 landing page 风 — 避免紫渐变白大字套路
```

其他命令：

```
/summon --list                    # 查看召唤词词典
/triple-check 按设计稿实现         # 进入三轮审慎工作流
/code-review                      # 系统代码审查
/plan-before-code 新功能开发       # 先设计后编码
/kaihui 帮我评审这个需求            # 工作流编排，多角度分析
/kaihui --list                    # 查看所有 workflow 模板
/init-skills                      # 一键定制所有技能
/code-simplifier                  # 简化最近修改的代码
/create-skill                     # 创建新 skill
```

---

## Skill 组合使用

技能之间可以串联，形成完整链条：

```
/summon → /plan-before-code → /triple-check → /code-review
```

或者直接用 `/kaihui` 自动编排这条链条——它会根据任务类型选择合适的 workflow 模板。

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
│   ├── plan-before-code/
│   ├── kaihui/
│   ├── code-simplifier/
│   ├── init-skills/
│   └── create-skill/
├── docs/                   # 设计理念与参考文档
│   ├── skill-design-philosophy.md
│   ├── claude-official-skill-guide.md
│   ├── summon-design-rationale.md
│   ├── triple-check-design-rationale.md
│   ├── plan-before-code-design-rationale.md
│   └── kaihui-design-rationale.md
└── examples/               # 项目定制示例
```

---

## License

MIT License. See [LICENSE](LICENSE).
