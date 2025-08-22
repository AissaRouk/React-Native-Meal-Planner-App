// src/Services/groceryBought-db-services.ts
import {GroceryBought} from '../Types/Types';
import {getDbConnection} from './db-services';
import {
  collection,
  query,
  getDocs,
  getFirestore,
  setDoc,
  doc,
  deleteDoc,
  getDoc,
  addDoc,
  FirebaseFirestoreTypes,
  where,
} from '@react-native-firebase/firestore';

// Table name
export const TABLE_GROCERY_BOUGHT = 'GroceryBought';

// Column names
export const GROCERY_BOUGHT_INGREDIENT_ID = 'ingredientId';
export const GROCERY_BOUGHT_TIMESTAMP = 'boughtAt';

const firestoreDb = getFirestore();
const groceryBoughtCollection = collection(firestoreDb, 'GroceryBought');

/**
 * Marks an ingredient as bought. If already marked, replaces timestamp.
 * @param ingredientId
 */
export const addGroceryBoughtDb = async (
  groceryBought: Omit<GroceryBought, 'id'>,
): Promise<GroceryBought> => {
  try {
    const docRef = await addDoc(groceryBoughtCollection, groceryBought);
    const newGroceryBought = {id: docRef.id, ...groceryBought};
    console.log(
      'addGroceryBoughtDb -> GroceryBought added: ' +
        JSON.stringify(newGroceryBought),
    );
    return newGroceryBought;
  } catch (error) {
    console.error('addGroceryBoughtDb -> Transaction failed:', error);
    throw new Error(`Failed to add groceryBought: ${error}`);
  }
};

/**
 * Unmarks an ingredient (removes its bought‐flag).
 * @param ingredientId
 */
export const removeGroceryBoughtDb: (
  ingredientId: string,
) => Promise<void> = async ingredientId => {
  try {
    const q = query(
      groceryBoughtCollection,
      where('ingredientId', '==', ingredientId),
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Delete all matching documents
      querySnapshot.forEach(
        async (docSnapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          await deleteDoc(doc(groceryBoughtCollection, docSnapshot.id));
        },
      );
      console.log(
        'removeGroceryBought -> GroceryBought documents deleted successfully for ingredientId:',
        ingredientId,
      );
    } else {
      console.log(
        'removeGroceryBought -> No GroceryBought documents found for ingredientId:',
        ingredientId,
      );
    }
  } catch (e) {
    console.error(
      'removeGroceryBought -> Error removing GroceryBought documents:',
      e,
    );
    throw new Error('removeGroceryBought -> ' + e);
  }
};

/**
 * Returns an array of all ingredientIds currently marked bought.
 */
export const getAllGroceryBoughtDb = async (): Promise<GroceryBought[]> => {
  try {
    const groceryBoughts: GroceryBought[] = [];
    const groceryBoughtQuery = query(groceryBoughtCollection);
    const querySnapshot = await getDocs(groceryBoughtQuery);
    querySnapshot.forEach(
      (docSnapshot: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        groceryBoughts.push({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        } as GroceryBought);
      },
    );
    return groceryBoughts;
  } catch (error) {
    console.error('getAllGroceryBoughtDb -> Transaction failed:', error);
    throw new Error(`Failed to get all groceryBoughts: ${error}`);
  }
};

export const updateGroceryBoughtDb = async (
  groceryBought: GroceryBought,
): Promise<void> => {
  try {
    const docRef = doc(groceryBoughtCollection, groceryBought.id);
    await setDoc(docRef, groceryBought);
    console.log('updateGroceryBoughtDb -> GroceryBought updated');
  } catch (error) {
    console.error('updateGroceryBoughtDb -> Transaction failed:', error);
    throw new Error(`Failed to update groceryBought: ${error}`);
  }
};

export const deleteGroceryBoughtDb = async (id: string): Promise<void> => {
  try {
    const docRef = doc(groceryBoughtCollection, id);
    await deleteDoc(docRef);
    console.log('deleteGroceryBoughtDb -> GroceryBought deleted');
  } catch (error) {
    console.error('deleteGroceryBoughtDb -> Transaction failed:', error);
    throw new Error(`Failed to delete groceryBought: ${error}`);
  }
};
