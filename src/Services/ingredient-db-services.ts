import {Ingredient, IngredientWithoutId} from '../Types/Types';
import {
  FAILED,
  getDbConnection,
  SUCCESS,
  TABLE_INGREDIENT,
} from './db-services';
import {
  collection,
  query,
  getDocs,
  getFirestore,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
} from '@react-native-firebase/firestore';

// Fields for the Ingredient table
export const INGREDIENT_ID = 'id';
export const INGREDIENT_NAME = 'name';
export const INGREDIENT_CATEGORY = 'category';

const firestoreDb = getFirestore();
const ingredientCollection = collection(firestoreDb, 'Ingredient');

//Ingredient CRUD functions

/**
 * Creates the Ingredient table in the database.
 *
 * This function creates the `Ingredient` table if it does not already exist. The table includes columns for the
 * ingredient's ID, name, and category. The name field must be unique to ensure that no duplicate ingredient names exist.
 *
 * @async
 * @function createIngredientTable
 * @returns {Promise<void>} Resolves when the table is successfully created or already exists.
 *
 */
export const createIngredientTable = async (): Promise<void> => {
  const db = await getDbConnection();
  const sqlCreateTable = `
    CREATE TABLE IF NOT EXISTS ${TABLE_INGREDIENT} (
      ${INGREDIENT_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${INGREDIENT_NAME} TEXT NOT NULL UNIQUE,
      ${INGREDIENT_CATEGORY} TEXT
    );
  `;

  try {
    await db.transaction(tx => {
      tx.executeSql(
        sqlCreateTable,
        [],
        (transaction, resultSet) => {
          console.log(
            'createIngredientTable -> Table created successfully or already exists.',
          );
        },
        error => {
          console.error(
            'createIngredientTable -> SQL error in table creation:',
            error,
          );
        },
      );
    });
  } catch (error) {
    console.error('createIngredientTable -> Transaction failed:', error);
    throw new Error(`createIngredientTable: ${error}`);
  }
};

/**
 * Adds a new ingredient to the Ingredient table if it does not already exist.
 *
 * This function inserts a new ingredient with the provided name and category into the `Ingredient` table.
 * If an ingredient with the same name already exists, the function ignores the insertion to prevent duplicates.
 *
 * @async
 * @function addIngredient
 * @param {IngredientWithoutId} ingredient The new ingredient added but without id, because the database will assign one for it
 * @returns {Promise<{created: boolean, response?: string}>} Resolves when the ingredient is added or the insertion is ignored if it already exists.
 *
 */
export const addIngredientDb = async (
  ingredient: IngredientWithoutId,
): Promise<{created: boolean; response?: string; insertedId?: number}> => {
  try {
    // Get database connection
    const db = await getDbConnection();

    // SQL query to insert a new ingredient
    const insertQuery = `INSERT OR IGNORE INTO ${TABLE_INGREDIENT} (${INGREDIENT_NAME}, ${INGREDIENT_CATEGORY}) VALUES (?, ?);`;

    // Execute the query
    const result = await new Promise<{
      created: boolean;
      response?: string;
      insertedId?: number;
    }>((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          insertQuery,
          [ingredient.name, ingredient.category],
          (tx, results) => {
            if (results.rowsAffected > 0) {
              console.log('addIngredient -> Ingredient added successfully!');
              resolve({
                created: SUCCESS,
                response: 'Ingredient added successfully',
                insertedId: results.insertId,
              });
            } else {
              console.log(
                'addIngredient -> Ingredient already exists, insertion ignored.',
              );
              resolve({
                created: FAILED,
                response: 'Ingredient already exists',
              });
            }
          },
          error => {
            console.error(
              'addIngredient -> SQL error in adding ingredient:',
              error,
            );
            reject(error);
          },
        );
      });
    });

    const addRef = await setDoc(
      doc(ingredientCollection, ingredient.name),
      ingredient,
    );
    console.log('addIngredient -> Firestore document added with ID:', addRef);
    // return {
    //   created: SUCCESS,
    //   insertedId: addRef.id,
    //   response: 'Ingredient added successfully to Firestore',
    // };

    return result;
  } catch (error) {
    console.error('addIngredient -> Transaction failed:', error);
    return {
      created: FAILED,
      response: `Error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

/**
 * Fetches all ingredients from the Ingredient table.
 *
 * This function retrieves all rows from the `Ingredient` table and returns them as an array of `Ingredient` objects.
 *
 * @async
 * @function getIngredients
 * @returns {Promise<Ingredient[]>} A promise that resolves to an array of ingredients or an empty array if an error occurs.
 *
 */
export const getAllIngredients: () => Promise<Ingredient[]> = async (): Promise<
  Ingredient[]
> => {
  try {
    // Get database connection
    const db = await getDbConnection();

    // SQL query to fetch all ingredients
    const selectQuery = `SELECT * FROM ${TABLE_INGREDIENT}`;
    const ingredients: Ingredient[] = [];

    // Execute the query and process the results
    await db.transaction(tx => {
      tx.executeSql(
        selectQuery,
        [],
        (tx, resultSet) => {
          const len = resultSet.rows.length;
          for (let i = 0; i < len; i++) {
            const row = resultSet.rows.item(i);
            ingredients.push(row);
          }
        },
        error => {
          console.error(
            'getIngredients -> SQL error fetching ingredients:',
            error,
          );
        },
      );
    });

    // Firebase Implementation
    const ingredientsQuery = query(ingredientCollection);
    const querySnapshot = await getDocs(ingredientsQuery);
    querySnapshot.forEach((doc: {data: () => IngredientWithoutId; id: any}) => {
      const data = doc.data() as IngredientWithoutId;
      const ingredient: Ingredient = {
        id: doc.id, // Use Firestore document ID as the ingredient ID
        name: data.name, // Ensure the name is present
        category: data.category || '', // Default to empty string if category is not provided
      };
      // ingredients.push(ingredient);
    });
    console.log(
      'getIngredients Firebase -> Ingredients fetched successfully:',
      ingredients,
    );

    return ingredients;
  } catch (error) {
    console.error(
      'getIngredients -> Transaction error:',
      error instanceof Error ? error : JSON.stringify(error),
    );
    return [];
  }
};

/**
 * Deletes an ingredient from the Ingredient table by its ID.
 *
 * This function deletes an ingredient row in the `Ingredient` table, specified by its unique ID.
 *
 * @async
 * @function deleteIngredient
 * @param {number} id - The ID of the ingredient to be deleted.
 * @returns {Promise<void>} A promise that resolves when the ingredient has been successfully deleted or logs an error if the deletion fails.
 *
 */
export const deleteIngredient: (id: number | string) => Promise<void> = async (
  id: number | string,
) => {
  const db = await getDbConnection();
  const sqlDelete = `DELETE FROM ${TABLE_INGREDIENT} WHERE ${INGREDIENT_ID} = ?`;

  try {
    if (typeof id == 'number')
      await db.transaction(tx => {
        tx.executeSql(
          sqlDelete,
          [id],
          (tx, results) => {
            if (results.rowsAffected > 0) {
              console.log(
                'deleteIngredient -> Ingredient deleted successfully!',
              );
            } else {
              console.warn(
                'deleteIngredient -> No ingredient found with the provided ID.',
              );
            }
          },
          error => {
            console.error(
              'deleteIngredient -> SQL error during deletion:',
              error,
            );
          },
        );
      });
    else {
      // Firebase Implementation
      const ingredientDoc = doc(ingredientCollection, id.toString());
      await deleteDoc(ingredientDoc);
      console.log(
        'deleteIngredient -> Firestore document deleted successfully.',
      );
    }
  } catch (error) {
    console.error(
      'deleteIngredient -> Transaction error:',
      error instanceof Error ? error : JSON.stringify(error),
    );
    throw new Error(
      'Failed to delete ingredient: ' +
        (error instanceof Error ? error.message : JSON.stringify(error)),
    );
  }
};

/**
 * Updates a specific ingredient in the Ingredient table.
 *
 * @param ingredient - The ingredient object containing updated properties (`id`, `name`, and `category`).
 * @returns A promise that resolves when the ingredient update operation is complete.
 */
export const updateIngredient: (
  ingredient: Ingredient,
) => Promise<void> = async ingredient => {
  const db = await getDbConnection();

  // SQL query to update the ingredient
  const sqlInsert = `UPDATE ${TABLE_INGREDIENT} SET ${INGREDIENT_NAME}=?, ${INGREDIENT_CATEGORY}=? WHERE ${INGREDIENT_ID}=?`;

  try {
    if (typeof ingredient.id == 'number')
      await db.transaction(tx =>
        tx.executeSql(
          sqlInsert,
          [ingredient.name, ingredient.category, ingredient.id],
          (tx, results) => {
            if (results.rowsAffected > 0) {
              console.log('Ingredient updated successfully!');
            } else {
              console.log('Ingredient update failed.');
            }
          },
        ),
      );
    else await setDoc(doc(ingredientCollection, ingredient.name), ingredient);
  } catch (error) {
    console.error('Error in updating the ingredient:', error);
  }
};

/**
 * Fetches all ingredients from the Ingredient table.
 *
 * This function retrieves all rows from the `Ingredient` table and returns them as an array of `Ingredient` objects.
 *
 * @async
 * @function getIngredients
 * @returns {Promise<Ingredient[]>} A promise that resolves to an array of ingredients or an empty array if an error occurs.
 *
 */
export const getIngredientById: (
  id: number | string,
) => Promise<Ingredient> = async (id): Promise<Ingredient> => {
  const db = await getDbConnection();

  //SQL query to get all the ingredients
  const sqlInsert = `SELECT * FROM ${TABLE_INGREDIENT} WHERE ${INGREDIENT_ID} = ?`;

  let ingredient: Ingredient | null = null;

  if (typeof id === 'number')
    // Execute the query and process the results
    await db.transaction(tx => {
      tx.executeSql(
        sqlInsert,
        [id],
        (tx, resultSet) => {
          if (resultSet.rows.length > 0) {
            ingredient = resultSet.rows.item(0);
            console.log(
              'getRecipeById -> Recipe fetched successfully:',
              ingredient,
            );
          } else {
            console.log('getRecipeById -> No recipe found with ID:', id);
          }
        },
        error => {
          console.error(
            'getIngredients -> SQL error fetching ingredients:',
            error,
          );
        },
      );
    });
  else {
    const ingredientDocRef = doc(firestoreDb, TABLE_INGREDIENT, id);
    const ingredientSnapShot = await getDoc(ingredientDocRef);
    if (ingredientSnapShot.exists()) {
      const ingredientData = ingredientSnapShot.data() as Ingredient;
      console.log(
        'getIngredientById -> Ingredient fetched successfully:',
        ingredientData,
      );
      return ingredientData;
    }
  }

  if (!ingredient) {
    throw new Error(`Ingredient with ID ${id} not found.`);
  }

  return ingredient;
};
