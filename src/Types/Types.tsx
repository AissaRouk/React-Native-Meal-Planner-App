//Types
export type Ingredient = {
  id: string;
  name: string;
  category: string;
};

export type IngredientWithoutId = Omit<Ingredient, 'id'>;

export type Recipe = {
  id: string;
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
  id: string;
  ingredientId: string;
  quantity: number;
  quantityType: QuantityType;
};
export type IngredientPantryWithoutId = Omit<IngredientPantry, 'id'>;

export enum WeeklyEntryType {
  RECIPE = 'RECIPE',
  INGREDIENT = 'INGREDIENT',
}

// Extend WeeklyMeal to support either a recipe or a single ingredient entry.
// Keep entryType optional for backward-compat with old docs (treat missing as RECIPE).
export type WeeklyMeal = {
  id: string;
  day: DaysOfWeek;
  mealType: MealType;
  entryType?: WeeklyEntryType; // defaults to RECIPE if undefined
  // RECIPE variant
  recipeId?: string;
  // INGREDIENT variant
  ingredientId?: string;
  quantity?: number;
  quantityType?: QuantityType;
  createdAt?: number | Date;
};

export type WeeklyMealWithoutId = Omit<WeeklyMeal, 'id'>;

export type GroceryBought = {
  id: string;
  ingredientId: string; // ID of the ingredient that was bought
  timestamp: number; // Timestamp when the ingredient was bought
};

//Enums

export enum QuantityType {
  UNIT = 'unit',
  GRAM = 'gram',
  KILOGRAM = 'kilogram',
  MILLILITER = 'milliliter',
  LITER = 'liter',
  CUP = 'cup',
  TABLESPOON = 'tablespoon',
  TEASPOON = 'teaspoon',
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
