export type Collection = {
  name: string;
  level: number;
  slug: string;
  path: string;
  sub: Collection[];
  img?: string;
};
