"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
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
  onFailure?: () => void;
  onRun?: (code: string, output: string) => void;
  onSubmit?: (code: string) => void;
  readOnly?: boolean;
  lessonId?: string;
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
  onFailure,
  onRun,
  onSubmit,
  readOnly = false,
  lessonId,
}: CodePlaygroundProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [testResults, setTestResults] = useState<{ passed: boolean; description: string; expected: string; actual?: string }[]>([]);
  const [showDiagnosticBanner, setShowDiagnosticBanner] = useState(false);
  const [isDiagnosticModalOpen, setIsDiagnosticModalOpen] = useState(false);
  const [diagnosticExplanation, setDiagnosticExplanation] = useState("");
  const [isFetchingDiagnostics, setIsFetchingDiagnostics] = useState(false);
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

      if (onRun) {
        onRun(code, outputStr);
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      const cleanError = errorMessage
        .replace(/File "<exec>", line \d+/g, "")
        .replace(/PythonError: Traceback.*?\n/g, "")
        .trim();
      setOutput(cleanError);
      setError(cleanError);
      setShowDiagnosticBanner(true);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!pyodideRef.current || isRunning) return;

    setIsRunning(true);
    setError(null);
    setIsCorrect(null);
    setTestResults([]);

    try {
      // Notify parent submission is starting
      if (onSubmit) onSubmit(code);

      // Capture stdout
      pyodideRef.current.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
      `);

      // Run user code
      await pyodideRef.current.runPythonAsync(code);
      const outputStr = String(pyodideRef.current.runPython("sys.stdout.getvalue()")).trim();
      setOutput(outputStr);

      let passed = false;

      // If test cases are provided, run each and validate via API
      if (testCases && testCases.length > 0) {
        const outputs: string[] = [];
        for (const tc of testCases) {
          try {
            pyodideRef.current.runPython(`sys.stdout = StringIO()`);
            await pyodideRef.current.runPythonAsync(code);
            const tcOutput = pyodideRef.current.runPython("sys.stdout.getvalue()");
            outputs.push(String(tcOutput).trim());
          } catch {
            outputs.push("");
          }
        }

        const res = await fetch("/api/code/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, testCases, outputs }),
        });

        if (res.ok) {
          const data = await res.json();
          setTestResults(data.results || []);
          setIsCorrect(data.passed);
          passed = data.passed;
        }
      } else if (expectedOutput !== undefined) {
        // Simple output comparison
        passed = outputStr === expectedOutput.trim();
        setIsCorrect(passed);
      }

      if (passed) {
        if (onSuccess) onSuccess();
      } else {
        if (onFailure) onFailure();
      }
    } catch (err: any) {
      const errorMessage = err.message || "An error occurred";
      const cleanError = errorMessage
        .replace(/File "<exec>", line \d+/g, "")
        .replace(/PythonError: Traceback.*?\n/g, "")
        .trim();
      setOutput(cleanError);
      setError(cleanError);
      setShowDiagnosticBanner(true);
      if (onFailure) onFailure();
    } finally {
      setIsRunning(false);
    }
  };

  const fetchDiagnostics = async () => {
    if (!error) return;
    setIsFetchingDiagnostics(true);
    setIsDiagnosticModalOpen(true);
    setDiagnosticExplanation(""); // Clear previous
    try {
      const res = await fetch("/api/ai/explain-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, error, lessonId }),
      });

      if (!res.ok) throw new Error("Failed to fetch diagnostics");

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                setDiagnosticExplanation((prev) => prev + data.text);
              }
            } catch (e) {
              console.error("Error parsing stream:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setDiagnosticExplanation("Oops! Py couldn't analyze the error right now. Try checking your syntax!");
    } finally {
      setIsFetchingDiagnostics(false);
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
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={runCode}
            disabled={isLoading || isRunning}
            className="text-dark-400 hover:text-white"
          >
            {isLoading ? "..." : isRunning ? "..." : "▶ Run"}
          </Button>
          {(testCases || expectedOutput !== undefined || onSubmit) && (
            <Button
              size="sm"
              onClick={submitCode}
              disabled={isLoading || isRunning}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              {isRunning ? "Checking..." : "✓ Submit Answer"}
            </Button>
          )}
        </div>
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

      {/* AI Diagnostic Banner */}
      {showDiagnosticBanner && error && (
        <div className="px-4 py-3 bg-primary-500/10 border-t border-primary-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
              Py
            </div>
            <div>
              <p className="text-sm font-medium text-primary-900">It looks like you hit a snag!</p>
              <p className="text-xs text-primary-700">Py noticed an error in your code. Want a hint?</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={fetchDiagnostics}
            className="bg-primary-600 hover:bg-primary-700 text-white border-none shadow-sm h-8 px-3 text-xs"
          >
            Run Py&apos;s Diagnostics
          </Button>
        </div>
      )}

      {/* Diagnostic Modal */}
      {isDiagnosticModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 bg-dark-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-dark-100 flex items-center justify-between bg-dark-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  Py
                </div>
                <div>
                  <h3 className="font-bold text-dark-900">Py&apos;s Diagnostic Clinic</h3>
                  <p className="text-xs text-dark-500 font-medium uppercase tracking-wider">Expert Debugger Mode</p>
                </div>
              </div>
              <button
                onClick={() => setIsDiagnosticModalOpen(false)}
                className="text-dark-400 hover:text-dark-600 transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-dark-100">
              {/* Left: Code Review */}
              <div className="flex-1 p-6 bg-dark-900 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Your Code</h4>
                  <div className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                    ERROR DETECTED
                  </div>
                </div>
                <pre className="text-sm font-mono text-green-400 leading-relaxed">
                  <code>{code}</code>
                </pre>
                <div className="mt-6 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-[10px] uppercase font-bold text-red-400 mb-1">Traceback</p>
                  <p className="text-xs font-mono text-red-300">{error}</p>
                </div>
              </div>

              {/* Right: Py's Analysis */}
              <div className="w-full md:w-[400px] p-8 bg-white flex flex-col">
                <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-6">Py&apos;s Analysis</h4>

                {isFetchingDiagnostics ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="relative w-16 h-16 mb-6">
                      <div className="absolute inset-0 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-xl">🔍</div>
                    </div>
                    <p className="text-dark-900 font-bold mb-1">Analyzing your logic...</p>
                    <p className="text-sm text-dark-500">Checking for typos, structural gaps, and Python rules.</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col">
                    <div className="prose prose-sm text-dark-700 leading-relaxed italic mb-8">
                      {diagnosticExplanation ? (
                        <ReactMarkdown>
                          {diagnosticExplanation}
                        </ReactMarkdown>
                      ) : (
                        <p>No explanation generated. Try running the diagnostics again.</p>
                      )}
                    </div>

                    <div className="mt-auto p-4 bg-primary-50 rounded-xl border border-primary-100">
                      <p className="text-xs font-bold text-primary-700 uppercase mb-2">Next Step</p>
                      <p className="text-sm text-primary-900">Close this modal and try to apply the fixed logic. You got this!</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-dark-50 border-t border-dark-100 flex justify-end">
              <Button onClick={() => setIsDiagnosticModalOpen(false)}>
                Got it, back to work
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
