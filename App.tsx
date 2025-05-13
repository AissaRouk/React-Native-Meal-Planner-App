import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainScreen from './src/Screens/MainScreen';
import {AppProvider} from './src/Context/Context';

export const MainScreenName = 'MainScreen';

const Stack = createNativeStackNavigator();

const RootStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false}}
      initialRouteName={MainScreenName}>
      <Stack.Screen name={MainScreenName} component={MainScreen} />
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
