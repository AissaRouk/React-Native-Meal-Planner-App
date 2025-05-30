import React, {useEffect, useState} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';
import {Ingredient, QuantityType, Recipe} from '../Types/Types';
import {useAppContext} from '../Context/Context';
import {verifyRecipe} from '../Utils/utils';
import {
  greyBorderColor,
  orangeBackgroundColor,
  screensBackgroundColor,
} from '../Utils/Styiling';
import Icon from '@react-native-vector-icons/ionicons';
import AppHeader from '../Components/AppHeader';
import {IngredientCard} from '../Components/IngredientCard';
import {IngredientComponent} from '../Components/IngredientComponent';
import {
  getIdFromRecipeId,
  updateRecipeIngredient,
} from '../Services/recipeIngredients-db-services';

type RecipeScreenProps = {
  route: any;
};

export const RecipeScreen: React.FC<RecipeScreenProps> = ({route}) => {
  /** Recipe passed through navigation route */
  const recipe: Recipe = route.params.recipe;

  /** Global context access for managing recipe list */
  const {addOrUpdateRecipe, getIngredientsOfRecipe} = useAppContext();

  /** Indicates whether the user is currently editing the form */
  const [isEditing, setIsEditing] = useState(false);
  /** Holds the temporary state of the editable recipe during editing */
  const [editableRecipe, setEditableRecipe] = useState<Recipe>(recipe);
  // Title of the header, it was added so it doesn't change inmediately when editing
  const [title, setTitle] = useState(recipe.name);
  // Boolean to record if there were some changes made in the recipe
  const [changed, setChanged] = useState<boolean>(false);
  /**
   * recipeIngredients the ingredients of the recipe with the quantity and the quantityType
   */
  const [recipeIngredients, setRecipeIngredients] = useState<
    (Ingredient & {quantity: number; quantityType: QuantityType})[]
  >([]);

  /**
   * Updates a specific field in the editable recipe state
   * @param field - The key of the recipe being edited
   * @param value - The new value from the user input
   */
  const handleChange = (field: keyof Recipe, value: string) => {
    setEditableRecipe(prev => ({
      ...prev,
      [field]:
        field === 'preparationTime' || field === 'servingSize'
          ? Number(value)
          : value,
    }));
    setChanged(true);
  };

  /**
   * Handles the save action after editing the form.
   * Verifies the updated recipe and exits editing mode.
   */
  const handleSave = () => {
    // verify the recipe is correct
    if (verifyRecipe(editableRecipe) && changed) {
      console.log('uploading recipe and recipeIngredient');
      // update the recipe
      addOrUpdateRecipe(editableRecipe);
      // update the title so it changes only when clicking on the button of save
      setTitle(editableRecipe.name);
    }
    setIsEditing(false);
  };

  /**
   * Handle when the changes of the states of a RecipeIngredient
   */
  const handleRecipeIngredientChange = async (
    id: number,
    field: 'quantity' | 'quantityType',
    value: string | number,
  ) => {
    // Check if id is correct number
    console.log('REcipeScreen.handleRecipeIngredientChange -> ' + value);
    if (id >= 0) {
      // search for the recipeIngredient
      const index: number = recipeIngredients.findIndex(
        instance => instance.id == id,
      );
      // If the ingredient was found
      if (index != -1) {
        // get the array
        const newRecipeIngredients = recipeIngredients;
        // if the quantity is modifies
        if (field == 'quantity')
          // add it
          newRecipeIngredients[index].quantity = Number(value);
        // if it's the quantityType
        else newRecipeIngredients[index].quantityType = value as QuantityType;
        // save the changes
        const instance = newRecipeIngredients[index];
        const recipeIngredientId: number = await getIdFromRecipeId(recipe.id);
        await updateRecipeIngredient({
          id: recipeIngredientId,
          ingredientId: id,
          quantity: instance.quantity,
          quantityType: instance.quantityType,
          recipeId: recipe.id,
        }).then(() => setRecipeIngredients(newRecipeIngredients));
        // save that a change has been done
        setChanged(true);
      }
    }
  };

  /**
   * Handle when an ingredient is deleted
   */
  const handleDeleteIngredient = (id: number) => {};

  // Fetch the ingredients of the recipe
  useEffect(() => {
    const asyncFunctions = async () => {
      setRecipeIngredients(await getIngredientsOfRecipe(recipe.id));
    };

    asyncFunctions();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={{marginBottom: 16}}>
        <AppHeader title={title} />
      </View>

      {/* Main View with Recipe details for viewing/editing */}
      <View style={{flex: 1, justifyContent: 'center'}}>
        {/* Name Field */}
        <Text style={styles.label}>Name</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editableRecipe.name}
            onChangeText={text => handleChange('name', text)}
          />
        ) : (
          <Text style={styles.value}>{editableRecipe.name}</Text>
        )}

        {/* Link Field */}
        <Text style={styles.label}>Link</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={editableRecipe.link}
            onChangeText={text => handleChange('link', text)}
          />
        ) : (
          <Text style={styles.value}>{editableRecipe.link}</Text>
        )}

        {/* Preparation Time Field */}
        <Text style={styles.label}>Preparation time (min)</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={editableRecipe.preparationTime?.toString() || ''}
            onChangeText={text => handleChange('preparationTime', text)}
          />
        ) : (
          <Text style={styles.value}>{editableRecipe.preparationTime} min</Text>
        )}

        {/* Serving Size Field */}
        <Text style={styles.label}>Serving Size</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={editableRecipe.servingSize?.toString()}
            onChangeText={text => handleChange('servingSize', text)}
          />
        ) : (
          <Text style={styles.value}>{editableRecipe.servingSize}</Text>
        )}
      </View>

      <Text style={styles.ingredientsHeader}>Ingredients:</Text>
      {/* ScrollView with all the ingredients of the Recipe */}
      <ScrollView>
        {!isEditing
          ? recipeIngredients.map((ingredients, index) => (
              <IngredientCard
                id={ingredients.id}
                name={ingredients.name}
                category={ingredients.category}
                quantity={ingredients.quantity}
                quantityType={ingredients.quantityType}
                key={index}
              />
            ))
          : recipeIngredients.map((ingredient, index) => (
              <IngredientComponent
                key={index}
                ingredients={recipeIngredients}
                id={ingredient.id}
                number={index}
                quantity={ingredient.quantity}
                quantityType={ingredient.quantityType}
                setQuantity={quantity =>
                  handleRecipeIngredientChange(
                    ingredient.id,
                    'quantity',
                    quantity,
                  )
                }
                setQuantityType={quantityType =>
                  handleRecipeIngredientChange(
                    ingredient.id,
                    'quantityType',
                    quantityType,
                  )
                }
                onDelete={() => {}}
              />
            ))}
      </ScrollView>
      {/* Save/Edit Toggle Button */}
      <TouchableOpacity
        onPress={isEditing ? handleSave : () => setIsEditing(true)}
        style={styles.editButton}>
        <Icon
          name={isEditing ? 'checkmark' : 'create'}
          size={20}
          color="white"
        />
        <Text style={styles.buttonText}>{isEditing ? 'Save' : 'Edit'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: screensBackgroundColor,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: greyBorderColor,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    marginBottom: 15,
    color: '#555',
  },
  editButton: {
    flexDirection: 'row',
    backgroundColor: orangeBackgroundColor,
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ingredientsHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#444',
    marginTop: 15,
  },
});

export default RecipeScreen;
