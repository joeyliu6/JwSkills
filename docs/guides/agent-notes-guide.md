# Agent Notes：把项目记忆当工程资产治理

来源：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的 `.agents/` 目录（读取于 2026-08-15）。
本文是**理解性整理**，不是照抄指南——最后一节写明哪些不该学。

---

## 一句话

> Agent Notes are effectively RFCs written by agents.

**AI 自己写的 RFC。** 一条决策一个文件，进 git，有生命周期、有分类、有格式闸门、有归档冻结规则。

不是笔记，不是 changelog，不是会议记录。是**决策的档案馆**。

---

## 它在防什么

不理解这三种死法，下面所有机制都会显得小题大做。

**死法一：决策蒸发。**
"为什么用 Node 不用 pwsh"这个判断，只活在当时那次对话里。对话关掉就没了。
三个月后 AI 接手，看到 Node hook 觉得别扭，改成 bash——当年踩过的坑重踩一遍。

**死法二：同一个坏主意反复被提。**
这是 AI 特有的病。人会记得"上次讨论过，不行"，AI 每次新会话都是失忆的。
它会一再提"这两个包合并吧"、"这段代码没人用，删了吧"——每次都提得很有道理，
因为**它确实没法从代码里看出当年为什么不合**。

**死法三：记忆悄悄变成谎。**
代码改了，笔记没改。AI 照着过期笔记干活，**比没有笔记更糟**——
没笔记它会去读代码，有过期笔记它会信。

三种死法对应三个机制：写下来 / `rejected/` 目录 / 强制同步。

---

## 六个机制

### 1. 路径即元数据，且不做索引

```
.agents/notes/{生命周期}/{分类}/2026-07-19-topic-title.md
```

- **生命周期**是顶层目录：`proposed/` `implemented/` `rejected/` `archived/`
- **分类**是嵌套目录：`feature` `bug-fix` `simplification` `architecture` `process` `testing`
- **日期**是这个话题**首次被提出**的日期（按 git 历史），不是文件创建日期

改状态 = `git mv`。不需要在文件里维护 status 字段之外的任何东西。

他们专门写了一篇笔记论证**不要 `INDEX.md`**，理由两条：

1. 索引重复了路径已经编码的信息（生命周期、分类、日期、标题全在路径里）
2. 任何分支加一篇笔记都要改同一个文件 → **必然成为合并冲突热点**

> 读者失去了一个按时间排的总览页，改用目录树浏览和全库搜索。

分类集合是**封闭的**，写死在脚本里，加新分类要同时改脚本和文档。
`refactor` 被**故意排除**——它和 `simplification` 重叠，而后者有个更锋利的判别式：
**可观察行为变了吗？**

### 2. 三种生命周期，移动要重写

| 目录 | 含义 | 状态行 |
|---|---|---|
| `proposed/` | 提案，还没建（或只建了一部分） | `Status: proposed` |
| `implemented/` | 已落地，**且与线上现实保持同步** | `Status: implemented` |
| `rejected/` | 考虑过，否决了 | `Status: rejected — <一行理由>` |

注意**只有 `rejected` 的状态行带内容**。理由说得很好：

> 被否决笔记的"判决"就是读者来找的那个事实。

其它信息该在哪在哪——首次提出日期在文件名里，其它一切在 git 里。状态行不放日期、不放括号补充。

**移动 = 重写，不是改个字段。** `proposed/` → `implemented/` 要：
把未来时的 `## 提案` 改写成现在时的 `## 决定`，
把 `## 验收标准` 和 `## 风险` 折叠进 `## 后果`，
删掉所有计划性内容。闸门会拒绝 implemented 笔记里出现 `## Proposal` `## Plan` `## Migration plan` `## Acceptance criteria`。

而 `proposed/` → `rejected/` **只加一行否决理由，正文原样冻结**——
包括当年写的验收标准和迁移计划。因为你要保存的是**当年那个提案的完整样子**，
否则后人无法判断"这个否决在今天是否还成立"。

### 3. 骨架强制：`## Problem` 必须能独立成立

```markdown
# Agent Note: <标题>

Status: <状态>

## Problem        ← 动机，写到脱离解决方案也能读懂
## Decision       ← 已落地：现在时，描述线上现实
…自由章节…        ← 包拓扑、协议契约、schema 这类确实特殊的内容
## Alternatives considered
## Consequences   ← 这个取舍付出了什么，又买到了什么
```

**"写到脱离解决方案也能读懂"**这条要求逼出真实动机。
写不出独立的 Problem，通常说明这个决策根本没有真问题在背后。

实物（`event-sourced-sessions`，全文 248 词，被技能点名"永久保留"）：

```markdown
## Problem

The MVP requires strict event-based tracing with fully replayable sessions
（严格的基于事件的trace、logging系统，session完全可回放）。
```

原始需求**原话保留，不改写**——连中文原话都带着。
翻译或润色都会丢掉当时说话人的语气和边界。

### 4. `## Alternatives considered` 强制，且不许编

> A decision recorded without what it beat invites re-litigation
> ——记下决策却不记它打败了谁，等于邀请后人重新吵一遍。

这跟"放弃了什么"是**两回事**：一个是代价，一个是败者。

格式：每个备选一个加粗开头的段落，说清它是什么、为什么输。实物：

```markdown
## Alternatives considered

**A mutable message array with events fired as notifications** — simpler,
but state and log can diverge; with event-sourcing the log IS the state,
so divergence is structurally impossible.
```

铁律：**备选方案只能记录，不能编造。**
早于格式确立日期的老笔记如果补不出当年的备选，就插一行特定注释标记"当年没记"，
闸门只对这类文件放行：

```markdown
<!-- agent-note-format: alternatives-not-recorded (pre-format Agent Note) -->
```

**宁可留一个公开的空洞，也不让 AI 编一个像模像样的假备选。**
这条值得单独记住——它是整套机制里对抗 AI 幻觉最直接的一处设计。

### 5. 事实可以就地改，决策不能

`implemented/` 目录有一份单独的 AGENTS.md，标题就是这句：

> ### This is not a license to rewrite the *decision*

规则切得很干净：

| 变了什么 | 怎么办 |
|---|---|
| 路径、符号名、默认值、机制细节 | **在同一个改动里就地改**，改成现在的事实 |
| 决策本身反转 | **新写一篇**，两边互相链接，旧的不动 |

而且明确禁止**追加变更历史**——直接改写过期的句子，不要写"原本是 X，2026-08 改成了 Y"。
变更历史 git 里有，笔记里再存一份就是噪音。

这条防的是记忆被静默改写成"我们一直就是这么想的"。

### 6. 减法：写新的必须清旧的

这是整套机制**不会腐烂**的关键，也是最容易被忽略的一条。

**触发点在写笔记时，不在定期审计时：**

> 每一篇新 Agent Note 都触发一次取代检查（supersession check）。
> 搜索活跃目录里涉及同一决策或机制的旧笔记，分类处理，
> **在同一个 PR 里**归档所有够格的记录。不要把已知的匹配推给以后的语料审计。

处理方式按生命周期分：

- **implemented，保留**：它的理由、备选、负向保证、持久化/协议语义、归属边界、
  安全规则或"什么条件下可以重新引入"仍可能指导未来改动。**长度不作数。**
- **implemented，归档**：决策已完结，正文不太可能指导未来。移进 `archived/` 永久冻结。
- **proposed，永不归档**：还活着的提案就留着；不值得做了就**诚实地否决它**。
- **rejected，只作护栏留**：只在"那个坏主意仍然诱人且有分量"时保留。
- **rejected，删除**：过时了、被取代了、不再可能被重提——**整个删掉**，并修好指向它的链接。

判定标准是**未来价值**，并且明文禁止用字数、年龄、配额来判。
技能里给的不是规则，是**校准样例**：

| 样例 | 词数 | 判定 |
|---|---|---|
| 折叠侧边栏控制条 | 533 | 归档——已完结的小 UI 行为 |
| Commander 参数适配器 | 1,498 | 归档——实现细节多，设计杠杆小 |
| 事件溯源 session | 248 | 保留——地基性的权威与持久化边界 |
| 丢弃图片内容块 | 334 | 保留——它写明了多模态落地时的重新引入条件 |

**1498 词的归档，248 词的保留。** 用样例标定判断力，比写规则有效——
这正是 [skill-design-philosophy.md](skill-design-philosophy.md) 里"方向而非枷锁"的实证版本。

---

## 真实数据

688 篇笔记（不含中文副本），分布：

| 生命周期 | 数量 | |
|---|---|---|
| `implemented/` | 505 | feature 170 / architecture 129 / bug-fix 77 / process 69 / simplification 48 / testing 12 |
| `archived/` | 142 | 冻结只读 |
| `proposed/` | 25 | |
| `rejected/` | **11** | |

两个数字值得盯着看：

**`rejected/` 只有 11 篇。** 不是因为很少否决方案，是因为**对否决记录也做减法**——
只有"这个坏主意今天仍然诱人"的才留下。护栏不是越多越好，
留一堆没人会犯的错误记录，等于稀释了真正该挡的那几条。

**11 篇里有 10 篇是 `simplification`。**
被否决的绝大多数是"要不要删掉/合并某个东西"。这个分布不是巧合：
**AI 最擅长提的就是这类提案**——它看到两个包只有一个实现、看到一个 API 没人调用，
必然会建议合并或删除。而这类提案恰恰最需要一份"当年为什么不合"的挡箭牌，
因为**答案从来不在代码里**（在"未来还要接第二个后端"这种代码看不见的计划里）。

实物，那篇被技能点名"必须保留"的：

```markdown
# Agent Note: Fold the single compaction backend into its service package

Status: rejected — More compaction backends are planned, so the Service
Definition and basic provider packages remain separate.
```

一行讲完判决。正文完整保留当年的提案、备选、验收标准、风险，冻结。

---

## 这套东西怎么做到不靠自觉

能长到 688 篇，靠的不是"记得写"。两个硬触发：

1. **每个非平凡改动必须在同一个 PR 里加或改一篇笔记。**
   非平凡 = 改了行为、架构、跨文件契约、流程工具、测试策略，
   或任何持久化/协议/配置格式。只有纯机械的局部编辑豁免。
2. **写新笔记时强制做取代检查**（上面第 6 条），写新的顺手清旧的。

第 1 条把"写"绑在改动上，第 2 条把"清"绑在写上。
**没有任何一步依赖人先想起来。**

---

## 明确不要学的

抄错比不抄贵。以下部分是他们的负担，不是他们的智慧：

| 不学 | 为什么 |
|---|---|
| i18n 三元组（`.md` / `.zh.md` / `.i18n.yaml`）+ sidecar 哈希 + append-only 冻结清单 + 5 个 verify 脚本 | 那是有 CI 和双语文档站才养得起的。小仓库抄过来就是没人跑的死代码 |
| "每个非平凡改动都要写笔记" | 在 monorepo 成立。在技能仓库会淹没——大部分改动就是改几行 prompt |
| 归档的密码学封存 | 解决的是"几百篇历史快照被误编辑"，几十篇的规模用不上 |
| 技能之间互相链接 | 他们的 `dsh-code-review` 链到 `dsh-prose-standard`。**JwSkills 的技能是可单独复制的分发单元，必须自包含**——见 [CLAUDE.md](../../CLAUDE.md) 的技能编写原则。约束不同，这里必须反着来 |

---

## 对照 JwSkills

现状：[docs/decisions.md](../decisions.md) 单文件，两张表格，共 5 行。
差距不在规模，在三处结构性缺口：

| | 现在 | 缺口 |
|---|---|---|
| **否决记录** | 无 | [plan-before-code](../../skills/plan-before-code/) 和 [huxun](../../skills/huxun/) 产出的**恰恰就是被否决的方案**，跑完全丢了。两个技能在生产这类信息，却没有容器接 |
| **备选方案** | "放弃了什么"列 = 代价 | 记不下"它打败了谁"，同一个选型会被重新讨论 |
| **触发时机** | CLAUDE.md 里一行倡议 | **依赖 AI 记得写**，没有任何硬触发 |

第三条最要命：**需要人先想起才会用的设计等于没用。**

单文件表格另有两个会随时间变糟的地方：
一是一行装不下真实理由（看看现在第 4 行 hook 那条，已经在往格子里塞三句话了）；
二是多分支并行改同一个文件必撞——正是他们不做 `INDEX.md` 的那个理由。

---

## 落地档位

从小到大三档，可以只做第一档：

**A. 只补 `rejected/`**（零迁移，格式不变）
`decisions.md` 原样保留，新增 `docs/decisions/rejected/yyyy-mm-dd-topic.md`。
补上最大的缺口，接住 `plan-before-code` / `huxun` 的产出。

**B. 加自动触发**（格式不变）
给 `init-project` 的 hook 加一条：提交时有代码改动但 `docs/decisions*` 没动 → 提醒（不阻断）。
把"记得写"变成自动的。

**C. 全量改为一决策一文件**
`docs/decisions/{decided,rejected}/yyyy-mm-dd-topic.md`，
正文四节 `## 问题 / ## 决定 / ## 备选方案 / ## 代价`，
现有 6 条迁移过去，同步更新 `init-project` 的模板。

C 会改变分发给别人的东西（`init-project` 模板），属于 CLAUDE.md 里"必须停下问"的第 2 类。
