import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, LayoutAnimation, Platform, UIManager, } from 'react-native';
import { DaysOfWeek, Ingredient, MealType, QuantityType, Recipe, WeeklyMeal } from '../Types/Types';
import RecipeCard from '../Components/RecipeCardComponent';
import MealTypeComponent from '../Components/MealTypeComponent';
import AddRecipeModal from '../Components/AddRecipeModal';
import { useAppContext } from '../Context/Context';
import MealsHeader from '../Components/MealsHeader';
import { screensBackgroundColor } from '../Utils/Styiling';
import { FloatingButton } from '../Components/FloatingButton';
import { PlanMealModal } from '../Components/PlanMealModal';
import { RecipeOptionsModal } from '../Components/RecipeOptionsModal';
import { handleNavigate, handleOnSubmitAddIngredient } from '../Utils/utils';
import { getAuth } from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { getAllIngredients, getIngredientById, } from '../Services/ingredient-db-services';
import { WeeklyEntryType } from '../Types/Types';
import PlannedIngredientCard from '../Components/PlannedIngredientCard';
import { IngredientOptionsModal } from '../Components/PlannedIngredeintOptionsModal';
import AddIngredientModal from '../Components/AddIngredientModal';
import { FadeInView } from '../Utils/AnimatedComposable';

export const auth = getAuth();

export default function MainScreen(): React.JSX.Element {
  type WeeklyMealsIngredient = {
    weeklyMealId: string;
    IngredientName: string;
    quantity: number;
    quantityType: QuantityType;
  };

  const [selectedMeal, setSelectedMeal] = useState<MealType>(MealType.BREAKFAST);
  const [selectedDay, setSelectedDay] = useState<DaysOfWeek>(DaysOfWeek.MONDAY);
  const [weeklyMeals, setWeeklyMeals] = useState<WeeklyMeal[]>([]);
  const [currentWeeklyMealsRecipes, setCurrentWeeklyMealsRecipes] = useState<Recipe[]>([]);
  const [currentWeeklyMealsIngredients, setCurrentWeeklyMealsIngredients] = useState<WeeklyMealsIngredient[]>([]);
  const [renderFlag, setRenderFlag] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [planMealModalVisible, setPlanMealModalVisible] = useState<boolean>(false);
  const [addIngredientModalVisible, setAddIngredientModalVisible] = useState<boolean>(false);
  const [recipeOptionsVisibility, setRecipeOptionsVisibility] = useState<boolean>(false);
  const [ingredientOptionsVisibility, setIngredientOptionsVisibility] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>();
  const [selectedIngredientInst, setSelectedIngredientInst] = useState<WeeklyMealsIngredient | null>(null);
  const [isFetchFinished, setIsFetchFinished] = useState<boolean>(false);
  const [isWeeklyMealsLoading, setIsWeeklyMealsLoading] = useState<boolean>(false);

  const {
    setIngredients, getRecipeById, setRecipes, deleteWeeklyMeal, getWeeklyMealsByDayAndMealType,
    addIngredient, getUserRecipes } = useAppContext();
  const navigation = useNavigation();

  const fetchWeeklyMeals = async (dayOfWeek: DaysOfWeek, mealType: MealType,) => {
    return await getWeeklyMealsByDayAndMealType(dayOfWeek, mealType)
  };

  const fetchRecipes = async () => {
    const fetchedRecipes: Recipe[] = [];
    const fetchedIngredients: WeeklyMealsIngredient[] = [];
    for (const meal of weeklyMeals) {
      if (meal.entryType === WeeklyEntryType.RECIPE && meal.recipeId) {
        const item: Recipe | null = await getRecipeById(meal.recipeId!);
        if (item) fetchedRecipes.push(item);
      }
      else if (meal.ingredientId) {
        const ingredient: Ingredient = await getIngredientById(meal.ingredientId!);
        if (ingredient) fetchedIngredients.push(
          {
            weeklyMealId: meal.id,
            IngredientName: ingredient.name,
            quantity: meal.quantity!,
            quantityType: meal.quantityType!,
          });
      }
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentWeeklyMealsIngredients(fetchedIngredients);
    setCurrentWeeklyMealsRecipes(fetchedRecipes || []);
  };

  const handlePlanRecipe = () => { setPlanMealModalVisible(true); };

  const handleUnplanRecipe = async () => {
    if (!selectedRecipe) return;

    const entry = weeklyMeals.find(wm => wm.recipeId === selectedRecipe.id);
    if (!entry) {
      console.warn('No schedule entry found for', selectedRecipe.id);
      return;
    }

    try {
      const success = await deleteWeeklyMeal(entry.id.toString());
      if (success) {
        setRenderFlag(flag => !flag);
        setRecipeOptionsVisibility(false);
      } else {
        console.error('Failed to unplan meal', entry.id);
      }
    } catch (e) {
      console.error('Error unplanning meal:', e);
    }
  };

  useEffect(() => {
    const asyncFunctions = async () => {
      const fetchedIngredients: Ingredient[] = await getAllIngredients();
      setIngredients(fetchedIngredients);
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error('No user ID found in auth context');
      const fetchedRecipes = await getUserRecipes(userId);
      setRecipes(fetchedRecipes);
      setIsFetchFinished(true);
    };
    asyncFunctions().catch(error => {
      if (error instanceof Error) {
        console.error('MainScreen -> error in asyncFunctions :', error.message, error.stack,);
      } else {
        console.error('MainScreen -> error in asyncFunctions :', error);
      }
    }).then(() => setIsFetchFinished(true));
  }, []);

  useEffect(() => {
    if (selectedDay && selectedMeal && isFetchFinished == true) {
      const fetchData = async () => {
        try {
          setIsWeeklyMealsLoading(true);
          const fetchedWeeklyMeals: WeeklyMeal[] = await fetchWeeklyMeals(selectedDay, selectedMeal,);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setWeeklyMeals(fetchedWeeklyMeals);
        } catch (error) {
          console.error('Error fetching weekly meals: ' + JSON.stringify(error));
        } finally {
          setIsWeeklyMealsLoading(false);
        }
      };
      fetchData();
    }
  }, [selectedMeal, selectedDay, renderFlag, isFetchFinished]);

  useEffect(() => {
    if (weeklyMeals.length > 0) fetchRecipes();
    else setCurrentWeeklyMealsRecipes([]);
  }, [weeklyMeals]);

  useEffect(() => {
    if (
      Platform.OS === 'android' &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  return isFetchFinished ? (
    <View style={[styles.container, { padding: 16 }]}>
      {/* Header */}
      <>
        <MealsHeader selectedDay={selectedDay} setSelectedDay={setSelectedDay} onRecipesButtonPress={() => handleNavigate({ screen: 'Recipes' }, navigation)}
          onLogoutButtonPress={() => auth.signOut()} />
        <MealTypeComponent mealType={selectedMeal} onSelectedMeal={setSelectedMeal} />
      </>

      {/* PlannedRecipes and PlannedIngredients list area */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {isWeeklyMealsLoading ? (
          <ActivityIndicator size="large" color="#fb7945" style={{ marginTop: 20 }} />
        ) : !isWeeklyMealsLoading && currentWeeklyMealsRecipes.length === 0 && weeklyMeals.length === 0 ? (
          <Text>No Recipes Found</Text>
        ) : (
          <>
            <FadeInView key={`${selectedDay}-${selectedMeal}`}>
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: '700', marginBottom: 6 }}>Planned Recipes</Text>
                {currentWeeklyMealsRecipes.map((recipe, index) => (
                  <RecipeCard key={index} recipe={recipe} onPress={() => handleNavigate({ screen: 'Recipe', params: { recipe: recipe } }, navigation,)}
                    onLongPress={() => { setSelectedRecipe(recipe); setRecipeOptionsVisibility(true); }} />
                ))}
                {currentWeeklyMealsIngredients.map((instance, index) => (
                  <PlannedIngredientCard ingredientName={instance.IngredientName} quantity={instance.quantity} quantityType={instance.quantityType} key={index}
                    onLongPress={() => { setIngredientOptionsVisibility(true); setSelectedIngredientInst(instance); }} />
                ))}
              </View>
            </FadeInView>
          </>
        )}
      </ScrollView>

      {/* Floating actions — duplicated inline styles for independent positioning. */}
      <>
        <FloatingButton iconName="add" iconSize={32} iconColor="white" onPress={() => setVisible(true)} />

        {/* Opens planner quickly from the main screen. */}
        <FloatingButton iconName="calendar-outline" iconSize={32} iconColor="white" onPress={() => setPlanMealModalVisible(true)}
          containerStyle={styles.planModalFloatingButton}
        />
        {/* Quick access to Pantry. */}
        <FloatingButton iconName="basket-outline" iconSize={32} iconColor="white"
          onPress={() => handleNavigate({ screen: 'Pantry' }, navigation)} containerStyle={styles.pantryFloatingButton}
        />
        {/* Opens Grocery List — CHECK route name spelling in navigator. */}
        <FloatingButton iconName="cart-outline" iconSize={32} iconColor="white"
          onPress={() => handleNavigate({ screen: 'GroceyList' }, navigation)} containerStyle={styles.groceryFloatingButton}
        />
      </>

      {/* Modals — mounted here so they can cover the whole screen. */}
      <>
        <AddRecipeModal visible={visible} onClose={() => setVisible(false)} />
        <PlanMealModal visible={planMealModalVisible} onClose={() => setPlanMealModalVisible(false)} onSaved={() => setRenderFlag(!renderFlag)}
          initialDay={selectedDay} initialMealType={selectedMeal}
          initialRecipeId={selectedRecipe?.id !== undefined ? selectedRecipe.id : undefined}
          setAddIngredientModalVisible={setAddIngredientModalVisible}
        />
        {selectedRecipe && (
          <RecipeOptionsModal menuVisible={recipeOptionsVisibility} setMenuVisible={() => setRecipeOptionsVisibility(false)}
            recipe={selectedRecipe} onPlan={() => handlePlanRecipe()} unPlanOption onUnplan={handleUnplanRecipe}
          />
        )}
        {/* New simple modal for planned ingredients */}
        <IngredientOptionsModal menuVisible={ingredientOptionsVisibility} setMenuVisible={setIngredientOptionsVisibility}
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
            handleOnSubmitAddIngredient(ingredient.name, ingredient.category, addIngredient, setIngredients, async () => { },
              setAddIngredientModalVisible
            )}
          onClose={() => setAddIngredientModalVisible(false)} visible={addIngredientModalVisible}
        />
      </>
    </View>
  ) : (
    // Full-screen spinner while bootstrapping global data.
    <ActivityIndicator size={100} color={'#fb7945'} style={styles.activityIndicatorStyle} />
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
