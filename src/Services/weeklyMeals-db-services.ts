import {
  DaysOfWeek,
  MealType,
  WeeklyMeal,
  WeeklyMealWithoutId,
} from '../Types/Types';
import {getDbConnection, TABLE_WEEKLY_MEALS, TABLE_RECIPE} from './db-services';
import {RECIPE_ID} from './recipe-db-services';

// Fields for the WeeklyMeals table
export const WEEKLY_MEALS_ID = 'id';
export const WEEKLY_MEALS_DAY = 'day';
export const WEEKLY_MEALS_MEAL_TYPE = 'mealType';
export const WEEKLY_MEALS_RECIPE_ID = 'recipeId';

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
  weeklyMeal: WeeklyMealWithoutId,
) => Promise<number> = async weeklyMeal => {
  const res = -1;
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
        [weeklyMeal.day, weeklyMeal.mealType, weeklyMeal.recipeId],
        (tx, results) => {
          if (results.rowsAffected > 0) {
            console.log('addWeeklyMeal -> Meal added successfully!');
            return results.insertId;
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
    return res;
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
export const deleteWeeklyMeal: (id: number) => Promise<boolean> = async id => {
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
            return true;
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
    return false;
  } catch (error) {
    console.error('deleteWeeklyMeal -> Transaction failed:', error);
    throw new Error(`deleteWeeklyMeal: ${error}`);
  }
};
