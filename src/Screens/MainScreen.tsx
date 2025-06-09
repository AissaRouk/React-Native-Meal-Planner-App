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
import {
  deleteWeeklyMeal,
  getWeeklyMealsByDayAndMealType,
} from '../Services/weeklyMeals-db-services';
import AddRecipeModal from '../Components/AddRecipeModal';
import {initialise} from '../Services/dataManager';
import {useAppContext} from '../Context/Context';
import MealsHeader from '../Components/MealsHeader';
import {screensBackgroundColor} from '../Utils/Styiling';
import {FloatingButton} from '../Components/FloatingButton';
import {PlanMealModal} from '../Components/PlanMealModal';
import {RecipeOptionsModal} from '../Components/RecipeOptionsModal';
import {handleNavigate} from '../Utils/utils';
import {getAuth} from '@react-native-firebase/auth';

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
  const [currentWeeklyMealsRecipes, setCurrentWeeklyMealsRecipes] = useState<
    Recipe[]
  >([]);
  //State that forces the fetch of the currentWeeklyMeals
  const [renderFlag, setRenderFlag] = useState<boolean>(false);
  //State to trigger the visibility of the AddRecipeModal
  const [visible, setVisible] = useState<boolean>(false);
  // State to trigger visibility of PlanMealModal
  const [planMealModalVisible, setPlanMealModalVisible] =
    useState<boolean>(false);
  // State to handle the visibility of the RecipeOptionsModal
  const [recipeOptionsVisibility, setRecipeOptionsVisibility] =
    useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>();
  //boolean state to track the completion of the data fetching
  const [isFetchFinished, setIsFetchFinished] = useState<boolean>(false);

  //CONTEXT
  // Context state to manage the ingredients
  const {ingredients, setIngredients, recipes, setRecipes} = useAppContext();

  const auth = getAuth();

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
    setCurrentWeeklyMealsRecipes(fetchedRecipes || []); // Update the state with fetched recipes
  };

  // called from the options modal:
  const handlePlanRecipe = () => {
    setPlanMealModalVisible(true);
  };

  // Handler para “desplanificar”
  const handleUnplanRecipe = async () => {
    if (!selectedRecipe) return;

    // Encuentra el WeeklyMeal que corresponde al recipeId
    const entry = weeklyMeals.find(wm => wm.recipeId === selectedRecipe.id);
    if (!entry) {
      console.warn('No schedule entry found for', selectedRecipe.id);
      return;
    }

    try {
      const success = await deleteWeeklyMeal(entry.id);
      if (success) {
        // Fuerza el re-fetch
        setRenderFlag(flag => !flag);
        // Cierra el modal de opciones
        setRecipeOptionsVisibility(false);
      } else {
        console.error('Failed to unplan meal', entry.id);
      }
    } catch (e) {
      console.error('Error unplanning meal:', e);
    }
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
  }, [selectedMeal, selectedDay, renderFlag, isFetchFinished]);

  // Fetches recipes whenever the weekly meals state is updated
  useEffect(() => {
    if (weeklyMeals.length > 0) {
      fetchRecipes();
    } else {
      setCurrentWeeklyMealsRecipes([]); // Reset recipes when there are no meals for the selected meal type
    }
  }, [weeklyMeals]);

  return isFetchFinished ? (
    <View style={[styles.container, {padding: 16}]}>
      <>
        {/* Header component to select the day of the week */}
        <MealsHeader
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          onRecipesButtonPress={() => handleNavigate({screen: 'Recipes'})}
          onLogoutButtonPress={() => auth.signOut()}
        />

        {/* Component to select the meal type */}
        <MealTypeComponent
          mealType={selectedMeal}
          onSelectedMeal={setSelectedMeal}
        />

        {/* ScrollView to display the recipes */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {currentWeeklyMealsRecipes === null ||
          currentWeeklyMealsRecipes?.length === 0 ? (
            <Text>No Recipes Found</Text>
          ) : (
            currentWeeklyMealsRecipes.map((recipe, index) => (
              <RecipeCard
                key={index}
                recipe={recipe}
                onPress={() =>
                  handleNavigate({screen: 'Recipe', params: {recipe: recipe}})
                }
                onLongPress={() => {
                  setSelectedRecipe(recipe);
                  setRecipeOptionsVisibility(true);
                }}
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
          iconName="calendar-outline"
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
        {/* Button to go to Pantry */}
        <FloatingButton
          iconName="basket-outline"
          iconSize={32}
          iconColor="white"
          onPress={() => handleNavigate({screen: 'Pantry'})}
          containerStyle={{
            position: 'absolute',
            bottom: 16,
            right: 60 * 2 + 16 * 3,
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
        {/* Button to open GroceryList Screen*/}
        <FloatingButton
          iconName="cart-outline"
          iconSize={32}
          iconColor="white"
          onPress={() => handleNavigate({screen: 'GroceyList'})}
          containerStyle={{
            position: 'absolute',
            bottom: 16,
            right: 60 * 3 + 16 * 4,
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
        {/* Modal to Plan the meals */}
        <PlanMealModal
          visible={planMealModalVisible}
          onClose={() => setPlanMealModalVisible(false)}
          onSaved={() => setRenderFlag(!renderFlag)}
          initialDay={selectedDay} // plan for current day
          initialMealType={selectedMeal} // plan for current meal
          initialRecipeId={selectedRecipe?.id} // and this recipe
        />
        {/* Modal to open the RecipeOptions */}
        {selectedRecipe && (
          <RecipeOptionsModal
            menuVisible={recipeOptionsVisibility}
            setMenuVisible={() => setRecipeOptionsVisibility(false)}
            recipe={selectedRecipe}
            onPlan={() => handlePlanRecipe()}
            unPlanOption
            onUnplan={handleUnplanRecipe}
          />
        )}
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
