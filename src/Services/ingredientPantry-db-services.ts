import {IngredientPantry, IngredientPantryWithoutId} from '../Types/Types';
import {
  collection,
  query,
  getDocs,
  getFirestore,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  addDoc,
  where,
} from '@react-native-firebase/firestore';

// Fields for the IngredientPantry table
export const INGREDIENT_PANTRY_ID = 'id';
export const INGREDIENT_PANTRY_INGREDIENT_ID = 'ingredientId';
export const INGREDIENT_PANTRY_QUANTITY = 'quantity';
export const INGREDIENT_PANTRY_QUANTITY_TYPE = 'quantityType';
export const TABLE_INGREDIENT_PANTRY = 'IngredientPantry';

const firestoreDb = getFirestore();
const ingredientPantryCollection = collection(
  firestoreDb,
  TABLE_INGREDIENT_PANTRY,
);

/**
 * Function that adds a pantry row to the Firestore table
 *
 * @param {IngredientPantryWithoutId} ingredientPantry the ingredientPantry object but without id
 * @returns {Promise<void>} A promise that resolves when the ingredientPantry is added
 */
export const addIngredientPantry: (
  ingredientPantry: IngredientPantryWithoutId,
) => Promise<void> = async ingredientPantry => {
  try {
    // Check if an ingredient with the same ingredientId already exists
    const ingredientPantryQuery = query(
      ingredientPantryCollection,
      where(
        INGREDIENT_PANTRY_INGREDIENT_ID,
        '==',
        ingredientPantry.ingredientId,
      ),
    );
    const querySnapshot = await getDocs(ingredientPantryQuery);

    if (!querySnapshot.empty) {
      console.warn(
        `Ingredient with ingredientId "${ingredientPantry.ingredientId}" already exists in pantry. Skipping.`,
      );
      return; // Exit the function if the ingredient already exists
    }

    // Generate a new document reference with an auto-generated ID
    const docRef = doc(ingredientPantryCollection);
    // Add the ingredientPantry with the generated ID as a prop
    await setDoc(docRef, {...ingredientPantry, id: docRef.id});
  } catch (error) {
    throw new Error(
      'addIngredientPantry -> an error occurred while adding row: ' +
        JSON.stringify(error),
    );
  }
};

/**
 * Function that returns all the IngredientPantries available
 *
 * @returns {Promise<ingredientPantry[]>} an array of all the IngredientPantry objects.
 */
export const getAllIngredientPantriesDb: () => Promise<
  IngredientPantry[]
> = async () => {
  try {
    const firebaseIngredientPantries: IngredientPantry[] = [];
    const ingredientPantriesQuery = query(ingredientPantryCollection);
    const querySnapshot = await getDocs(ingredientPantriesQuery);

    querySnapshot.forEach((document: {data: () => IngredientPantry}) => {
      const ingredientPantry = document.data() as IngredientPantry;
      firebaseIngredientPantries.push(ingredientPantry);
    });

    return firebaseIngredientPantries;
  } catch (error) {
    throw new Error(
      "getIngredientPantries -> Couldn't retrieve the ingredientPantry " +
        JSON.stringify(error),
    );
  }
};

/**
 * Function that updates a specific ingredientPantry, it can't update the ingredientId value
 *
 * @param {IngredientPantry} updatedIngredientPantry - The ingredient pantry that will be updated
 * @returns {Promise<void>} A promise that resolves when the table is created successfully or if it already exists.
 */
export const updateIngredientPantry: (
  updatedIngredientPantry: IngredientPantry,
) => Promise<void> = async updatedIngredientPantry => {
  try {
    const ingredientPantryDocRef = doc(
      firestoreDb,
      TABLE_INGREDIENT_PANTRY,
      updatedIngredientPantry.id,
    );
    await setDoc(ingredientPantryDocRef, updatedIngredientPantry);
  } catch (error) {
    throw new Error(
      'updateIngredientPantry -> error while updating the IngredientPantry: ' +
        JSON.stringify(error),
    );
  }
};

/**
 * Function that deletes a specific ingredientPantry
 *
 * @param {string} ingredientPantryId - The id of the  ingredientPantry that will be deleted
 * @returns {Promise<void>} A promise that resolves when the table is created successfully or if it already exists.
 */
export const deleteIngredientPantry: (
  ingredientPantryId: string,
) => Promise<void> = async ingredientPantryId => {
  try {
    const ingredientPantryDoc = doc(
      firestoreDb,
      TABLE_INGREDIENT_PANTRY,
      ingredientPantryId,
    );
    await deleteDoc(ingredientPantryDoc);
  } catch (error) {
    throw new Error(
      'deleteIngredientPantry -> error while deleting IngredientPantry: ' +
        JSON.stringify(error),
    );
  }
};
