"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUser, useSubscription } from "@/hooks";
import { UpgradePrompt } from "@/components/ui/upgrade-prompt";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ChatSession } from "@/types";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const { profile } = useUser();
  const { isPro } = useSubscription();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson_id");
  const lessonTitle = searchParams.get("lesson_title");

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: lessonTitle
        ? `Hey there! I'm Py, your Python tutor. I see you're working on "${lessonTitle}". Ask me anything about this lesson - I'm here to help you understand the concepts!`
        : "Hey there! I'm Py, your Python tutor. I'm here to help you learn Python in a fun, patient way. What would you like to explore today? You can ask me about any Python concept, share code you're working on, or just say hi!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const userName = profile?.name || "Learner";
  const userInitial = userName.charAt(0).toUpperCase();

  // Fetch past sessions
  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/chat/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data);
        } else {
          console.error("Failed to load chat sessions:", res.status);
        }
      } catch (err) {
        console.error("Failed to fetch chat sessions:", err);
      }
    }
    fetchSessions();
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);



  const loadSession = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setSessionId(id);
      setMessages(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.messages?.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
        })) || []
      );
      setShowSessions(false);
    } catch {
      // Silent fail
    }
  };

  const startNewChat = () => {
    setSessionId(null);
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hey there! I'm Py, your Python tutor. What would you like to explore today?",
        timestamp: new Date(),
      },
    ]);
    setError(null);
    setShowSessions(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    // Add placeholder for streaming response
    const assistantId = (Date.now() + 1).toString();
    setStreamingId(assistantId);
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
    ]);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          session_id: sessionId ?? undefined,
          lesson_id: lessonId ?? undefined,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          setError(errorData.message);
          // Remove the empty placeholder
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setMessages((prev) => [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              content: isPro
                ? "You've reached your daily message limit. Try again tomorrow!"
                : "You've used all your free messages for today. Upgrade to Pro for 500 messages per day!",
              timestamp: new Date(),
            },
          ]);
          return;
        }
        throw new Error(errorData.message || "Failed to send message");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.type === "session_id") {
              setSessionId(data.session_id);
            } else if (data.type === "text") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + data.text }
                    : m
                )
              );
            } else if (data.type === "error") {
              throw new Error(data.message);
            }
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }

      // Refresh session list
      const sessRes = await fetch("/api/chat/sessions");
      if (sessRes.ok) setSessions(await sessRes.json());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Failed to send message:", err);
      const errorMessage = err.name === "AbortError"
        ? "Request timed out. Please try again."
        : err.message || "Network error. Please check your connection and try again.";
      setError(errorMessage);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
              ...m,
              content:
                m.content ||
                "Oops! I hit a snag there. Could you try sending your message again?",
            }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      setStreamingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] -mx-4 -mb-4 lg:-m-8 relative">
      {/* Sessions Sidebar - Overlay on mobile, inline on desktop */}
      {showSessions && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSessions(false)}
        />
      )}
      <div
        className={`${showSessions ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:translate-x-0 lg:w-0"
          } transition-all duration-200 overflow-hidden bg-white border-r border-dark-200 flex flex-col fixed lg:relative h-full z-50 lg:z-auto`}
      >
        <div className="p-3 sm:p-4 border-b border-dark-200 flex items-center justify-between gap-2">
          <Button onClick={startNewChat} className="flex-1" size="sm">
            + New Chat
          </Button>
          <button
            onClick={() => setShowSessions(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-dark-100 text-dark-500"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-2 space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => loadSession(session.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm truncate transition-colors ${sessionId === session.id
                ? "bg-primary-100 text-primary-700"
                : "text-dark-600 hover:bg-dark-50"
                }`}
            >
              {session.title || "Untitled chat"}
            </button>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-dark-400 p-3 text-center">
              No past sessions
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="bg-white border-b border-dark-200 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setShowSessions(!showSessions)}
              className="text-dark-500 hover:text-dark-700 p-1.5 rounded-lg hover:bg-dark-50 flex-shrink-0"
              title="Toggle sessions"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm sm:text-xl flex-shrink-0">
              Py
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-dark-900 text-sm sm:text-base truncate">
                Py - Your Python Tutor
              </div>
              <div className="text-xs text-primary-600 hidden sm:block">
                Remembers your progress
              </div>
            </div>
          </div>
          {!isPro && (
            <Link
              href="/pricing"
              className="text-xs text-dark-400 hover:text-primary-600 flex-shrink-0 ml-2"
            >
              Free plan
            </Link>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-3 sm:p-6 space-y-4 sm:space-y-6 bg-dark-50">
          {messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              userInitial={userInitial}
              onEdit={() => {
                setInput(message.content);
                inputRef.current?.focus();
              }}
              isFirstAssistant={index === 0 && message.role === "assistant"}
              isStreaming={streamingId === message.id}
            />
          ))}
          {/* Loading dots shown only before streaming starts (waiting for server) */}
          {isLoading && !streamingId && (
              <div className="flex items-start gap-2 sm:gap-3 max-w-3xl">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
                  Py
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none p-3 sm:p-4 shadow-sm border border-dark-100">
                  <div className="flex gap-1.5">
                    <span
                      className="w-2 h-2 bg-dark-300 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-dark-300 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-dark-300 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error banner / Upgrade prompt on limit hit */}
        {error && !isPro && error.includes("limited to") ? (
          <div className="border-t border-dark-200 p-3 sm:p-4">
            <UpgradePrompt variant="message-limit" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border-t border-red-200 px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm text-red-700 flex items-center justify-between gap-2">
            <span>{error}</span>
            {!isPro && (
              <Link href="/pricing">
                <Button size="sm">Upgrade to Pro</Button>
              </Link>
            )}
          </div>
        ) : null}

        {/* Input Area */}
        <div className="bg-white border-t border-dark-200 p-2 sm:p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 sm:gap-3">
              <div className="flex-1 bg-dark-50 rounded-xl border border-dark-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-3 sm:p-4 bg-transparent resize-none text-dark-700 placeholder-dark-400 focus:outline-none text-sm sm:text-base"
                  rows={1}
                  placeholder="Ask Py anything about Python..."
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0"
                size="sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </Button>
            </div>
            <div className="hidden sm:flex items-center justify-between mt-2 text-xs text-dark-400">
              <span>Py remembers your progress and adapts to your level</span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  userInitial,
  onEdit,
  isFirstAssistant,
  isStreaming,
}: {
  message: Message;
  userInitial: string;
  onEdit: () => void;
  isFirstAssistant?: boolean;
  isStreaming?: boolean;
}) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="flex items-start gap-2 sm:gap-3 max-w-3xl ml-auto flex-row-reverse group">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-xs sm:text-sm flex-shrink-0">
          {userInitial}
        </div>
        <div className="flex-1 flex flex-col items-end min-w-0">
          <div className="bg-primary-500 text-white rounded-2xl rounded-tr-none p-3 sm:p-4 shadow-sm relative max-w-full">
            <p className="whitespace-pre-wrap text-sm sm:text-base break-words">{message.content}</p>
          </div>
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={onEdit}
              className="p-1.5 text-dark-400 hover:text-dark-600 hover:bg-white rounded-md flex items-center gap-1 text-xs transition-all font-medium border border-transparent hover:border-dark-200"
              title="Edit message"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 text-dark-400 hover:text-dark-600 hover:bg-white rounded-md flex items-center gap-1 text-xs transition-all font-medium border border-transparent hover:border-dark-200"
              title="Copy text"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 sm:gap-3 max-w-3xl group">
      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm flex-shrink-0">
        Py
      </div>
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl rounded-tl-none p-3 sm:p-4 shadow-sm border border-dark-100">
          <div className="text-dark-700 prose prose-sm max-w-none prose-pre:bg-transparent prose-pre:p-0 prose-headings:text-dark-900 prose-a:text-primary-600 prose-strong:text-dark-800 break-words">
            {message.content ? (
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const inline = !match;
                    if (inline) {
                      return (
                        <code
                          className="bg-dark-100 px-1.5 py-0.5 rounded text-sm font-mono text-dark-700"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }
                    return (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-xl !my-3"
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : null}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-primary-500 rounded-sm ml-0.5 animate-pulse" />
            )}
          </div>
        </div>
        {!isFirstAssistant && !isStreaming && (
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              className="p-1.5 text-dark-400 hover:text-dark-600 hover:bg-white rounded-md flex items-center gap-1 text-xs transition-all font-medium border border-transparent hover:border-dark-200"
              onClick={handleCopy}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
