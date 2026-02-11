// src/Screens/MainScreen.tsx

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
  QuantityType,
  Recipe,
  WeeklyMeal,
} from '../Types/Types';
import RecipeCard from '../Components/RecipeCardComponent';
import MealTypeComponent from '../Components/MealTypeComponent';
import AddRecipeModal from '../Components/AddRecipeModal';
import {useAppContext} from '../Context/Context';
import MealsHeader from '../Components/MealsHeader';
import {screensBackgroundColor} from '../Utils/Styiling';
import {FloatingButton} from '../Components/FloatingButton';
import {PlanMealModal} from '../Components/PlanMealModal';
import {RecipeOptionsModal} from '../Components/RecipeOptionsModal';
import {handleNavigate, handleOnSubmitAddIngredient} from '../Utils/utils';
import {getAuth} from '@react-native-firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {
  getAllIngredients,
  getIngredientById,
} from '../Services/ingredient-db-services';
import {WeeklyEntryType} from '../Types/Types';
import PlannedIngredientCard from '../Components/PlannedIngredientCard';
import {IngredientOptionsModal} from '../Components/PlannedIngredeintOptionsModal';
import AddIngredientModal from '../Components/AddIngredientModal';

export const auth = getAuth(); // Needed for sign-out; keep outside render paths.

export default function MainScreen(): React.JSX.Element {
  // Types
  type WeeklyMealsIngredient = {
    weeklyMealId: string;
    IngredientName: string;
    quantity: number;
    quantityType: QuantityType;
  };

  // Tracks the active tab; used to query weekly meals and default Plan modal.
  const [selectedMeal, setSelectedMeal] = useState<MealType>(
    MealType.BREAKFAST,
  );
  // Day selector that drives weekly-meal queries and Plan modal defaults.
  const [selectedDay, setSelectedDay] = useState<DaysOfWeek>(DaysOfWeek.MONDAY);
  // Source of truth for scheduled entries for the current (day, meal).
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeal[]>([]);
  // Concrete recipe docs for current weeklyMeals (rendered as cards).
  const [currentWeeklyMealsRecipes, setCurrentWeeklyMealsRecipes] = useState<
    Recipe[]
  >([]);
  // The list of the ingredients available in the weeklyMeals
  const [currentWeeklyMealsIngredients, setCurrentWeeklyMealsIngredients] =
    useState<WeeklyMealsIngredient[]>([]);
  // Flip-flop to force a refetch when mutating schedule without changing filters.
  const [renderFlag, setRenderFlag] = useState<boolean>(false);
  // Toggles the add-recipe modal.
  const [visible, setVisible] = useState<boolean>(false);
  // Shows the plan-meal modal (planning a recipe into a (day, meal)).
  const [planMealModalVisible, setPlanMealModalVisible] =
    useState<boolean>(false);
  // Controls the AddIngredientModal visibility
  const [addIngredientModalVisible, setAddIngredientModalVisible] =
    useState<boolean>(false);
  // Controls the long-press options on a recipe card.
  const [recipeOptionsVisibility, setRecipeOptionsVisibility] =
    useState<boolean>(false);
  // Controls the long-press options on a planned ingredient card.
  const [ingredientOptionsVisibility, setIngredientOptionsVisibility] =
    useState<boolean>(false);
  // Holds the recipe the user long-pressed; optional by design.
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>();
  // Holds the ingredient instance the user long-pressed; optional by design.
  const [selectedIngredientInst, setSelectedIngredientInst] =
    useState<WeeklyMealsIngredient | null>(null);
  // Guards first-render UX; prevents UI flashing before initial data is ready.
  const [isFetchFinished, setIsFetchFinished] = useState<boolean>(false);
  // Spinner for the weekly-meals fetch (distinct from initial boot loading).
  const [isWeeklyMealsLoading, setIsWeeklyMealsLoading] =
    useState<boolean>(false);

  // CONTEXT — central app API/state providers.
  const {
    setIngredients,
    getRecipeById,
    setRecipes,
    getAllRecipes,
    deleteWeeklyMeal,
    getWeeklyMealsByDayAndMealType,
    addIngredient,
  } = useAppContext();
  const navigation = useNavigation(); // Untyped here; consider useNavigation<AppStackNav>() for type-safety.

  // Thin wrapper: keeps caller code clean and testable.
  const fetchWeeklyMeals = async (
    dayOfWeek: DaysOfWeek,
    mealType: MealType,
  ) => {
    return await getWeeklyMealsByDayAndMealType(dayOfWeek, mealType);
  };

  // Fetches recipe docs for current weeklyMeals.
  // NOTE: This runs sequentially to preserve order; if order is irrelevant, `Promise.all` would be faster.
  const fetchRecipes = async () => {
    const fetchedRecipes: Recipe[] = [];
    const fetchedIngredients: WeeklyMealsIngredient[] = [];
    for (const meal of weeklyMeals) {
      if (meal.entryType === WeeklyEntryType.RECIPE && meal.recipeId) {
        // Skip non-recipe entries.
        const item: Recipe | null = await getRecipeById(meal.recipeId!);
        if (item) fetchedRecipes.push(item); // Only add existing recipes.
      }
      // if it's an ingredient, we add it to the ingredient list
      else if (meal.ingredientId) {
        const ingredient: Ingredient = await getIngredientById(
          meal.ingredientId!,
        );
        if (ingredient) {
          fetchedIngredients.push({
            weeklyMealId: meal.id,
            IngredientName: ingredient.name,
            quantity: meal.quantity!,
            quantityType: meal.quantityType!,
          });
        }
      }
    }
    setCurrentWeeklyMealsIngredients(fetchedIngredients);
    setCurrentWeeklyMealsRecipes(fetchedRecipes || []);
  };

  // From options modal: open planner prefilled with current selection.
  const handlePlanRecipe = () => {
    setPlanMealModalVisible(true);
  };

  // Unplan removes the specific WeeklyMeal entry that references the recipe.
  // Why: a recipe can exist in multiple slots; we target only the current (day, meal) entry.
  const handleUnplanRecipe = async () => {
    if (!selectedRecipe) return; // Defensive: modal can linger after state changes.

    const entry = weeklyMeals.find(wm => wm.recipeId === selectedRecipe.id);
    if (!entry) {
      console.warn('No schedule entry found for', selectedRecipe.id);
      return;
    }

    try {
      const success = await deleteWeeklyMeal(entry.id.toString());
      if (success) {
        setRenderFlag(flag => !flag); // Force refresh of the current view.
        setRecipeOptionsVisibility(false); // Close menu on success for clear UX.
      } else {
        console.error('Failed to unplan meal', entry.id);
      }
    } catch (e) {
      console.error('Error unplanning meal:', e);
    }
  };

  // Boot strap: load global ingredients and recipes before showing the screen.
  // Why: downstream components expect these lists to be present in context.
  useEffect(() => {
    const asyncFunctions = async () => {
      const fetingredients: Ingredient[] = await getAllIngredients();
      setIngredients(fetingredients);

      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No user ID found in auth context');

      // Fetch only the current user's recipes.
      const fetchedRecipes = await getAllRecipes(userId);

      setRecipes(fetchedRecipes);
      setIsFetchFinished(true); // Unlocks UI; also set again in `.then` below (dup but harmless).
    };
    asyncFunctions()
      .catch(error => {
        if (error instanceof Error) {
          console.error(
            'MainScreen -> error in asyncFunctions :',
            error.message,
            error.stack,
          );
        } else {
          console.error('MainScreen -> error in asyncFunctions :', error);
        }
      })
      .then(() => setIsFetchFinished(true)); // Redundant with the set above; safe but can be removed.
  }, []);

  // React to (day, meal) changes or explicit refreshes.
  // Why: clear stale data before fetch to avoid flicker of old items.
  useEffect(() => {
    if (selectedDay && selectedMeal && isFetchFinished == true) {
      const fetchData = async () => {
        try {
          setIsWeeklyMealsLoading(true);
          setWeeklyMeals([]); // Avoids rendering outdated recipes while loading.
          const fetchedWeeklyMeals: WeeklyMeal[] = await fetchWeeklyMeals(
            selectedDay,
            selectedMeal,
          );
          setWeeklyMeals(fetchedWeeklyMeals);
        } catch (error) {
          console.error(
            'Error fetching weekly meals: ' + JSON.stringify(error),
          );
        } finally {
          setIsWeeklyMealsLoading(false);
        }
      };

      fetchData();
    }
  }, [selectedMeal, selectedDay, renderFlag, isFetchFinished]);

  // Keep `currentWeeklyMealsRecipes` in sync with `weeklyMeals`.
  // Why: these are separate because weeklyMeals are lightweight refs, recipes are full docs.
  useEffect(() => {
    if (weeklyMeals.length > 0) {
      fetchRecipes();
    } else {
      setCurrentWeeklyMealsRecipes([]); // Clear when there are no entries for the slot.
    }
  }, [weeklyMeals]);

  return isFetchFinished ? (
    <View style={[styles.container, {padding: 16}]}>
      {/* Header */}
      <>
        {/* Day selector; also exposes navigation and sign-out actions. */}
        <MealsHeader
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          onRecipesButtonPress={() =>
            handleNavigate({screen: 'Recipes'}, navigation)
          }
          onLogoutButtonPress={() => auth.signOut()}
        />
        {/* Meal-type tabs; drives the (day, meal) query. */}
        <MealTypeComponent
          mealType={selectedMeal}
          onSelectedMeal={setSelectedMeal}
        />
      </>
      {/* PlannedRecipes and PlannedIngredients list area */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {isWeeklyMealsLoading ? (
          <ActivityIndicator
            size="large"
            color="#fb7945"
            style={{marginTop: 20}}
          />
        ) : !isWeeklyMealsLoading &&
          currentWeeklyMealsRecipes.length === 0 &&
          weeklyMeals.length === 0 ? (
          // Shows an empty state only when both arrays are empty to avoid flicker during transitions.
          <Text>No Recipes Found</Text>
        ) : (
          <>
            <View style={{marginTop: 12}}>
              <Text style={{fontWeight: '700', marginBottom: 6}}>
                Planned Ingredients
              </Text>
              {currentWeeklyMealsRecipes.map((recipe, index) => (
                <RecipeCard
                  key={index} // Consider key={recipe.id} if stable to avoid re-mounting.
                  recipe={recipe}
                  onPress={() =>
                    handleNavigate(
                      {screen: 'Recipe', params: {recipe: recipe}},
                      navigation,
                    )
                  }
                  onLongPress={() => {
                    setSelectedRecipe(recipe);
                    setRecipeOptionsVisibility(true);
                  }}
                />
              ))}
              {currentWeeklyMealsIngredients.map((instance, index) => (
                <PlannedIngredientCard
                  ingredientName={instance.IngredientName}
                  quantity={instance.quantity}
                  quantityType={instance.quantityType}
                  key={index}
                  onLongPress={() => {
                    setIngredientOptionsVisibility(true);
                    setSelectedIngredientInst(instance);
                  }}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Floating actions — duplicated inline styles for independent positioning. */}
      <>
        <FloatingButton
          iconName="add"
          iconSize={32}
          iconColor="white"
          onPress={() => setVisible(true)}
        />

        {/* Opens planner quickly from the main screen. */}
        <FloatingButton
          iconName="calendar-outline"
          iconSize={32}
          iconColor="white"
          onPress={() => setPlanMealModalVisible(true)}
          containerStyle={styles.planModalFloatingButton}
        />
        {/* Quick access to Pantry. */}
        <FloatingButton
          iconName="basket-outline"
          iconSize={32}
          iconColor="white"
          onPress={() => handleNavigate({screen: 'Pantry'}, navigation)}
          containerStyle={styles.pantryFloatingButton}
        />
        {/* Opens Grocery List — CHECK route name spelling in navigator. */}
        <FloatingButton
          iconName="cart-outline"
          iconSize={32}
          iconColor="white"
          onPress={() => handleNavigate({screen: 'GroceyList'}, navigation)} // likely 'GroceryList'
          containerStyle={styles.groceryFloatingButton}
        />
      </>

      {/* Modals — mounted here so they can cover the whole screen. */}
      <>
        <AddRecipeModal visible={visible} onClose={() => setVisible(false)} />
        <PlanMealModal
          visible={planMealModalVisible}
          onClose={() => setPlanMealModalVisible(false)}
          onSaved={() => setRenderFlag(!renderFlag)} // Triggers a refresh of the current (day, meal) view.
          initialDay={selectedDay}
          initialMealType={selectedMeal}
          initialRecipeId={
            selectedRecipe?.id !== undefined ? selectedRecipe.id : undefined
          } // Prefills with long-pressed recipe when present.
          setAddIngredientModalVisible={setAddIngredientModalVisible}
        />
        {selectedRecipe && (
          <RecipeOptionsModal
            menuVisible={recipeOptionsVisibility}
            setMenuVisible={() => setRecipeOptionsVisibility(false)}
            recipe={selectedRecipe}
            onPlan={() => handlePlanRecipe()}
            unPlanOption // Exposes the unplan action only when appropriate.
            onUnplan={handleUnplanRecipe}
          />
        )}
        {/* New simple modal for planned ingredients */}
        <IngredientOptionsModal
          menuVisible={ingredientOptionsVisibility}
          setMenuVisible={setIngredientOptionsVisibility}
          ingredientName={selectedIngredientInst?.IngredientName ?? ''}
          onPlan={() => {
            setIngredientOptionsVisibility(false);
            setPlanMealModalVisible(true);
          }}
          onUnplan={async () => {
            if (!selectedIngredientInst) return;
            const ok = await deleteWeeklyMeal(
              selectedIngredientInst.weeklyMealId,
            );
            if (ok) setRenderFlag(f => !f);
            setIngredientOptionsVisibility(false);
          }}
        />
        {/* Modal added to the planMealModal to create an ingredient */}
        <AddIngredientModal
          onSubmit={ingredient =>
            handleOnSubmitAddIngredient(
              ingredient.name,
              ingredient.category,
              addIngredient,
              setIngredients,
              async () => {},
              setAddIngredientModalVisible,
            )
          }
          onClose={() => setAddIngredientModalVisible(false)}
          visible={addIngredientModalVisible}
        />
      </>
    </View>
  ) : (
    // Full-screen spinner while bootstrapping global data.
    <ActivityIndicator
      size={100}
      color={'#fb7945'}
      style={styles.activityIndicatorStyle}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: screensBackgroundColor,
    paddingBottom: 10,
    marginBottom: 10,
    flex: 1,
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
    flex: 1, // Centers spinner vertically when used as the whole-screen element.
  },
  planModalFloatingButton: {
    position: 'absolute',
    bottom: 16,
    right: 60 + 16 * 2,
    backgroundColor: '#fb7945',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  pantryFloatingButton: {
    position: 'absolute',
    bottom: 16,
    right: 60 * 2 + 16 * 3,
    backgroundColor: '#fb7945',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  groceryFloatingButton: {
    position: 'absolute',
    bottom: 16,
    right: 60 * 3 + 16 * 4,
    backgroundColor: '#fb7945',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
