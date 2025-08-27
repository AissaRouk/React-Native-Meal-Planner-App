import {Recipe, RecipeWithoutId} from '../Types/Types';
import {FAILED, SUCCESS, TABLE_RECIPE} from './db-services';
import {
  collection,
  query,
  getDocs,
  getFirestore,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  where,
} from '@react-native-firebase/firestore';

// Fields for the Recipe table
export const RECIPE_ID = 'id';
export const RECIPE_NAME = 'name';
export const RECIPE_LINK = 'link';
export const RECIPE_PREP_TIME = 'preparationTime';
export const RECIPE_SERVING_SIZE = 'servingSize';

const firestoreDb = getFirestore();
const recipeCollection = collection(firestoreDb, TABLE_RECIPE);

//
//
//
//CRUD for Recipe Table
///
//
//

/**
 * Adds a new recipe to the Recipe table if it does not already exist.
 *
 * @param {RecipeWithoutId} recipe - The recipe object without the id param
 * @returns A promise that resolves when the recipe addition operation is complete.
 */
export const addRecipeDb: (
  recipe: RecipeWithoutId,
) => Promise<{
  created: boolean;
  insertedId?: string;
  response?: string;
}> = async recipe => {
  try {
    // Check if a recipe with the same name already exists
    const recipeQuery = query(
      recipeCollection,
      where('name', '==', recipe.name),
    );
    const querySnapshot = await getDocs(recipeQuery);

    if (!querySnapshot.empty) {
      console.warn(
        `Recipe with name "${recipe.name}" already exists. Skipping.`,
      );
      return {
        created: FAILED,
        response: `Recipe with name "${recipe.name}" already exists.`,
      };
    }

    // Adding with Firebase
    const newRecipeRef = doc(recipeCollection); // Create a new document reference with auto-generated ID
    const recipeWithId = {...recipe, id: newRecipeRef.id};
    await setDoc(newRecipeRef, recipeWithId);
    const addRef = newRecipeRef.id;
    console.log('addIngredient -> Firestore document added with ID:', addRef);

    return {created: SUCCESS, insertedId: addRef};
  } catch (error) {
    console.error('addRecipe -> Error adding the recipe:', error);
    return {created: FAILED};
  }
};

/**
 * Fetches all recipes from the Recipe table.
 *
 * @returns A promise that resolves to an array of Recipe objects.
 */
export const getRecipes: () => Promise<Recipe[]> = async () => {
  try {
    const fetchedRecipes: Recipe[] = [];

    // Fetching with Firebase
    const firebaseRecipes: Recipe[] = [];
    const ingredientsQuery = query(recipeCollection);
    const querySnapshot = await getDocs(ingredientsQuery);
    querySnapshot.forEach((doc: {data: () => RecipeWithoutId; id: any}) => {
      const data = doc.data() as RecipeWithoutId;
      const recipe: Recipe = {
        id: doc.id, // Use Firestore document ID as the ingredient ID
        name: data.name, // Ensure the name is present
        link: data.link || '', // Default to empty string if category is not provided
        preparationTime: data.preparationTime || 0, // Default to 0 if preparationTime is not provided
        servingSize: data.servingSize || 0, // Default to 0 if serving
      };
      firebaseRecipes.push(recipe);
    });
    console.log(
      'getRecipes Firebase -> Recipes fetched successfully:',
      JSON.stringify(fetchedRecipes),
    );

    return fetchedRecipes;
  } catch (error) {
    console.error('getRecipes -> Error fetching recipes:', error);
    return [];
  }
};

/**
 * Fetches a recipe from the Recipe table by its ID.
 *
 * This function retrieves a single recipe from the `Recipe` table based on the provided recipe ID.
 *
 * @async
 * @function getRecipeById
 * @param {number} id - The ID of the recipe to be fetched.
 * @returns {Promise<Recipe | null>} A promise that resolves to a `Recipe` object if found, or `null` if no recipe is found.
 */
export const getRecipeByIdDb: (
  id: string,
) => Promise<Recipe | null> = async id => {
  try {
    let recipe: Recipe | null = null;

    // Fetching with Firebase
    const recipeDocRef = doc(firestoreDb, TABLE_RECIPE, id);
    const recipeSnapShot = await getDoc(recipeDocRef);
    if (recipeSnapShot.exists()) {
      const data = recipeSnapShot.data() as RecipeWithoutId;
      recipe = {
        id: recipeSnapShot.id, // Use Firestore document ID as the recipe ID
        ...data,
      };
      console.log(
        'getRecipeById -> Firebase Recipe fetched successfully:' +
          JSON.stringify(recipe),
      );
      // return recipeData;
      // Optionally, you could assign ingredientData to recipe if you want to prefer Firestore data
      // recipe = ingredientData;
    }

    return recipe === undefined ? null : recipe;
  } catch (error) {
    console.error(
      'getRecipeById -> Transaction error:',
      error instanceof Error ? error : JSON.stringify(error),
    );
    return null;
  }
};

/**
 * Function that gets all the recipes.
 * @returns an array of all the recipes
 */
export const getAllRecipesDb = async (): Promise<Recipe[]> => {
  try {
    // Fetching with Firebase
    const firebaseRecipes: Recipe[] = [];
    const recipesQuery = query(recipeCollection);
    const querySnapshot = await getDocs(recipesQuery);
    querySnapshot.forEach((doc: {data: () => RecipeWithoutId; id: any}) => {
      const data = doc.data() as RecipeWithoutId;
      const frecipe: Recipe = {
        id: doc.id, // Use Firestore document ID as the ingredient ID
        name: data.name, // Ensure the name is present
        link: data.link || '', // Default to empty string if category is not provided
        preparationTime: data.preparationTime || 0, // Default to 0 if preparationTime is not provided
        servingSize: data.servingSize, // Default to 0 if serving
      };
      firebaseRecipes.push(frecipe);
    });
    console.log(
      'getIngredients Firebase -> Ingredients fetched successfully:' +
        JSON.stringify(firebaseRecipes),
    );

    return firebaseRecipes;
  } catch (error) {
    throw new Error('getRecipes -> Error while retrieving: ' + error);
  }
};

/**
 * Function to update an existing recipe
 *
 * @param {Recipe} recipe - The recipe that will be updated
 * @returns {Promise<boolean>} - True if updated successfully, false otherwise
 */
export const updateRecipe = async (recipe: Recipe): Promise<boolean> => {
  try {
    await setDoc(doc(recipeCollection, recipe.name), recipe);
    return true;
  } catch (error) {
    console.error('Error in updateRecipe:', error);
    throw new Error('Error while updating recipe: ' + error);
  }
};

/**
 * Function to delete recipe
 *
 * @param {number} id the id of the Recipe to delete
 */
export const deleteRecipe: (id: string) => Promise<void> = async id => {
  // Firebase Implementation
  const recipeDoc = doc(recipeCollection, id.toString());
  await deleteDoc(recipeDoc);
  console.log('deleteRecipe -> Firestore document deleted successfully.');
};
