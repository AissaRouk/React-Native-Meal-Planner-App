import {ScrollView, View} from 'react-native';
import AppHeader from '../Components/AppHeader';
import {useAppContext} from '../Context/Context';
import RecipeCard from '../Components/RecipeCardComponent';
import {screensBackgroundColor} from '../Utils/Styiling';
import {useNavigation} from '@react-navigation/native';
import {RecipeScreenName} from '../../App';

export function RecipesScreen(): React.JSX.Element {
  const {recipes, setRecipes} = useAppContext();
  const navigation = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: screensBackgroundColor,
        padding: 16,
      }}>
      <View style={{marginBottom: 16}}>
        <AppHeader title="Recipes" />
      </View>
      <ScrollView>
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={index}
            recipe={recipe}
            onPress={() =>
              (navigation as any).navigate(RecipeScreenName, {
                recipe: recipe,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
