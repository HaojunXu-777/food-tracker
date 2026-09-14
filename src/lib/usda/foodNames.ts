const FOOD_MAP: { zh: string; en: string }[] = [
  { zh: "鸡胸肉", en: "chicken breast" },
  { zh: "鸡腿肉", en: "chicken thigh" },
  { zh: "鸡翅", en: "chicken wing" },
  { zh: "鸡蛋", en: "egg" },
  { zh: "白米饭", en: "cooked white rice" },
  { zh: "米饭", en: "cooked rice" },
  { zh: "糙米", en: "brown rice" },
  { zh: "面条", en: "noodles" },
  { zh: "面包", en: "bread" },
  { zh: "燕麦", en: "oats" },
  { zh: "西兰花", en: "broccoli" },
  { zh: "菠菜", en: "spinach" },
  { zh: "生菜", en: "lettuce" },
  { zh: "番茄", en: "tomato" },
  { zh: "黄瓜", en: "cucumber" },
  { zh: "胡萝卜", en: "carrot" },
  { zh: "土豆", en: "potato" },
  { zh: "红薯", en: "sweet potato" },
  { zh: "玉米", en: "corn" },
  { zh: "苹果", en: "apple" },
  { zh: "香蕉", en: "banana" },
  { zh: "橙子", en: "orange" },
  { zh: "草莓", en: "strawberry" },
  { zh: "蓝莓", en: "blueberry" },
  { zh: "葡萄", en: "grape" },
  { zh: "牛奶", en: "milk" },
  { zh: "酸奶", en: "yogurt" },
  { zh: "奶酪", en: "cheese" },
  { zh: "牛肉", en: "beef" },
  { zh: "猪肉", en: "pork" },
  { zh: "瘦猪肉", en: "lean pork" },
  { zh: "三文鱼", en: "salmon" },
  { zh: "金枪鱼", en: "tuna" },
  { zh: "虾", en: "shrimp" },
  { zh: "豆腐", en: "tofu" },
  { zh: "豆浆", en: "soy milk" },
  { zh: "花生酱", en: "peanut butter" },
  { zh: "杏仁", en: "almond" },
  { zh: "核桃", en: "walnut" },
  { zh: "橄榄油", en: "olive oil" },
  { zh: "黄油", en: "butter" },
  { zh: "牛油果", en: "avocado" },
];

const HAS_CJK = /[\u4e00-\u9fff]/;

export function resolveSearchQuery(raw: string): {
  usdaQuery: string;
  displayNameZh: string;
} {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  const byZh = [...FOOD_MAP].sort((a, b) => b.zh.length - a.zh.length).find((item) => trimmed.includes(item.zh));
  if (byZh) {
    return { usdaQuery: byZh.en, displayNameZh: byZh.zh };
  }

  const byEn = [...FOOD_MAP]
    .sort((a, b) => b.en.length - a.en.length)
    .find((item) => lower.includes(item.en));
  if (byEn) {
    return { usdaQuery: byEn.en, displayNameZh: byEn.zh };
  }

  return {
    usdaQuery: trimmed,
    displayNameZh: HAS_CJK.test(trimmed) ? trimmed : "",
  };
}

export function chineseNameFor(description: string, fallbackZh: string): string {
  const lower = description.toLowerCase();
  const match = [...FOOD_MAP]
    .sort((a, b) => b.en.length - a.en.length)
    .find((item) => lower.includes(item.en));
  if (match) return match.zh;
  if (fallbackZh) return fallbackZh;
  return description;
}
