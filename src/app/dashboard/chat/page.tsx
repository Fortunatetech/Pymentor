'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial greeting
  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, streak_count')
          .eq('id', user.id)
          .single();

        if (profile) {
          const greeting: Message = {
            id: 'greeting',
            role: 'assistant',
            content: `Hey ${profile.name || 'there'}! 👋 ${profile.streak_count > 0 ? `You're on a ${profile.streak_count}-day streak! 🔥` : ''}\n\nI'm Py, your Python tutor. I remember what we've worked on before, so feel free to ask me anything about Python!\n\nWhat would you like to learn today?`,
            created_at: new Date().toISOString(),
          };
          setMessages([greeting]);
        }
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSessionId(data.session_id);

      const assistantMessage: Message = {
        id: data.id || Date.now().toString(),
        role: 'assistant',
        content: data.content,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: 'error',
        role: 'assistant',
        content: "Oops! I had trouble processing that. Let's try again - what were you asking about?",
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-dark-200 px-6 py-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl">
          🐍
        </div>
        <div>
          <h1 className="font-semibold text-dark-900">Py - Your Python Tutor</h1>
          <p className="text-xs text-primary-600 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Remembers your progress
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-dark-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 max-w-3xl ${
              message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'assistant' 
                ? 'bg-primary-500 text-white' 
                : 'bg-primary-100 text-primary-700 font-semibold'
            }`}>
              {message.role === 'assistant' ? '🐍' : 'Y'}
            </div>
            
            <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
              <div className={message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                {message.role === 'assistant' ? (
                  <ReactMarkdown
                    className="prose prose-sm max-w-none prose-dark"
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const code = String(children).replace(/\n$/, '');
                        
                        if (!inline && match) {
                          return (
                            <div className="relative my-3">
                              <button
                                onClick={() => copyCode(code)}
                                className="absolute right-2 top-2 p-1.5 rounded bg-dark-700 hover:bg-dark-600 transition-colors"
                              >
                                {copiedCode === code ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4 text-dark-400" />
                                )}
                              </button>
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-xl !bg-dark-900 !p-4"
                                {...props}
                              >
                                {code}
                              </SyntaxHighlighter>
                            </div>
                          );
                        }
                        return (
                          <code className="bg-dark-100 px-1.5 py-0.5 rounded text-sm" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p>{message.content}</p>
                )}
              </div>
              <div className={`text-xs text-dark-400 mt-1 ${message.role === 'user' ? 'text-right mr-2' : 'ml-2'}`}>
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-start gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center">
              🐍
            </div>
            <div className="chat-bubble-assistant">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                <span className="text-dark-500">Py is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-dark-200 p-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 bg-dark-50 rounded-xl border border-dark-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask Py anything about Python..."
                className="w-full p-4 bg-transparent resize-none text-dark-700 placeholder-dark-400 focus:outline-none"
                rows={1}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn-primary p-4 rounded-xl disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-dark-400 mt-2 text-center">
            Py remembers your progress and adapts to your level
          </p>
        </form>
      </div>
    </div>
  );
}
