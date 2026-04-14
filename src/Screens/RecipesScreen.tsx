import { ScrollView, Text, View } from 'react-native';
import AppHeader from '../Components/AppHeader';
import { useAppContext } from '../Context/Context';
import RecipeCard from '../Components/RecipeCardComponent';
import { screensBackgroundColor } from '../Utils/Styiling';
import { useNavigation } from '@react-navigation/native';
import { RecipeScreenName } from '../../App';
import React, { useState } from 'react';
import { Recipe } from '../Types/Types';
import { RecipeOptionsModal } from '../Components/RecipeOptionsModal';

export function RecipesScreen(): React.JSX.Element {
  const { recipes, deleteRecipe } = useAppContext();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>();

  return (
    <View style={{ flex: 1, backgroundColor: screensBackgroundColor, padding: 16, }}>
      <View style={{ marginBottom: 16 }}>
        <AppHeader title="Recipes" />
      </View>
      <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
        {recipes.length === 0 && <Text >No recipes yet!</Text>}
        {recipes.map((recipe, index) => (
          <RecipeCard key={index} recipe={recipe}
            onPress={() => (navigation as any).navigate(RecipeScreenName, { recipe: recipe, })}
            onLongPress={() => {
              setModalVisible(true);
              setSelectedRecipe(recipe);
            }}
          />
        ))}
      </ScrollView>
      {selectedRecipe && (
        <RecipeOptionsModal recipe={selectedRecipe} menuVisible={modalVisible} deleteOption
          onDelete={async () => await deleteRecipe(selectedRecipe.id).then(() => setModalVisible(false))}
          setMenuVisible={setModalVisible}
          key={selectedRecipe.id}
        />
      )}
    </View>
  );
}
