import {Ingredient} from '../Types/Types';
import {dropAllTables} from './db-services';
import {
  createIngredientTable,
  getAllIngredients,
} from './ingredient-db-services';
import {createIngredientPantryTable} from './ingredientPantry-db-services';
import {createPantryTable} from './pantry-db-services';
import {createRecipeTable} from './recipe-db-services';
import {createRecipeIngredientTable} from './recipeIngredients-db-services';
import {createWeeklyMealsTable} from './weeklyMeals-db-services';

//this function will initialize the whole database and fetch all the tables necessary to have everything ready for the program to work
export const initialise: () => Promise<Ingredient[]> = async () => {
  try {
    await initialiseTables(); // Initializes the database tables
    const ingredients = await getAllIngredients(); // Fetches all the ingredients in the db
    console.log('fetched ingredients: ' + JSON.stringify(ingredients));
    return ingredients;
  } catch (error) {
    throw new Error('dataManager.initialize -> ' + error);
  }
};

export const initialiseTables = async () => {
  // await dropAllTables();
  await createIngredientTable();
  await createRecipeTable();
  await createRecipeIngredientTable();
  await createWeeklyMealsTable();
  await createPantryTable();
  await createIngredientPantryTable();
};
