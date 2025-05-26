import {Recipe} from '../Types/Types';

export const handleOnSetQuantity = (quantity: number): number => {
  if (quantity < 0) return 0;
  else return quantity;
};

/**
 * Function that checks that the recipe contains all the necessary values
 * @param recipe the recipe to check
 * @returns true if the recipe is correct, false if it's not correct
 */
export const verifyRecipe = (recipe: Recipe): boolean => {
  if (recipe.name && recipe.servingSize) {
    return true;
  }
  return false;
};
