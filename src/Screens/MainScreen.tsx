import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import {
  DaysOfWeek,
  Ingredient,
  MealType,
  Recipe,
  RecipeIngredient,
  WeeklyMeal,
} from '../Types/Types';
import RecipeCard from '../Components/RecipeCardComponent';
import MealTypeComponent from '../Components/MealTypeComponent';
import {getAllRecipes} from '../Services/recipe-db-services';
import {getRecipeById} from '../Services/recipe-db-services';
import {getWeeklyMealsByDayAndMealType} from '../Services/weeklyMeals-db-services';
import AddRecipeModal from '../Components/AddRecipeModal';
import {initialise} from '../Services/dataManager';
import {useAppContext} from '../Context/Context';
import {useNavigation} from '@react-navigation/native';
import {RecipeScreenName, RecipesScreenName} from '../../App';
import MealsHeader from '../Components/MealsHeader';
import {orangeBackgroundColor, screensBackgroundColor} from '../Utils/Styiling';
import {getAllRecipeIngredients} from '../Services/recipeIngredients-db-services';
import {FloatingButton} from '../Components/FloatingButton';
import {PlanMealModal} from '../Components/PlanMealModal';

export default function MainScreen(): React.JSX.Element {
  // State to track the currently selected meal type (e.g., Breakfast, Lunch, Dinner)
  const [selectedMeal, setSelectedMeal] = useState<MealType>(
    MealType.BREAKFAST,
  );
  // State to track the currently selected day of the week
  const [selectedDay, setSelectedDay] = useState<DaysOfWeek>(DaysOfWeek.MONDAY);
  // State to store the fetched weekly meals based on the selected day and meal type
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeal[]>([]);
  // The recipes of the selected day and mealType
  const [currentWeeklyMeals, setCurrentWeeklyMeals] = useState<Recipe[]>([]);
  //State that forces the fetch of the currentWeeklyMeals
  const [renderFlag, setRenderFlag] = useState<boolean>(false);
  //State to trigger the visibility of the AddRecipeModal
  const [visible, setVisible] = useState<boolean>(false);
  // State to trigger visibility of PlanMealModal
  const [planMealModalVisible, setPlanMealModalVisible] =
    useState<boolean>(false);
  //boolean state to track the completion of the data fetching
  const [isFetchFinished, setIsFetchFinished] = useState<boolean>(false);

  //CONTEXT
  // Context state to manage the ingredients
  const {ingredients, setIngredients, recipes, setRecipes} = useAppContext();

  // NAVIGATION
  const navigation = useNavigation();

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
    setCurrentWeeklyMeals(fetchedRecipes || []); // Update the state with fetched recipes
  };

  // Handles the navigation
  const handleNavigate = () => {
    (navigation as any).navigate(RecipesScreenName);
  };

  // Runs once when the component is mounted to initialize and populate the database
  useEffect(() => {
    const asyncFunctions = async () => {
      const fetingredients: Ingredient[] = await initialise();
      setIngredients(fetingredients);
      const fetchedRecipes = await getAllRecipes();
      setRecipes(fetchedRecipes);
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

  useEffect(() => {
    console.log('ingredients array changed: ' + JSON.stringify(ingredients));
  }, [ingredients]);

  // Fetches the weekly meals whenever the selected day or meal type changes
  useEffect(() => {
    if (selectedDay && selectedMeal && isFetchFinished == true) {
      const fetchData = async () => {
        try {
          setWeeklyMeals([]); // Clear previous recipes to avoid stale data
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
  }, [selectedMeal, selectedDay, renderFlag]);

  // Fetches recipes whenever the weekly meals state is updated
  useEffect(() => {
    if (weeklyMeals.length > 0) {
      console.log('Fetching recipes for weeklyMeals:', weeklyMeals);
      fetchRecipes();
    } else {
      setCurrentWeeklyMeals([]); // Reset recipes when there are no meals for the selected meal type
    }
  }, [weeklyMeals]);

  return isFetchFinished ? (
    <View style={[styles.container, {padding: 16}]}>
      <>
        {/* Header component to select the day of the week */}
        <MealsHeader
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          onButtonPress={handleNavigate}
        />

        {/* Component to select the meal type */}
        <MealTypeComponent
          mealType={selectedMeal}
          onSelectedMeal={setSelectedMeal}
        />

        {/* ScrollView to display the recipes */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {currentWeeklyMeals === null || currentWeeklyMeals?.length === 0 ? (
            <Text>No Recipes Found</Text>
          ) : (
            currentWeeklyMeals.map((weeklyMeal, index) => (
              <RecipeCard
                key={index}
                recipe={weeklyMeal}
                onPress={() =>
                  (navigation as any).navigate(RecipeScreenName, {
                    recipe: weeklyMeal,
                  })
                }
              />
            ))
          )}
        </ScrollView>

        {/*
          Replace your old inline TouchableOpacity with our reusable FloatingButton:
        */}
        <FloatingButton
          iconName="add"
          iconSize={32}
          iconColor="white"
          onPress={() => setVisible(true)}
        />

        {/* button to open PlanMealMode */}
        <FloatingButton
          iconName="calendar"
          iconSize={32}
          iconColor="white"
          onPress={() => setPlanMealModalVisible(true)}
          containerStyle={{
            position: 'absolute',
            bottom: 16,
            right: 60 + 16 * 2,
            backgroundColor: '#fb7945',
            width: 60,
            height: 60,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5, // Android shadow
            shadowColor: '#000', // iOS shadow
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.3,
            shadowRadius: 3,
          }}
        />

        {/* Modal to add the Recipes */}
        <AddRecipeModal visible={visible} onClose={() => setVisible(false)} />
        <PlanMealModal
          visible={planMealModalVisible}
          onClose={() => setPlanMealModalVisible(false)}
          onSaved={() => setRenderFlag(!renderFlag)}
        />
      </>
    </View>
  ) : (
    // ActivityIndicator to show loading state while fetching data
    // This is displayed until the data fetching is complete
    <ActivityIndicator
      size={100}
      color={'#fb7945'}
      style={styles.activityIndicatorStyle}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: screensBackgroundColor, // Background color for the main container
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
  activityIndicatorStyle: {
    flex: 1,
  },
});
