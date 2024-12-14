import React, {useEffect, useState} from 'react';
import {View, StyleSheet, ScrollView, Text} from 'react-native';
import {
  DaysOfWeek,
  Ingredient,
  MealType,
  Recipe,
  WeeklyMeal,
} from '../Types/Types';
import Header from '../Components/HeaderComponent';
import RecipeCard from '../Components/RecipeCardComponent';
import MealTypeComponent from '../Components/MealTypeComponent';
import {
  Breakfast,
  Dinner,
  fillTablesWMockupData,
  initialiseTables,
  Lunch,
} from './sucio';
import {
  getIngredients,
  getRecipeById,
  getRecipes,
  getWeeklyMeals,
  getWeeklyMealsByDayAndMealType,
} from '../services/db-services';

export default function MainScreen(): React.JSX.Element {
  // State to track the currently selected meal type (e.g., Breakfast, Lunch, Dinner)
  const [selectedMeal, setSelectedMeal] = useState<MealType>(
    MealType.BREAKFAST,
  );
  // State to track the currently selected day of the week
  const [selectedDay, setSelectedDay] = useState<DaysOfWeek>(DaysOfWeek.MONDAY);
  // State to store the fetched weekly meals based on the selected day and meal type
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeal[]>([]);
  // State to store the recipes corresponding to the fetched weekly meals
  const [recipes, setRecipes] = useState<Recipe[]>();

  // Fetches the weekly meals for a specific day and meal type
  const fetchWeeklyMeals = async (
    dayOfWeek: DaysOfWeek,
    mealType: MealType,
  ) => {
    return await getWeeklyMealsByDayAndMealType(dayOfWeek, mealType);
  };

  // Fetches the recipes for the weekly meals
  const fetchRecipes = async () => {
    const fetchedRecipes: Recipe[] = [];
    for (let i = 0; i < weeklyMeals.length; i++) {
      const item: Recipe | null = await getRecipeById(weeklyMeals[i].recipeId);
      if (item) fetchedRecipes.push(item); // Only add recipes that exist
    }
    setRecipes(fetchedRecipes); // Update the state with fetched recipes
  };

  // Runs once when the component is mounted to initialize and populate the database
  useEffect(() => {
    const asyncFunctions = async () => {
      await initialiseTables(); // Initializes the database tables
      await fillTablesWMockupData(); // Fills the tables with mock data for testing
    };
    asyncFunctions().catch(error =>
      console.log(
        'MainScreen -> error in asyncFunctions : ' + JSON.stringify(error),
      ),
    );
  }, []);

  // Fetches the weekly meals whenever the selected day or meal type changes
  useEffect(() => {
    if (selectedDay && selectedMeal) {
      const fetchData = async () => {
        try {
          setRecipes([]); // Clear previous recipes to avoid stale data
          const fetchedWeeklyMeals: WeeklyMeal[] = await fetchWeeklyMeals(
            selectedDay,
            selectedMeal,
          );
          setWeeklyMeals(fetchedWeeklyMeals);
          console.log(
            'weeklyMeals: ' + JSON.stringify(fetchedWeeklyMeals, null, 1),
          );
        } catch (error) {
          console.error(
            'Error fetching weekly meals: ' + JSON.stringify(error),
          );
        }
      };

      fetchData();
    }
  }, [selectedMeal, selectedDay]);

  // Fetches recipes whenever the weekly meals state is updated
  useEffect(() => {
    const functions = async () => {
      await fetchRecipes(); // Fetch recipes corresponding to the current weekly meals
    };
    if (weeklyMeals.length >= 1) {
      console.log('useEffectweeklyMeals -> entered');
      functions(); // Call the function if weeklyMeals is not empty
    }
  }, [weeklyMeals]);

  return (
    <View style={[styles.container, {padding: 16}]}>
      {/* Header component to select the day of the week */}
      <Header selectedDay={selectedDay} setSelectedDay={setSelectedDay} />

      {/* Component to select the meal type */}
      <MealTypeComponent
        mealType={selectedMeal}
        onSelectedMeal={setSelectedMeal}
      />

      {/* ScrollView to display the recipes */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {recipes === null || recipes?.length === 0 ? (
          <Text>No Recipes Found</Text>
        ) : (
          recipes?.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffff', // Background color for the main container
    paddingBottom: 10,
    marginBottom: 10,
    flex: 1, // Fills the entire available space
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
  borderRight: {
    borderRightWidth: 0.5,
    borderColor: '#6e6f71',
  },
});
