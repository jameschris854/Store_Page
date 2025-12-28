import type { Collection } from "../types/type";

export function buildCategorySchema(
  rows: Record<string, string>[]
): Collection[] {
  const result: Collection[] = [];

  function findOrCreate(arr: Collection[], name: string, level: number): Collection {
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