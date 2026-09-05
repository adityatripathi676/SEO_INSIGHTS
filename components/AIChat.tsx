"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useParams } from "next/navigation";

interface AIChatProps {
  seoReportId?: string; // Optional override
  className?: string;
}

export default function AIChat({ seoReportId: manualId, className }: AIChatProps) {
  const params = useParams();
  const idFromUrl = params?.id as string | undefined;
  const seoReportId = manualId || idFromUrl;

  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: seoReportId || "global-chat",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Clear messages on page refresh and when navigating to a different report
  useEffect(() => {
    setMessages([]);
  }, [seoReportId, setMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isExpanded) {
      scrollToBottom();
    }
  }, [messages, isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ 
        text: input, 
        metadata: { seoReportId } 
      });
      setInput("");
    }
  };

  const isTyping = status === "submitted";

  return (
    <div className={cn("fixed bottom-6 right-6 z-40 transition-all duration-300", className)}>
      {/* Chat Window */}
      <div
        className={cn(
          "absolute bottom-20 right-0 w-[400px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-120px)]",
          "glass-strong rounded-[28px] shadow-apple-lg border border-border/40 flex flex-col overflow-hidden",
          "transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform origin-bottom-right",
          isExpanded ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-90 translate-y-10 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-br from-primary/90 to-primary text-white border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-apple-sm">
              <Sparkles className="size-4.5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm tracking-tight">AI SEO Assistant</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={cn("size-1.5 rounded-full", isTyping ? "bg-amber-300 animate-pulse" : "bg-green-400")} />
                <p className="text-[10px] font-medium text-white/80 uppercase tracking-wider">
                  {isTyping ? "Analyzing..." : "Ready to help"}
                </p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsExpanded(false)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={chatRef} 
          className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-hide bg-muted/5 dark:bg-black/10"
        >
          {messages.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
              <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <MessageCircle className="size-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  How can I help you today?
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {seoReportId 
                    ? "Ask me anything about your SEO analysis, keywords, or competitors."
                    : "Ask me general questions about SEO strategies and optimization."}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center">
              Failed to connect to AI. Please check your API key.
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] px-4 py-3 rounded-2xl text-[13px] shadow-apple-sm",
                  message.role === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "glass border border-border/40 text-foreground rounded-bl-none"
                )}
              >
                {message.parts.length === 0 && message.role === "assistant" && (
                   <div className="flex items-center gap-2">
                     <Loader2 className="size-3 animate-spin" />
                     <span>Thinking...</span>
                   </div>
                )}
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <div key={`${message.id}-${i}`} className="leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 pl-4 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 pl-4 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <span className="font-bold">{children}</span>,
                            a: ({ children, href }) => (
                              <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {part.text}
                        </ReactMarkdown>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer/Input */}
        <div className="p-4 glass-nav border-t border-border/40">
          <form onSubmit={handleSubmit} className="flex gap-2.5">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 h-10 rounded-2xl bg-muted/50 border-border/40 text-xs focus-visible:ring-primary/20 transition-all"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="size-10 rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-apple-sm transition-transform hover:scale-105 active:scale-95"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Bubble Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "size-14 rounded-3xl flex items-center justify-center text-white shadow-apple-lg transition-all duration-300 transform",
          "bg-gradient-to-br from-primary/90 to-primary hover:scale-110 active:scale-95",
          isExpanded ? "rotate-90 bg-destructive" : "hover:shadow-primary/25"
        )}
      >
        {isExpanded ? (
          <X className="size-6" />
        ) : (
          <MessageCircle className="size-6" />
        )}
        
        {/* Unread indicator / Notification dot */}
        {!isExpanded && (
          <span className="absolute -top-1 -right-1 size-4 bg-amber-500 rounded-full border-2 border-background flex items-center justify-center">
            <div className="size-1.5 bg-white rounded-full animate-pulse" />
          </span>
        )}
      </button>
    </div>
  );
}
