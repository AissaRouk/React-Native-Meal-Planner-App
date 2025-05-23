import {
  getDbConnection,
  TABLE_INGREDIENT,
  TABLE_INGREDIENT_PANTRY,
} from './db-services';
import {INGREDIENT_ID} from './ingredient-db-services';
import {IngredientPantry, IngredientPantryWithoutId} from '../Types/Types';

// Fields for the IngredientPantry table
export const INGREDIENT_PANTRY_ID = 'id';
export const INGREDIENT_PANTRY_INGREDIENT_ID = 'ingredientId';
export const INGREDIENT_PANTRY_QUANTITY = 'quantity';
export const INGREDIENT_PANTRY_QUANTITY_TYPE = 'quantityType';

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
