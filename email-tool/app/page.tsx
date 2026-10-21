"use client";

import { useState } from "react";
import { CHANNELS, type ChannelId } from "@/lib/channels";
import { RELATIONSHIPS, type RelationshipId } from "@/lib/relationships";

type Result = { subject: string; body: string } | { message: string };

export default function Home() {
  const [text, setText] = useState("");
  const [channel, setChannel] = useState<ChannelId>("email");
  const [relationship, setRelationship] = useState<RelationshipId>("formal");
  const [result, setResult] = useState<Result | null>(null);
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
        body: JSON.stringify({ text, relationship, channel }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "エラーが起きました。");
        return;
      }
      setResult(data as Result);
    } catch {
      setError("通信できませんでした。インターネット接続を確認してください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:py-16">
      <h1 className="text-2xl font-bold tracking-tight">英文メッセージ作成</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        伝えたいことを日本語でざっくり書くと、自然な英文のメールやチャットに整えます。
      </p>

      <section className="mt-8 space-y-6">
        <OptionGroup
          legend="送り先"
          options={CHANNELS}
          value={channel}
          onChange={(id) => {
            setChannel(id);
            setResult(null);
          }}
          columns="grid-cols-2 sm:grid-cols-4"
        />

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

        <OptionGroup
          legend="相手との関係"
          options={RELATIONSHIPS}
          value={relationship}
          onChange={setRelationship}
          columns="grid-cols-3"
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {loading ? "作成中…" : channel === "email" ? "英文メールにする" : "英文メッセージにする"}
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

      {result && (
        <section className="mt-10 space-y-4" aria-live="polite">
          {"message" in result ? (
            <ResultBlock label="メッセージ" value={result.message} multiline />
          ) : (
            <>
              <ResultBlock label="件名（Subject）" value={result.subject} />
              <ResultBlock label="本文（Body）" value={result.body} multiline />
            </>
          )}
        </section>
      )}
    </main>
  );
}

function OptionGroup<T extends string>({
  legend,
  options,
  value,
  onChange,
  columns,
}: {
  legend: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  columns: string;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div className={`mt-2 grid gap-2 ${columns}`}>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.id)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-zinc-300 bg-white hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
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
