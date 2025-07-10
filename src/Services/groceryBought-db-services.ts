// src/Services/groceryBought-db-services.ts
import {getDbConnection} from './db-services';

// Table name
export const TABLE_GROCERY_BOUGHT = 'GroceryBought';

// Column names
export const GROCERY_BOUGHT_INGREDIENT_ID = 'ingredientId';
export const GROCERY_BOUGHT_TIMESTAMP = 'boughtAt';

/**
 * Creates the GroceryBought table if it doesn't already exist.
 */
export const createGroceryBoughtTableDb: () => Promise<void> = async () => {
  try {
    const db = await getDbConnection();
    const sql = `
      CREATE TABLE IF NOT EXISTS ${TABLE_GROCERY_BOUGHT} (
        ${GROCERY_BOUGHT_INGREDIENT_ID} INTEGER PRIMARY KEY,
        ${GROCERY_BOUGHT_TIMESTAMP}     TEXT NOT NULL
      );
    `;
    await db.transaction(tx =>
      tx.executeSql(
        sql,
        [],
        () => console.log('createGroceryBoughtTable -> Table ready'),
        (_, err) => {
          console.error('createGroceryBoughtTable ->', err);
          return false;
        },
      ),
    );
  } catch (e) {
    throw new Error('createGroceryBoughtTable -> ' + e);
  }
};

/**
 * Marks an ingredient as bought. If already marked, replaces timestamp.
 * @param ingredientId
 */
export const addGroceryBoughtDb: (
  ingredientId: number,
) => Promise<void> = async ingredientId => {
  try {
    const db = await getDbConnection();
    const now = new Date().toISOString();
    const sql = `
      INSERT OR REPLACE INTO ${TABLE_GROCERY_BOUGHT}
        (${GROCERY_BOUGHT_INGREDIENT_ID}, ${GROCERY_BOUGHT_TIMESTAMP})
      VALUES (?, ?);
    `;
    await db.transaction(tx =>
      tx.executeSql(
        sql,
        [ingredientId, now],
        () => console.log(`addGroceryBought -> ${ingredientId} marked bought`),
        (_, err) => {
          console.error('addGroceryBought ->', err);
          return false;
        },
      ),
    );
  } catch (e) {
    throw new Error('addGroceryBought -> ' + e);
  }
};

/**
 * Unmarks an ingredient (removes its bought‐flag).
 * @param ingredientId
 */
export const removeGroceryBoughtDb: (
  ingredientId: number,
) => Promise<void> = async ingredientId => {
  try {
    const db = await getDbConnection();
    const sql = `
      DELETE FROM ${TABLE_GROCERY_BOUGHT}
      WHERE ${GROCERY_BOUGHT_INGREDIENT_ID} = ?;
    `;
    await db.transaction(tx =>
      tx.executeSql(
        sql,
        [ingredientId],
        () => console.log(`removeGroceryBought -> ${ingredientId} unmarked`),
        (_, err) => {
          console.error('removeGroceryBought ->', err);
          return false;
        },
      ),
    );
  } catch (e) {
    throw new Error('removeGroceryBought -> ' + e);
  }
};

/**
 * Returns an array of all ingredientIds currently marked bought.
 */
export const getAllGroceryBoughtDb: () => Promise<number[]> = async () => {
  try {
    const db = await getDbConnection();
    const sql = `SELECT ${GROCERY_BOUGHT_INGREDIENT_ID} FROM ${TABLE_GROCERY_BOUGHT};`;
    const result: number[] = [];
    await db.transaction(tx =>
      tx.executeSql(
        sql,
        [],
        (_, {rows}) => {
          for (let i = 0; i < rows.length; i++) {
            result.push(rows.item(i)[GROCERY_BOUGHT_INGREDIENT_ID]);
          }
        },
        (_, err) => {
          console.error('getAllGroceryBought ->', err);
          return false;
        },
      ),
    );
    return result;
  } catch (e) {
    throw new Error('getAllGroceryBought -> ' + e);
  }
};
