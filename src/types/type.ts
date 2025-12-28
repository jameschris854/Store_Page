export interface Collection {
  level: number;
  name: string;
  img?: string;
  description?: string;
  subCategories: Collection[];
}