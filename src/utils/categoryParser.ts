import type { Collection } from "../types/type";
import { slugify } from "./slug";

export function buildCollectionTree(
  collectionRows: Record<string, string>[],
  masterRows: any[]
): Collection[] {
  const imageMap = new Map<string, string>();

  masterRows.forEach((row) => {
    if (row.cat_name && row.img) {
      imageMap.set(row.cat_name.trim(), row.img);
    }
  });

  const result: Collection[] = [];

  function findOrCreate(
    arr: Collection[],
    name: string,
    level: number,
    parentPath: string
  ): Collection {
    let node = arr.find((i) => i.name === name);

    if (!node) {
      const slug = slugify(name);
      const path = parentPath ? `${parentPath}/${slug}` : slug;

      node = {
        name,
        level,
        slug,
        path,
        img: imageMap.get(name), // ✅ hydrated HERE
        sub: []
      };

      arr.push(node);
    }

    return node;
  }

  collectionRows.forEach((row) => {
    let current = result;
    let parentPath = "";

    for (let level = 1; level <= 4; level++) {
      const name = row[String(level)];
      if (!name) break;

      const node = findOrCreate(current, name, level, parentPath);
      parentPath = node.path;
      current = node.sub;
    }
  });

  return result;
}
