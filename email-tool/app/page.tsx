"use client";

import { useState } from "react";
import { RELATIONSHIPS, type RelationshipId } from "@/lib/relationships";

type Email = { subject: string; body: string };

export default function Home() {
  const [text, setText] = useState("");
  const [relationship, setRelationship] = useState<RelationshipId>("formal");
  const [email, setEmail] = useState<Email | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!text.trim()) {
      setError("日本語の内容を入力してください。");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // APIキーはサーバー側（/api/generate）でのみ使う
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, relationship }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが起きました。");
        return;
      }
      setEmail(data as Email);
    } catch {
      setError("通信できませんでした。インターネット接続を確認してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:py-16">
      <h1 className="text-2xl font-bold tracking-tight">英文メール作成</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        伝えたいことを日本語でざっくり書くと、自然な英文メールに整えます。
      </p>

      <section className="mt-8 space-y-6">
        <div>
          <label htmlFor="source" className="block text-sm font-medium">
            伝えたい内容（日本語）
          </label>
          <textarea
            id="source"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="例：来週の打ち合わせ、木曜の15時に変更してほしい。資料は前日までに送ります。"
            className="mt-2 w-full resize-y rounded-lg border border-zinc-300 bg-white p-3 text-base leading-relaxed outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium">相手との関係</legend>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {RELATIONSHIPS.map((r) => {
              const selected = r.id === relationship;
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRelationship(r.id)}
                  className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                    selected
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "作成中…" : "英文メールにする"}
        </button>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}
      </section>

      {email && (
        <section className="mt-10 space-y-4" aria-live="polite">
          <ResultBlock label="件名（Subject）" value={email.subject} />
          <ResultBlock label="本文（Body）" value={email.body} multiline />
        </section>
      )}
    </main>
  );
}

function ResultBlock({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("コピーできませんでした。手動で選択してコピーしてください。");
    }
  }

  return (
    <div className="rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-800">
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-md border border-zinc-300 px-3 py-1 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {copied ? "コピーしました" : "コピー"}
        </button>
      </div>
      <p
        className={`px-4 py-3 text-base leading-relaxed ${multiline ? "whitespace-pre-wrap" : "font-semibold"}`}
      >
        {value}
      </p>
    </div>
  );
}
