import React, {useEffect, useState} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';
import {
  Ingredient,
  IngredientWithoutId,
  QuantityType,
  Recipe,
} from '../Types/Types';
import {useAppContext} from '../Context/Context';
import {verifyIngredientWithoutId, verifyRecipe} from '../Utils/utils';
import {
  greyBorderColor,
  orangeBackgroundColor,
  screensBackgroundColor,
} from '../Utils/Styiling';
import Icon from '@react-native-vector-icons/ionicons';
import AppHeader from '../Components/AppHeader';
import {IngredientCard} from '../Components/IngredientCard';
import {IngredientComponent} from '../Components/IngredientComponent';
import {FloatingButton} from '../Components/FloatingButton';
import AddIngredientModal from '../Components/AddIngredientModal';
import {IngredientSearchModal} from '../Components/IngredientSearchModal';

type RecipeScreenProps = {
  route: any;
};

export const RecipeScreen: React.FC<RecipeScreenProps> = ({route}) => {
  /** Recipe passed through navigation route */
  const recipe: Recipe = route.params.recipe;

  /** Global context access for managing recipe list */
  const {
    addOrUpdateRecipe,
    getIngredientsOfRecipe,
    updateRecipeIngredient,
    deleteRecipeIngredient,
    addRecipeIngredient,
    addIngredient,
  } = useAppContext();

  /** Indicates whether the user is currently editing the form */
  const [isEditing, setIsEditing] = useState(false);
  /** Holds the temporary state of the editable recipe during editing */
  const [editableRecipe, setEditableRecipe] = useState<Recipe>(recipe);
  // Title of the header, it was added so it doesn't change inmediately when editing
  const [title, setTitle] = useState(recipe.name);
  // Boolean to record if there were some changes made in the recipe
  const [changed, setChanged] = useState<boolean>(false);
  // Falg that triggers the fetch of the recipeIngredients of the recipe
  // Normally it's triggered when the recipeIngredients change
  const [fetchFlag, setFetchFlag] = useState<boolean>(false);
  //state to control the visibility of the IngredientSearchSelector
  const [isIngredientModalVisible, setIsIngredientModalVisible] =
    useState<boolean>(false);
  //state to control the visibility of the AddIngredientModal
  const [isAddIngredientModalVisible, setAddIngredientModalVisible] =
    useState<boolean>(false);
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
    id: string,
    field: 'quantity' | 'quantityType',
    value: string | number,
  ) => {
    // Check if id is correct number
    console.log('REcipeScreen.handleRecipeIngredientChange -> ' + value);
    if (id && id !== '') {
      // search for the recipeIngredient
      const index: number = recipeIngredients.findIndex(
        instance => instance.id == id,
      );
      // If the ingredient was found
      if (index != -1) {
        const index = recipeIngredients.findIndex(inst => inst.id === id);
        if (index !== -1) {
          // 1) Build a fresh copy of recipeIngredients, mutating only the one entry:
          const newList = [...recipeIngredients];
          newList[index] = {
            ...newList[index],
            [field]:
              field === 'quantity' ? Number(value) : (value as QuantityType),
          };

          // 2) Sync React state right away
          setRecipeIngredients(newList);

          // 3) Then send it to your DB
          await updateRecipeIngredient({
            recipeId: recipe.id,
            ingredientId: newList[index].id,
            quantity: newList[index].quantity,
            quantityType: newList[index].quantityType,
          });
        }
      }
    }
  };

  /**
   * Handle when an ingredient is deleted
   */
  const handleDeleteIngredient = async (ingredientId: string) => {
    // delete the RecipeIngredient in the DB
    const response: boolean = await deleteRecipeIngredient(
      ingredientId,
      recipe.id,
    );
    // trigger the fetching to have the new data locally as well
    setFetchFlag(!fetchFlag);
  };

  /**
   * Handles when a recipeIngredient is added
   */
  const handleAddRecipeIngredient = async (
    recipeIngredient: Ingredient & {
      quantity: number;
      quantityType: QuantityType;
    },
  ) => {
    const response = await addRecipeIngredient({
      ingredientId: recipeIngredient.id,
      recipeId: recipe.id,
      quantity: recipeIngredient.quantity,
      quantityType: recipeIngredient.quantityType,
    });
    if (!response) {
      setFetchFlag(prev => !prev);
    }
  };

  /**
   * Handle when an ingredient is added from the AddRecipeModal
   */
  const handleAddIngredient = async (
    ingredient: IngredientWithoutId,
  ): Promise<string> => {
    var response = '';
    const check = verifyIngredientWithoutId(ingredient);
    if (check) {
      // the ingredient added is without id, so give it a temporal one
      response == (await addIngredient({...ingredient})).insertedId;
      if (response) {
        onCloseModal();
      }
    }

    return response;
  };

  /**
   * Function to call handleAddIngredient in the AddIngredientModal so it doesn't have a type error
   */
  const handleCallHandleAddIngredient = async (
    ingredient: IngredientWithoutId,
  ): Promise<boolean> => {
    const response = await handleAddIngredient(ingredient);
    return response ? true : false;
  };

  /**
   *
   * Handle modal closing
   */
  const onCloseModal = () => {
    setAddIngredientModalVisible(false);
  };

  // async function that fethces all the ingredients of a recipe
  const fetchIngredients = async (): Promise<
    (Ingredient & {quantity: number; quantityType: QuantityType})[]
  > => {
    return await getIngredientsOfRecipe(recipe.id);
  };

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        console.log('fetching the RecipeIngredient');
        const response = await fetchIngredients();
        setRecipeIngredients(response);
      } catch (error) {
        console.error('Error fetching ingredients:', error);
      }
    };
    loadIngredients();
  }, [fetchFlag]);

  return (
    <ScrollView style={styles.container}>
      {/* Header of the app */}
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
            value={editableRecipe.link || '-'}
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
            value={editableRecipe.preparationTime?.toString() || '-'}
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

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}>
        <Text style={styles.ingredientsHeader}>Ingredients:</Text>
        <FloatingButton
          iconName="add"
          onPress={() => setIsIngredientModalVisible(true)}
          containerStyle={{
            backgroundColor: orangeBackgroundColor,
            width: 30,
            height: 30,
            borderRadius: 30,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5, // Android shadow
            shadowColor: '#000', // iOS shadow
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.3,
            shadowRadius: 3,
          }}
          iconSize={20}
        />
      </View>

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
                onDelete={() => {
                  handleDeleteIngredient(ingredient.id);
                }}
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

      {/* Modal to add the RecipeIngredient */}
      <IngredientSearchModal
        visible={isIngredientModalVisible}
        onClose={() => setIsIngredientModalVisible(false)}
        onAddIngredient={handleAddRecipeIngredient}
        onChangeQuantity={(id, quantity) =>
          handleRecipeIngredientChange(id, 'quantity', quantity)
        }
        onChangeQuantityType={(id, quantityType) =>
          handleRecipeIngredientChange(id, 'quantityType', quantityType)
        }
        onRemoveIngredient={() => {}}
        selectedIngredients={recipeIngredients}
        onOpenAddIngredientModal={() => setAddIngredientModalVisible(true)}
      />

      {/* The button for opening the modal */}
      <AddIngredientModal
        visible={isAddIngredientModalVisible}
        onSubmit={handleCallHandleAddIngredient}
        onClose={onCloseModal}
      />
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
