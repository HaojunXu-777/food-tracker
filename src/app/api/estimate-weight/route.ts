import { NextResponse } from "next/server";
import { chatWithImages, parseJsonObject } from "@/lib/ai/client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      nameZh?: string;
      images?: string[];
    };
    const nameZh = body.nameZh?.trim() ?? "";
    const images = Array.isArray(body.images) ? body.images.filter(Boolean) : [];
    if (!nameZh) {
      return NextResponse.json({ error: "缺少食物名称" }, { status: 400 });
    }
    if (images.length === 0) {
      return NextResponse.json({ error: "缺少餐食照片" }, { status: 400 });
    }

    const prompt = `根据这些餐食照片，估算「${nameZh}」的可食用重量（克）。
这只是建议值。
只返回 JSON：{"estimatedWeightGrams": 150}
不要返回自然语言，不要判断餐别或烹饪方式。`;

    const text = await chatWithImages(prompt, images.slice(0, 8));
    const parsed = parseJsonObject(text);
    const estimatedWeightGrams = Math.round(Number(parsed.estimatedWeightGrams));
    if (!Number.isFinite(estimatedWeightGrams) || estimatedWeightGrams <= 0) {
      return NextResponse.json({ error: "无法估算重量，请手动填写" }, { status: 502 });
    }
    return NextResponse.json({ estimatedWeightGrams });
  } catch (error) {
    const message = error instanceof Error ? error.message : "重量估算失败，请手动填写";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
