import React, {useState} from 'react';
import {Ingredient, Recipe} from '../Types/Types';

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
  const addOrUpdateRecipe = (newRecipe: Recipe) => {
    setRecipes(prev => {
      const index = prev.findIndex(r => r.id === newRecipe.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = newRecipe;
        console.log('updated the recipe: ' + JSON.stringify(newRecipe));
        return updated;
      } else {
        console.log('added the recipe: ' + JSON.stringify(newRecipe));
        return [...prev, newRecipe];
      }
    });
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
