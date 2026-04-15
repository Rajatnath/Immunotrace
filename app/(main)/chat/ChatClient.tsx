"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Search, ArrowRight, Activity, Layers, CheckCircle2, User, Bot, Loader2, FileText } from "lucide-react";

interface Source {
  label: string;
  prescriptionId: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  insightCard?: {
    type: "PATTERN" | "URGENT" | "GENERAL";
    title: string;
    summary: string;
    evidence: string[];
    recommendations: string[];
    nextSteps: string[];
    confidence: number;
  };
  followUp?: string;
  ayushPerspective?: string;
  disclaimer?: string;
  sources?: Source[];
}

const THINKING_PHASES = [
  "Scanning past records...",
  "Detecting patterns...",
  "Generating clinical insight...",
];

export function ChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingPhase, setThinkingPhase] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const thinkingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMessage = query.trim();
    setQuery("");
    
    // Add user message to thread
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);
    setThinkingPhase(0);
    thinkingTimer.current = setInterval(() => {
      setThinkingPhase(p => (p + 1) % THINKING_PHASES.length);
    }, 1200);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMessage,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.data.message,
          insightCard: data.data.insightCard,
          followUp: data.data.followUp,
          ayushPerspective: data.data.ayushPerspective,
          disclaimer: data.data.disclaimer,
          sources: data.data.sources ?? [],
        }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I encountered a connection error. Please try again.",
      }]);
    } finally {
      if (thinkingTimer.current) clearInterval(thinkingTimer.current);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] w-full max-w-5xl flex-col bg-transparent">
      
      {/* Thread Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0F3D3E]/5 text-[#0F3D3E]">
              <Sparkles className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#0F3D3E]">Ask ImmunoTrace</h1>
            <p className="mt-4 max-w-md text-[15px] font-medium leading-relaxed text-slate-500">
              I am your clinical health companion. Ask me anything about your symptoms, history, or wellness patterns.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex w-full flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              
              {/* Message Bubble Container */}
              <div className={`group relative flex max-w-[85%] flex-col gap-2 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                
                {/* Avatar Label */}
                <div className="mb-1 flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {msg.role === "user" ? (
                    <>You <User className="h-3 w-3" /></>
                  ) : (
                    <><Bot className="h-3.5 w-3.5 text-[#0F3D3E]" /> ImmunoTrace AI</>
                  )}
                </div>

                {/* Primary Bubble */}
                <div className={`rounded-3xl px-6 py-4 text-[15px] leading-relaxed shadow-sm transition-all duration-300 ${
                  msg.role === "user" 
                    ? "bg-[#0F3D3E] font-medium text-white ring-1 ring-white/10" 
                    : "border border-slate-100 bg-white text-[#334155] ring-1 ring-slate-100/50"
                }`}>
                  {msg.content}
                </div>


                {/* Source Citations */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-1 mt-1 animate-in fade-in duration-500">
                    {msg.sources.map((src, i) => (
                      <span key={i} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500">
                        <FileText className="h-3 w-3 text-[#2EC4B6]" />
                        Source: {src.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* ImmunoTrace Intelligence Card (If present) */}
                {msg.insightCard && (
                  <div className="mt-6 flex w-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex flex-col p-8">
                      {/* Header */}
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                            msg.insightCard.type === "PATTERN" ? "bg-blue-50 text-blue-600" :
                            msg.insightCard.type === "URGENT" ? "bg-red-50 text-red-600" :
                            "bg-emerald-50 text-emerald-600"
                          }`}>
                            <Activity className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Clinical Analysis</span>
                            <h3 className="text-[16px] font-bold text-slate-800">{msg.insightCard.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50/50 px-3 py-1.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-bold text-slate-500">{(msg.insightCard.confidence * 100).toFixed(0)}% Confidence</span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mb-6 rounded-2xl bg-slate-50/80 p-5 ring-1 ring-inset ring-slate-100/50">
                        <p className="text-[15px] font-medium leading-relaxed text-slate-700">
                          {msg.insightCard.summary}
                        </p>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Evidence */}
                        <div className="flex flex-col">
                          <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <Layers className="h-3.5 w-3.5" /> Supporting Evidence
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {msg.insightCard.evidence.map((item, i) => (
                              <span key={i} className="rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-600 shadow-sm">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="flex flex-col">
                          <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Recommended Actions
                          </div>
                          <div className="flex flex-col gap-3">
                            {msg.insightCard.recommendations.map((rec, i) => (
                              <div key={i} className="rounded-xl border border-blue-100 bg-blue-50/30 p-4 ring-1 ring-inset ring-blue-100/20">
                                <p className="text-[13px] font-bold leading-relaxed text-blue-700">
                                  {rec}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Next Steps */}
                        <div className="flex flex-col">
                          <div className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            <ArrowRight className="h-3.5 w-3.5" /> Diagnostic Next Steps
                          </div>
                          <div className="flex flex-col gap-2">
                            {msg.insightCard.nextSteps.map((step, i) => (
                              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/50 p-3 shadow-sm transition-all hover:border-slate-200">
                                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                                  {i + 1}
                                </div>
                                <span className="text-[12px] font-semibold text-slate-600">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Perspective Footer */}
                    {msg.ayushPerspective && (
                      <div className="border-t border-slate-100 bg-slate-50/30 p-6 px-8">
                        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/80">
                          <Sparkles className="h-3.5 w-3.5" /> Ayush Strategy
                        </div>
                        <p className="text-[13px] font-medium italic leading-relaxed text-slate-600">
                          {msg.ayushPerspective}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Follow-up Guidance */}
                {msg.followUp && !loading && messages.indexOf(msg) === messages.length - 1 && (
                  <div className="mt-4 flex w-full flex-col gap-3 px-1 animate-in fade-in slide-in-from-left-2 duration-700 delay-300">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <ArrowRight className="h-3 w-3" /> Next Step
                    </div>
                    <button 
                      onClick={() => setQuery(msg.followUp!)}
                      className="w-fit rounded-2xl border border-slate-200 bg-white px-5 py-3 text-left text-[14px] font-bold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:text-blue-600 hover:shadow-md active:scale-95"
                    >
                      {msg.followUp}
                    </button>
                  </div>
                )}
                {/* Global Message Footer (Disclaimer) */}
                {msg.disclaimer && (
                  <div className="mt-4 px-4 text-[11px] font-medium leading-relaxed text-slate-400">
                    <span className="font-bold text-slate-500 uppercase tracking-wider mr-2">Notice:</span> 
                    {msg.disclaimer}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex w-full items-start gap-3 px-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100">
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              </div>
              <div className="mt-1 flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F3D3E] transition-all duration-300">
                  {THINKING_PHASES[thinkingPhase]}
                </span>
                <div className="flex gap-1">
                  <div className="h-2 w-2 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Console */}
      <div className="border-t border-slate-100 bg-white/80 p-6 backdrop-blur-xl">
        <form 
          onSubmit={handleSubmit}
          className="relative mx-auto flex w-full max-w-4xl items-center rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition-all focus-within:border-[#0F3D3E]/30 focus-within:shadow-md focus-within:ring-4 focus-within:ring-[#0F3D3E]/5"
        >
          <Search className="ml-4 h-5 w-5 text-slate-400" />
          <input 
            type="text" 
            autoFocus
            className="flex-1 bg-transparent px-4 py-3 text-[16px] font-medium text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="Describe your symptoms or ask about clinical history..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 rounded-xl bg-[#0F3D3E] px-6 py-3 font-bold text-white transition-all hover:bg-[#0F3D3E]/90 disabled:opacity-50 disabled:grayscale"
          >
            {loading ? "Analyzing history..." : "Ask ImmunoTrace"} <ArrowRight className="h-4 w-4" />
          </button>
        </form>
        <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
          Powered by Clinical RAG & Ayush Intelligence Guardrails
        </p>
      </div>

    </div>
  );
}
