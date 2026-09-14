import { NextResponse } from "next/server";
import type { NutritionSearchItem } from "@/lib/nutrition";
import { chineseNameFor, resolveSearchQuery } from "@/lib/usda/foodNames";
import { parseUsdaFood } from "@/lib/usda/parseFood";

type UsdaSearchResponse = {
  foods?: unknown[];
  error?: { message?: string };
  message?: string;
};

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!query) {
    return NextResponse.json({ error: "请输入食物名称" }, { status: 400 });
  }

  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "未配置 USDA_API_KEY，请在服务端环境变量中设置" },
      { status: 500 },
    );
  }

  const { usdaQuery, displayNameZh } = resolveSearchQuery(query);
  const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
  url.searchParams.set("query", usdaQuery);
  url.searchParams.set("pageSize", "10");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.append("dataType", "Foundation");
  url.searchParams.append("dataType", "SR Legacy");
  url.searchParams.append("dataType", "Survey (FNDDS)");

  try {
    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json(
        { error: "营养数据库暂时不可用，请稍后重试" },
        { status: 502 },
      );
    }

    const data = (await response.json()) as UsdaSearchResponse;
    const foods = Array.isArray(data.foods) ? data.foods : [];
    const items: NutritionSearchItem[] = [];

    for (const food of foods) {
      const parsed = parseUsdaFood(food as Parameters<typeof parseUsdaFood>[0]);
      if (!parsed) continue;
      items.push({
        fdcId: parsed.fdcId,
        nameEn: parsed.nameEn,
        nameZh: chineseNameFor(parsed.nameEn, displayNameZh),
        caloriesPer100g: parsed.caloriesPer100g,
        proteinPer100g: parsed.proteinPer100g,
        carbsPer100g: parsed.carbsPer100g,
        fatPer100g: parsed.fatPer100g,
        servingGrams: parsed.servingGrams,
      });
      if (items.length >= 8) break;
    }

    return NextResponse.json({ items, usdaQuery });
  } catch {
    return NextResponse.json(
      { error: "网络异常，无法查询营养数据" },
      { status: 503 },
    );
  }
}
