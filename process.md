项目：TikTok Creator Insight Assistant (MVP)
版本：0.1.0
范式：Spec-Driven Development（规格驱动开发）
核心目标：将模糊主题 → 结构化脚本大纲 + 趋势洞察，以卡片式 UI呈现，提升 Time-to-Publish

---
1、使用的工具与模型
1.1 IDE / AI 工具
    •   IDE：VSCode
    •   AI 辅助工具：Gemini CLI / Codex
    •   说明：AI 工具用于根据 Spec 生成/修改文档与代码；所有对外行为以 spec.md 为“合同”。
1.2 LLM 平台与 Key 管理
    •   平台：阿里云百炼（Aliyun Bailian）
    •   模型：qwen-max
    •   Key 安全：
    •   真实 Key 仅存在于 .env.local（本地）或部署平台环境变量
    •   仓库仅提交 .env.example（不提交 .env.local）
    •   前端不直接调用百炼，统一通过 POST /api/insights 代理

---
2、设计思想与决策（Why）
2.1 为什么 Spec 是第一优先级

本笔试明确“评估过程而非仅仅结果”，因此我将需求转化为可审查、可验收、可驱动 AI 生成的规格（spec.md）。
Spec 的价值在于：固定 Schema / API / UI 组件树 / 错误处理，避免 LLM 输出漂移导致前后端不一致。

2.2 架构选择：Next.js (App Router) 全栈 + API Route 代理

选择 Next.js App Router 的原因：
    •   端到端最快：前端 + /api/insights 同仓协作
    •   Key 不泄露：百炼调用在服务端完成
    •   便于实现“Loading / 错误 / 重试 / Toast / Copy”等交互闭环

说明：文件树属于实现层选择，不是 spec 的核心契约；我把文件树作为 scaffold 计划落地到仓库，以便 AI 在固定结构下实现功能。

---
3、Spec 驱动开发的流程（What & How）
我遵循以下“规格→生成→验证→修正”的闭环：
    1.  编写 Spec（spec.md）
将需求拆成：User Stories + Acceptance Criteria、数据模型（UserInput/InsightResponse/ErrorResponse）、API 契约、Prompt Contract、UI 组件树、错误处理与安全约束。
    2.  生成UI工程骨架计划（Prompt 2）
由 LLM 输出目录结构与文件职责（不写实现代码），用于建立“可落地的工程骨架”。
    3.  落盘创建目录与空文件（Scaffold）
注意：Prompt2 只输出“计划”，不会自动修改项目文件。因此我额外使用“落盘型”提示词/脚本，在本地创建对应目录与空文件，保证后续 AI 按固定结构填充代码。
    4.  按 spec 生成实现代码（Prompt 3）
要求实现与你 spec 完全一致：
    •   POST /api/insights（校验输入、组装 prompt、调用百炼、解析 JSON、返回结构化响应）
    •   前端卡片式展示 + Loading + Error + Copy（单卡/复制全部 + Toast）
    5.  关键修正 Crucial Fixes：用改 spec 的方式修正 AI 错误
当 AI 输出与 spec 不一致时，优先修改 spec 的约束（Prompt Contract / Data Model / Acceptance Criteria），再驱动 AI 修复代码，从而形成可审查的“架构师式”证据链。

---
4、本项目使用的初始化提示词（Prompts）
说明：提示词是“驱动工具的手段”，Spec 才是对外契约。以下 prompts 全程强调“以 spec 为准”。
Prompt 0：约束总控（System/Instruction）
你是一个 Spec-Driven Development 工程助手。严格遵循以下规则：
禁止直接编写业务代码，必须先输出技术规格文档（spec.md 或 .kiro requirements/design/tasks）。
规格要足够精确，包含：User Stories、Data Models(Schema)、API Interface、UI 组件层级、Error Handling、Acceptance Criteria。
技术实现必须接入阿里云百炼（Aliyun Bailian）LLM，API Key 只允许从 .env 读取，严禁硬编码。
MVP 必须端到端跑通：输入主题（中/英）→ 调用 LLM → 输出 3 套脚本结构 + 5-10 hashtags + 音乐风格 → 前端卡片式展示 + Loading/错误 + 一键复制。
当我要求“生成代码”时，只能基于已经生成的 spec 内容进行，并保持与 spec 一致。
在后续的所有提示词下，都会加上该Prompt0作为系统提示词
Prompt 1：生成 spec.md（只写规格，不写业务代码）
该阶段输出 spec.md，即本项目的“合同”。
任务：为 “TikTok Creator Insight Assistant (MVP)” 编写 spec.md（Markdown）。
禁止输出任何业务实现代码（包括前端组件代码、后端路由代码、具体 HTTP 请求代码）。只输出 spec.md 正文。

prompt："""
背景与目标：
用户输入一个模糊主题/赛道（支持中/英），例如 "Japan Travel"、"Home Cooking"
系统生成：
3 个不同风格的短视频脚本结构（每个包含 Hook/黄金3秒、核心叙事、Call to Action）
5-10 个高潜力 hashtags
推荐背景音乐“风格描述”（不是具体歌名也行）
前端以卡片形式结构化展示（不是纯文本流），需要 Loading、Error Handling、一键复制（单卡复制 + 复制全部）。
硬约束：
LLM 必须通过阿里云百炼接入（模型：DeepSeek-V3/DeepSeek-R1/Qwen-Max 任一，作为可配置项）。
API Key 通过环境变量读取（.env），严禁硬编码。
推荐技术栈：Next.js/React（可用 Next API routes 作为后端）。你也可以提出更优但必须说明理由。
必须端到端跑通。
spec.md 必须包含以下章节（按顺序）：
Overview（范围、目标、非目标）
User Stories（至少 5 条）+ 每条 Acceptance Criteria
Data Models（JSON Schema 或等价定义，字段类型、示例 JSON）
输入模型：UserInput
输出模型：InsightResponse，其中包含 scripts[3]、hashtags[5-10]、music_style、meta（request_id、language、latency_ms）
错误模型：ErrorResponse（code、message、details、retryable）
API Interface（HTTP endpoints）
POST /api/insights：request/response 示例、错误码、超时策略、重试策略、速率限制提示
Prompt Contract（给 LLM 的系统提示与用户提示的结构要求）
强制 LLM 只返回严格 JSON（不得夹带解释文本）
要求 3 种“风格”标签（例如：informative/storytelling/humor 或你定义的）
UI Component Hierarchy（组件树与交互流程）
Input、Language toggle、Generate button、Loading skeleton、Error banner、Result cards、Copy buttons
Error Handling & Observability（日志字段、异常捕获、用户提示文案）
Security（.env、key 管理、CORS/CSRF 基本说明）
Milestones（MVP 里程碑拆解）
Open Questions（你认为需要澄清但不阻塞 MVP 的点）
输出格式要求：
只输出 spec.md 的 Markdown 内容，不要输出任何额外解释。"""
Prompt 2：生成工程骨架计划（不写代码、不落盘）
"""基于你刚刚生成的 spec.md，现在生成一个可运行项目的“工程骨架计划”，输出包含：
推荐的目录结构（文件树）
每个文件的职责说明（1-2 句）
package.json scripts（仅列出脚本名与用途，不要贴大量代码）
.env.example 需要哪些变量
启动方式（npm install / npm run dev）
限制：仍然禁止输出具体业务实现代码（组件实现、API handler 实现都不要写）。你可以写伪代码或接口签名。

输出格式：
先给文件树（tree）
再按文件逐个说明职责
最后给环境变量清单与启动命令"""
Prompt 2.5：落盘创建目录与空文件（Scaffold）
"""任务：请根据下面的“目标目录结构”，在当前项目根目录实际创建对应的目录和空文件。
要求：
只允许创建目录与空文件（touch），不要写任何业务实现代码。
不要改动现有文件内容（除非文件不存在需要创建）。
如果文件/目录已存在，跳过并继续，不要报错。
输出你执行的 shell 命令，并按顺序执行它们。
目标目录结构（必须创建）：
.env.example
src/app/layout.tsx
src/app/page.tsx
src/app/api/insights/route.ts
src/components/GeneratorSection.tsx
src/components/ResultsSection.tsx
src/components/ScriptCard.tsx
src/components/ErrorBanner.tsx
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/components/ui/Card.tsx
src/components/ui/Skeleton.tsx
src/lib/aliyun.ts
src/lib/prompt.ts
src/lib/utils.ts
src/types/index.ts
注意：
需要先 mkdir -p 创建所有父目录。
不要创建 .env.local（它是本地私密配置，应由我手动复制 .env.example 生成）。
开始执行。

关键说明：Prompt2 只生成“计划”，不会自动改动项目文件。为了形成可执行骨架，我新增该提示词/脚本。"""
Prompt 3：按 spec 生成代码（实现端到端）
"""严格按仓库根目录 spec.md 实现项目（Next.js App Router）：
/api/insights 调用阿里云百炼（env 读取 key）
严格 JSON 输出与解析失败处理
UI：卡片式展示 3 个脚本卡 + 趋势信息；Loading / Error / Retry；Copy 单卡 + Copy All + Toast
输出必须可运行，字段命名与 spec 完全一致"""

---
5、新增：真实问题复盘（根据开发过程中实际遇到的坑）
[图片]
5.1 Tailwind 未接通：导致“任何颜色/居中都不生效”
现象  
- 多次修改 bg-*、border-*、flex、items-center 等 class，代码与 DOM 上能看到 className，但页面肉眼仍是纯白。  
- DevTools computed 里 background-color 显示 rgb(255,255,255) 或 transparent，看不到任何变化。
定位方法（强制可视化验证）  
- 临时把目标元素强制改成 bg-red-200 p-6，如果仍不变红：  
  - 说明不是“颜色太淡”，而是 Tailwind CSS 根本没输出/没加载  
- 在构建产物 CSS 中搜索类名：  
  - .next/static/css 里 grep bg-sky-100 / bg-red-200  
  - 如果搜不到：Tailwind 没生成这些 class（content 路径/配置/引入可能有问题）
结论  
- 根因是 Tailwind 没连接/没生效。修复后，所有颜色和布局 class 立即生效，后续 UI 调优才有意义。

---
5.2 UI 需求变更：输入区改成“百度/搜索引擎式居中布局”
目标  
- 首屏核心输入区居中、上部留白、一个“方框”包住输入区（类似百度/Google 首页）。
做法（Spec 驱动）  
- 先在 spec.md 的 6.1 UX & Visual Guidelines 写清楚：
  - 页面整体布局策略（min-h-screen flex flex-col items-center ... pt-[15vh]）
  - container 宽度（max-w-3xl w-full px-4）
  - 输入卡片样式（bg-white border rounded-2xl shadow-sm p-6）
- 再改 page.tsx / GeneratorSection.tsx 落地。

---
5.3 错误处理：从“通用 Generation Failed”升级为“可解释、可重试”
现象  
- 我故意把 API Key 改错，UI 仍只显示：  
  - Generation Failed / Something went wrong. Please try again.  
- 这种提示不符合产品预期，也不利于评审理解“错误处理设计”。
改进目标  
- 面对不同错误类型，展示不同提示与可操作建议（是否可重试、如何修复）。
建议的错误类型（与 spec Data Models 对齐）  
- INVALID_INPUT：输入过短/过长  
- UNAUTHORIZED / API_KEY_INVALID：Key 错误、未配置  
- RATE_LIMIT_EXCEEDED：触发限流（提示稍后重试）  
- PROVIDER_ERROR：百炼上游异常  
- INVALID_JSON / SCHEMA_MISMATCH：LLM 输出不满足 schema（需 repair/retry）  
- NETWORK_ERROR / TIMEOUT：网络/超时
交互设计  
- retryable=true：显示“重试”按钮  
- 非 retryable：给出明确修复提示（例如“检查 .env.local 是否配置 ALIYUN_API_KEY”）

---
5.4 LLM 输出导致“卡片不完整/字段缺失”引发渲染异常
[图片]
现象  
- 有时 `scripts` 数量不是 3，或某条缺 `hook / core_narrative / cta`，导致卡片渲染缺块。  
- 这属于 LLM 输出不稳定的典型问题（不是前端渲染逻辑本身“故意缺失”）。
修复策略（先 Spec 再代码）  
- 在 `spec.md` 中明确“输出完整性”验收与错误映射：
  - `scripts` 必须严格 3 条，且每条字段齐全（`style/hook/core_narrative/cta` 均非空）
  - `hashtags` 长度必须在 5–10
  - 在 7.1 错误映射表新增：生成内容不完整（字段缺失） → `502` / `retryable: true` / UI 展示 Banner + Retry  
- 后端增加严格校验逻辑（实现层落在 `src/lib/aliyun.ts`）：
  - 解析 JSON 后逐条检查每个 script 的关键字段是否非空（`style/hook/core_narrative/cta`）
  - 一旦发现缺失/为空，直接抛出结构化 `ServiceError`（`code: PROVIDER_ERROR`, `status: 502`, `retryable: true`），让前端展示“可重试错误”，而不是继续渲染残缺卡片
效果  
- 当上游偶发返回空字段时，页面不再出现“半张卡/空白卡”，而是稳定进入错误态并提供一键重试，整体体验更一致、更符合 spec 的 Error Handling 设计。
[图片]

---
6、可运行性验证（验收对齐 spec）
我按 spec 的验收标准逐条自测：
- 输入校验：topic 2–100 字符；为空禁用生成（US-1）  
- Loading：请求中 skeleton + 禁用按钮（US-4）  
- 结果：3 张脚本卡（hook/core_narrative/cta）+ hashtags + music_style（US-2/US-3）  
- Copy：单卡复制 + 复制全部 + Toast（US-5）  
- Error：网络/429/provider error/Key 错误 的友好提示 + 重试按钮（US-6/US-7）  
- 安全：.env.local 不入库；API 仅服务端调用百炼（Security）
[图片]
[图片]
[图片]
[图片]

---
7、仓库结构说明（与工程骨架一致）

（这里写你目前采用的目录结构摘要即可；不必塞进 spec，但放在 process/README 很合理。）
    •   src/app/page.tsx：前端状态管理容器（输入→loading→结果）
    •   src/app/api/insights/route.ts：后端代理（输入校验→prompt→百炼→parse→标准响应）
    •   src/lib/aliyun.ts：百炼调用封装（鉴权、超时、错误映射）
    •   src/lib/prompt.ts：Prompt 拼装逻辑（严格 JSON 合约）
    •   src/types/index.ts：类型单一真源（对齐 spec 的数据模型）
    •   src/components/*：UI 组件（cards、error、copy、skeleton）

---
8、后续迭代策略（保持 Spec 与实现一致）
    •   任何改变“对外行为/契约”（API 字段、UI 卡片结构、错误策略、输出语言策略）→ 先改 spec，再改代码
    •   仅内部重构或样式微调 → 可直接改代码，但不改变 spec 契约
    •   每次重要改动：保留 spec diff + 生成过程截图（便于复盘/审计）

