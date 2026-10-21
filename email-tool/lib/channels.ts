// 画面とサーバーの両方で使う「送り先」の選択肢（秘密情報は含まない）
export const CHANNELS = [
  { id: "email", label: "メール" },
  { id: "line", label: "LINE" },
  { id: "instagram", label: "Instagram" },
  { id: "whatsapp", label: "WhatsApp" },
] as const;

export type ChannelId = (typeof CHANNELS)[number]["id"];

export function isChannelId(value: unknown): value is ChannelId {
  return CHANNELS.some((c) => c.id === value);
}
