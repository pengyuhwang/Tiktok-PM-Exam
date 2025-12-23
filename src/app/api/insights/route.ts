import { NextRequest, NextResponse } from "next/server";
import { generateInsights } from "@/lib/aliyun";
import { ErrorResponse } from "@/types";

export const maxDuration = 60; // Allow longer timeout for LLM

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, language } = body;

    // Input Validation
    if (!topic || typeof topic !== "string" || topic.length < 2) {
      return NextResponse.json(
        { 
          code: "INVALID_INPUT", 
          message: "Topic must be at least 2 characters long.",
          retryable: false
        } as ErrorResponse,
        { status: 400 }
      );
    }

    if (topic.length > 100) {
       return NextResponse.json(
        { 
          code: "INVALID_INPUT", 
          message: "Topic is too long (max 100 characters).",
          retryable: false
        } as ErrorResponse,
        { status: 400 }
      );
    }

    const lang = language === "zh" || language === "en" ? language : "zh"; // Default to zh

    const insights = await generateInsights(topic, lang);

    return NextResponse.json(insights);

  } catch (error: any) {
    console.error("API Route Error:", error);

    let status = 500;
    let errorResponse: ErrorResponse = {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again.",
      retryable: true
    };

    if (error.message === "RATE_LIMIT_EXCEEDED") {
      status = 429;
      errorResponse = {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please wait a moment.",
        retryable: true
      };
    } else if (error.message === "INVALID_JSON_FORMAT" || error.message === "MISSING_SCRIPTS") {
        status = 502; // Bad Gateway (Upstream error)
        errorResponse = {
            code: "PROVIDER_ERROR",
            message: "Failed to generate valid content. Please try again.",
            retryable: true
        };
    }

    return NextResponse.json(errorResponse, { status });
  }
}