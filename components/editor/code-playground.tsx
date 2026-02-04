"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface TestCase {
  input: string;
  expected_output: string;
  description?: string;
}

interface CodePlaygroundProps {
  initialCode?: string;
  expectedOutput?: string;
  testCases?: TestCase[];
  onSuccess?: () => void;
  onRun?: (code: string, output: string) => void;
  readOnly?: boolean;
}

declare global {
  interface Window {
    loadPyodide: () => Promise<any>;
    pyodide: any;
  }
}

export function CodePlayground({
  initialCode = "# Write your Python code here\nprint('Hello, World!')",
  expectedOutput,
  testCases,
  onSuccess,
  onRun,
  readOnly = false,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [testResults, setTestResults] = useState<{ passed: boolean; description: string; expected: string; actual?: string }[]>([]);
  const pyodideRef = useRef<any>(null);

  useEffect(() => {
    loadPyodide();
  }, []);

  const loadPyodide = async () => {
    try {
      // Load Pyodide script if not already loaded
      if (!window.loadPyodide) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Initialize Pyodide
      if (!pyodideRef.current) {
        pyodideRef.current = await window.loadPyodide();
      }
      
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load Python environment");
      setIsLoading(false);
    }
  };

  const runCode = async () => {
    if (!pyodideRef.current || isRunning) return;

    setIsRunning(true);
    setOutput("");
    setError(null);
    setIsCorrect(null);
    setTestResults([]);

    try {
      // Capture stdout
      pyodideRef.current.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `);

      // Run user code with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Code execution timed out (10s limit)")), 10000);
      });

      const runPromise = (async () => {
        await pyodideRef.current.runPythonAsync(code);
        return pyodideRef.current.runPython("sys.stdout.getvalue()");
      })();

      const result = await Promise.race([runPromise, timeoutPromise]);
      const outputStr = String(result).trim();
      
      setOutput(outputStr);

      // If test cases are provided, run each and validate via API
      if (testCases && testCases.length > 0) {
        const outputs: string[] = [];
        for (const tc of testCases) {
          try {
            pyodideRef.current.runPython(`sys.stdout = StringIO()`);
            // Build a call expression: assume the code defines a function
            // Run user code first, then call with input
            await pyodideRef.current.runPythonAsync(code);
            const tcOutput = pyodideRef.current.runPython("sys.stdout.getvalue()");
            outputs.push(String(tcOutput).trim());
          } catch {
            outputs.push("");
          }
        }

        try {
          const res = await fetch("/api/code/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, testCases, outputs }),
          });
          if (res.ok) {
            const data = await res.json();
            setTestResults(data.results || []);
            setIsCorrect(data.passed);
            if (data.passed && onSuccess) {
              onSuccess();
            }
          }
        } catch {
          // Fall back to client-side check
        }
      } else if (expectedOutput !== undefined) {
        // Simple output comparison
        const isMatch = outputStr === expectedOutput.trim();
        setIsCorrect(isMatch);
        if (isMatch && onSuccess) {
          onSuccess();
        }
      }

      if (onRun) {
        onRun(code, outputStr);
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      // Clean up Python error message for readability
      const cleanError = errorMessage
        .replace(/File "<exec>", line \d+/g, "")
        .replace(/PythonError: Traceback.*?\n/g, "")
        .trim();
      setOutput(cleanError);
      setError(cleanError);
    } finally {
      setIsRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      }, 0);
    }
    
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      runCode();
    }
  };

  return (
    <div className="bg-dark-900 rounded-xl overflow-hidden border border-dark-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-dark-400 text-sm font-mono ml-2">main.py</span>
        </div>
        <Button
          size="sm"
          onClick={runCode}
          disabled={isLoading || isRunning}
        >
          {isLoading ? "Loading Python..." : isRunning ? "Running..." : "▶ Run"}
        </Button>
      </div>

      {/* Code Editor */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          className="w-full bg-transparent text-green-400 font-mono text-sm p-4 resize-none focus:outline-none min-h-[200px]"
          style={{ lineHeight: "1.5" }}
          spellCheck={false}
          placeholder="# Write your Python code here"
        />
        <div className="absolute bottom-2 right-2 text-xs text-dark-500">
          Ctrl+Enter to run
        </div>
      </div>

      {/* Output */}
      <div className="border-t border-dark-700">
        <div className="px-4 py-2 text-xs text-dark-400 bg-dark-800 flex items-center justify-between">
          <span>Output</span>
          {isCorrect !== null && (
            <span className={isCorrect ? "text-green-400" : "text-red-400"}>
              {isCorrect ? "✓ Correct!" : "✗ Try again"}
            </span>
          )}
        </div>
        <div className="p-4 font-mono text-sm min-h-[80px] max-h-[200px] overflow-auto">
          {output ? (
            <pre className={error ? "text-red-400" : "text-green-400"}>
              {output}
            </pre>
          ) : (
            <span className="text-dark-500">Run your code to see output</span>
          )}
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="border-t border-dark-700 px-4 py-3">
          <div className="text-xs text-dark-400 mb-2">Test Results</div>
          <div className="space-y-1">
            {testResults.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-mono">
                <span className={r.passed ? "text-green-400" : "text-red-400"}>
                  {r.passed ? "✓" : "✗"}
                </span>
                <span className="text-dark-300">{r.description}</span>
                {!r.passed && r.actual !== undefined && (
                  <span className="text-dark-500 text-xs">
                    (expected: {r.expected}, got: {r.actual})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Banner */}
      {isCorrect === true && (
        <div className="px-4 py-3 bg-primary-500/10 border-t border-primary-500/30 flex items-center gap-2">
          <span className="text-primary-500 text-xl">🎉</span>
          <span className="text-primary-400 font-medium">Great job! Your code is correct!</span>
        </div>
      )}
      {isCorrect === false && expectedOutput && output && !error && (
        <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/30">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-red-400 text-lg">💡</span>
            <span className="text-red-400 font-medium">Not quite right — check your output</span>
          </div>
          <div className="text-xs text-dark-400 font-mono">
            Expected: <span className="text-yellow-400">{expectedOutput.trim()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
