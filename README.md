# TikTok 创意灵感助手 (MVP)

这是一个基于 Next.js 开发的应用程序，利用阿里云百炼大模型（Aliyun Bailian LLM）根据用户输入的主题，自动生成结构化的 TikTok 视频脚本、热门标签（Hashtags）以及音乐风格建议。

## ✨ 功能特性

- **主题转脚本**: 仅需输入一个简单的主题，即可生成 3 种风格各异的脚本结构（包含黄金3秒 Hook、核心叙事、行动号召 CTA）。
- **多语言支持**: 完美支持中文和英文的输入与输出（界面语言随目标语言自动切换）。
- **智能洞察**: 提供高潜力的 Hashtags 和背景音乐风格推荐。
- **一键复制**: 支持单个脚本复制，或一键复制所有生成结果，方便粘贴到备忘录。
- **响应式设计**: 针对桌面端（三列布局）和移动端（单列布局）进行了深度优化。

## 🛠 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **AI 集成**: 阿里云百炼 (支持 Qwen-max / Deepseek-v3)，通过 OpenAI 兼容 API 调用。

## 🚀 快速开始

0.  **前提条件**: 确保你的电脑已安装 [Node.js](https://nodejs.org/)（Next.js 14 需要 v18.17 或更高版本）。

1.  **获取项目代码**:
    - 克隆仓库: `git clone <repository-url>`
    - **或者** 如果你收到的是压缩包，请直接解压。
    - 进入项目目录:
      ```bash
      cd Tiktok-PM_exam
      ```

2.  **安装依赖**:
    ```bash
    npm install
    ```

3.  **环境配置 (关键步骤)**:
    - 将 `.env.example` 复制一份并重命名为 `.env.local`:
      ```bash
      cp .env.example .env.local
      ```
    - **获取 API Key**: 访问 [阿里云百炼控制台](https://bailian.console.aliyun.com/) 申请免费或付费的 API Key。
    - 打开 `.env.local` 文件，将你的 Key 填入 `ALIYUN_API_KEY` 字段后保存。

4.  **运行开发服务器**:
    ```bash
    npm run dev
    ```

5.  打开浏览器访问 [http://localhost:3000](http://localhost:3000)。

## 📂 项目结构

- `src/app/api/insights`: 处理 LLM 请求的后端 API 路由（包含服务端验证）。
- `src/lib/aliyun.ts`: 与阿里云百炼 API 通信的核心服务层（含错误处理）。
- `src/components`: UI 组件库，核心组件包括 `ScriptCard`（脚本卡片）和 `GeneratorSection`（生成器交互）。
- **`spec.md`**: **技术规格说明书**。包含详细的产品设计、数据模型定义、API 接口文档和 Prompt 协议，是本项目的核心设计文档。