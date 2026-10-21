import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { isRelationshipId, type RelationshipId } from "@/lib/relationships";

// このファイルはサーバー側でのみ実行される。APIキーは画面側に渡らない。
const MODEL = "claude-haiku-5-5";
const MAX_INPUT_LENGTH = 4000;

const TONE_GUIDES: Record<RelationshipId, string> = {
  formal:
    "The recipient is the writer's boss or a business client. Use a polite, formal, professional tone (e.g. 'Dear Mr./Ms. ...', 'I would appreciate it if...', 'Best regards').",
  colleague:
    "The recipient is a coworker. Use a friendly but professional tone, clear and concise (e.g. 'Hi ...', 'Could you...', 'Thanks').",
  friend:
    "The recipient is a friend. Use a casual, warm, natural tone, like a native speaker writing to a friend (e.g. 'Hey ...', 'Cheers').",
};

const SYSTEM_PROMPT = `You turn rough Japanese notes into a natural English email written by a native-level speaker.

- Convey everything the Japanese notes say; do not invent facts, dates, names, or promises that are not in the notes.
- Reorganize and smooth the content so it reads like a well-written email, not a literal translation.
- If the recipient's or sender's name is not given, use a neutral greeting and sign-off without placeholders like [Name].
- The subject line should be short and specific.
- The body should include the greeting, the message, and the sign-off, with paragraphs separated by blank lines.`;

const EmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

const client = new Anthropic(); // ANTHROPIC_API_KEY 環境変数から読み込む

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "サーバーにAPIキーが設定されていません。.env.local を確認してください。" },
      { status: 500 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "リクエストの形式が正しくありません。" }, { status: 400 });
  }

  const { text, relationship } = (payload ?? {}) as { text?: unknown; relationship?: unknown };

  if (typeof text !== "string" || text.trim() === "") {
    return Response.json({ error: "日本語の内容を入力してください。" }, { status: 400 });
  }
  if (text.length > MAX_INPUT_LENGTH) {
    return Response.json(
      { error: `入力は${MAX_INPUT_LENGTH}文字以内にしてください。` },
      { status: 400 },
    );
  }
  if (!isRelationshipId(relationship)) {
    return Response.json({ error: "相手との関係を選んでください。" }, { status: 400 });
  }

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      output_config: {
        effort: "low",
        format: zodOutputFormat(EmailSchema),
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Tone: ${TONE_GUIDES[relationship]}\n\nJapanese notes:\n<notes>\n${text.trim()}\n</notes>`,
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return Response.json(
        { error: "この内容は変換できませんでした。内容を変えてお試しください。" },
        { status: 422 },
      );
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      return Response.json(
        { error: "英文の生成に失敗しました。もう一度お試しください。" },
        { status: 502 },
      );
    }

    return Response.json(response.parsed_output);
  } catch (error) {
    console.error("Anthropic API error:", error);
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json(
        { error: "APIキーが正しくありません。.env.local を確認してください。" },
        { status: 500 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json(
        { error: "混み合っています。少し待ってからお試しください。" },
        { status: 429 },
      );
    }
    return Response.json(
      { error: "AIとの通信でエラーが起きました。少し待ってからお試しください。" },
      { status: 502 },
    );
  }
}
