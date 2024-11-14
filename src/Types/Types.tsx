//Types
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

export type RecipeIngredient = {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity: number;
  quantityType: QuantityType;
};

//Enums

export enum QuantityType {
  GRAMS = 'grams',
  MILLILITERS = 'milliliters',
  PIECES = 'pieces',
  TABLESPOON = 'tablespoon',
  TEASPOON = 'teaspoon',
  CUPS = 'cups',
  // Add other units as needed
}
