export type Ingredient = {
  id: number;
  name: string;
  category: string;
};

export type Recipe = {
  id: number;
  name: string;
  link: string;
  preparationTime: number;
  servingSize: number;
};
