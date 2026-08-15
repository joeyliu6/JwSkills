# JwSkills

一组 Claude Code skill，持续收录。

---

## 核心原理

**[`summon`](skills/summon/)**：名词是思想的压缩包。一句「按 Dieter Rams 十诫设计」胜过几百字描述"克制、功能优先、诚实"。

**[`triple-check`](skills/triple-check/)**：把资深工程师的内心独白（实现 → 压测 → 规范）翻译成强制提示词流程，用 token 换用户的返工精力。

**[`code-review`](skills/code-review/)**：系统化代码审查，6 步流程确保高信噪比——宁可漏报 3 个小毛病，不可误报 1 个不存在的 bug。

**[`huxun`](skills/huxun/)**：多角色评审的默认玩法是独白制——每人各说一段，互相看不见彼此的产出，矛盾等到最后才被动浮现。互训让角色互相读产出、互相挑毛病，交锋完再裁决。

**[`init-project`](skills/init-project/)**：模板文档要人照着抄，抄到第三步就烦了——新项目粗糙就是这么来的。这个技能负责执行那几步，把规则、hook、骨架真装进项目。能机械判定的（文件行数、目录堆积）交给会报错的 hook，需要判断的（别过度设计）留给方向。

---

## Skill 清单

| Skill | 触发 | 说明 |
|-------|------|------|
| `summon` | `/summon <需求>` | 召唤词词典，用思想名词定方向 · [设计理念](docs/rationale/summon-design-rationale.md) |
| `triple-check` | `/triple-check <任务>` | 三遍自纠，高质量实现 · [设计理念](docs/rationale/triple-check-design-rationale.md) |
| `code-review` | `/code-review` | 系统代码审查，高信噪比 PR review |
| `plan-before-code` | `/plan-before-code <任务>` | 先设计后编码，三阶段审核 · [设计理念](docs/rationale/plan-before-code-design-rationale.md) |
| `huxun` | `/huxun <方案>` | 多角色互相质询，暴露矛盾和盲区后逐条裁决 |
| `init-project` | `/init-project` | 项目基线安装：规则 + hook + docs 骨架 + 技能 |
| `init-skills` | `/init-skills` | 一键定制所有技能，扫描技术栈生成专属规则 |
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

## 装进你的项目（推荐）

安装后在你的项目里跑一次：

```
/init-project
```

它会勘察项目、分流新旧，然后把四层东西装上：CLAUDE.md 行为规则、
行数与结构检查 hook、`docs/` 骨架和 `docs/decisions.md`、技能本身。
跑完会自动接 `/init-skills` 做技术栈定制，所以**只需要记住这一个命令**。

既有项目只补缺的、不覆盖已有方案；重复跑进入审计模式，不会重复创建。

只想定制技能规则、不想装骨架和 hook，可以单独跑 `/init-skills`。

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
/huxun 这个上传队列方案            # 多角色互相质询，找盲区
/init-project                     # 给项目装上基线：规则 + hook + 骨架
/init-skills                      # 一键定制所有技能
/create-skill                     # 创建新 skill
```

---

## Skill 组合使用

技能之间可以串联，形成完整链条：

```
/summon → /plan-before-code → /triple-check → /code-review
```

`/huxun` 可以插在链条的任意位置——方案定下来之前用它找盲区，实现完之后用它审视取舍。

---

## 设计哲学

> 好的 Skill = 方向 + AI 自身能力。不要把 Skill 当规范手册来写。

详见 [Skill 设计哲学](docs/guides/skill-design-philosophy.md)。编写新 skill 时也可参考 [Claude 官方 Skill 编写指南](docs/guides/claude-official-skill-guide.md)。

---

## 仓库结构

```
JwSkills/
├── skills/                 # Claude Code skill 实现（持续新增）
│   ├── summon/
│   ├── triple-check/
│   ├── code-review/
│   ├── plan-before-code/
│   ├── huxun/
│   ├── init-project/
│   ├── init-skills/
│   └── create-skill/
├── docs/                   # 设计理念与参考文档
│   ├── guides/             # 通用指南
│   │   ├── skill-design-philosophy.md
│   │   ├── claude-md-writing-standard.md
│   │   └── claude-official-skill-guide.md
│   ├── rationale/          # 各 Skill 设计理念
│   │   ├── summon-design-rationale.md
│   │   ├── triple-check-design-rationale.md
│   │   └── plan-before-code-design-rationale.md
│   ├── ai-dev-mental-model.md   # 心智模型：为什么这么组织
│   └── ai-dev-framework.md      # 框架怎么用（怎么装见 init-project）
└── examples/               # 项目定制示例
```

---

## License

MIT License. See [LICENSE](LICENSE).
