import {openDatabase} from 'react-native-sqlite-storage';
import {Ingredient} from '../Types/Types';

// Function to get the database connection
export const getDbConnection = async () => {
  return openDatabase({name: 'MealPlanningDB', location: 'default'});
};

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
export const INGREDIENT_CATEGORY_ID = '';

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

  // Create Recipe table
  const createRecipeTable = `
    CREATE TABLE IF NOT EXISTS ${TABLE_RECIPE} (
      ${RECIPE_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${RECIPE_NAME} TEXT NOT NULL,
      ${RECIPE_LINK} TEXT,
      ${RECIPE_PREP_TIME} INTEGER,
      ${RECIPE_SERVING_SIZE} INTEGER
    );
  `;

  // Create Ingredient table
  const createIngredientTable = `
    CREATE TABLE IF NOT EXISTS ${TABLE_INGREDIENT} (
      ${INGREDIENT_ID} INTEGER PRIMARY KEY AUTOINCREMENT,
      ${INGREDIENT_NAME} TEXT NOT NULL,
      ${INGREDIENT_CATEGORY_ID} INTEGER,
      FOREIGN KEY (${INGREDIENT_CATEGORY_ID}) REFERENCES ${TABLE_CATEGORY}(${CATEGORY_ID})
    );
  `;

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

  // Execute all table creation queries
  await db.transaction(tx => {
    tx.executeSql(createRecipeTable);
    tx.executeSql(createIngredientTable);
    tx.executeSql(createRecipeIngredientsTable);
    tx.executeSql(createGroceryListTable);
    tx.executeSql(createPantryTable);
    tx.executeSql(createIngredientPantryTable);
    tx.executeSql(createCategoryTable);
  });
};

//Ingredient CRUD functions

/**
 * Function that creates a ingredient
 */
export const createIngredient = async (name: String, category: String) => {
  try {
    //get db connection
    const db = await getDbConnection();

    //SQL query to insert a new ingredient
    const insertQuery = `INSERT INTO ${TABLE_INGREDIENT} (name, category)
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
export const getIngredients = async (): Promise<Ingredient[]> => {
  try {
    // Get db connection
    const db = await getDbConnection();

    // SQL query to fetch all ingredients
    const selectQuery = `SELECT * FROM ${TABLE_INGREDIENT}`;

    const ingredients: Ingredient[] = [];

    // Execute the query and process the results
    const results = await db.transaction(tx => {
      tx.executeSql(selectQuery, [], (tx, results) => {
        const rows = results.rows;
        for (let i = 0; i < rows.length; i++) {
          const item = rows.item(i);
          // Map each row to the Ingredient type
          ingredients.push({
            id: item.id,
            name: item.name,
            category: item.category_id,
          });
        }
      });
    });

    return ingredients;
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }
};
