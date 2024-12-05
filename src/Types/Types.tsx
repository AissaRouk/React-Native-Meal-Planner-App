//Types
export type Ingredient = {
  id: number;
  name: string;
  category: string;
};

export type IngredientWithoutId = Omit<Ingredient, 'id'>;

export type Recipe = {
  id: number;
  name: string;
  link: string;
  preparationTime: number;
  servingSize: number;
};
export type RecipeWithoutId = Omit<Recipe, 'id'>;

export type RecipeIngredient = {
  id: number;
  recipeId: number;
  ingredientId: number;
  quantity: number;
  quantityType: QuantityType;
};
export type RecipeIngredientWithoutId = Omit<RecipeIngredient, 'id'>;

export type Pantry = {
  id: number;
  ingredientPantry: number;
};
export type PantryWithoutId = Omit<Pantry, 'id'>;

export type IngredientPantry = {
  id: number;
  ingredientId: number;
  quantity: number;
  quantityType: QuantityType;
};
export type IngredientPantryWithoutId = Omit<IngredientPantry, 'id'>;

export type WeeklyMeal = {
  id: number;
  day: string; // Day of the week (e.g., "Monday")
  mealType: MealType; // Type of meal (e.g., "Breakfast", "Lunch", "Dinner")
  recipeId: number; // ID of the recipe assigned
};
export type WeeklyMealWithoutId = Omit<WeeklyMeal, 'id'>;

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

export enum MealType {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
}
