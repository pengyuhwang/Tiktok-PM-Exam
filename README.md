# TikTok Creator Insight Assistant (MVP)

A Next.js application that generates structured TikTok video scripts, hashtags, and music suggestions based on a topic. Powered by Aliyun Bailian LLM.

## Features

- **Topic to Script:** Generate 3 unique script structures (Hook, Narrative, CTA) from a simple topic.
- **Multilingual:** Supports Chinese and English input/output.
- **Smart Insights:** Provides relevant hashtags and music style recommendations.
- **Copy Ready:** One-click copy for individual scripts or all results.
- **Responsive:** Optimized for desktop and mobile.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **AI Integration:** Aliyun Bailian (Qwen-max/Deepseek-v3) via OpenAI-compatible API

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Environment Setup:**
    Copy `.env.example` to `.env.local` and add your Aliyun API Key.
    ```bash
    cp .env.example .env.local
    ```
4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/app/api/insights`: Backend API route handling LLM requests.
- `src/lib/aliyun.ts`: Service for communicating with Aliyun Bailian.
- `src/components`: UI components including ScriptCard and GeneratorSection.
- `spec.md`: Technical specification.
