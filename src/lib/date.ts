export function todayDate(): string {
  return formatISODate(new Date());
}

export function formatISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseISODate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = parseISODate(value);
  return formatISODate(parsed) === value;
}

export function formatDateDisplay(date: string): string {
  const [y, m, d] = date.split("-");
  return `${y}/${m}/${d}`;
}

export function formatMonthTitle(date: string): string {
  const parsed = parseISODate(date);
  return `${parsed.getFullYear()}年${parsed.getMonth() + 1}月`;
}

export function formatListDate(date: string): string {
  const parsed = parseISODate(date);
  return `${parsed.getMonth() + 1}月${parsed.getDate()}日`;
}

export function addDays(date: string, delta: number): string {
  const parsed = parseISODate(date);
  parsed.setDate(parsed.getDate() + delta);
  return formatISODate(parsed);
}

export function dateRange(endDate: string, days: number): string[] {
  const start = addDays(endDate, -(days - 1));
  const result: string[] = [];
  let current = start;
  while (current <= endDate) {
    result.push(current);
    current = addDays(current, 1);
  }
  return result;
}

export function monthCells(year: number, monthIndex: number): (string | null)[] {
  const first = new Date(year, monthIndex, 1);
  const days = new Date(year, monthIndex + 1, 0).getDate();
  const leading = first.getDay();
  const cells: (string | null)[] = [];
  for (let i = 0; i < leading; i += 1) cells.push(null);
  for (let day = 1; day <= days; day += 1) {
    cells.push(formatISODate(new Date(year, monthIndex, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
