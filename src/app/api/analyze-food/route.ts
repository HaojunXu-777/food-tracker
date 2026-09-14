import { NextResponse } from "next/server";
import { chatWithImages, parseJsonObject } from "@/lib/ai/client";

const PROMPT = `你只识别这些餐食照片里出现了哪些食物。
只返回 JSON，不要自然语言，不要置信度，不要判断餐别，不要判断烹饪方式，不要估算重量，不要合并重复食物。
不同照片里出现的相同食物也要分别列出。
食物名称必须是中文。
格式：
{"foods":[{"nameZh":"白米饭"},{"nameZh":"鸡胸肉"}]}`;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { images?: string[] };
    const images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
    if (images.length === 0) {
      return NextResponse.json({ error: "请先选择照片" }, { status: 400 });
    }

    const text = await chatWithImages(PROMPT, images.slice(0, 8));
    const parsed = parseJsonObject(text);
    const rawFoods = Array.isArray(parsed.foods) ? parsed.foods : [];
    const foods = rawFoods
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const nameZh = String((item as { nameZh?: unknown }).nameZh ?? "").trim();
        return nameZh ? { nameZh } : null;
      })
      .filter((item): item is { nameZh: string } => item != null);

    return NextResponse.json({ foods });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 识别失败，请改为手动添加";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
