import {openDatabase} from 'react-native-sqlite-storage';

//function to get the database connection
export const getDbConnection = async () => {
  return openDatabase({name: 'MealPlanningDB', location: 'default'});
};

//function that creates all the databases if they don't exist
export const createTables = async () => {};
