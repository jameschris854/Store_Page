import type { Category } from "../types/type";

export function buildCategorySchema(
  rows: Record<string, string>[]
): Category[] {
  const result: Category[] = [];

  function findOrCreate(arr: Category[], name: string, level: number): Category {
    let node = arr.find(item => item.name === name);
    if (!node) {
      node = { level, name, subCategories: [] };
      arr.push(node);
    }
    return node;
  }

  rows.forEach(row => {
    let current = result;

    for (let level = 1; level <= 4; level++) {
      const name = row[String(level)];
      if (!name) break;

      const node = findOrCreate(current, name, level);
      current = node.subCategories;
    }
  });

  return result;
}