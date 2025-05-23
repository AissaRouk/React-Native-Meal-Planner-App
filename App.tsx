import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainScreen from './src/Screens/MainScreen';
import {AppProvider} from './src/Context/Context';
import {RecipesScreen} from './src/Screens/RecipesScreen';

export const MainScreenName: string = 'MainScreen';
export const RecipesScreenName: string = 'RecipesScreen';

const Stack = createNativeStackNavigator();

const RootStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={MainScreenName}>
      <Stack.Screen name={MainScreenName} component={MainScreen} />
      <Stack.Screen name={RecipesScreenName} component={RecipesScreen} />
    </Stack.Navigator>
  );
};

function App(): React.JSX.Element {
  return (
    <AppProvider>
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </AppProvider>
  );
}

export default App;
