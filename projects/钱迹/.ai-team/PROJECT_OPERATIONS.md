# PROJECT OPERATIONS

This file is the live operation log for this project.

It is written for AI coding agents.
Before continuing work, read this file first, then inspect the referenced files.

---

## 1. Project Identity

Project name: 钱迹

Project path: `projects/钱迹`

Parent workspace: `D:\AI-Team\ai-team-workspace`

Current branch: `main`

Main rules: `AGENTS.md`

Project rules: `projects/钱迹/AGENTS.md`

---

## 2. Current Project Stage

Current stage: planning and static prototype exploration

Current active role: @AI项目书记

Current objective: establish real-time operation documents and record v2 role update.

Current task status: DONE

---

## 3. Confirmed Requirements

1. 钱迹 is an intelligent bookkeeping mini-program.
2. MVP includes manual bookkeeping, calendar bills, daily details, monthly statistics, AI consumption advice, simplified finance product information, and AI finance assistance.
3. AI finance content must include risk warnings and must not make investment decisions for users.
4. Growth operations must consider launch promotion, seed users, feedback collection, and product iteration.
5. Operation docs must be updated after each project iteration.

---

## 4. Rejected / Avoided Directions

1. Do not implement automatic payment bill import in the first version.
2. Do not implement OCR receipt recognition in the first version.
3. Do not implement multi-ledger or family shared ledger in the first version.
4. Do not let AI buy, redeem, transfer funds, or promise financial returns.
5. Do not skip operation-document updates after task completion.

---

## 5. Tech Stack

Frontend: static prototype currently present under `projects/钱迹/frontend/`; final mini-program stack is not confirmed.

Backend: unknown

Database: unknown

Cache: unknown

AI: API-based integration planned; provider unknown.

Testing: unknown

Deployment: planned test target documented in `projects/钱迹/docs/deployment.md`

Design: young trendy style

Docs: `README.md`, `docs/requirements.md`, `docs/design.md`, `docs/ai.md`, `docs/growth.md`, `docs/api.md`, `docs/database.md`, `docs/deployment.md`.

---

## 6. Important Files To Read First

1. `projects/钱迹/README.md`
2. `projects/钱迹/AGENTS.md`
3. `projects/钱迹/docs/requirements.md`
4. `projects/钱迹/docs/design.md`
5. `projects/钱迹/docs/ai.md`
6. `projects/钱迹/docs/growth.md`
7. `projects/钱迹/docs/api.md`
8. `projects/钱迹/docs/database.md`
9. `projects/钱迹/docs/deployment.md`
10. `projects/钱迹/frontend/index.html`

---

## 7. Task Board

### IN_PROGRESS

None.

---

### TODO

#### Task ID: QJ-TODO-001

Task name: Confirm mini-program technical stack

Responsible role: @架构师

Reason: The project has a static frontend prototype, but the real mini-program framework is not confirmed.

Depends on: user confirmation

Expected output: technology comparison and recommended implementation path.

#### Task ID: QJ-TODO-002

Task name: Validate static prototype

Responsible role: @测试工程师

Reason: Static prototype files are present and should be reviewed for layout, responsiveness, and missing states.

Depends on: browser verification

Expected output: prototype test notes and issues.

#### Task ID: QJ-TODO-003

Task name: Convert growth plan into launch checklist

Responsible role: @增长运营

Reason: Growth document exists, but launch checklist and feedback form are not yet created.

Depends on: MVP confirmation

Expected output: launch checklist, seed user plan, feedback form draft.

---

### DONE

#### Task ID: QJ-DONE-001

Task name: Establish 钱迹 project documentation

Responsible role: @项目总控 / @文档工程师 / @增长运营

Completed at: 2026-07-05

Completed work:

1. Created project-level README and AGENTS rules.
2. Created requirements, design, AI, and growth docs.
3. Added root README project index entry.
4. Added operation documentation mechanism in v2.

Files changed:

1. `projects/钱迹/README.md`
2. `projects/钱迹/AGENTS.md`
3. `projects/钱迹/docs/requirements.md`
4. `projects/钱迹/docs/design.md`
5. `projects/钱迹/docs/ai.md`
6. `projects/钱迹/docs/growth.md`
7. `projects/钱迹/.ai-team/PROJECT_OPERATIONS.md`
8. `projects/钱迹/.ai-team/HANDOFF.md`
9. `projects/钱迹/docs/api.md`
10. `projects/钱迹/docs/database.md`
11. `projects/钱迹/docs/deployment.md`
12. `projects/钱迹/frontend/index.html`
13. `projects/钱迹/frontend/styles.css`
14. `projects/钱迹/frontend/app.js`

Validation:

1. Documentation consistency checked with `rg`.
2. Markdown whitespace checked with `git diff --check`.

Remaining risks:

1. Actual mini-program stack is not confirmed.
2. Static prototype has not been visually verified in browser in this iteration.
3. Backend, database, and deployment are still planning documents only.

---

### CANCELLED

None.

---

## 8. Recent File Changes

| Time | File | Change | Role |
|---|---|---|---|
| 2026-07-05 | `projects/钱迹/docs/growth.md` | Added growth operations plan | @增长运营 |
| 2026-07-05 | `projects/钱迹/docs/api.md` | Added planned API scope | @文档工程师 |
| 2026-07-05 | `projects/钱迹/docs/database.md` | Added planned data objects | @数据库工程师 |
| 2026-07-05 | `projects/钱迹/docs/deployment.md` | Added deployment planning notes | @运维部署工程师 |
| 2026-07-05 | `projects/钱迹/frontend/` | Added static responsive prototype files | @前端工程师 |
| 2026-07-05 | `projects/钱迹/.ai-team/PROJECT_OPERATIONS.md` | Added live operation record | @AI项目书记 |
| 2026-07-05 | `projects/钱迹/.ai-team/HANDOFF.md` | Added handoff summary | @AI项目书记 |

---

## 9. Key Decisions

### Decision 001

Date: 2026-07-05

Role: @项目总控

Decision: 第一版采用年轻潮流型视觉方向，主题切换放到后续规划。

Reason: Avoid over-designing theme system before MVP validation.

Impact: UI design and static prototype.

Alternatives: minimalist finance style, warm life ledger style.

Risk: Trendy style may need user validation.

### Decision 002

Date: 2026-07-05

Role: @AI项目书记

Decision: 钱迹 must maintain `PROJECT_OPERATIONS.md` and `HANDOFF.md`.

Reason: Project state should be recoverable by future AI agents.

Impact: All future project iterations.

Alternatives: one-time handoff only.

Risk: Requires discipline until automated hooks exist.

---

## 10. API Status

Implemented APIs: none

Designed but not implemented APIs:

1. User login/current user
2. Bill CRUD/query
3. Category query/manage
4. Calendar monthly summary
5. Statistics query
6. Budget query/update
7. AI consumption analysis
8. Finance product query
9. Feedback submit

Unclear APIs:

1. Mini-program login flow
2. AI provider integration
3. Finance data source

---

## 11. Database Status

Designed tables: none

Implemented tables: none

Pending migrations: none

Risks:

1. User data isolation must be designed before implementation.
2. Money fields must avoid floating-point errors.
3. AI analysis records should avoid unnecessary private details.

---

## 12. Frontend Status

Implemented pages: static responsive prototype files are present under `projects/钱迹/frontend/`.

Designed but not implemented pages:

1. Home
2. Add bill
3. Calendar
4. Daily bill
5. Statistics
6. AI assistant
7. Finance
8. Mine

Pending states:

1. Loading
2. Empty
3. Error
4. Permission denied
5. AI authorization

Risks:

1. Static prototype may not match final mini-program framework.
2. Visual verification is still needed.

---

## 13. AI Feature Status

Planned AI features:

1. Consumption habit analysis
2. Budget control suggestions
3. Finance product explanation
4. Finance assistance with risk warning

Implemented AI features: none

Prompt files: none

RAG status: not planned yet

Known AI risks:

1. Must not make investment decisions.
2. Must not promise returns.
3. Must not read unauthorized private data.

---

## 14. Testing Status

Tests run:

1. `git diff --check`
2. `rg` documentation coverage checks

Tests passed: formatting checks passed before commit.

Tests failed: none

Tests not run:

1. Browser visual verification of static prototype.
2. Automated frontend tests.

Reason tests not run: current task is team role and documentation mechanism update.

Recommended next tests:

1. Open `projects/钱迹/frontend/index.html` in browser.
2. Verify mobile and desktop layout.
3. Check page navigation and text overflow.

---

## 15. Deployment Status

Deployment target: `192.168.100.128` planned test host, not deployed.

Deployment files: `projects/钱迹/docs/deployment.md`

Deployment completed: no

Deployment pending: yes

Deployment risks:

1. Tech stack is not confirmed.
2. No backend service exists yet.

---

## 16. Known Risks

1. Mini-program technical route is not confirmed.
2. Finance product data source is not confirmed.
3. AI provider is not confirmed.
4. Static prototype has not been visually verified in this iteration.
5. Operation document updates are rule-based, not hook-enforced.

---

## 17. Next AI Agent Instructions

The next AI agent should:

1. Read this file first.
2. Inspect `projects/钱迹/frontend/index.html` before making frontend decisions.
3. Ask the user to confirm mini-program technical stack before implementing runtime code.
4. Keep operation docs updated after every iteration.

The next AI agent must not:

1. Claim finance advice is investment advice.
2. Commit real API keys or passwords.
3. Delete existing project files without explicit confirmation.
4. Skip `PROJECT_OPERATIONS.md` updates after work.

Recommended next role: @项目总控

Recommended next prompt:

```text
请读取钱迹 PROJECT_OPERATIONS.md，判断下一步先做技术选型、原型验证，还是继续补产品需求。
```

---

## 18. Open Questions For User

1. 钱迹最终采用微信原生小程序、uni-app、Taro，还是先保留静态原型？
2. 第一版是否需要后端服务？
3. AI API 供应商选择哪个？
4. 理财产品数据第一版用模拟数据还是接真实 API？
