"use client";

import { useState } from "react";

type ChatLine = {
  role: "user" | "assistant";
  content: string;
};

export function ChatClient() {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [thread, setThread] = useState<ChatLine[]>([
    {
      role: "assistant",
      content: "Describe your current symptoms and I will use your history to provide safe guidance.",
    },
  ]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = input.trim();
    if (!message) {
      return;
    }

    setError("");
    setIsSending(true);
    setInput("");
    setThread((current) => [...current, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const payload = await response.json();

      if (!payload?.success) {
        throw new Error(payload?.error?.message || "Chat request failed");
      }

      const assistantResponse = payload?.data?.response;
      if (!assistantResponse || typeof assistantResponse !== "string") {
        throw new Error("Invalid response format from server.");
      }

      setThread((current) => [...current, { role: "assistant", content: assistantResponse }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to fetch chat response.");
      setThread((current) => [
        ...current,
        { role: "assistant", content: "I could not process that. Please try again in a moment." },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-3 text-sm">
        {thread.map((line, index) => (
          <div
            key={`${line.role}-${index}`}
            className={
              line.role === "assistant"
                ? "rounded-xl bg-orange-50 p-3 text-slate-800"
                : "rounded-xl bg-slate-100 p-3 text-slate-800"
            }
          >
            {line.content}
          </div>
        ))}
      </div>

      <form className="mt-4 flex gap-2" onSubmit={onSubmit}>
        <input
          className="flex-1 rounded-lg border p-2"
          placeholder="Describe your symptoms"
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        <button
          disabled={isSending}
          className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-500 disabled:opacity-60"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      <p className="mt-3 text-xs text-slate-500">
        This assistant gives informational guidance only and does not provide diagnosis or dosage advice.
      </p>
    </section>
  );
}
