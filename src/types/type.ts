export interface Category {
  level: number;
  name: string;
  img?: string;
  description?: string;
  subCategories: Category[];
}