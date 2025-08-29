import {
  DaysOfWeek,
  MealType,
  WeeklyMeal,
  WeeklyMealWithoutId,
} from '../Types/Types';
import {TABLE_WEEKLY_MEALS} from './db-services';
import {
  collection,
  query,
  getDocs,
  getFirestore,
  setDoc,
  doc,
  deleteDoc,
  where,
} from '@react-native-firebase/firestore';

// Fields for the WeeklyMeals table
export const WEEKLY_MEALS_ID = 'id';
export const WEEKLY_MEALS_DAY = 'day';
export const WEEKLY_MEALS_MEAL_TYPE = 'mealType';
export const WEEKLY_MEALS_RECIPE_ID = 'recipeId';

//firestore imports
const firestoreDb = getFirestore();
const weeklyMealCollection = collection(firestoreDb, TABLE_WEEKLY_MEALS);

/**
 * Adds a new entry to the WeeklyMeals table.
 *
 * @async
 * @function addWeeklyMealDb
 * @param {WeeklyMealWithoutId} weeklyMeal - The weekly meal to add.
 * @returns {Promise<string>} Resolves with the ID of the added weekly meal.
 */
export const addWeeklyMealDb: (
  weeklyMeal: WeeklyMealWithoutId,
) => Promise<string> = async weeklyMeal => {
  try {
    const newDocRef = doc(weeklyMealCollection);
    await setDoc(newDocRef, weeklyMeal);
    console.log(
      'addWeeklyMeal -> Weekly meal added successfully:',
      newDocRef.id,
    );
    return newDocRef.id;
  } catch (error) {
    console.error('addWeeklyMeal -> Transaction failed:', error);
    throw new Error(`addWeeklyMeal: ${error}`);
  }
};

/**
 * Fetches all entries from the WeeklyMeals table.
 *
 * @async
 * @function getWeeklyMealsDb
 * @returns {Promise<WeeklyMeal[]>} Resolves with an array of weekly meal entries.
 * @throws {Error} If there's an error fetching the weekly meals.
 */
export const getWeeklyMealsDb: () => Promise<WeeklyMeal[]> = async () => {
  try {
    const weeklyMeals: WeeklyMeal[] = [];
    // Firebase Implementation
    const weeklyMealsQuery = query(weeklyMealCollection);
    const querySnapshot = await getDocs(weeklyMealsQuery);
    querySnapshot.forEach((doc: {data: () => WeeklyMealWithoutId; id: any}) => {
      const data = doc.data() as WeeklyMealWithoutId;
      const wMeal: WeeklyMeal = {
        id: doc.id, // Use Firestore document ID as the ingredient ID
        ...data,
      };
      weeklyMeals.push(wMeal);
    });
    console.log(
      'getWeeklyMeals Firebase -> WeeklyMeals fetched successfully:',
      weeklyMeals,
    );

    return weeklyMeals;
  } catch (error) {
    console.error('getWeeklyMeals -> Transaction error:', error);
    throw new Error(`getWeeklyMeals: ${error}`); // Throw error for consistency
  }
};

/**
 * Retrieves the WeeklyMeals for a specific DayOfWeek and MealType combination.
 *
 * @async
 * @function getWeeklyMealsByDayAndMealTypeDb
 * @param {DayOfWeek} dayOfWeek - The day of the week for which meals are to be fetched.
 * @param {MealType} mealType - The type of meal for which meals are to be fetched.
 * @returns {Promise<WeeklyMeal[]>} Resolves with an array of WeeklyMeals objects that match the criteria.
 * @throws {Error} If the retrieval operation fails.
 */
export const getWeeklyMealsByDayAndMealTypeDb: (
  dayOfWeek: DaysOfWeek,
  mealType: MealType,
) => Promise<WeeklyMeal[]> = async (dayOfWeek, mealType) => {
  try {
    const weeklyMeals: WeeklyMeal[] = [];
    const weeklyMealsQuery = query(
      weeklyMealCollection,
      where(WEEKLY_MEALS_DAY, '==', dayOfWeek),
      where(WEEKLY_MEALS_MEAL_TYPE, '==', mealType),
    );
    const querySnapshot = await getDocs(weeklyMealsQuery);
    querySnapshot.forEach((doc: {data: () => WeeklyMealWithoutId; id: any}) => {
      const data = doc.data() as WeeklyMealWithoutId;
      weeklyMeals.push({
        id: doc.id,
        ...data,
      });
    });
    console.log(
      'getWeeklyMealsByDayAndMealTypeDb -> WeeklyMeals fetched successfully:',
      weeklyMeals,
    );
    return weeklyMeals;
  } catch (error) {
    console.error('Error fetching WeeklyMeals:', error);
    throw new Error('Error fetching WeeklyMeals:' + error);
  }
};

/**
 * Updates an existing entry in the WeeklyMeals table.
 *
 * @async
 * @function updateWeeklyMealDb
 * @param {WeeklyMeal} weeklyMeal - The weekly meal to update.
 * @returns {Promise<void>} Resolves when the weekly meal entry is updated successfully.
 * @throws {Error} If the update operation fails.
 */
export const updateWeeklyMealDb: (
  weeklyMeal: WeeklyMeal,
) => Promise<void> = async (weeklyMeal: WeeklyMeal) => {
  try {
    await setDoc(doc(weeklyMealCollection, weeklyMeal.id), weeklyMeal);
    console.log('updateWeeklyMeal -> Weekly meal updated successfully');
  } catch (error) {
    console.error('updateWeeklyMeal -> Transaction failed:', error);
    throw new Error(`updateWeeklyMeal: ${error}`);
  }
};

/**
 * Deletes an entry from the WeeklyMeals table by its ID.
 *
 * @async
 * @function deleteWeeklyMealDb
 * @param {string} id - The ID of the weekly meal entry to be deleted.
 * @returns {Promise<boolean>} Resolves with true if the deletion was successful.
 * @throws {Error} If the deletion operation fails.
 */
export const deleteWeeklyMealDb: (
  id: string,
) => Promise<boolean> = async id => {
  try {
    const weeklyMealDoc = doc(weeklyMealCollection, id);
    await deleteDoc(weeklyMealDoc);
    console.log('deleteWeeklyMeal -> Weekly meal deleted successfully');
    return true;
  } catch (error) {
    console.error('deleteWeeklyMeal -> Transaction failed:', error);
    throw new Error(`deleteWeeklyMeal: ${error}`); // Throw error instead of returning false
  }
};

/**
 * Fetches all entries from the WeeklyMeals table.
 *
 * @async
 * @function getAllWeeklyMeals
 * @returns {Promise<WeeklyMeal[]>} Resolves with an array of weekly meal entries.
 * @throws {Error} If there's an error fetching the weekly meals.
 */
export const getAllWeeklyMealsDb: () => Promise<WeeklyMeal[]> = async () => {
  try {
    const weeklyMeals: WeeklyMeal[] = [];
    const weeklyMealsQuery = query(weeklyMealCollection);
    const querySnapshot = await getDocs(weeklyMealsQuery);
    querySnapshot.forEach(
      (doc: {data: () => WeeklyMealWithoutId; id: string}) => {
        const data = doc.data() as WeeklyMealWithoutId;
        weeklyMeals.push({
          id: doc.id,
          ...data,
        });
      },
    );
    console.log(
      'getAllWeeklyMeals Firebase -> WeeklyMeals fetched successfully:',
      weeklyMeals,
    );

    return weeklyMeals;
  } catch (error) {
    console.error('getAllWeeklyMeals -> Transaction error:', error);
    throw new Error(`getAllWeeklyMeals: ${error}`); // Throw error for consistency
  }
};
