//Types
export type Ingredient = {
  id: string;
  name: string;
  category: string;
};

export type IngredientWithoutId = Omit<Ingredient, 'id'>;

export type Recipe = {
  id: number | string;
  name: string;
  link?: string;
  preparationTime?: number;
  servingSize: number;
};
export type RecipeWithoutId = Omit<Recipe, 'id'>;

export type RecipeIngredient = {
  id: string;
  recipeId: string;
  ingredientId: string;
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
  id: string;
  day: DaysOfWeek; // Day of the week (e.g., "Monday")
  mealType: MealType; // Type of meal (e.g., "Breakfast", "Lunch", "Dinner")
  recipeId: string; // ID of the recipe assigned
};
export type WeeklyMealWithoutId = Omit<WeeklyMeal, 'id'>;

//Enums

export enum QuantityType {
  UNIT = 'UNIT',
  GRAM = 'GRAM',
  KILOGRAM = 'KILOGRAM',
  MILLILITER = 'MILLILITER',
  LITER = 'LITER',
  CUP = 'CUP',
  TABLESPOON = 'TABLESPOON',
  TEASPOON = 'TEASPOON',
}

//Array of the quantityTypes
export const quantityTypes: QuantityType[] = Object.values(QuantityType);

export enum MealType {
  BREAKFAST = 'Breakfast',
  LUNCH = 'Lunch',
  DINNER = 'Dinner',
}

export enum DaysOfWeek {
  MONDAY = 'Mon',
  TUESDAY = 'Tue',
  WEDNESDAY = 'Wed',
  THURSDAY = 'Thu',
  FRIDAY = 'Fri',
  SATURDAY = 'Sat',
  SUNDAY = 'Sun',
}

export enum ErrorResponseCodes {
  SUCCESS = 200,
  ALREADY_EXISTS = 409,
  ERROR = 0,
}
