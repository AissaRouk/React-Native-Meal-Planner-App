import {
  getDbConnection,
  TABLE_INGREDIENT,
  TABLE_RECIPE,
  TABLE_RECIPE_INGREDIENTS,
} from './db-services';
import {SUCCESS, FAILED} from './db-services';
import {
  ErrorResponseCodes,
  Ingredient,
  QuantityType,
  RecipeIngredient,
  RecipeIngredientWithoutId,
} from '../Types/Types';
import {INGREDIENT_ID} from './ingredient-db-services';
import {RECIPE_ID} from './recipe-db-services';

// Fields for the RecipeIngredients table
export const RECIPE_INGREDIENTS_ID = 'id';
export const RECIPE_INGREDIENTS_RECIPE_ID = 'recipeId';
export const RECIPE_INGREDIENTS_INGREDIENT_ID = 'ingredientId';
export const RECIPE_INGREDIENTS_QUANTITY = 'quantity';
export const RECIPE_INGREDIENTS_QUANTITY_TYPE = 'quantityType';

/**
 * Creates the RecipeIngredients table in the database.
 *
 * This function creates the `RecipeIngredients` table if it does not already exist. The table includes columns for
 * linking recipes to ingredients, as well as specifying the quantity and type of measurement for each ingredient.
 * Foreign keys link to the `Recipe` and `Ingredient` tables, ensuring referential integrity.
 *
 * @async
 * @function createRecipeIngredientTable
 * @returns {Promise<void>} Resolves when the table is created successfully.
 * @throws {Error} Throws an error if the table creation fails.
 *
 * @example
 * createRecipeIngredientTable()
 *   .then(() => console.log('RecipeIngredients table created or already exists'))
 *   .catch(error => console.error('Error creating RecipeIngredients table:', error));
 */
export const createRecipeIngredientTable = async (): Promise<void> => {
  const db = await getDbConnection();

  try {
    const sqlCreateTable = `CREATE TABLE IF NOT EXISTS ${TABLE_RECIPE_INGREDIENTS} (
      ${RECIPE_INGREDIENTS_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${RECIPE_INGREDIENTS_RECIPE_ID} INTEGER,
      ${RECIPE_INGREDIENTS_INGREDIENT_ID} INTEGER UNIQUE,
      ${RECIPE_INGREDIENTS_QUANTITY} REAL,
      ${RECIPE_INGREDIENTS_QUANTITY_TYPE} TEXT,
      FOREIGN KEY (${RECIPE_INGREDIENTS_RECIPE_ID}) REFERENCES ${TABLE_RECIPE}(${RECIPE_ID}),
      FOREIGN KEY (${RECIPE_INGREDIENTS_INGREDIENT_ID}) REFERENCES ${TABLE_INGREDIENT}(${INGREDIENT_ID})
    );`;

    await db.transaction(tx =>
      tx.executeSql(
        sqlCreateTable,
        [],
        () => {
          console.log(
            "createRecipeIngredientTable -> Table 'RecipeIngredients' created successfully or already exists.",
          );
        },
        error => {
          console.error(
            "createRecipeIngredientTable -> SQL error in creating 'RecipeIngredients' table:",
            error,
          );
        },
      ),
    );
  } catch (error) {
    console.error('createRecipeIngredientTable -> Transaction failed:', error);
    throw new Error(`createRecipeIngredientTable: ${error}`);
  }
};

/**
 * Adds a new ingredient to a recipe in the database.
 *
 * This function inserts a record linking an ingredient to a recipe along with the specified quantity and quantity type.
 * If the ingredient already exists for the recipe, the `INSERT OR IGNORE` ensures no duplicate entries.
 *
 * @async
 * @function addRecipeIngredient
 * @param {RecipeIngredientWithoutId} recipeIngredient - recipeIngredient without the id param
 * @returns {Promise<void>} Resolves when the ingredient is added successfully.
 * @throws {Error} Throws an error if the insertion fails.
 *
 * @example
 * addRecipeIngredient(recipe, ingredient, 100, 'grams')
 *   .then(() => console.log('Ingredient added successfully'))
 *   .catch(error => console.error('Error adding ingredient:', error));
 */
export const addRecipeIngredient = async (
  recipeIngredient: RecipeIngredientWithoutId,
): Promise<{
  created: boolean;
  insertedId?: number;
  responseCode?: ErrorResponseCodes;
}> => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `INSERT OR IGNORE INTO ${TABLE_RECIPE_INGREDIENTS} (${RECIPE_INGREDIENTS_RECIPE_ID}, ${RECIPE_INGREDIENTS_INGREDIENT_ID}, ${RECIPE_INGREDIENTS_QUANTITY}, ${RECIPE_INGREDIENTS_QUANTITY_TYPE}) VALUES (?,?,?,?)`;

    // Execute the query
    const result = await new Promise<{
      created: boolean;
      responseCode?: ErrorResponseCodes;
      insertedId?: number;
    }>(
      async resolve =>
        await db.transaction(tx =>
          tx.executeSql(
            sqlInsert,
            [
              recipeIngredient.recipeId,
              recipeIngredient.ingredientId,
              recipeIngredient.quantity,
              recipeIngredient.quantityType,
            ],
            (_, resultSet) => {
              if (resultSet.rowsAffected > 0) {
                console.log(
                  `addRecipeIngredient -> Ingredient added to Recipe ID: ${recipeIngredient.recipeId}`,
                );
                resolve({
                  created: SUCCESS,
                  responseCode: ErrorResponseCodes.SUCCESS,
                  insertedId: resultSet.insertId,
                });
              } else {
                console.log(
                  `addRecipeIngredient -> Ingredient not added for Recipe ID: ${recipeIngredient.recipeId}`,
                );
                resolve({
                  created: SUCCESS,
                  responseCode: ErrorResponseCodes.ERROR,
                });
              }
            },
            error =>
              console.error(
                `addRecipeIngredient -> SQL error for Recipe ID ${recipeIngredient.recipeId}:`,
                error,
              ),
          ),
        ),
    );
    return result;
  } catch (error) {
    console.error('addRecipeIngredient -> Transaction failed:', error);
    throw new Error(`Failed to add ingredient to recipe: ${error}`);
  }
};

/**
 * Adds multiple ingredients to a recipe in the database.
 *
 * Iterates over the provided array of ingredients and attempts to add each one to the specified recipe.
 * If any ingredient fails to be added, the process stops and returns a failure response.
 *
 * @param recipeId - The unique identifier of the recipe to which ingredients will be added.
 * @param ingredients - An array of ingredient objects, each containing the ingredient details, quantity, and quantity type.
 * @returns A promise that resolves to an object indicating whether all ingredients were successfully added,
 *          and optionally includes an inserted ID or error response code.
 *
 * @example
 * const result = await addRecipeIngredientMultiple(1, [
 *   { id: 2, name: 'Salt', quantity: 1, quantityType: 'tsp' },
 *   { id: 3, name: 'Pepper', quantity: 0.5, quantityType: 'tsp' }
 * ]);
 * if (result.created) {
 *   // All ingredients added successfully
 * }
 */
export const addRecipeIngredientMultiple = async (
  recipeId: number,
  ingredients: Array<
    Ingredient & {quantity: number; quantityType: QuantityType}
  >,
): Promise<{
  created: boolean;
  insertedId?: number;
  responseCode?: ErrorResponseCodes;
}> => {
  try {
    for (const ingredient of ingredients) {
      const response = await addRecipeIngredient({
        recipeId: recipeId,
        ingredientId: ingredient.id,
        quantity: ingredient.quantity,
        quantityType: ingredient.quantityType,
      });
      if (response.created === FAILED) {
        console.log(
          `addRecipeIngredientMultiple -> Ingredient ${ingredient.name} not added for Recipe ID: ${recipeId}`,
        );
        return {created: FAILED};
      }
    }
    return {created: SUCCESS};
  } catch (error) {
    console.error('addRecipeIngredientMultiple -> Error:', error);
    return {created: FAILED};
  }
};

/**
 * Fetches all the RecipeIngredients from the database.
 *
 * @async
 * @function getRecipeIngredients
 * @returns {Promise<RecipeIngredient[]>} Resolves with an array of RecipeIngredient objects.
 */
export const getRecipeIngredients = async (): Promise<RecipeIngredient[]> => {
  try {
    const db = await getDbConnection();
    const sqlInsert = `SELECT * FROM ${TABLE_RECIPE_INGREDIENTS}`;
    const result: RecipeIngredient[] = [];

    await db.transaction(tx =>
      tx.executeSql(sqlInsert, [], (tx, resultSet) => {
        const len = resultSet.rows.length;

        for (let i = 0; i < len; i++) {
          const row = resultSet.rows.item(i);
          result.push(row);
        }
      }),
    );
    return result;
  } catch (error) {
    console.error('getRecipeIngredients -> Transaction failed:', error);
    throw new Error(`getRecipeIngredients: ${error}`);
  }
};

/**
 * Changes the data of the RecipeIngredient with the id submitted in the param
 *
 * @async
 * @function updateRecipeIngredient
 * @param {RecipeIngredient} recipeIngredient the RecipeIngredient with the data that will be updated and the same id
 * @returns {Promise<void>} Resolves with a void
 */
export const updateRecipeIngredient: (
  recipeIngredient: RecipeIngredient,
) => Promise<void> = async recipeIngredient => {
  try {
    const db = getDbConnection();

    console.log(
      'updateRecipeIngredient -> REcipeIngredient to be updated: ' +
        JSON.stringify(recipeIngredient),
    );

    const sqlInsert = `UPDATE ${TABLE_RECIPE_INGREDIENTS} SET ${RECIPE_INGREDIENTS_RECIPE_ID} = ?, ${RECIPE_INGREDIENTS_INGREDIENT_ID} = ?, ${RECIPE_INGREDIENTS_QUANTITY} = ?, ${RECIPE_INGREDIENTS_QUANTITY_TYPE} = ? WHERE ${RECIPE_INGREDIENTS_ID} = ?`;

    (await db).transaction(tx =>
      tx.executeSql(
        sqlInsert,
        [
          recipeIngredient.recipeId,
          recipeIngredient.ingredientId,
          recipeIngredient.quantity,
          recipeIngredient.quantityType,
          recipeIngredient.id,
        ],
        (tx, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('updateRecipeIngredient -> RecipeIngredient updated');
          } else {
            console.log('updateRecipeIngredient -> RecipeIngredient updated');
          }
        },
      ),
    );
  } catch (error) {
    console.log('Error while updating RecipeIngredient: ' + error);
    throw new Error('Error while updating RecipeIngredient: ' + error);
  }
};

/**
 * Deletes a function given its id
 *
 * @async
 * @function updateRecipeIngredient
 * @param {number} id
 * @returns {Promise<void>} Resolves with a void
 */
export const deleteRecipeIngredient: (
  id: number,
) => Promise<void> = async id => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `DELETE FROM ${TABLE_RECIPE_INGREDIENTS} WHERE ${RECIPE_INGREDIENTS_ID} = ?`;

    await db.transaction(tx =>
      tx.executeSql(sqlInsert, [id], (tx, resultSet) => {
        if (resultSet.rowsAffected > 0) {
          console.log(
            'deleteRecipeIngredient -> RecipeIngredient deleted successfully',
          );
        } else
          console.log(
            'deleteRecipeIngredient -> could not delete RecipeIngredient',
          );
      }),
    );
  } catch (error) {
    throw new Error(
      'deleteRecipeIngredient -> could not delete RecipeIngredient: ' + error,
    );
  }
};
