# AI-Team Version History

本文件记录 AI-Team 母项目和团队规则的重要版本更新。

---

## v2 - 2026-07-05

### 更新类型

团队机制升级。

### 更新摘要

新增 `@AI项目书记` 角色，并建立实时操作文档机制。

### 主要变化

- 新增团队级操作文档：`.ai-team/TEAM_OPERATIONS.md`。
- 新增团队级交接摘要：`.ai-team/HANDOFF.md`。
- 新增子项目操作文档规范：`projects/<project-name>/.ai-team/PROJECT_OPERATIONS.md`。
- 新增子项目交接摘要规范：`projects/<project-name>/.ai-team/HANDOFF.md`。
- 更新 `AGENTS.md`，加入 `@AI项目书记` 的角色定义、触发场景、写入规则、输出格式和联动规则。
- 更新根目录 `README.md` 和 `templates/project-readme.md`，把操作文档机制纳入默认项目结构。
- 为 `钱迹` 项目补充 `.ai-team/PROJECT_OPERATIONS.md` 和 `.ai-team/HANDOFF.md`。

### 影响范围

- AI 团队所有后续任务。
- 所有新增子项目。
- 所有项目更新迭代后的收尾流程。

### 后续要求

每次完成项目更新迭代后，必须：

1. 更新团队级或子项目级操作文档。
2. 写入本文件或对应项目版本记录。
3. 创建 Git 提交。
4. 自动推送到远程仓库，除非用户明确要求不要推送。

---

## v1 - 2026-07-05

### 更新类型

母项目初始化。

### 更新摘要

建立 AI-Team 母项目结构、团队角色规则、根 README、项目 README 模板、增长运营角色和初始钱迹项目文档。

### 主要变化

- 创建根目录 `AGENTS.md`。
- 创建根目录 `README.md`。
- 创建 `templates/project-readme.md`。
- 新增 `@增长运营` 角色。
- 建立 `projects/钱迹` 初始项目文档。
- 推送到 GitHub 仓库 `JY-M6/AI-Team`。
