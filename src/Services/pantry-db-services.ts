import {getDbConnection, TABLE_PANTRY} from './db-services';
import {PantryWithoutId, Pantry} from '../Types/Types';

// Fields for the Pantry table
export const PANTRY_ID = 'id';
export const PANTRY_INGREDIENT_PANTRY = 'ingredientPantry';

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
