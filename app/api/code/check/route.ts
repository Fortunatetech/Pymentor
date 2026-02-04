import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

interface TestCase {
  input: string;
  expected_output: string;
  description?: string;
}

interface TestResult {
  passed: boolean;
  description: string;
  expected: string;
  actual?: string;
}

// POST /api/code/check - Validate code against test cases
// This endpoint validates test results sent from the client (Pyodide runs in-browser)
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const rl = rateLimit(`code-check:${ip}`, RATE_LIMITS.codeRun);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "rate_limit", message: "Too many code checks. Please slow down." },
        { status: 429 }
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "unauthorized", message: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { code, testCases, outputs } = body as {
      code: string;
      testCases: TestCase[];
      outputs: string[];
    };

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "bad_request", message: "Code is required" },
        { status: 400 }
      );
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "bad_request", message: "Test cases are required" },
        { status: 400 }
      );
    }

    if (!outputs || !Array.isArray(outputs)) {
      return NextResponse.json(
        { error: "bad_request", message: "Outputs array is required" },
        { status: 400 }
      );
    }

    // Validate outputs against expected values
    const results: TestResult[] = testCases.map((tc, i) => {
      const actual = (outputs[i] ?? "").trim();
      const expected = tc.expected_output.trim();
      const passed = actual === expected;

      return {
        passed,
        description: tc.description || `Test case ${i + 1}`,
        expected,
        actual,
      };
    });

    const allPassed = results.every((r) => r.passed);
    const passedCount = results.filter((r) => r.passed).length;

    return NextResponse.json({
      passed: allPassed,
      score: Math.round((passedCount / results.length) * 100),
      results,
    });
  } catch (error) {
    console.error("Code check API error:", error);
    return NextResponse.json(
      { error: "server_error", message: "Failed to validate code" },
      { status: 500 }
    );
  }
}
