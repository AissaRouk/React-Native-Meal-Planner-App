import React, {useEffect, useState} from 'react';
import {
  Ingredient,
  QuantityType,
  Recipe,
  RecipeIngredientWithoutId,
} from '../Types/Types';
import {updateRecipe} from '../Services/recipe-db-services';
import {
  getIdFromRecipeId,
  getIngredientsFromRecipeId,
  updateRecipeIngredientDb,
} from '../Services/recipeIngredients-db-services';
import {Alert} from 'react-native';
import {addIngredient} from '../Services/ingredient-db-services';

// Define the shape of the context
type ContextProps = {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
  /**
   * adds or updates an ingredient depending if it already exists in the system
   * @param {Ingredient} ingredient - Ingredient to be added, if it's a RecipeIngredient add id:-1
   * @returns
   */
  addOrUpdateIngredient: (ingredient: Ingredient) => Promise<number>;

  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  addOrUpdateRecipe: (recipe: Recipe) => void;
  getIngredientsOfRecipe: (
    recipeId: number,
  ) => Promise<(Ingredient & {quantity: number; quantityType: QuantityType})[]>;
  updateRecipeIngredient: (
    newRecipeIngredient: RecipeIngredientWithoutId,
  ) => void;
};

type AppProviderProps = {
  children: React.ReactNode;
};

// Create the context
const AppContext = React.createContext<ContextProps>({
  ingredients: [],
  setIngredients: () => {},
  addOrUpdateIngredient: async () => 0,

  recipes: [],
  setRecipes: () => {},
  addOrUpdateRecipe: () => {},
  getIngredientsOfRecipe: async () => [],
  updateRecipeIngredient: async () => {},
});

// Create the provider component
export const AppProvider = ({children}: AppProviderProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    console.log('Context-> recipes: ' + JSON.stringify(recipes));
  }, [recipes]);

  // Adds or updates ingredient
  const addOrUpdateIngredient = async (
    newIngredient: Ingredient,
  ): Promise<number> => {
    var res = -1;
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
        async () => {
          const response = await addIngredient(newIngredient);
          if (response.created) {
            console.log(
              'added the ingredient: ' + JSON.stringify(newIngredient),
            );
            return [...prev, newIngredient];
          }
        };
        return [...prev];
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

  /**
   * function that given the
   * @param recipeId
   * @param ingredient
   * @param quantity
   * @param quantityType
   */
  const updateRecipeIngredient = async (
    newRecipeIngredient: RecipeIngredientWithoutId,
  ) => {
    try {
      //function that given a recipeId and one ingredient, it updates the recipeIngredient of both
      const recipeIngredientId: number = await getIdFromRecipeId(
        newRecipeIngredient.recipeId,
      );
      console.log('updating this recipeIngredient: ' + recipeIngredientId);
      if (recipeIngredientId >= 0) {
        await updateRecipeIngredientDb({
          id: recipeIngredientId,
          ...newRecipeIngredient,
        }).then(() => {
          console.log(
            'context.updateRecipeIngredient -> recipeIngredient updated',
          );
        });
      }
    } catch (error) {
      console.error(error);
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
        getIngredientsOfRecipe,
        updateRecipeIngredient,
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
