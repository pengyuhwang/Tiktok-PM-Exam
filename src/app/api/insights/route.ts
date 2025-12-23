// src/app/api/insights/route.ts
import { NextResponse } from "next/server";
import { generateInsightsAliyun } from "@/lib/aliyun";
import { UserInput, InsightResponse, ErrorResponse } from "@/types";

export async function POST(req: Request) {
  try {
    const userInput: UserInput = await req.json();

    // Basic input validation
    if (!userInput.topic || userInput.topic.trim().length < 2) {
      return NextResponse.json<ErrorResponse>(
        {
          code: "INVALID_INPUT",
          message: "主题不能为空且至少包含2个字符。",
          retryable: false,
        },
        { status: 400 }
      );
    }

    if (!["en", "zh"].includes(userInput.language)) {
      return NextResponse.json<ErrorResponse>(
        {
          code: "INVALID_INPUT",
          message: "语言选择无效。",
          retryable: false,
        },
        { status: 400 }
      );
    }

    // Call the Aliyun LLM service
    const result = await generateInsightsAliyun(userInput);

    if ("code" in result) {
      // It's an ErrorResponse
      let status = 500;
      if (result.code === "INVALID_INPUT") status = 400;
      if (result.code === "RATE_LIMIT_EXCEEDED") status = 429;
      if (result.code === "INVALID_API_KEY") status = 401;

      return NextResponse.json<ErrorResponse>(result, { status });
    } else {
      // It's an InsightResponse
      return NextResponse.json<InsightResponse>(result, { status: 200 });
    }
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json<ErrorResponse>(
      {
        code: "INTERNAL_SERVER_ERROR",
        message: "服务器内部错误，请稍后再试。",
        details: error instanceof Error ? error.message : String(error),
        retryable: true,
      },
      { status: 500 }
    );
  }
}
