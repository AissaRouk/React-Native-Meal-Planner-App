import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
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
  getAllIngredients,
  getRecipeById,
  getRecipes,
  getWeeklyMeals,
  getWeeklyMealsByDayAndMealType,
} from '../Services/db-services';
import Icon from '@react-native-vector-icons/ionicons';
import AddRecipeModal from '../Components/AddRecipeModal';
import {initialise} from '../Services/dataManager';

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
  //State to trigger the visibility of the AddRecipeModal
  const [visible, setVisible] = useState<boolean>(false);
  //state to save the fetched ingredients
  const [fetchedIngredients, setFetchedIngredients] = useState<Ingredient[]>(
    [],
  );
  //boolean state to track the completion of the data fetching
  const [isFetchFinished, setIsFetchFinished] = useState<boolean>(false);

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
      const ingredients: Ingredient[] = await initialise();
      setFetchedIngredients(ingredients);
      setIsFetchFinished(true);
    };
    asyncFunctions()
      .catch(error =>
        console.log(
          'MainScreen -> error in asyncFunctions : ' + JSON.stringify(error),
        ),
      )
      // when finished hide ActivityIndicator
      .then(() => setIsFetchFinished(true));
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
    if (weeklyMeals.length > 0) {
      console.log('Fetching recipes for weeklyMeals:', weeklyMeals);
      fetchRecipes();
    } else {
      setRecipes([]); // Reset recipes when there are no meals for the selected meal type
    }
  }, [weeklyMeals]);

  return isFetchFinished ? (
    <View style={[styles.container, {padding: 16}]}>
      <>
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
            recipes?.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          )}
        </ScrollView>

        {/* Button that shows the Modal to add the Recipes */}
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              position: 'absolute', // Position the button absolutely within its parent
              bottom: 16, // Distance from the bottom of the screen
              right: 16, // Distance from the right of the screen
            },
          ]}
          onPress={() => {
            setVisible(true);
          }}>
          <Icon name="add" size={40} color="white" />
        </TouchableOpacity>

        {/* Modal to add the Recipes */}
        <AddRecipeModal
          visible={visible}
          onSubmit={() => {}}
          onClose={() => setVisible(false)}
          ingredients={fetchedIngredients}
          isFetchFinished={isFetchFinished}
        />
      </>
    </View>
  ) : (
    <ActivityIndicator
      size={100}
      color={'#fb7945'}
      style={styles.activityIndicatorStyle}
    />
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
  addButton: {
    backgroundColor: '#fb7945', // Button color
    height: 60, // Height of the button
    width: 60, // Width of the button
    justifyContent: 'center', // Center the content vertically
    alignItems: 'center', // Center the content horizontally
    borderRadius: 30, // Full circle for a round button
    shadowColor: '#000', // Shadow for a floating effect
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5, // Android shadow
  },
  activityIndicatorStyle: {
    flex: 1,
  },
});
