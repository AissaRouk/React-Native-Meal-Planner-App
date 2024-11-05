import {enablePromise, openDatabase} from 'react-native-sqlite-storage';
import {Ingredient, Recipe} from '../Types/Types';

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
export const RECIPE_INGREDIENTS_RECIPE_ID = 'recipe_id';
export const RECIPE_INGREDIENTS_INGREDIENT_ID = 'ingredient_id';
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
 * Create the ingredient table
 */
export const createIngredientTable = async () => {
  const db = await getDbConnection();
  const sqlInsert = `
    CREATE TABLE IF NOT EXISTS ${TABLE_INGREDIENT} (
      ${INGREDIENT_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${INGREDIENT_NAME} TEXT NOT NULL UNIQUE,
      ${INGREDIENT_CATEGORY} STRING
    );
  `;
  try {
    await db.transaction(tx => {
      tx.executeSql(sqlInsert, [], (transaction, resultSet) => {
        console.log(
          'createIngredientTable.transaction: ' + JSON.stringify(transaction),
        );
        console.log(
          'createIngredientTable.resultSet: ' + JSON.stringify(resultSet),
        );
      });
    });
  } catch (error) {
    throw new Error(
      'createIngredientTable.Error in createTable: ' + JSON.stringify(error),
    );
  }
};

/**
 * Function that adds an ingredient to the ingredient table if this one doesn't exist
 */
export const addIngredient = async (name: String, category: String) => {
  try {
    //get db connection
    const db = await getDbConnection();

    //SQL query to insert a new ingredient
    const insertQuery = `INSERT OR IGNORE INTO ${TABLE_INGREDIENT} (${INGREDIENT_NAME}, ${INGREDIENT_CATEGORY})
    VALUES (?, ?);`;

    //execute the query
    await db.transaction(tx => {
      tx.executeSql(insertQuery, [name, category], (tx, results) => {
        if (results.rowsAffected > 0)
          console.log('Ingredient added successfully!');
        else {
          console.log('Failed to add ingredient.');
        }
      });
    });
  } catch (error) {
    console.error('Error creating ingredient:', error);
  }
};

/**
 * Function that gets the content of the Ingredient table
 */
export const getIngredients: () => Promise<Ingredient[]> = async (): Promise<
  Ingredient[]
> => {
  try {
    // Get db connection
    const db = await getDbConnection();

    // SQL query to fetch all ingredients
    const selectQuery = `SELECT * FROM ${TABLE_INGREDIENT}`;

    const ingredients: Ingredient[] = [];

    // Execute the query and process the results
    await db.transaction(tx => {
      tx.executeSql(selectQuery, [], (tx, resultSet) => {
        const len = resultSet.rows.length;
        for (let i = 0; i < len; i++) {
          const row = resultSet.rows.item(i);
          ingredients.push(row);
        }
      });
    });

    return ingredients;
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }
};

/**
 * Function to delete an ingredient from the Ingredient Table
 */
export const deleteIngredient: (id: number) => Promise<void> = async (
  id: number,
) => {
  const db = await getDbConnection();

  const sqlInsert = `DELETE FROM ${TABLE_INGREDIENT} WHERE ${INGREDIENT_ID} = ?`;

  try {
    (await db).transaction(tx => {
      tx.executeSql(sqlInsert, [id], (tx, results) => {
        if (results.rowsAffected > 0)
          console.log('Ingredient deleted successfully!');
        else {
          console.log('Failed to delete ingredient.');
        }
      });
    });
  } catch (error) {
    throw new Error('Failed to delete ingredient: ' + error);
  }
};

/**
 * Function that updates a specific ingredient
 */
export const updateIngredient: (
  ingredient: Ingredient,
) => Promise<void> = async ingredient => {
  const db = getDbConnection();

  //sql query
  const sqlInsert = `UPDATE ${TABLE_INGREDIENT} SET ${INGREDIENT_NAME}=?, ${INGREDIENT_CATEGORY}=? WHERE ${INGREDIENT_ID}=?`;

  try {
    (await db).transaction(tx =>
      tx.executeSql(
        sqlInsert,
        [ingredient.name, ingredient.category, ingredient.id],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('Ingredient updated successfully!!');
          }
        },
      ),
    );
  } catch (error) {
    throw new Error('Erro in updating the ingredient: ' + error);
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
 * Function that creates the Recipe Table in the DB
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

    db.transaction(tx =>
      tx.executeSql(sqlInsert, [], (tx, results) => {
        if (results.rowsAffected > 0)
          console.log('Recipe table created successfully!!');
      }),
    );
  } catch (error) {
    throw new Error(
      'createRecipeTable -> Error creating the Recipe table: ' + error,
    );
  }
};

/**
 * Function that adds a Recipe in the table
 * ${RECIPE_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${RECIPE_NAME} TEXT NOT NULL,
      ${RECIPE_LINK} TEXT,
      ${RECIPE_PREP_TIME} INTEGER,
      ${RECIPE_SERVING_SIZE} INTEGER
 */
export const addRecipe: (
  name: string,
  link: string,
  preparationTime: number,
  servingSize: number,
) => Promise<void> = async (name, link, preparationTime, servingSize) => {
  try {
    const db = await getDbConnection();

    //SQL query
    const insertQuery = `INSERT OR IGNORE INTO ${TABLE_RECIPE} (${RECIPE_NAME}, ${RECIPE_LINK}, ${RECIPE_PREP_TIME}, ${RECIPE_SERVING_SIZE})
  VALUES (?, ?, ?, ?);`;

    //sql execution
    await db.transaction(tx =>
      tx.executeSql(
        insertQuery,
        [name, link, preparationTime, servingSize],
        (tx, resultSet) => {
          if (resultSet.rowsAffected > 0)
            console.log('Recipe added successfully!!');
          else console.log('Recipe not added!!');
        },
        (tx, error) =>
          console.log('Error in adding Recipe: ' + JSON.stringify(error)),
      ),
    );
  } catch (error) {
    throw new Error('addRecipe -> Error adding the Recipe table: ' + error);
  }
};

/**
 * Function that fetches all the Recipes
 */
export const getRecipes: () => Promise<Recipe[]> = async () => {
  const db = await getDbConnection();

  const sqlInsert = `SELECT * FROM ${TABLE_RECIPE}`;

  try {
    var fetchedRecipes: Recipe[] = [];

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
    throw new Error('Error in fetching the recipes: ' + error);
  }
};

/**
 * Function to update an existing recipe
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

export const checkRecipe: (id: number) => Promise<void> = async id => {
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

//
//
//
//General Table CRUD functions

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
