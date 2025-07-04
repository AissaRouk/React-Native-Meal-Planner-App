// App.tsx
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainScreen from './src/Screens/MainScreen';
import {RecipesScreen} from './src/Screens/RecipesScreen';
import RecipeScreen from './src/Screens/RecipeScreen';
import PantryScreen from './src/Screens/PantryScreen';
import GroceryListScreen from './src/Screens/GroceryListScreen';
import LoginScreen from './src/Screens/LoginScreen';
import RegisterScreen from './src/Screens/RegisterScreen';
import {AppProvider} from './src/Context/Context';
import {getAuth, FirebaseAuthTypes} from '@react-native-firebase/auth';

const Stack = createNativeStackNavigator();

export const MainScreenName: string = 'MainScreen',
  RecipesScreenName: string = 'RecipesScreen',
  RecipeScreenName: string = 'RecipeScreen',
  PantryScreenName: string = 'PantryScreen',
  GroceryListScreenName: string = 'GroceryListScreen';

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  // While waiting for Firebase to tell us if we're logged in or not…
  if (initializing) return null;

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          {user ? (
            // logged in
            <>
              <Stack.Screen name={MainScreenName} component={MainScreen} />
              <Stack.Screen
                name={RecipesScreenName}
                component={RecipesScreen}
              />
              <Stack.Screen name={RecipeScreenName} component={RecipeScreen} />
              <Stack.Screen name={PantryScreenName} component={PantryScreen} />
              <Stack.Screen
                name={GroceryListScreenName}
                component={GroceryListScreen}
              />
            </>
          ) : (
            // not logged in
            <>
              <Stack.Screen name="LoginScreen" component={LoginScreen} />
              <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
