type ChatContent =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

type ChatResponse = {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
};

export async function chatWithImages(prompt: string, imageDataUrls: string[]): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("未配置 AI_API_KEY，请在服务端环境变量中设置");
  }

  const base = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const content: ChatContent[] = [
    { type: "text", text: prompt },
    ...imageDataUrls.map((url) => ({
      type: "image_url" as const,
      image_url: { url },
    })),
  ];

  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content }],
    }),
  });

  const data = (await response.json()) as ChatResponse;
  if (!response.ok) {
    throw new Error("AI 服务暂时不可用，请稍后重试");
  }
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("AI 没有返回有效结果");
  }
  return text;
}

export function parseJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : trimmed;
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("AI 返回格式无效");
  }
  return parsed as Record<string, unknown>;
}
