// 画面とサーバーの両方で使う「相手との関係」の選択肢（秘密情報は含まない）
export const RELATIONSHIPS = [
  { id: "formal", label: "上司・取引先" },
  { id: "colleague", label: "同僚" },
  { id: "friend", label: "友人" },
] as const;

export type RelationshipId = (typeof RELATIONSHIPS)[number]["id"];

export function isRelationshipId(value: unknown): value is RelationshipId {
  return RELATIONSHIPS.some((r) => r.id === value);
}
