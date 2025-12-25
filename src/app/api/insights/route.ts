import { NextRequest, NextResponse } from "next/server";
import { generateInsights, ServiceError } from "@/lib/aliyun";
import { ErrorResponse } from "@/types";

export const maxDuration = 60; // Match frontend timeout

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

    // Default Fallback
    let status = 500;
    let errorResponse: ErrorResponse = {
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong. Please try again.",
      retryable: true,
      details: error.message
    };

    // Handle Structured ServiceError
    if (error instanceof ServiceError) {
        status = error.status;
        errorResponse = {
            code: error.code,
            message: error.message,
            retryable: error.retryable,
            details: error.message
        };
    } 

    return NextResponse.json(errorResponse, { status });
  }
}