import {Recipe, RecipeWithoutId} from '../Types/Types';
import {FAILED, getDbConnection, SUCCESS, TABLE_RECIPE} from './db-services';

// Fields for the Recipe table
export const RECIPE_ID = 'id';
export const RECIPE_NAME = 'name';
export const RECIPE_LINK = 'link';
export const RECIPE_PREP_TIME = 'preparationTime';
export const RECIPE_SERVING_SIZE = 'servingSize';

//
//
//
//CRUD for Recipe Table
///
//
//

/**
 * Creates the Recipe Table in the database if it does not already exist.
 *
 * @returns A promise that resolves when the Recipe table creation operation is complete.
 */
export const createRecipeTable: () => Promise<void> = async () => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `
      CREATE TABLE IF NOT EXISTS ${TABLE_RECIPE} (
        ${RECIPE_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${RECIPE_NAME} TEXT NOT NULL UNIQUE,
        ${RECIPE_LINK} TEXT,
        ${RECIPE_PREP_TIME} INTEGER,
        ${RECIPE_SERVING_SIZE} INTEGER
      );
    `;

    await db.transaction(tx =>
      tx.executeSql(sqlInsert, [], (tx, results) => {
        if (results.rowsAffected > 0) {
          console.log('Recipe table created successfully!');
        } else {
          console.log('Recipe table already exists or creation not required.');
        }
      }),
    );
  } catch (error) {
    console.error('Error creating the Recipe table:', error);
  }
};

/**
 * Adds a new recipe to the Recipe table if it does not already exist.
 *
 * @param {RecipeWithoutId} recipe - The recipe object without the id param
 * @returns A promise that resolves when the recipe addition operation is complete.
 */
export const addRecipe: (
  recipe: RecipeWithoutId,
) => Promise<{created: boolean; insertedId?: number}> = async recipe => {
  try {
    // Connect the database
    const db = await getDbConnection();

    // Create query
    const insertQuery = `INSERT OR IGNORE INTO ${TABLE_RECIPE} (${RECIPE_NAME}, ${RECIPE_LINK}, ${RECIPE_PREP_TIME}, ${RECIPE_SERVING_SIZE})
    VALUES (?, ?, ?, ?);`;

    // returns the promise
    return await new Promise<{created: boolean; insertedId?: number}>(
      (resolve, reject) => {
        db.transaction(tx => {
          // execute the query
          tx.executeSql(
            insertQuery,
            [
              recipe.name,
              recipe.link,
              recipe.preparationTime,
              recipe.servingSize,
            ],
            (tx, resultSet) => {
              // If added
              if (resultSet.rowsAffected > 0) {
                console.log('Recipe added successfully!');
                // return success and the id of the inserted recipe
                resolve({created: SUCCESS, insertedId: resultSet.insertId});
              } else {
                console.log('Recipe not added; it may already exist.');
                // if any problem return false
                resolve({created: FAILED});
              }
            },
            (tx, error) => {
              console.error('Error adding recipe:', error);
              reject(error);
            },
          );
        });
      },
    );
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
  const db = await getDbConnection();
  const sqlInsert = `SELECT * FROM ${TABLE_RECIPE}`;

  try {
    const fetchedRecipes: Recipe[] = [];

    await db.transaction(tx =>
      tx.executeSql(sqlInsert, [], (tx, resultSet) => {
        const len = resultSet.rows.length;
        for (let i = 0; i < len; i++) {
          const row = resultSet.rows.item(i);
          fetchedRecipes.push(row);
        }
      }),
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
export const getRecipeById: (
  id: number,
) => Promise<Recipe | null> = async id => {
  try {
    const db = await getDbConnection();

    const sqlQuery = `SELECT * FROM ${TABLE_RECIPE} WHERE ${RECIPE_ID} = ?`;

    let recipe: Recipe | null = null;

    await db.transaction(tx => {
      tx.executeSql(
        sqlQuery,
        [id],
        (tx, resultSet) => {
          if (resultSet.rows.length > 0) {
            recipe = resultSet.rows.item(0);
            console.log(
              'getRecipeById -> Recipe fetched successfully:',
              recipe,
            );
          } else {
            console.log('getRecipeById -> No recipe found with ID:', id);
          }
        },
        error => {
          console.error('getRecipeById -> SQL error fetching recipe:', error);
        },
      );
    });

    return recipe;
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
export const getAllRecipes = async (): Promise<Recipe[]> => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `SELECT * FROM ${TABLE_RECIPE}`;

    const resultRecipes: Recipe[] = [];

    await db.transaction(txn =>
      txn.executeSql(sqlInsert, [], (_unused, resultSet) => {
        if (resultSet.rows.length > 0) {
          for (let i = 0; i < resultSet.rows.length; i++) {
            const recipeItem: Recipe = resultSet.rows.item(i);
            resultRecipes.push(recipeItem);
            console.log('Recipes fetched successfully');
          }
        } else if (resultSet.rows.length === 0) {
          console.log('getRecipes -> There are no elements in the table');
        } else {
          console.log("getRecipes -> Couldn't retrieve any Recipes");
        }
      }),
    );
    return resultRecipes;
  } catch (error) {
    throw new Error('getRecipes -> Error while retrieving: ' + error);
  }
};

/**
 * Function to update an existing recipe
 *
 * @param {Recipe} recipe the recipe that will be updated
 */
export const updateRecipe: (recipe: Recipe) => Promise<void> = async recipe => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `UPDATE ${TABLE_RECIPE} SET ${RECIPE_NAME}=?, ${RECIPE_LINK}=?, ${RECIPE_PREP_TIME}=?, ${RECIPE_SERVING_SIZE}=? WHERE ${RECIPE_ID}=?`;

    db.transaction(tx =>
      tx.executeSql(
        sqlInsert,
        [
          recipe.name,
          recipe.link,
          recipe.preparationTime,
          recipe.servingSize,
          recipe.id,
        ],
        (tx, resultset) => {
          if (resultset.rowsAffected > 0)
            console.log('Recipe updated successfully!!');
          else console.log("couldn't updated Recipe successfully!!");
        },
        (tx, error) =>
          console.log('Error in updating Recipe: ' + JSON.stringify(error)),
      ),
    );
  } catch (error) {
    throw new Error('Error while updating recipe: ' + error);
  }
};

/**
 * Function to delete recipe
 *
 * @param {number} id the id of the Recipe to delete
 */
export const deleteRecipe: (id: number) => Promise<void> = async id => {
  const db = await getDbConnection();

  const sqlInsert = `DELETE FROM ${TABLE_RECIPE} WHERE ${RECIPE_ID}=?`;

  await db.transaction(tx =>
    tx.executeSql(sqlInsert, [id], (tx, resultSet) => {
      if (resultSet.rowsAffected > 0) {
        console.log('deleteRecipe -> recipe deleted successfully!');
      } else console.log("deleteRecipe -> Couldn't delete Recipe!!");
    }),
  );
};
