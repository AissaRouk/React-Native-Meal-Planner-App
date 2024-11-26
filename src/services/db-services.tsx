import {enablePromise, openDatabase} from 'react-native-sqlite-storage';
import {
  Ingredient,
  IngredientWithoutId,
  PantryWithoutId,
  QuantityType,
  Recipe,
  RecipeIngredient,
  RecipeIngredientWithoutId,
  RecipeWithoutId,
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
export const INGREDIENT_PANTRY_INGREDIENT_ID = 'ingredient_id';
export const INGREDIENT_PANTRY_QUANTITY = 'quantity';
export const INGREDIENT_PANTRY_UNIT = 'unit';

// Fields for the Category table
export const CATEGORY_ID = 'id';
export const CATEGORY_NAME = 'name';

// Function to create tables
export const createTables = async () => {
  const db = await getDbConnection();

  // // Create Ingredient table
  // const createIngredientTable = `
  //   CREATE TABLE IF NOT EXISTS ${TABLE_INGREDIENT} (
  //     ${INGREDIENT_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
  //     ${INGREDIENT_NAME} TEXT NOT NULL,
  //     ${INGREDIENT_CATEGORY_ID} INTEGER,
  //     FOREIGN KEY (${INGREDIENT_CATEGORY_ID}) REFERENCES ${TABLE_CATEGORY}(${CATEGORY_ID})
  //   );
  // `;

  // Create RecipeIngredients table
  const createRecipeIngredientsTable = `
    CREATE TABLE IF NOT EXISTS ${TABLE_RECIPE_INGREDIENTS} (
      ${RECIPE_INGREDIENTS_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${RECIPE_INGREDIENTS_RECIPE_ID} INTEGER,
      ${RECIPE_INGREDIENTS_INGREDIENT_ID} INTEGER,
      ${RECIPE_INGREDIENTS_QUANTITY} REAL,
      ${RECIPE_INGREDIENTS_QUANTITY_TYPE} TEXT CHECK(${RECIPE_INGREDIENTS_QUANTITY_TYPE} IN ('gr', 'kg', 'L', 'ml')),
      FOREIGN KEY (${RECIPE_INGREDIENTS_RECIPE_ID}) REFERENCES ${TABLE_RECIPE}(${RECIPE_ID}),
      FOREIGN KEY (${RECIPE_INGREDIENTS_INGREDIENT_ID}) REFERENCES ${TABLE_INGREDIENT}(${INGREDIENT_ID})
    );
  `;

  // Create GroceryList table
  const createGroceryListTable = `
    CREATE TABLE IF NOT EXISTS ${TABLE_GROCERY_LIST} (
      ${GROCERY_LIST_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${GROCERY_LIST_RECIPE_INGREDIENTS} INTEGER,
      FOREIGN KEY (${GROCERY_LIST_RECIPE_INGREDIENTS}) REFERENCES ${TABLE_RECIPE_INGREDIENTS}(${RECIPE_INGREDIENTS_ID})
    );
  `;

  // Create Pantry table
  const createPantryTable = `
    CREATE TABLE IF NOT EXISTS ${TABLE_PANTRY} (
      ${PANTRY_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${PANTRY_INGREDIENT_PANTRY} INTEGER,
      FOREIGN KEY (${PANTRY_INGREDIENT_PANTRY}) REFERENCES ${TABLE_INGREDIENT_PANTRY}(${INGREDIENT_PANTRY_ID})
    );
  `;

  // Create IngredientPantry table
  const createIngredientPantryTable = `
    CREATE TABLE IF NOT EXISTS ${TABLE_INGREDIENT_PANTRY} (
      ${INGREDIENT_PANTRY_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${INGREDIENT_PANTRY_INGREDIENT_ID} INTEGER,
      ${INGREDIENT_PANTRY_QUANTITY} REAL,
      ${INGREDIENT_PANTRY_UNIT} TEXT,
      FOREIGN KEY (${INGREDIENT_PANTRY_INGREDIENT_ID}) REFERENCES ${TABLE_INGREDIENT}(${INGREDIENT_ID})
    );
  `;

  // Create Category table
  const createCategoryTable = `
    CREATE TABLE IF NOT EXISTS ${TABLE_CATEGORY} (
      ${CATEGORY_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${CATEGORY_NAME} TEXT NOT NULL
    );
  `;
  // try {
  //   // Execute all table creation queries
  //   await db.transaction(tx => {
  //     tx.executeSql(createRecipeTable);
  //     // tx.executeSql(createIngredientTable);
  //     tx.executeSql(createRecipeIngredientsTable);
  //     tx.executeSql(createGroceryListTable);
  //     tx.executeSql(createPantryTable);
  //     tx.executeSql(createIngredientPantryTable);
  //     tx.executeSql(createCategoryTable);
  //   });
  // } catch (error) {
  //   throw Error('Failed to create tables because: ' + JSON.stringify(error));
  // }
};

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
 * @param {string} name - The name of the ingredient to add (must be unique).
 * @param {string} category - The category of the ingredient (e.g., "Spice", "Vegetable").
 * @returns {Promise<void>} Resolves when the ingredient is added or the insertion is ignored if it already exists.
 *
 */
export const addIngredient = async (
  ingredient: IngredientWithoutId,
): Promise<void> => {
  try {
    // Get database connection
    const db = await getDbConnection();

    // SQL query to insert a new ingredient
    const insertQuery = `INSERT OR IGNORE INTO ${TABLE_INGREDIENT} (${INGREDIENT_NAME}, ${INGREDIENT_CATEGORY}) VALUES (?, ?);`;

    // Execute the query
    await db.transaction(tx => {
      tx.executeSql(
        insertQuery,
        [ingredient.name, ingredient.category],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('addIngredient -> Ingredient added successfully!');
          } else {
            console.log(
              'addIngredient -> Ingredient already exists, insertion ignored.',
            );
          }
        },
        error => {
          console.error(
            'addIngredient -> SQL error in adding ingredient:',
            error,
          );
        },
      );
    });
  } catch (error) {
    console.error('addIngredient -> Transaction failed:', error);
    throw new Error(`addIngredient: ${error}`);
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
export const getIngredients: () => Promise<Ingredient[]> = async (): Promise<
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
 * Function that gets a recipe by id
 *
 * @param {number} id te id of the recipe wanted to be fetched
 */
export const getRecipeById: (id: number) => Promise<void> = async id => {
  const db = getDbConnection();

  const sqlInsert = `SELECT * FROM ${TABLE_RECIPE} WHERE ${RECIPE_ID}= ?`;

  (await db).transaction(tx =>
    tx.executeSql(sqlInsert, [id], (tx, resultSet) => {
      if (resultSet.rows.length > 0) {
        console.log('Recipe found: ' + JSON.stringify(resultSet.rows.item(0)));
      } else console.log("Couldn't find any recipe!");
    }),
  );
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

    console.log('getRecipeIngredients -> ' + JSON.stringify(result));
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
  } catch (error) {}
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

    const sqlInsert = `INSERT OR IGNORE INTO ${TABLE_PANTRY} (${PANTRY_INGREDIENT_PANTRY} = ?)`;

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
 * Ingredient Pantry Table Operations
 */

/**
 *
 *
 * @returns
 */
export const createIngredientPantryTable: () => Promise<void> = async () => {
  try {
    const db = await getDbConnection();

    const sqlInsert = `CREATE TABLE IF NOT EXISTS ${TABLE_INGREDIENT_PANTRY} (
    ${INGREDIENT_PANTRY_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
    ${INGREDIENT_PANTRY_INGREDIENT_ID} INTEGER UNIQUE,
    ${INGREDIENT_PANTRY_QUANTITY} REAL
    FOREIGN KEY (${INGREDIENT_PANTRY_INGREDIENT_ID}) REFERENCES ${TABLE_INGREDIENT}(${INGREDIENT_ID}),
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
    throw new Error('Error in createIngredientPantryTable -> ' + error);
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

      console.log('Table names:', tableNames);
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
