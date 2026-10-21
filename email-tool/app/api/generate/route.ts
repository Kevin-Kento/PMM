import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { isChannelId, type ChannelId } from "@/lib/channels";
import { isRelationshipId, type RelationshipId } from "@/lib/relationships";

// このファイルはサーバー側でのみ実行される。APIキーは画面側に渡らない。
const MODEL = "claude-haiku-5-5";
const MAX_INPUT_LENGTH = 4000;

const TONE_GUIDES: Record<RelationshipId, string> = {
  formal:
    "The recipient is the writer's boss or a business client. Use a polite, respectful, professional tone.",
  colleague:
    "The recipient is a coworker. Use a friendly but professional tone, clear and concise.",
  friend:
    "The recipient is a friend. Use a casual, warm, natural tone, like a native speaker talking to a friend.",
};

const EMAIL_SYSTEM_PROMPT = `You turn rough Japanese notes into a natural English email written by a native-level speaker.

- Convey everything the Japanese notes say; do not invent facts, dates, names, or promises that are not in the notes.
- Reorganize and smooth the content so it reads like a well-written email, not a literal translation.
- Match the greeting and sign-off to the relationship (e.g. "Dear ..." / "Best regards" for a boss or client, "Hi ..." / "Thanks" for a coworker, "Hey ..." / "Cheers" for a friend).
- If the recipient's or sender's name is not given, use a neutral greeting and sign-off without placeholders like [Name].
- The subject line should be short and specific.
- The body should include the greeting, the message, and the sign-off, with paragraphs separated by blank lines.`;

const CHAT_STYLE_GUIDES: Record<Exclude<ChannelId, "email">, string> = {
  line: "The message will be sent on LINE. Keep it short and conversational, like a quick text; use few line breaks.",
  instagram:
    "The message will be sent as an Instagram DM. Keep it light and friendly, the way people write DMs on Instagram.",
  whatsapp:
    "The message will be sent on WhatsApp. Write it like a natural chat message a native speaker would send on WhatsApp.",
};

const CHAT_SYSTEM_PROMPT = `You turn rough Japanese notes into a natural English chat message written by a native-level speaker.

- Convey everything the Japanese notes say; do not invent facts, dates, names, or promises that are not in the notes.
- Write it as a chat message, not an email: no subject, no "Dear ...", no "Best regards" or other email sign-offs.
- Keep it concise; split into short lines only where it helps readability.
- Emoji: for a friend or coworker, a few fitting emoji are fine but optional; for a boss or business client, use no emoji.
- If a name is not given, do not add placeholders like [Name].`;

const EmailSchema = z.object({
  subject: z.string(),
  body: z.string(),
});

const ChatSchema = z.object({
  message: z.string(),
});

const client = new Anthropic(); // ANTHROPIC_API_KEY 環境変数から読み込む

function buildUserContent(text: string, relationship: RelationshipId, channel: ChannelId) {
  const style = channel === "email" ? "" : `\nChannel: ${CHAT_STYLE_GUIDES[channel]}`;
  return `Tone: ${TONE_GUIDES[relationship]}${style}\n\nJapanese notes:\n<notes>\n${text.trim()}\n</notes>`;
}

async function generate(text: string, relationship: RelationshipId, channel: ChannelId) {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: buildUserContent(text, relationship, channel) },
  ];
  if (channel === "email") {
    return client.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: "low", format: zodOutputFormat(EmailSchema) },
      system: EMAIL_SYSTEM_PROMPT,
      messages,
    });
  }
  return client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: "low", format: zodOutputFormat(ChatSchema) },
    system: CHAT_SYSTEM_PROMPT,
    messages,
  });
}

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

  const { text, relationship, channel } = (payload ?? {}) as {
    text?: unknown;
    relationship?: unknown;
    channel?: unknown;
  };

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
  if (!isChannelId(channel)) {
    return Response.json({ error: "送り先を選んでください。" }, { status: 400 });
  }

  try {
    const response = await generate(text, relationship, channel);

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
