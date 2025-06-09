import {useNavigation} from '@react-navigation/native';
import {
  Ingredient,
  Recipe,
  RecipeIngredient,
  Pantry,
  IngredientPantry,
  WeeklyMeal,
  QuantityType,
  MealType,
  DaysOfWeek,
  IngredientWithoutId,
  RecipeIngredientWithoutId,
} from '../Types/Types';
import {
  GroceryListScreenName,
  MainScreenName,
  PantryScreenName,
  RecipeScreenName,
  RecipesScreenName,
} from '../../App';

export const handleOnSetQuantity = (quantity: number): number => {
  if (quantity < 0) return 0;
  else return quantity;
};

// conversion to a base unit (e.g. grams for weight, ml for volume)
const CONVERSION_FACTORS: Record<QuantityType, number> = {
  [QuantityType.GRAM]: 1,
  [QuantityType.KILOGRAM]: 1000,
  [QuantityType.MILLILITER]: 1,
  [QuantityType.LITER]: 1000,
  [QuantityType.CUP]: 240, // ml
  [QuantityType.TABLESPOON]: 15, // ml
  [QuantityType.TEASPOON]: 5, // ml
  [QuantityType.UNIT]: 1, // no conversion
};
export function normalize(quantity: number, type: QuantityType) {
  return quantity * (CONVERSION_FACTORS[type] || 1);
}
export function denormalize(normalized: number, toType: QuantityType): number {
  return normalized / (CONVERSION_FACTORS[toType] || 1);
}

// Utils/validators.ts

/**
 * Verifies that an Ingredient has a positive id, a non‐empty name, and a non‐empty category.
 */
export const verifyIngredient = (ingredient: Ingredient): boolean => {
  if (
    typeof ingredient.id === 'number' &&
    ingredient.id > 0 &&
    typeof ingredient.name === 'string' &&
    ingredient.name.trim().length > 0 &&
    typeof ingredient.category === 'string' &&
    ingredient.category.trim().length > 0
  ) {
    return true;
  }
  return false;
};

/**
 * Verifies that an Ingredient has a positive id, a non‐empty name, and a non‐empty category.
 */
export const verifyIngredientWithoutId = (
  ingredient: IngredientWithoutId,
): boolean => {
  if (
    typeof ingredient.name === 'string' &&
    ingredient.name.trim().length > 0 &&
    typeof ingredient.category === 'string' &&
    ingredient.category.trim().length > 0
  ) {
    return true;
  }
  return false;
};

/**
 * Verifies a Recipe:
 *  • id must be a positive number
 *  • name must be a non‐empty string
 *  • servingSize must be a positive number
 *  • link (if provided) must be a non‐empty string
 *  • preparationTime (if provided) must be ≥ 0
 */
export const verifyRecipe = (recipe: Recipe): boolean => {
  if (
    typeof recipe.id === 'number' &&
    recipe.id > 0 &&
    typeof recipe.name === 'string' &&
    recipe.name.trim().length > 0 &&
    typeof recipe.servingSize === 'number' &&
    recipe.servingSize > 0 &&
    (recipe.link === undefined || recipe.link.trim().length > 0) &&
    (recipe.preparationTime === undefined || recipe.preparationTime >= 0)
  ) {
    return true;
  }
  return false;
};

/**
 * Verifies a RecipeIngredient:
 *  • id, recipeId, ingredientId must be positive numbers
 *  • quantity must be ≥ 0
 *  • quantityType must be one of the known enum entries
 */
export const verifyRecipeIngredient = (ri: RecipeIngredient): boolean => {
  const validQuantityTypeValues: string[] = Object.values(QuantityType);
  if (
    typeof ri.id === 'number' &&
    ri.id > 0 &&
    typeof ri.recipeId === 'number' &&
    ri.recipeId > 0 &&
    typeof ri.ingredientId === 'number' &&
    ri.ingredientId > 0 &&
    typeof ri.quantity === 'number' &&
    ri.quantity >= 0 &&
    typeof ri.quantityType === 'string' &&
    validQuantityTypeValues.includes(ri.quantityType)
  ) {
    return true;
  }
  return false;
};

export const verifyRecipeIngredientWithoutId = (
  ri: RecipeIngredientWithoutId,
): boolean => {
  const validQuantityTypeValues: string[] = Object.values(QuantityType);
  if (
    typeof ri.recipeId === 'number' &&
    ri.recipeId > 0 &&
    typeof ri.ingredientId === 'number' &&
    ri.ingredientId > 0 &&
    typeof ri.quantity === 'number' &&
    ri.quantity >= 0 &&
    typeof ri.quantityType === 'string' &&
    validQuantityTypeValues.includes(ri.quantityType)
  ) {
    return true;
  }
  return false;
};

/**
 * Verifies a Pantry:
 *  • id must be positive
 *  • ingredientPantry must be a positive number (it represents an ingredientId)
 */
export const verifyPantry = (p: Pantry): boolean => {
  if (
    typeof p.id === 'number' &&
    p.id > 0 &&
    typeof p.ingredientPantry === 'number' &&
    p.ingredientPantry > 0
  ) {
    return true;
  }
  return false;
};

/**
 * Verifies an IngredientPantry:
 *  • id, ingredientId must be positive
 *  • quantity must be ≥ 0
 *  • quantityType must be one of the enum values
 */
export const verifyIngredientPantry = (ip: IngredientPantry): boolean => {
  const validQuantityTypeValues: string[] = Object.values(QuantityType);
  if (
    typeof ip.id === 'number' &&
    ip.id > 0 &&
    typeof ip.ingredientId === 'number' &&
    ip.ingredientId > 0 &&
    typeof ip.quantity === 'number' &&
    ip.quantity >= 0 &&
    typeof ip.quantityType === 'string' &&
    validQuantityTypeValues.includes(ip.quantityType)
  ) {
    return true;
  }
  return false;
};

/**
 * Verifies a WeeklyMeal:
 *  • id must be positive
 *  • day must be one of the DaysOfWeek enum values
 *  • mealType must be one of the MealType enum values
 *  • recipeId must be positive
 */
export const verifyWeeklyMeal = (wm: WeeklyMeal): boolean => {
  const validDays: string[] = Object.values(DaysOfWeek);
  const validMeals: string[] = Object.values(MealType);

  if (
    typeof wm.id === 'number' &&
    wm.id > 0 &&
    typeof wm.day === 'string' &&
    validDays.includes(wm.day) &&
    typeof wm.mealType === 'string' &&
    validMeals.includes(wm.mealType) &&
    typeof wm.recipeId === 'number' &&
    wm.recipeId > 0
  ) {
    return true;
  }
  return false;
};

// NAVIGATION
const navigation = useNavigation();

type Destination =
  | {screen: 'Recipes'}
  | {screen: 'Recipe'; params: {recipe: Recipe}}
  | {screen: 'Pantry'}
  | {screen: 'GroceyList'}
  | {screen: 'Login'}
  | {screen: 'Main'}
  | {screen: 'Register'};

export const handleNavigate = (dest: Destination) => {
  switch (dest.screen) {
    case 'Recipes':
      (navigation as any).navigate(RecipesScreenName);
      break;
    case 'Recipe':
      (navigation as any).navigate(RecipeScreenName, dest.params);
      break;
    case 'Pantry':
      (navigation as any).navigate(PantryScreenName);
      break;
    case 'GroceyList':
      (navigation as any).navigate(GroceryListScreenName);
      break;
    case 'Main':
      (navigation as any).navigate(MainScreenName);
      break;
    case 'Login':
      (navigation as any).navigate(MainScreenName);
      break;
    case 'Register':
      (navigation as any).navigate(RecipeScreenName);
      break;
  }
};
