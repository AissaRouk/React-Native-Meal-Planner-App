import React, {useEffect, useState} from 'react';
import {ScrollView, Text, View, StyleSheet} from 'react-native';
import {
  getAllIngredients,
  getTableNames,
  createIngredientTable,
  addIngredient,
  deleteIngredient,
  updateIngredient,
  createRecipeTable,
  getRecipes,
  addRecipe,
  dropAllTables,
  updateRecipe,
  deleteRecipe,
  createRecipeIngredientTable,
  getRecipeIngredients,
  updateRecipeIngredient,
  addRecipeIngredient,
  createPantryTable,
  addPantry,
  createIngredientPantryTable,
  addIngredientPantry,
  getAllIngredientPantries,
  getAllPantries,
  updatePantry,
  deletePantry,
  updateIngredientPantry,
  deleteIngredientPantry,
  createWeeklyMealsTable,
  addWeeklyMeal,
} from '../Services/db-services';
import {
  DaysOfWeek,
  Ingredient,
  IngredientPantry,
  MealType,
  Pantry,
  QuantityType,
  Recipe,
  RecipeIngredient,
  WeeklyMeal,
} from '../Types/Types';

export default function MainScreen(): React.JSX.Element {
  const [recipes, setRecipes] = useState<Recipe[]>();
  const [recipeIngredients, setRecipeIngredients] =
    useState<RecipeIngredient[]>();
  const [ingredients, setIngredients] = useState<Ingredient[]>();

  const [pantries, setPantries] = useState<Pantry[]>();
  const [ingredientPantries, setingredientPantries] =
    useState<IngredientPantry[]>();

  useEffect(() => {
    // Initialize tables and insert ingredient
    const initializeDatabase = async () => {
      try {
        // Create tables
        // await dropAllTables();
        await createIngredientTable();
        await createRecipeTable();
        await createRecipeIngredientTable();
        await createPantryTable();
        await createIngredientPantryTable();
        await getTableNames();

        const newIngredients: Ingredient[] = await getAllIngredients();
        // console.log('newIngredients: ' + JSON.stringify(newIngredients));
        setIngredients(newIngredients);

        const rcps: Recipe[] = await getRecipes();
        setRecipes(rcps);

        const rcpIngr: RecipeIngredient[] = await getRecipeIngredients();
        setRecipeIngredients(rcpIngr);

        await deleteIngredientPantry(14);
        const ingrpantrs: IngredientPantry[] = await getAllIngredientPantries();
        setingredientPantries(ingrpantrs);

        const pantris: Pantry[] = await getAllPantries();
        setPantries(pantris);
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };

    // Call the function to initialize the database and add data
    initializeDatabase();
  }, []);

  const printTableIngredient = (ingredient: Ingredient) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ingredient</Text>
        <Text style={styles.text}>ID: {ingredient.id}</Text>
        <Text style={styles.text}>Name: {ingredient.name}</Text>
        <Text style={styles.text}>Category: {ingredient.category}</Text>
      </View>
    );
  };

  const printTableRecipe = (recipe: Recipe) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recipe</Text>
        <Text style={styles.text}>ID: {recipe.id}</Text>
        <Text style={styles.text}>Name: {recipe.name}</Text>
        <Text style={styles.text}>Link: {recipe.link}</Text>
        <Text style={styles.text}>
          Preparation Time: {recipe.preparationTime} mins
        </Text>
        <Text style={styles.text}>Serving Size: {recipe.servingSize}</Text>
      </View>
    );
  };

  const printRecipeIngredientTable = (recipeIngredient: RecipeIngredient) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recipe Ingredient</Text>
        <Text style={styles.text}>ID: {recipeIngredient.id}</Text>
        <Text style={styles.text}>
          Recipe ID: {recipeIngredient.recipeId ?? 'N/A'}
        </Text>
        <Text style={styles.text}>
          Ingredient ID: {recipeIngredient.ingredientId ?? 'N/A'}
        </Text>
        <Text style={styles.text}>
          Quantity: {recipeIngredient.quantity ?? 'N/A'}
        </Text>
        <Text style={styles.text}>
          Quantity Type: {recipeIngredient.quantityType ?? 'N/A'}
        </Text>
      </View>
    );
  };

  const printPantryTable = (pantry: Pantry) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pantry</Text>
        <Text style={styles.text}>ID: {pantry.id}</Text>
        <Text style={styles.text}>
          IngredientPantry: {pantry.ingredientPantry}
        </Text>
      </View>
    );
  };

  const printIngredientPantryTable = (ingredientPantry: IngredientPantry) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>IngredientPantry</Text>
        <Text style={styles.text}>ID: {ingredientPantry.id}</Text>
        <Text style={styles.text}>Ingredient ID: {ingredientPantry.id}</Text>
        <Text style={styles.text}>
          Quantity: {ingredientPantry.quantity} {ingredientPantry.quantityType}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Ingredients */}
      <Text style={styles.heading}>Ingredients</Text>
      {ingredients?.map(ingredient => (
        <View key={`ingredient-${ingredient.id}`}>
          {printTableIngredient(ingredient)}
        </View>
      ))}

      {/* Recipes */}
      <Text style={styles.heading}>Recipes</Text>
      {recipes?.map(recipe => (
        <View key={`recipe-${recipe.id}`}>{printTableRecipe(recipe)}</View>
      ))}

      {/* Recipe Ingredients */}
      <Text style={styles.heading}>Recipe Ingredients</Text>
      {recipeIngredients?.map(recipeIngredient => (
        <View key={`recipeIngredient-${recipeIngredient.id}`}>
          {printRecipeIngredientTable(recipeIngredient)}
        </View>
      ))}
      {/* IngredientPantry */}
      <Text style={styles.heading}>IngredientPantry</Text>
      {ingredientPantries?.map(ingredientPantry => (
        <View key={`IngredientPantry-${ingredientPantry.id}`}>
          {printIngredientPantryTable(ingredientPantry)}
        </View>
      ))}

      {/* Pantry */}
      <Text style={styles.heading}>Pantry</Text>
      {pantries?.map(pantry => (
        <View key={`recipeIngredient-${pantry.id}`}>
          {printPantryTable(pantry)}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    paddingBottom: 10,
    marginBottom: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});

const Breakfast: Recipe[] = [
  {
    id: 1,
    name: 'Oatmeal with Banana',
    link: 'https://example.com/oatmeal-banana',
    preparationTime: 10,
    servingSize: 1,
  },
  {
    id: 2,
    name: 'Avocado Toast',
    link: 'https://example.com/avocado-toast',
    preparationTime: 5,
    servingSize: 1,
  },
  {
    id: 3,
    name: 'Scrambled Eggs with Spinach',
    link: 'https://example.com/scrambled-eggs-spinach',
    preparationTime: 7,
    servingSize: 2,
  },
];

const Lunch: Recipe[] = [
  {
    id: 4,
    name: 'Chicken Caesar Salad',
    link: 'https://example.com/chicken-caesar-salad',
    preparationTime: 15,
    servingSize: 2,
  },
  {
    id: 5,
    name: 'Grilled Cheese Sandwich',
    link: 'https://example.com/grilled-cheese-sandwich',
    preparationTime: 10,
    servingSize: 1,
  },
  {
    id: 6,
    name: 'Pasta with Tomato Sauce',
    link: 'https://example.com/pasta-tomato-sauce',
    preparationTime: 20,
    servingSize: 3,
  },
];

const Dinner: Recipe[] = [
  {
    id: 7,
    name: 'Grilled Salmon with Vegetables',
    link: 'https://example.com/grilled-salmon-vegetables',
    preparationTime: 25,
    servingSize: 2,
  },
  {
    id: 8,
    name: 'Beef Stir Fry',
    link: 'https://example.com/beef-stir-fry',
    preparationTime: 20,
    servingSize: 2,
  },
  {
    id: 9,
    name: 'Vegetable Curry with Rice',
    link: 'https://example.com/vegetable-curry-rice',
    preparationTime: 30,
    servingSize: 4,
  },
];

export const initialiseTables = async () => {
  // await dropAllTables();
  await createIngredientTable();
  await createRecipeTable();
  await createRecipeIngredientTable();
  await createWeeklyMealsTable();
};

export const fillTablesWMockupData = async () => {
  await addIngredient({name: 'Salt', category: 'Spices'});
  await addIngredient({name: 'Sugar', category: 'Spices'});
  await addIngredient({name: 'Maple Syrup', category: 'Sauce'});
  await addIngredient({name: 'Soja Sauce', category: 'Sauce'});
  await addIngredient({name: 'Teriyaki Sauce', category: 'Sauce'});

  await addIngredient({name: 'eggs', category: 'Protein'});
  await addRecipe({
    name: 'Boiled eggs',
    link: 'google.com',
    preparationTime: 15,
    servingSize: 1,
  });
  await addRecipe({
    name: 'Scrambled eggs',
    link: 'google.com',
    preparationTime: 15,
    servingSize: 1,
  });
  await addRecipeIngredient({
    recipeId: 30,
    ingredientId: 31,
    quantity: 1,
    quantityType: QuantityType.PIECES,
  });
  addWeeklyMeal(DaysOfWeek.MONDAY, MealType.BREAKFAST, 1);
};

export {Dinner, Lunch, Breakfast};

// Mock Recipes Array
const mockRecipes: Recipe[] = [
  {
    id: 1,
    name: 'Pancakes',
    link: 'pancakes.com',
    preparationTime: 20,
    servingSize: 2,
  },
  {
    id: 2,
    name: 'Grilled Cheese',
    link: 'grilledcheese.com',
    preparationTime: 10,
    servingSize: 1,
  },
  {
    id: 3,
    name: 'Spaghetti',
    link: 'spaghetti.com',
    preparationTime: 30,
    servingSize: 4,
  },
  {
    id: 4,
    name: 'Omelette',
    link: 'omelette.com',
    preparationTime: 15,
    servingSize: 1,
  },
  {
    id: 5,
    name: 'Chicken Salad',
    link: 'chickensalad.com',
    preparationTime: 20,
    servingSize: 1,
  },
  {
    id: 6,
    name: 'Pizza',
    link: 'pizza.com',
    preparationTime: 25,
    servingSize: 2,
  },
  {
    id: 7,
    name: 'French Toast',
    link: 'frenchtoast.com',
    preparationTime: 15,
    servingSize: 1,
  },
  {
    id: 8,
    name: 'Caesar Salad',
    link: 'caesarsalad.com',
    preparationTime: 20,
    servingSize: 1,
  },
  {
    id: 9,
    name: 'Beef Stew',
    link: 'beefstew.com',
    preparationTime: 60,
    servingSize: 4,
  },
];

// Mock WeeklyMeals Array
const mockWeeklyMeals: WeeklyMeal[] = [
  {id: 1, day: 'Monday', mealType: MealType.BREAKFAST, recipeId: 1},
  {id: 2, day: 'Monday', mealType: MealType.LUNCH, recipeId: 2},
  {id: 3, day: 'Monday', mealType: MealType.DINNER, recipeId: 3},
  {id: 4, day: 'Tuesday', mealType: MealType.BREAKFAST, recipeId: 4},
  {id: 5, day: 'Tuesday', mealType: MealType.LUNCH, recipeId: 5},
  {id: 6, day: 'Tuesday', mealType: MealType.DINNER, recipeId: 6},
  {id: 7, day: 'Wednesday', mealType: MealType.BREAKFAST, recipeId: 7},
  {id: 8, day: 'Wednesday', mealType: MealType.LUNCH, recipeId: 8},
  {id: 9, day: 'Wednesday', mealType: MealType.DINNER, recipeId: 9},
];
