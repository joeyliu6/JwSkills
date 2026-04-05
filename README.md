# JwSkills

> Joey 在日常 AI 协作中悟出的提示工程方法论，做成 Claude Code skills 开源。
>
> **一个人的私人武器库**，欢迎 fork 建你自己的。

---

## 为什么值得看

在和 AI 长期协作的过程中，我发现**提示词质量**比任何"魔法咒语"都重要。这里沉淀了两个核心发现：

### 💡 发现一：名词是思想的压缩包

> 一句「按 Dieter Rams 十诫设计」 > 几千字描述"克制、功能优先、诚实"

AI 的训练数据里沉淀了大量 Polanyi 默会知识（tacit knowledge）——说不清但懂的人都懂。通过"名字"一键召唤，比显性描述更有效。

→ [`/summon`](skills/summon/) 召唤词词典（20 词 + 7 避雷）

### 💡 发现二：一次交卷 = 学生；三遍自纠 = 工程师

> LLM 默认贪心解码，首次输出 = 训练数据里最常见解法 = 必然漏边界。

把资深工程师的内心独白（实现→压测→规范）翻译成强制提示词流程，用 token 换用户的返工精力。

→ [`/triple-check`](skills/triple-check/) 三遍自纠工作流

---

## 快速安装

```bash
# 克隆仓库
git clone https://github.com/joeyliu6/JwSkills.git
cd JwSkills

# 选择安装方式：
# 方式 A - 用户级（所有 Claude Code 会话都能用）
cp -r skills/summon ~/.claude/skills/
cp -r skills/triple-check ~/.claude/skills/

# 方式 B - 项目级（只在当前项目生效）
cp -r skills/summon /path/to/your-project/.claude/skills/
cp -r skills/triple-check /path/to/your-project/.claude/skills/
```

安装后在 Claude Code 里直接用：

```
/summon --list              # 查看召唤词词典
/summon 设计设置页面        # 自动挑词
/triple-check 按设计稿实现  # 走三轮审慎工作流
```

---

## Skill 清单

| Skill | 触发 | 一句话作用 | 文档 |
|-------|------|-----------|------|
| `summon` | `/summon <需求>` | 用高浓度名词替代长提示词 | [README](skills/summon/README.md) · [设计理念](docs/summon-design-rationale.md) |
| `triple-check` | `/triple-check <任务>` | 三轮审慎工作流，边界不漏 | [README](skills/triple-check/README.md) · [设计理念](docs/triple-check-design-rationale.md) |

---

## 仓库结构

```
JwSkills/
├── skills/                          # Claude Code skill 实现
│   ├── summon/
│   │   ├── SKILL.md                 # skill 主文件（含 frontmatter）
│   │   ├── dictionary.md            # 20 词完整词典
│   │   ├── avoid-list.md            # 7 条避雷区
│   │   └── README.md                # 使用说明
│   └── triple-check/
│       ├── SKILL.md                 # 通用模板版
│       └── README.md                # 使用说明
├── docs/                            # 设计理念与原理分析
│   ├── summon-design-rationale.md
│   └── triple-check-design-rationale.md
└── examples/                        # 真实项目落地样例
    └── picnexus-triple-check.md     # PicNexus 项目的定制版 triple-check
```

---

## 如何贡献你自己的 skill

**这些方法论是"活的"，不是标准答案**。最好的用法是：

1. **Fork 本仓库** → 改成你自己的私人武器库
2. **替换 summon 词典** — 换上你收藏的思想家/方法论
3. **改写 triple-check 的 Round 3** — 填入你项目的具体规范
4. **增加新 skill** — 把你悟出的其他工作流也做成 skill

好的 skill 不追求通用，追求**和你自己契合**。

---

## 底层哲学

这个仓库背后有两条信念：

1. **AI 协作的上限 = 你能把自己的思维方式表达出来的程度**。模糊的需求只能换来平庸的输出。
2. **名词 > 形容词，流程 > 一次性指令**。方法论可以被压缩到名字里，也可以被固化到流程里——但都需要你先想清楚。

---

## 致谢

- 仓库理念致敬 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)
- 感谢每一个在对话中给过反馈、踩过坑、一起迭代的朋友

---

## License

[MIT](LICENSE) © Joey Liu
