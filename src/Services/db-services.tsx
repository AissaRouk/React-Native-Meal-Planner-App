import {enablePromise, openDatabase} from 'react-native-sqlite-storage';
import {
  DaysOfWeek,
  Ingredient,
  IngredientPantry,
  IngredientPantryWithoutId,
  IngredientWithoutId,
  MealType,
  Pantry,
  PantryWithoutId,
  Recipe,
  RecipeIngredient,
  RecipeIngredientWithoutId,
  RecipeWithoutId,
  WeeklyMeal,
} from '../Types/Types';

// Function to get the database connection
export const getDbConnection = async () => {
  return openDatabase({name: 'MealPlanningDB', location: 'default'});
};

//enabling promises
enablePromise(true);

// Constants for table and field names
export const TABLE_RECIPE = 'Recipe';
export const TABLE_INGREDIENT = 'Ingredient';
export const TABLE_RECIPE_INGREDIENTS = 'RecipeIngredients';
export const TABLE_GROCERY_LIST = 'GroceryList';
export const TABLE_PANTRY = 'Pantry';
export const TABLE_INGREDIENT_PANTRY = 'IngredientPantry';
export const TABLE_CATEGORY = 'Category';
export const TABLE_WEEKLY_MEALS = 'WeeklyMeals';

// Fields for the Recipe table
export const RECIPE_ID = 'id';
export const RECIPE_NAME = 'name';
export const RECIPE_LINK = 'link';
export const RECIPE_PREP_TIME = 'preparationTime';
export const RECIPE_SERVING_SIZE = 'servingSize';

// Fields for the Ingredient table
export const INGREDIENT_ID = 'id';
export const INGREDIENT_NAME = 'name';
export const INGREDIENT_CATEGORY = 'category';

// Fields for the RecipeIngredients table
export const RECIPE_INGREDIENTS_ID = 'id';
export const RECIPE_INGREDIENTS_RECIPE_ID = 'recipeId';
export const RECIPE_INGREDIENTS_INGREDIENT_ID = 'ingredientId';
export const RECIPE_INGREDIENTS_QUANTITY = 'quantity';
export const RECIPE_INGREDIENTS_QUANTITY_TYPE = 'quantityType';

// Fields for the GroceryList table
export const GROCERY_LIST_ID = 'id';
export const GROCERY_LIST_RECIPE_INGREDIENTS = 'recipeIngredients';

// Fields for the Pantry table
export const PANTRY_ID = 'id';
export const PANTRY_INGREDIENT_PANTRY = 'ingredientPantry';

// Fields for the IngredientPantry table
export const INGREDIENT_PANTRY_ID = 'id';
export const INGREDIENT_PANTRY_INGREDIENT_ID = 'ingredientId';
export const INGREDIENT_PANTRY_QUANTITY = 'quantity';
export const INGREDIENT_PANTRY_QUANTITY_TYPE = 'quantityType';

// Fields for the WeeklyMeals table
export const WEEKLY_MEALS_ID = 'id';
export const WEEKLY_MEALS_DAY = 'day';
export const WEEKLY_MEALS_MEAL_TYPE = 'mealType';
export const WEEKLY_MEALS_RECIPE_ID = 'recipeId';

//Flags indicating the success or failure of database operations.
export const SUCCESS = true;
export const FAILED = false;

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
export const addIngredient = async (
  ingredient: IngredientWithoutId,
): Promise<{created: boolean; response?: string}> => {
  try {
    // Get database connection
    const db = await getDbConnection();

    // SQL query to insert a new ingredient
    const insertQuery = `INSERT OR IGNORE INTO ${TABLE_INGREDIENT} (${INGREDIENT_NAME}, ${INGREDIENT_CATEGORY}) VALUES (?, ?);`;

    // Execute the query
    const result = await new Promise<{created: boolean; response?: string}>(
      (resolve, reject) => {
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
      },
    );

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
export const deleteIngredient: (id: number) => Promise<void> = async (
  id: number,
) => {
  const db = await getDbConnection();
  const sqlDelete = `DELETE FROM ${TABLE_INGREDIENT} WHERE ${INGREDIENT_ID} = ?`;

  try {
    await db.transaction(tx => {
      tx.executeSql(
        sqlDelete,
        [id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('deleteIngredient -> Ingredient deleted successfully!');
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
export const getIngredientById: (id: number) => Promise<Ingredient> = async (
  id,
): Promise<Ingredient> => {
  const db = await getDbConnection();

  //SQL query to get all the ingredients
  const sqlInsert = `SELECT * FROM ${TABLE_INGREDIENT} WHERE ${INGREDIENT_ID} = ?`;

  let ingredient: Ingredient | null = null;

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

  if (!ingredient) {
    throw new Error(`Ingredient with ID ${id} not found.`);
  }

  return ingredient;
};

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
) => Promise<void> = async recipe => {
  try {
    const db = await getDbConnection();

    // SQL query
    const insertQuery = `INSERT OR IGNORE INTO ${TABLE_RECIPE} (${RECIPE_NAME}, ${RECIPE_LINK}, ${RECIPE_PREP_TIME}, ${RECIPE_SERVING_SIZE})
    VALUES (?, ?, ?, ?);`;

    // Execute the query
    await db.transaction(tx =>
      tx.executeSql(
        insertQuery,
        [recipe.name, recipe.link, recipe.preparationTime, recipe.servingSize],
        (tx, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('Recipe added successfully!');
          } else {
            console.log('Recipe not added; it may already exist.');
          }
        },
        (tx, error) => console.error('Error adding recipe:', error),
      ),
    );
  } catch (error) {
    console.error('addRecipe -> Error adding the recipe:', error);
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

//
//
//
//CRUD for Table
//
//
//AUTOINCREMENT
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
): Promise<void> => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `INSERT OR IGNORE INTO ${TABLE_RECIPE_INGREDIENTS} (${RECIPE_INGREDIENTS_RECIPE_ID}, ${RECIPE_INGREDIENTS_INGREDIENT_ID}, ${RECIPE_INGREDIENTS_QUANTITY}, ${RECIPE_INGREDIENTS_QUANTITY_TYPE}) VALUES (?,?,?,?)`;

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
          } else {
            console.log(
              `addRecipeIngredient -> Ingredient not added for Recipe ID: ${recipeIngredient.recipeId}`,
            );
          }
        },
        error =>
          console.error(
            `addRecipeIngredient -> SQL error for Recipe ID ${recipeIngredient.recipeId}:`,
            error,
          ),
      ),
    );
  } catch (error) {
    console.error('addRecipeIngredient -> Transaction failed:', error);
    throw new Error(`Failed to add ingredient to recipe: ${error}`);
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

/**
 * PANTRY TABLE OPERATIONS
 */

/**
 * Function that creates the Pantry table
 *
 * @function createPantryTable
 * @returns {Promise<void>} A promise that resolves when the table is created successfully or if it already exists.
 */
export const createPantryTable: () => Promise<void> = async () => {
  try {
    const db = await getDbConnection();

    // SQL query to create the Pantry table
    const sqlCreatePantryTable = `
      CREATE TABLE IF NOT EXISTS ${TABLE_PANTRY} (
        ${PANTRY_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${PANTRY_INGREDIENT_PANTRY} INTEGER,
        FOREIGN KEY (ingredientPantry) REFERENCES IngredientPantry(id)
      );
    `;

    // Execute the SQL transaction
    await db.transaction(tx =>
      tx.executeSql(
        sqlCreatePantryTable,
        [],
        () => {
          console.log(
            'createPantryTable -> Table "Pantry" created successfully or already exists.',
          );
        },
        (_, error) => {
          console.error(
            'createPantryTable -> Failed to create "Pantry" table:',
            error,
          );
          return false;
        },
      ),
    );
  } catch (error) {
    throw new Error(
      'createPantryTable -> Error creating the Pantry table: ' + error,
    );
  }
};

/**
 * Function that adds a pantry row to the table
 *
 * @param {PantryWithoutId} pantry the pantry object but without id
 * @returns {Promise<void>} A promise that resolves when the table is created successfully or if it already exists.
 */
export const addPantry: (
  pantry: PantryWithoutId,
) => Promise<void> = async pantry => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `INSERT OR IGNORE INTO ${TABLE_PANTRY} (${PANTRY_INGREDIENT_PANTRY}) values (?)`;

    db.transaction(tx =>
      tx.executeSql(sqlInsert, [pantry.ingredientPantry], (tx, resultSet) => {
        if (resultSet.rowsAffected > 0) {
          console.log(
            'addPantry -> Pantry added successfully or already exists',
          );
        } else {
          console.log("addPantry -> Couldn't add pantry");
        }
      }),
    );
  } catch (error) {
    throw new Error(
      'addPantry -> pantry was not added: ' + JSON.stringify(error),
    );
  }
};

/**
 * Function that fetches all the Pantry objects from the Pantry Table
 *
 * @returns {Promise<Pantry[]>} an array of all the Pantry objects.
 */
export const getAllPantries: () => Promise<Pantry[]> = async () => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `SELECT * FROM ${TABLE_PANTRY}`;

    const resultPantries: Pantry[] = [];

    await db.transaction(tx =>
      tx.executeSql(sqlInsert, [], (tx, resultSet) => {
        if (resultSet.rows.length > 0) {
          for (var i = 0; i < resultSet.rows.length; i++) {
            const pantryItem: Pantry = resultSet.rows.item(i);
            resultPantries.push(pantryItem);
            console.log('Pantries fetched successfully');
          }
        } else if ((resultSet.rows.length = 0)) {
          console.log('getPantries -> There are no elements in the table');
        } else {
          console.log("getPantries -> Couldn't retrieve any Pantries");
        }
      }),
    );
    return resultPantries;
  } catch (error) {
    throw new Error('getPantries -> Error while retrieving: ' + error);
  }
};

/**
 * Function that updates a specific pantry
 *
 * @param {Pantry} updatedPantry The pantry with the updated data and the same id
 * @returns {Promise<void>} A promise that resolves when the table is created successfully or if it already exists.
 */
export const updatePantry: (
  updatedPantry: Pantry,
) => Promise<void> = async pantry => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `UPDATE ${TABLE_PANTRY} SET ${PANTRY_INGREDIENT_PANTRY} = ? WHERE ${PANTRY_ID} = ?`;

    await db.transaction(tx =>
      tx.executeSql(
        sqlInsert,
        [pantry.ingredientPantry, pantry.id],
        (tx, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('updatePantry -> Pantry updated successfully :)');
          } else {
            console.log("updatePantry -> Couldn't update Pantry :(");
          }
        },
      ),
    );
  } catch (error) {
    throw new Error(
      "updatePantry -> Couldn't update Pantry error: " + JSON.stringify(error),
    );
  }
};

/**
 * Function that deletes a Pantry given its id
 *
 * @param {number} pantryId The id of the Pantry that will be deleted
 * @returns {Promise<void>} A promise that resolves when the table is created successfully or if it already exists.
 */
export const deletePantry: (
  pantryId: number,
) => Promise<void> = async pantryId => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `DELETE FROM ${TABLE_PANTRY} WHERE ${PANTRY_ID} = ?`;

    await db.transaction(tx =>
      tx.executeSql(sqlInsert, [pantryId], (tx, resultSet) => {
        if (resultSet.rowsAffected > 0) {
          console.log(
            'deletePantry -> pantry with id ' +
              pantryId +
              ' deleted successfully!',
          );
        } else {
          console.log("deletePantry -> couldn't delete pantry! :(");
        }
      }),
    );
  } catch (error) {
    throw new Error(
      'deletePantry -> error in  delete pantry: ' + JSON.stringify(error),
    );
  }
};

/**
 * INGREDIENTPANTRY TABLE FUNCTIONS
 */

/**
 *Function that creates the INGREDIENTPANTRY table
 *
 * @returns {Promise<void>} A promise that resolves when the table is created successfully or if it already exists.
 */
export const createIngredientPantryTable: () => Promise<void> = async () => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `CREATE TABLE IF NOT EXISTS ${TABLE_INGREDIENT_PANTRY} (
    ${INGREDIENT_PANTRY_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${INGREDIENT_PANTRY_INGREDIENT_ID} INTEGER UNIQUE,
    ${INGREDIENT_PANTRY_QUANTITY} REAL,
    ${INGREDIENT_PANTRY_QUANTITY_TYPE} STRING,
    FOREIGN KEY (${INGREDIENT_PANTRY_INGREDIENT_ID}) REFERENCES ${TABLE_INGREDIENT}(${INGREDIENT_ID})
    ) `;

    await db.transaction(tx =>
      tx.executeSql(sqlInsert, [], (tx, resultSet) => {
        if (resultSet.rowsAffected > 0) {
          console.log('createIngredientPantryTable -> Table created');
        } else {
          console.log('createIngredientPantryTable -> Table NOT created');
        }
      }),
    );
  } catch (error) {
    throw new Error(
      'Error in createIngredientPantryTable -> ' + JSON.stringify(error),
    );
  }
};

/**
 * Function that adds a pantry row to the table
 *
 * @param {IngredientWithoutId} ingredientPantry the ingredientPantry object but without id
 * @returns {Promise<void>} A promise that resolves when the table is created successfully or if it already exists.
 */
export const addIngredientPantry: (
  ingredientPantry: IngredientPantryWithoutId,
) => Promise<void> = async ingredientPantry => {
  try {
    const db = await getDbConnection();

    // Corrected SQL insert statement
    const sqlInsert = `INSERT OR IGNORE INTO ${TABLE_INGREDIENT_PANTRY} (
      ${INGREDIENT_PANTRY_INGREDIENT_ID},
      ${INGREDIENT_PANTRY_QUANTITY},
      ${INGREDIENT_PANTRY_QUANTITY_TYPE}
    ) VALUES (?, ?, ?);`;

    await db.transaction(tx =>
      tx.executeSql(
        sqlInsert,
        [
          ingredientPantry.ingredientId,
          ingredientPantry.quantity,
          ingredientPantry.quantityType,
        ],
        (tx, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log('addIngredientPantry -> row added successfully');
          } else {
            console.log(
              'addIngredientPantry -> there was a problem adding the row',
            );
          }
        },
      ),
    );
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
export const getAllIngredientPantries: () => Promise<
  IngredientPantry[]
> = async () => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `SELECT * FROM ${TABLE_INGREDIENT_PANTRY}`;

    const result: IngredientPantry[] = [];

    await db.transaction(tx =>
      tx.executeSql(sqlInsert, [], (tx, resultSet) => {
        if (resultSet.rows.length > 0) {
          var item: IngredientPantry;
          for (var i = 0; i < resultSet.rows.length; i++) {
            item = resultSet.rows.item(i);
            result.push(item);
          }
        } else if (resultSet.rows.length == 0)
          console.log(
            'getIngredientPantries -> IngredientPantry Table is empty!',
          );
        else {
          console.log(
            "getIngredientPantries -> couldn't retrieve the IngredientPantries",
          );
        }
      }),
    );
    return result;
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
    const db = await getDbConnection();

    const sqlQuery = `UPDATE ${TABLE_INGREDIENT_PANTRY} SET ${INGREDIENT_PANTRY_INGREDIENT_ID} = ?, ${INGREDIENT_PANTRY_QUANTITY} = ?, ${INGREDIENT_PANTRY_QUANTITY_TYPE} = ? WHERE ${INGREDIENT_PANTRY_ID} = ?`;

    console.log(
      'updateIngredientPantry -> IngredientPantry update: ' +
        JSON.stringify(updatedIngredientPantry),
    );

    await db.transaction(tx =>
      tx.executeSql(
        sqlQuery,
        [
          updatedIngredientPantry.ingredientId,
          updatedIngredientPantry.quantity,
          updatedIngredientPantry.quantityType,
          updatedIngredientPantry.id,
        ],
        (tx, resultSet) => {
          if (resultSet.rowsAffected > 0)
            console.log(
              'updateIngredientPantry -> IngredientPantry updated successfully :) -> ' +
                JSON.stringify(resultSet.rows.item(0)),
            );
          else
            console.log(
              "updateIngredientPantry -> couldn't update IngredientPantry :(",
            );
        },
      ),
    );
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
 * @param {number} ingredientPantryId - The id of the  ingredientPantry that will be deleted
 * @returns {Promise<void>} A promise that resolves when the table is created successfully or if it already exists.
 */
export const deleteIngredientPantry: (
  ingredientPantryId: number,
) => Promise<void> = async ingredientPantryId => {
  try {
    const db = await getDbConnection();

    const sqlQuery = `DELETE FROM ${TABLE_INGREDIENT_PANTRY} WHERE ${INGREDIENT_PANTRY_ID} = ?`;

    await db.transaction(tx =>
      tx.executeSql(sqlQuery, [ingredientPantryId], (tx, resultSet) => {
        if (resultSet.rowsAffected > 0) {
          console.log(
            'deleteIngredientPantry -> IngredientPantry deleted successfully :)',
          );
        } else {
          console.log(
            "deleteIngredientPantry -> couldn't delete IngredientPantry :(",
          );
        }
      }),
    );
  } catch (error) {
    throw new Error(
      'deleteIngredientPantry -> error while deleting IngredientPantry: ' +
        JSON.stringify(error),
    );
  }
};

/**
 *
 *
 *
 *
 * WEEKLYMEALS TABLE CRUD FUNCTIONS
 */

/**
 * Creates the WeeklyMeals table in the database if it does not already exist.
 *
 * The WeeklyMeals table contains information about which recipe is assigned to each day and meal type (e.g., Breakfast, Lunch, Dinner).
 *
 * @async
 * @function createWeeklyMealsTable
 * @returns {Promise<void>} Resolves when the table is created successfully or if it already exists.
 */

export const createWeeklyMealsTable: () => Promise<void> = async () => {
  try {
    const db = await getDbConnection();

    const sqlCreateTable = `
      CREATE TABLE IF NOT EXISTS ${TABLE_WEEKLY_MEALS} (
        ${WEEKLY_MEALS_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
        ${WEEKLY_MEALS_DAY} TEXT NOT NULL,
        ${WEEKLY_MEALS_MEAL_TYPE} TEXT NOT NULL,
        ${WEEKLY_MEALS_RECIPE_ID} INTEGER,
        FOREIGN KEY (${WEEKLY_MEALS_RECIPE_ID}) REFERENCES ${TABLE_RECIPE}(${RECIPE_ID}),
        UNIQUE(${WEEKLY_MEALS_DAY}, ${WEEKLY_MEALS_MEAL_TYPE})
      );
    `;

    await db.transaction(tx => {
      tx.executeSql(
        sqlCreateTable,
        [],
        () => {
          console.log(
            'createWeeklyMealsTable -> Table created successfully or already exists.',
          );
        },
        (_, error) => {
          console.error(
            'createWeeklyMealsTable -> SQL error in table creation:',
            error,
          );
        },
      );
    });
  } catch (error) {
    console.error('createWeeklyMealsTable -> Transaction failed:', error);
    throw new Error(`createWeeklyMealsTable: ${error}`);
  }
};

/**
 * Adds a new entry to the WeeklyMeals table.
 *
 * This function inserts a new row into the WeeklyMeals table, assigning a recipe to a specific day and meal type.
 * If the same entry already exists, the function ignores the insertion.
 *
 * @async
 * @function addWeeklyMeal
 * @param {string} day - The day of the week (e.g., "Monday").
 * @param {string} mealType - The type of meal (e.g., "Breakfast", "Lunch", "Dinner").
 * @param {number} recipeId - The ID of the recipe to be assigned.
 * @returns {Promise<void>} Resolves when the weekly meal is added successfully or the insertion is ignored.
 */
export const addWeeklyMeal: (
  day: string,
  mealType: MealType,
  recipeId: number,
) => Promise<void> = async (day, mealType, recipeId) => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `
      INSERT OR IGNORE INTO ${TABLE_WEEKLY_MEALS} (
        ${WEEKLY_MEALS_DAY},
        ${WEEKLY_MEALS_MEAL_TYPE},
        ${WEEKLY_MEALS_RECIPE_ID}
      ) VALUES (?, ?, ?);
    `;

    await db.transaction(tx => {
      tx.executeSql(
        sqlInsert,
        [day, mealType, recipeId],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('addWeeklyMeal -> Meal added successfully!');
          } else {
            console.log('addWeeklyMeal -> Meal not added or already exists.');
          }
        },
        error => {
          console.error(
            'addWeeklyMeal -> SQL error in adding weekly meal:',
            error,
          );
        },
      );
    });
  } catch (error) {
    console.error('addWeeklyMeal -> Transaction failed:', error);
    throw new Error(`addWeeklyMeal: ${error}`);
  }
};

/**
 * Fetches all entries from the WeeklyMeals table.
 *
 * This function retrieves all weekly meal assignments from the WeeklyMeals table.
 *
 * @async
 * @function getWeeklyMeals
 * @returns {Promise<WeeklyMeal[]>} Resolves with an array of weekly meal entries.
 */
export const getWeeklyMeals: () => Promise<WeeklyMeal[]> = async () => {
  try {
    const db = await getDbConnection();
    const sqlSelect = `SELECT * FROM ${TABLE_WEEKLY_MEALS}`;
    const weeklyMeals: any[] = [];

    await db.transaction(tx => {
      tx.executeSql(
        sqlSelect,
        [],
        (tx, resultSet) => {
          const len = resultSet.rows.length;
          for (let i = 0; i < len; i++) {
            const row = resultSet.rows.item(i);
            weeklyMeals.push(row);
          }
        },
        error => {
          console.error(
            'getWeeklyMeals -> SQL error fetching weekly meals:',
            error,
          );
        },
      );
    });

    return weeklyMeals;
  } catch (error) {
    console.error('getWeeklyMeals -> Transaction error:', error);
    return [];
  }
};

/**
 * Retrieves the WeeklyMeals for a specific DayOfWeek and MealType combination.
 *
 * This function fetches all records from the WeeklyMeals table that match the provided
 * day of the week and meal type. It is useful for retrieving meal plans for specific
 * days and meal types (e.g., Breakfast on Monday).
 *
 * @async
 * @function getWeeklyMealsByDayAndMealType
 * @param {DayOfWeek} dayOfWeek - The day of the week for which meals are to be fetched (e.g., Monday, Tuesday).
 * @param {MealType} mealType - The type of meal for which meals are to be fetched (e.g., Breakfast, Lunch, Dinner).
 * @returns {Promise<WeeklyMeals[]>} Resolves with an array of WeeklyMeals objects that match the criteria, or an empty array if no matches are found.
 * @throws {Error} Throws an error if the retrieval operation fails.
 *
 * @example
 * getWeeklyMealsByDayAndMealType(DayOfWeek.MONDAY, MealType.BREAKFAST)
 *   .then(weeklyMeals => console.log(weeklyMeals))
 *   .catch(error => console.error('Error fetching weekly meals:', error));
 */
export const getWeeklyMealsByDayAndMealType: (
  dayOfWeek: DaysOfWeek,
  mealType: MealType,
) => Promise<WeeklyMeal[]> = async (dayOfWeek, mealType) => {
  try {
    const db = await getDbConnection();

    const sqlQuery = `SELECT * FROM ${TABLE_WEEKLY_MEALS} WHERE ${WEEKLY_MEALS_DAY}=? AND ${WEEKLY_MEALS_MEAL_TYPE}=?`;
    const result: WeeklyMeal[] = [];

    await db.transaction(tx =>
      tx.executeSql(
        sqlQuery,
        [dayOfWeek, mealType],
        (tx, resultSet) => {
          for (let i = 0; i < resultSet.rows.length; i++) {
            result.push(resultSet.rows.item(i));
          }
        },
        error => {
          console.error('SQL error:', error);
        },
      ),
    );

    return result;
  } catch (error) {
    console.error('Error fetching WeeklyMeals:', error);
    throw new Error('Error fetching WeeklyMeals:' + error);
  }
};

/**
 * Updates an existing entry in the WeeklyMeals table.
 *
 * This function updates a row in the WeeklyMeals table with new values for the day, meal type, and recipe ID.
 *
 * @async
 * @function updateWeeklyMeal
 * @param {number} id - The ID of the weekly meal entry to be updated.
 * @param {string} day - The updated day of the week (e.g., "Monday").
 * @param {string} mealType - The updated type of meal (e.g., "Breakfast", "Lunch", "Dinner").
 * @param {number} recipeId - The updated recipe ID.
 * @returns {Promise<void>} Resolves when the weekly meal entry is updated successfully.
 */
export const updateWeeklyMeal: (
  id: number,
  day: string,
  mealType: string,
  recipeId: number,
) => Promise<void> = async (id, day, mealType, recipeId) => {
  try {
    const db = await getDbConnection();

    const sqlUpdate = `
      UPDATE ${TABLE_WEEKLY_MEALS}
      SET ${WEEKLY_MEALS_DAY} = ?, ${WEEKLY_MEALS_MEAL_TYPE} = ?, ${WEEKLY_MEALS_RECIPE_ID} = ?
      WHERE ${WEEKLY_MEALS_ID} = ?;
    `;

    await db.transaction(tx => {
      tx.executeSql(
        sqlUpdate,
        [day, mealType, recipeId, id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('updateWeeklyMeal -> Meal updated successfully!');
          } else {
            console.log('updateWeeklyMeal -> Meal update failed.');
          }
        },
        error => {
          console.error(
            'updateWeeklyMeal -> SQL error updating weekly meal:',
            error,
          );
        },
      );
    });
  } catch (error) {
    console.error('updateWeeklyMeal -> Transaction failed:', error);
    throw new Error(`updateWeeklyMeal: ${error}`);
  }
};

/**
 * Deletes an entry from the WeeklyMeals table by its ID.
 *
 * This function removes a row from the WeeklyMeals table based on the provided ID.
 *
 * @async
 * @function deleteWeeklyMeal
 * @param {number} id - The ID of the weekly meal entry to be deleted.
 * @returns {Promise<void>} Resolves when the weekly meal entry is deleted successfully.
 */
export const deleteWeeklyMeal: (id: number) => Promise<void> = async id => {
  try {
    const db = await getDbConnection();
    const sqlDelete = `DELETE FROM ${TABLE_WEEKLY_MEALS} WHERE ${WEEKLY_MEALS_ID} = ?;`;

    await db.transaction(tx => {
      tx.executeSql(
        sqlDelete,
        [id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('deleteWeeklyMeal -> Meal deleted successfully!');
          } else {
            console.log('deleteWeeklyMeal -> Meal not found or delete failed.');
          }
        },
        error => {
          console.error(
            'deleteWeeklyMeal -> SQL error deleting weekly meal:',
            error,
          );
        },
      );
    });
  } catch (error) {
    console.error('deleteWeeklyMeal -> Transaction failed:', error);
    throw new Error(`deleteWeeklyMeal: ${error}`);
  }
};

//
//
//
//Generic Tables CRUD functions

export const getTableNames = async () => {
  try {
    const db = await getDbConnection();

    // SQL query to get the names of all tables
    const sqlQuery = `SELECT name FROM sqlite_master WHERE type='table';`;

    // Execute the query
    const results = await db.executeSql(sqlQuery);

    if (results[0]?.rows?.length > 0) {
      const tableNames = [];
      for (let i = 0; i < results[0].rows.length; i++) {
        const tableName = results[0].rows.item(i).name;
        tableNames.push(tableName);
      }

      return tableNames;
    } else {
      console.log('No tables found.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching table names:', error);
    return [];
  }
};

// Function to drop all tables
export const dropAllTables = async () => {
  try {
    const db = await getDbConnection();
    const selectTablesQuery = `SELECT name FROM sqlite_master WHERE type='table';`;

    await db.transaction(tx => {
      tx.executeSql(selectTablesQuery, [], (tx, results) => {
        const rows = results.rows;

        // Loop through the list of tables and drop each one
        for (let i = 0; i < rows.length; i++) {
          const tableName = rows.item(i).name;
          if (
            tableName !== 'sqlite_sequence' &&
            tableName !== 'android_metadata'
          ) {
            const dropTableQuery = `DROP TABLE IF EXISTS ${tableName};`;
            tx.executeSql(dropTableQuery, [], () => {
              console.log(`Dropped table: ${tableName}`);
            });
          }
        }
      });
    });
  } catch (error) {
    console.error('Error dropping tables:', error);
  }
};
