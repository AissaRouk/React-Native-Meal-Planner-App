import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import {createTables, createIngredient} from './src/services/db-services';

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize tables and insert ingredient
    const initializeDatabase = async () => {
      try {
        // Create tables
        await createTables();
        console.log('Tables created successfully.');

        // Insert a test ingredient (for example, 'Tomato' under category 'Vegetable')
        await createIngredient('Tomato', 'Vegetable');
        console.log('Ingredient inserted successfully.');
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };

    // Call the function to initialize the database and add data
    initializeDatabase();
  }, []);

  return (
    <View>
      <Text>Database Initialized. Check the logs for results.</Text>
    </View>
  );
}

export default App;
