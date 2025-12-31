import PublicGoogleSheetsParser from "public-google-sheets-parser";
import { buildCollectionTree } from "../utils/categoryParser";
import type { Collection } from "../types/type";

let cache: Collection[] | null = null;

export async function getCollectionsTree(): Promise<Collection[]> {
  if (cache) return cache;

  const collectionParser = new PublicGoogleSheetsParser(
    import.meta.env.VITE_SHEET_ID,
    { sheetName: "COLLECTIONS" }
  );

  const mastersParser = new PublicGoogleSheetsParser(
    import.meta.env.VITE_SHEET_ID,
    { sheetName: "COLLECTION MASTER" }
  );

  return Promise.all([collectionParser.parse(), mastersParser.parse()]).then(
    ([collectionData, masterData]) => {
      const masterMap: Record<string, any> = {};
      masterData.forEach((row: any) => {
        masterMap[row.cat_name] = row;
      });
      cache = buildCollectionTree(collectionData, masterData);
      return cache;
    }
  );
}
