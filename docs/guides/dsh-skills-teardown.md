# DeepSeek Harness 的 11 个技能：拆解与可借鉴处

来源：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) 的 `.agents/skills/`（读取于 2026-08-15）。
配套阅读：[agent-notes-guide.md](agent-notes-guide.md)（同一套体系的记忆层）。

---

## 全景

| 技能 | 干什么 | 归类 |
|---|---|---|
| `dsh-code-review` | PR 审查：本仓库的标准 + 代码看不出来的检查项 | 闸门 |
| `dsh-pre-push-checks` | 推送前**选最小验证集**，反对反射性跑全量 | 闸门 |
| `dsh-find-simplifications` | 找可简化点，写成 `proposed/` 笔记 | 减法 |
| `dsh-archive-agent-notes` | 归档/删除笔记，按未来价值判 | 减法 |
| `dsh-prose-standard` | 文字标准：哪里必须写、写到什么程度 | 文字 |
| `dsh-doc-standards` | 文档放哪、层级、字数预算 | 文字 |
| `dsh-trim-cot-leakage` | 清理"思维链泄漏" | 文字 |
| `dsh-translate-docs` | 双语文档同步 | 文字 |
| `dsh-doc-site-sync` | 文档站投影 | 文字 |
| `dsh-merging-stacked-prs` | 堆叠 PR 落地 | 流程 |
| `record-browser-gif` | 录 GIF 作为 PR 证据 | 证据 |

**11 个里 5 个是文字类。** 这个比例极不寻常，也是最该注意的信号：
他们认为 AI 协作的主要失败模式**不是代码写错，是文字写歪**——
代码有编译器和测试兜底，文字没有，而文字恰恰是下一个 AI 的输入。

---

## 一、`dsh-trim-cot-leakage`：全场最原创

**思维链泄漏**（chain-of-thought leakage）指的是：
一段文字的**视角**是"当时那次会话"，而不是"这个仓库"。

判别式只有一条，非常锋利：

> 一个站在 HEAD、**没有任何会话记录、PR 讨论、未提交草稿**的读者，
> 能不能解析每一个引用、验证每一个论断？

答不能，就是泄漏。他们给了 8 类分类学：

| 类 | 长什么样 |
|---|---|
| 死的设计会话引用 | `(decision 7)`、`(audit C2)`、`design §4.7`、阶段标签 `T4` `W3` |
| 栈/PR 视角 | "a later PR in this stack"、"this PR adds"、"上一个 commit" |
| 变更叙述与版本戳 | "used to"、"no longer"、"原来是…现在改成了"、"v1"、"这一版" |
| 评审编排 | "Rejected in review:"、"评审者确认过"、"第 5 稿" |
| 对评审者辩护 | "这个 cast 是安全的——它只是…"、"这样写是对的因为…" |
| 复述与推导 transcript | 控制流叙述（"先 X 然后 Y"）、测试走查、显然分支的证明 |
| 对冲与计划残留 | "暂时应该够用"、"probably fine for now"、没有标记的推迟 |
| 写作语言串味 | 英文文档里混进 `端`、`设计稿`、`---- 私有 ----` |

第 5 类最值得单独说：**一段注释在论证自己正确，说明它在对评审者说话，不是对维护者说话。**
正确的写法是陈述那个让代码安全的不变量，或者删掉——因为代码本身已经显示了。

修法不是一删了之：

> 当一个段落带有事实子句时，修法**从来不是**单纯删除——
> 把每个事实重述成在 HEAD 站得住的形式，然后删掉周围的 transcript。
> 只有完全不含事实的段落（审计代码、控制流叙述）才直接删。

配套还有**反向清单**（什么不算泄漏），防止过度纠正：
issue 引用 `#1470`、已合并 PR 的引用、`oxlint-disable -- 理由`、
反事实回归锚点（"没有 X 就会 Y"）、实测数据（"measured: 512 层 ≈ 0.15s"，
"measured" 这个词是承重的）、运行时的新旧状态（"旧连接排空后新连接才接受"——
这是运行时生命周期，不是变更历史）。

以及**过度纠正陷阱**四条：把义务改成背书、把假设升格成已发布特性、删掉真事实、丢掉出处。

> **为什么这条对中文 AI 开发特别值钱**：中文提示词 + AI 写文档，
> 产出的注释几乎必然带会话视角（"根据你的要求改成了…"、"这里之前有个 bug"）。
> 这类文字会被下一次 AI 读到并当成事实。

---

## 二、`dsh-prose-standard`：保全完整命题

核心规则叫 **complete-proposition rule**。编辑任何一段文字前，先列出它包含的每个命题：

- 行为者与动作
- 条件、时机、顺序
- 情态：must / may / never
- **负向保证与例外**
- 归属、副作用、失败模式、后果

只有**每一个事实子句都存活**且结果更清楚，删减才算改进。原话：

> A smaller word count alone is not an improvement.
> （单看字数变少，不算改进。）

而且明确**不是单向缩减**——该加的要加：

> This is not a one-way shortening pass. Add or restore prose when
> code, types, and structure do not communicate a required contract.

另有一条术语纪律很值得抄：`contract`、`boundary`、`shape`、`surface`、`seam`
这些词**用前先自问**有没有更精确的词。写 `response fields` 而不是 `response shape`，
写 `JSON validation` 而不是 `validation boundary`。
`contract` 留给真正的前置/后置条件和兼容承诺。

**这是在防 AI 的抽象词癖。** AI 特别爱写"边界""契约""形状"，
听起来很专业，实际上把具体信息糊掉了。

---

## 三、`dsh-pre-push-checks`：反对"跑个全套证明我很勤奋"

> There is no universal local baseline beyond the hooks.
> （除了 hook，本地没有什么放之四海的基线。）

规则是：按 diff 实际触及的面，选**最窄的、会因为这个回归而失败的**那个检查。

| diff 碰了什么 | 跑什么 |
|---|---|
| 包/脚本行为 | 拥有它的那个测试文件或具名测试 |
| 文档、笔记、目录 | `doc-sync` |
| 模型/编辑器/CLI 可见输出 | 拥有该输出的快照场景 |
| 包清单、公开导出、构建配置 | `build` + hygiene + 构建产物冒烟 |
| 真实 provider 行为 | 对应的 e2e |

并明确禁止两件事：

- **不要因为"接下来要提交/推送"就重复跑一个已经通过的检查**
- 不要在 push 前手动跑 typecheck——pre-push hook 已经跑了

跑全套只在三种情况下允许：用户明确要求、诊断 CI 失败、改动确实横跨全仓库。

> AI 的典型行为是跑全套测试来表演尽责。这条把"证据"和"表演"分开了：
> **证据的标准是"这个检查会因为我引入的回归而失败"，不是"我跑了很多东西"。**

---

## 四、`record-browser-gif`：把"我验证过了"变成不可伪造的证据

规则：**任何改动产品用户可见 GUI 的 PR，必须附一个用本技能录制的 GIF。**

关键不在录 GIF，在**证据链**：

- 必须用**这个 PR 的 tree** 构建的真服务器
- 真 API key、真模型轮次
- **禁止** fixture 查询、mock 传输、合成事件注入、test-only hook
- GIF 旁边必须写明：确切的 commit SHA、服务它的 tree 和 origin、
  任何模式标志或浏览器状态例外、是否跑了真实模型轮次

录制前要求干净工作树，`git rev-parse HEAD` 记下确切 commit 再构建——
**用另一个 commit 的构建产物录的 GIF 是伪证。**

还有一条职责分离：录制只产生本地文件，**永不改远程状态**；
发布（推到 assets 分支 + 嵌进 PR 正文）是分开的最后一步，且不碰 PR 自己的分支。

> 这是对"AI 声称已验证"最强的反制。AI 说"我测试过了功能正常"是零成本的，
> 而一个绑定了 commit SHA、禁止 mock 的真实录制不是。

---

## 五、`dsh-find-simplifications`：AI 只会加，这个技能专门减

先给"强候选"的定义（有证据表明**当前设计的成本超过它买到的东西**）：

- 某个公开方法/事件/配置项/包/持久化事件**没有生产消费者**
- 只有测试和文档在消费它，且它们钉住的行为不承重
- 两个表示镜像同一个事实
- 一个 seam 有所有实现都必须支持、但没有消费者使用的方法
- 投机性的产品通用化：多会话、后台任务名册、实时注册表失效……**没有产品负责人**
- 某个不变量/回滚路径/特例测试**只是为了保护一个没人用的 API**
- 手写代码重造了成熟依赖或 Node 内置已有的东西

再给"弱候选"（不值得写笔记）：删一个错字、跑一次 `knip`、
移除一个有文档明确说明的后端、以及**没有调用点证据的"这看起来很复杂"**。

两条方法论值得单独记：

**分类消费者，再动手。** 生产语料（`packages/*/src`、runnable 配置、loader 路径）
vs 非生产语料（测试、文档、笔记、快照）vs 模糊语料（可能是冒烟路径的 examples 和 scripts）。
`rg` 先搜，然后**读调用点**；`knip` 能帮忙但不能替代理解。

**默认不可动清单。** 双 LLM 适配器、双持久化后端"默认是有意为之"，
除非用户明确推翻，否则不许提议删掉任何一个双胞胎。
**给减法本身也划了红线**——否则 AI 会把有意的冗余当成浪费。

---

## 六、技能架构层面的四个手法

这几条跟具体技能内容无关，是**怎么组织一套技能**的经验：

**1. 每个技能显式声明自己拥有什么、不拥有什么。**
`dsh-prose-standard` 开头就写："本技能拥有编辑判断和必需覆盖；
放置/预算/双语用 `dsh-doc-standards`；猎取思维链泄漏用 `dsh-trim-cot-leakage`。"
**这是"一个事实一个家"在技能层面的应用**——5 个文字类技能不打架，靠的是这个。

**2. 几乎每个技能都写着 "It is guidance, not a script/checklist."**
而且 `dsh-prose-standard` 明确要求技能文档**必须**包含这类
"行为护栏和显式范围限制"。这是把"方向而非枷锁"写成了硬要求。

**3. 高成本技能显式关掉自动触发。**
`dsh-translate-docs` 的 frontmatter：

```yaml
disable-model-invocation: true
user-invocable: true
```

理由写在技能里：全文重译会把已经审校过的措辞全部丢掉，
所以日常翻译走"简报驱动的最小更新"路径，重家伙只在用户点名时才动。

**4. 同一技能给不同 agent 平台的适配层。**
每个技能目录下有 `agents/openai.yaml`：

```yaml
interface:
  display_name: "DSH Prose Standard"
  short_description: "Write concise prose without losing contracts"
  default_prompt: "Use $dsh-prose-standard to audit a specified repository scope..."
```

技能正文一份，入口适配按平台放。

---

## 七、整套 SOP 的分层

技能只是中间一层。完整结构是五层：

| 层 | 载体 | 回答什么 |
|---|---|---|
| 宪法 | 根 `AGENTS.md`（149 行，30 条 conventions）<br>`CLAUDE.md` 是它的**符号链接** | 这个仓库的硬规矩 |
| 工作流 | `.agents/skills/` 11 个 | 具体一件事怎么做 |
| 闸门 | `scripts/` 一批 `verify-*` + `doc-sync` | 机械可查的部分谁来卡 |
| 记忆 | `.agents/notes/` 688 篇 | 为什么这么定 |
| 减法 | `find-simplifications` + `archive-agent-notes` | 防止上面四层自己长胖 |

第五层是最容易被忽略、也最决定这套东西能不能活过一年的。
**AI 只会加不会减**——没有专门的减法机制，规则、文档、代码都会单调膨胀，
最后没人（也没有 AI）读得完，SOP 就死了。

顺带一提，他们连宪法自己的膨胀都用脚本卡：`verify-doc-budgets` 管字数上限，
超了要按"**重新安置 → 压缩 → 才允许抬高上限**"的顺序处理。

---

## 八、对照 JwSkills

按软件开发生命周期铺开看覆盖情况：

| 阶段 | JwSkills | DeepSeek |
|---|---|---|
| 装规则 | `init-project` `init-skills` | 根 AGENTS.md（手工） |
| 方案讨论 | **`huxun`** | 无对应物 |
| 设计 | `plan-before-code` | `proposed/` 笔记 |
| 审美方向 | **`summon`** | 无对应物 |
| 实现 | `triple-check` | 根 AGENTS.md 的 conventions |
| 代码审查 | `code-review` | `dsh-code-review` |
| **提交前验证** | ❌ | `dsh-pre-push-checks` |
| **文字质量** | ❌ | 5 个技能 |
| **决策留痕** | ⚠️ `decisions.md` 表格 | 688 篇笔记 + 格式闸门 |
| **做减法** | ❌ | 2 个技能 |
| 造技能 | **`create-skill`** | 无对应物 |

三个 ❌ 就是缺口，按价值排序：

**1. 做减法（最缺）。** 理由同上：AI 只加不减。这是唯一一个"不补就会随时间恶化"的缺口，
其余两个不补只是"少了个好东西"。

**2. 文字质量。** 尤其是 `trim-cot-leakage` 那条判别式——
中文提示词 + AI 写文档几乎必然产生会话视角的文字。

**3. 提交前验证。** 反制 AI 用"跑全套"表演尽责。

反过来，JwSkills 有三个 DeepSeek 完全没有的东西：
`huxun`（多角色互相质询）、`summon`（审美方向）、`create-skill`（造技能的技能）。
**这三个都不是"某个仓库的规矩"，是可迁移的方法**——恰恰是 DeepSeek 那套最缺的可分发性。
