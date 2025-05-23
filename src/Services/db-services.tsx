import {enablePromise, openDatabase} from 'react-native-sqlite-storage';

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

// Fields for the GroceryList table
export const GROCERY_LIST_ID = 'id';
export const GROCERY_LIST_RECIPE_INGREDIENTS = 'recipeIngredients';

//Flags indicating the success or failure of database operations.
export const SUCCESS = true;
export const FAILED = false;

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
