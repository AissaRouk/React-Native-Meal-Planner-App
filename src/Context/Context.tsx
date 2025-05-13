import React, {useState} from 'react';
import {Ingredient} from '../Types/Types';

// Define the shape of the context
type ContextProps = {
  ingredients: Ingredient[];
  setIngredients: React.Dispatch<React.SetStateAction<Ingredient[]>>;
};

type AppProviderProps = {
  children: React.ReactNode;
};

// Create the context
const AppContext: React.Context<ContextProps> =
  React.createContext<ContextProps>({
    ingredients: [],
    setIngredients: () => {},
  });

// Create the provider component
export const AppProvider = ({children}: AppProviderProps) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  return (
    <AppContext.Provider value={{ingredients, setIngredients}}>
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
