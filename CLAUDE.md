# 项目须知

## 这是什么

JwSkills 是一个 Claude Code skill 仓库。每个 skill 是一组 markdown 指令，扩展 AI 的能力。

## AI 工作方式

**一次做完**：连续执行到任务完成，不做一半停下汇报进度。

**只有这五类事停下问我**（清单外的工程选择自己定，把依据写进产出）：

1. 改变产品范围或目标用户
2. 改变主要技术栈、公开 API 或长期数据格式
3. 改变安全、隐私、认证或许可边界
4. 不可逆操作：删数据、改 git 历史、迁移
5. 需要花钱、密钥或生产权限

**自主权只用于减少提问，不用于扩大范围**：不加没被要求的抽象层、配置项、
"以后可能用得上"的接口。范围锁死，决策放开。

**验证过的决策和踩坑写进 `docs/decisions.md`**，不写进本机记忆目录——
换台机器就丢了，协作者 clone 也看不到。

## 双 Skills 文件夹

本仓库有两套 skill 文件，**修改任何 skill 时必须同步更新两个目录**：

| 目录 | 用途 | 说明 |
|------|------|------|
| `.claude/skills/` | 工作副本 | Claude Code 直接加载，本项目开发时使用 |
| `skills/` | 发布副本 | 供用户 clone 后复制到自己项目使用 |

规则：
- 以 `.claude/skills/` 为**源头**，修改完后同步到 `skills/`
- 两个目录下同名 skill 的 SKILL.md 及辅助文件必须保持一致
- `skills/` 下的 `README.md` 是给 GitHub 用户看的文档，仅存在于发布目录，无需同步到 `.claude/skills/`
- 提交前检查：改了一边就必须改另一边

**`.claude/skills/` 不进版本控制**（只有 `skills/` 进）。所以新 clone 下来它是空的，
这时 `skills/` 才是唯一的源头。开工前先补上工作副本，否则本仓库一个技能都加载不到：

```bash
mkdir -p .claude/skills
cp -r skills/*/ .claude/skills/
find .claude/skills -name README.md -delete   # README 只属于发布副本
```

## Skill 清单

| Skill | 用途 |
|-------|------|
| `summon` | 召唤词词典，用思想名词给 AI 定方向 |
| `triple-check` | 三遍自纠，高质量实现的审慎工作流 |
| `code-review` | 系统代码审查，高信噪比的 PR review |
| `plan-before-code` | 先设计后编码，三阶段设计审核后才写代码 |
| `init-skills` | 一键定制，扫描项目技术栈自动生成 project-config.md |
| `create-skill` | 引导式创建新 skill，采访 + 生成 + 哲学自检 |
| `huxun` | 多角色互相质询，暴露矛盾和盲区后逐条裁决 |
| `init-project` | 项目基线安装，把规则、hook、docs 骨架和技能装进任意项目 |

## Skill 编写原则

编写或修改 skill 时遵循以下原则（详见 `docs/guides/skill-design-philosophy.md`）：

- **方向而非枷锁**：告诉 AI 关注什么方向，不要列出它已经知道的每条具体规则
- **只写 AI 推断不出来的东西**：项目约定要写，通用最佳实践不写
- **SKILL.md 控制在 500 行以内**：详细参考放辅助文件
- **Description 前置关键用途**：250 字符上限，多一个字都是噪音
- **每个技能自包含**：不引用其他技能的文件（如 `summon/dictionary.md`），需要的内容直接内联——用户可能只复制单个技能目录到自己项目

## 提交约定

遵循 [Conventional Commits](https://www.conventionalcommits.org/)，scope 用 skill 名称（如 `feat(summon): add fuzzy matching`）。

## 文档

| 文件 | 内容 |
|------|------|
| `docs/decisions.md` | 决策与踩坑：项目为什么这么定 |
| `docs/guides/skill-design-philosophy.md` | Skill 设计哲学：方向而非枷锁 |
| `docs/guides/claude-md-writing-standard.md` | CLAUDE.md 审查标准：一句话判断每行是否值得写 |
| `docs/guides/claude-official-skill-guide.md` | Claude 官方 Skill 编写指南（中文整理版） |
| `docs/rationale/summon-design-rationale.md` | Summon 设计理念 |
| `docs/rationale/triple-check-design-rationale.md` | Triple-Check 设计理念 |
| `docs/rationale/plan-before-code-design-rationale.md` | Plan Before Code 设计理念 |
| `docs/ai-dev-mental-model.md` | AI 辅助开发心智模型：三支柱讨论 |
| `docs/ai-dev-framework.md` | AI 辅助开发框架**怎么用**；怎么**装**在 `init-project` 技能里，两边不要重复写 |
