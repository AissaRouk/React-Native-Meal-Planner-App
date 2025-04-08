import {fillTablesWMockupData, initialiseTables} from '../Screens/sucio';
import {Ingredient} from '../Types/Types';
import {getAllIngredients} from './db-services';

//this function will initialize the whole database and fetch all the tables necessary to have everything ready for the program to work
export const initialise: () => Promise<Ingredient[]> = async () => {
  try {
    await initialiseTables(); // Initializes the database tables
    await fillTablesWMockupData(); // Fills the tables with mock data for testing
    const ingredients = await getAllIngredients(); // Fetches all the ingredients in the db
    console.log('fetched ingredients: ' + JSON.stringify(ingredients));
    return ingredients;
  } catch (error) {
    throw new Error('dataManager.initialize -> ' + error);
  }
};
