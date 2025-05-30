import React, {useEffect, useState} from 'react';
import {Ingredient, Recipe} from '../Types/Types';
import {updateRecipe} from '../Services/recipe-db-services';

// Define the shape of the context
type ContextProps = {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  addOrUpdateIngredient: (ingredient: Ingredient) => void;

  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  addOrUpdateRecipe: (recipe: Recipe) => void;
};

type AppProviderProps = {
  children: React.ReactNode;
};

// Create the context
const AppContext = React.createContext<ContextProps>({
  ingredients: [],
  setIngredients: () => {},
  addOrUpdateIngredient: () => {},

  recipes: [],
  setRecipes: () => {},
  addOrUpdateRecipe: () => {},
});

// Create the provider component
export const AppProvider = ({children}: AppProviderProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    console.log('Context-> recipes: ' + JSON.stringify(recipes));
  }, [recipes]);

  // Adds or updates ingredient
  const addOrUpdateIngredient = (newIngredient: Ingredient) => {
    setIngredients(prev => {
      const index = prev.findIndex(i => i.id === newIngredient.id);
      if (index !== -1) {
        // update
        const updated = [...prev];
        updated[index] = newIngredient;
        console.log('updated the ingredient: ' + JSON.stringify(newIngredient));
        return updated;
      } else {
        // add
        console.log('added the ingredient: ' + JSON.stringify(newIngredient));
        return [...prev, newIngredient];
      }
    });
  };

  // Adds or updates recipe
  const addOrUpdateRecipe = async (newRecipe: Recipe) => {
    const response: boolean = await updateRecipe(newRecipe);
    if (response) {
      setRecipes(prev => {
        const index = prev.findIndex(r => r.id === newRecipe.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = newRecipe;
          // optional
          console.log('updated the recipe: ' + JSON.stringify(newRecipe));
          return updated;
        } else {
          // optional
          console.log('added the recipe: ' + JSON.stringify(newRecipe));
          return [...prev, newRecipe];
        }
      });
    }
  };

  // Get ingredients of a recipe
  const getIngredientsOfRecipe = async (recipeId: number) => {
    const result: Array<
      Ingredient & {
        quantity: number;
        quantityType: QuantityType;
      }
    > = [];

    if (recipeId < 0) throw new Error('recipeId value invalid');

    const rows = await getIngredientsFromRecipeId(recipeId);

    if (rows.length === 0) {
      Alert.alert("The selected recipe doesn't contain any ingredients");
      return result;
    }

    for (const ri of rows) {
      // 👇 match on ingredientId, not recipeId
      const idx = ingredients.findIndex(i => i.id === ri.ingredientId);
      if (idx === -1) {
        console.warn(`Ingredient ${ri.ingredientId} not found in context`);
        continue; // or throw
      }

      const ing = ingredients[idx];
      result.push({
        ...ing,
        quantity: ri.quantity,
        quantityType: ri.quantityType,
      });
    }

    return result;
  };

  const updateRecipeIngredient = async (
    recipeId: number,
    ingredient: Ingredient,
    quantity: number,
    quantityType: QuantityType,
  ) => {
    //function that given a recipeId and one ingredient, it updates the recipeIngredient of both
    const response: number = await getIdFromRecipeId(recipeId);
    if (response >= 0) {
      await updateRecipeIngredient(
        recipeId,
        ingredient,
        quantity,
        quantityType,
      ).then(() => {
        console.log(
          'context.updateRecipeIngredient -> recipeIngredient updated',
        );
      });
    } else {
      throw new Error('context.updateRecipeIngredient -> Something went wrong');
    }
  };

  return (
    <AppContext.Provider
      value={{
        ingredients,
        setIngredients,
        addOrUpdateIngredient,
        recipes,
        setRecipes,
        addOrUpdateRecipe,
      }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
