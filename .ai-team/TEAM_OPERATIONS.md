# AI TEAM OPERATIONS

This file is the long-term operation log for the AI project team.

It is written for AI coding agents.
Read this file before changing team rules, role definitions, skills, MCP configuration, or global workflow.

---

## 1. Team Status

Current team mode: AI software project team

Current version: v2

Main rules file: `AGENTS.md`

Version history: `docs/version-history.md`

Skills directory: `.agents/skills/`

MCP config location: `.codex/config.toml`

Default workspace: `D:\AI-Team\ai-team-workspace`

Projects directory: `projects/`

---

## 2. Active Roles

| Role | Status | Purpose |
|---|---|---|
| @项目总控 | active | Coordinates the team |
| @产品经理 | active | Defines product scope |
| @需求分析师 | active | Clarifies business rules |
| @架构师 | active | Designs architecture |
| @UI设计师 | active | Designs UI/UX |
| @前端工程师 | active | Implements frontend |
| @后端工程师 | active | Implements backend |
| @AI工程师 | active | Designs AI features |
| @数据库工程师 | active | Designs database |
| @测试工程师 | active | Tests features |
| @代码审查员 | active | Reviews code |
| @运维部署工程师 | active | Handles deployment |
| @文档工程师 | active | Writes docs |
| @答辩顾问 | active | Prepares presentation |
| @增长运营 | active | Handles launch and growth |
| @AI项目书记 | active | Maintains operation docs |

---

## 3. Global Rules Change Log

### Change 001

Date: 2026-07-05

Changed by: @项目总控 / @AI项目书记

Change: Established AI-Team mother workspace rules, role system, project README template, and GitHub repository publishing workflow.

Reason: The workspace needs a stable team structure before hosting multiple real projects.

Impact: Root `AGENTS.md`, root `README.md`, `templates/project-readme.md`, and GitHub `main` branch.

Need update AGENTS.md: done

Need update Skill: planned

### Change 002

Date: 2026-07-05

Changed by: @项目总控 / @AI项目书记

Change: Added `@AI项目书记` and the real-time operation document mechanism.

Reason: The team needs persistent operation records so Codex, Antigravity, Claude Code, Cursor, or another AI coding tool can continue work from documented state instead of relying on one-time handoff notes.

Impact: Adds required `.ai-team/TEAM_OPERATIONS.md`, `.ai-team/HANDOFF.md`, project-level `.ai-team/PROJECT_OPERATIONS.md`, project-level `.ai-team/HANDOFF.md`, role rules in `AGENTS.md`, and README/template guidance.

Need update AGENTS.md: done

Need update Skill: planned, `ai-project-secretary`

---

## 4. Version Log

| Version | Date | Summary |
|---|---|---|
| v1 | 2026-07-05 | Established AI-Team workspace, root README, project README template, growth operations role, and initial `钱迹` docs. |
| v2 | 2026-07-05 | Added `@AI项目书记`, real-time operation documents, version update records, and handoff mechanism. |

---

## 5. Skill Status

| Skill | Status | Path | Notes |
|---|---|---|---|
| ai-team-orchestrator | planned | `.agents/skills/ai-team-orchestrator` |  |
| product-manager | planned | `.agents/skills/product-manager` |  |
| java-backend-engineer | planned | `.agents/skills/java-backend-engineer` |  |
| frontend-engineer | planned | `.agents/skills/frontend-engineer` |  |
| ai-engineer | planned | `.agents/skills/ai-engineer` |  |
| tester | planned | `.agents/skills/tester` |  |
| code-reviewer | planned | `.agents/skills/code-reviewer` |  |
| growth-operator | planned | `.agents/skills/growth-operator` |  |
| ai-project-secretary | planned | `.agents/skills/ai-project-secretary` | Should maintain operation docs automatically. |

---

## 6. MCP Status

| MCP | Status | Purpose | Risk Level |
|---|---|---|---|
| Figma MCP | unknown | UI design | medium |
| Browser MCP | unknown | Browser testing | low |
| GitHub MCP | unknown | Repository operations | medium |
| Google Drive MCP | unknown | Docs reading/writing | medium |
| Database MCP | unknown | Database inspection | high |

---

## 7. Cross-Project Conventions

1. All real projects should be placed under `projects/`.
2. Each project should have its own `AGENTS.md`.
3. Each project should have its own `.ai-team/PROJECT_OPERATIONS.md`.
4. High-risk operations require explicit user confirmation.
5. Completed work must be moved from `IN_PROGRESS` to `DONE`.
6. Do not keep stale unfinished task notes after a task is completed.
7. Every completed iteration must include an update note, Git commit, and Git push unless the user explicitly asks not to push.
8. Team rule changes must update this file and `AGENTS.md`.

---

## 8. Open Team-Level Issues

1. Role-specific skills are planned but not implemented.
2. MCP availability is not fully mapped in repository docs.
3. Automation for operation-document updates is rule-based for now, not enforced by hooks.

---

## 9. Next Team-Level Actions

1. Create `.agents/skills/ai-project-secretary/SKILL.md` when skill extraction begins.
2. Add a reusable project creation template that includes `.ai-team/PROJECT_OPERATIONS.md`.
3. Consider a lightweight hook or checklist to remind future agents to update operation docs before commits.
