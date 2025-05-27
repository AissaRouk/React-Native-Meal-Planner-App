import React, {useState} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';
import {Recipe} from '../Types/Types';
import {useAppContext} from '../Context/Context';
import {verifyRecipe} from '../Utils/utils';
import {
  greyBorderColor,
  orangeBackgroundColor,
  screensBackgroundColor,
} from '../Utils/Styiling';
import Icon from '@react-native-vector-icons/ionicons';
import AppHeader from '../Components/AppHeader';

type RecipeScreenProps = {
  route: any;
};

export const RecipeScreen: React.FC<RecipeScreenProps> = ({route}) => {
  /** Recipe passed through navigation route */
  const recipe: Recipe = route.params.recipe;

  /** Global context access for managing recipe list */
  const {addOrUpdateRecipe} = useAppContext();

  /** Indicates whether the user is currently editing the form */
  const [isEditing, setIsEditing] = useState(false);

  /** Holds the temporary state of the editable recipe during editing */
  const [editableRecipe, setEditableRecipe] = useState<Recipe>(recipe);
  // Title of the header, it was added so it doesn't change inmediately when editing
  const [title, setTitle] = useState(recipe.name);

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
  };

  /**
   * Handles the save action after editing the form.
   * Verifies the updated recipe and exits editing mode.
   */
  const handleSave = () => {
    // verify the recipe is correct
    if (verifyRecipe(editableRecipe)) {
      // update the recipe
      addOrUpdateRecipe(editableRecipe);
      // update the title so it changes only when clicking on the button of save
      setTitle(editableRecipe.name);
      setIsEditing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{marginBottom: 16}}>
        <AppHeader title={title} />
      </View>
      <View style={{flex: 1, justifyContent: 'center', paddingLeft: 10}}>
        {/* Name Field */}
        <Text style={styles.label}>Nombre</Text>
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
        <Text style={styles.label}>Enlace</Text>
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
        <Text style={styles.label}>Tiempo de preparación (min)</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={editableRecipe.preparationTime?.toString() || ''}
            onChangeText={text => handleChange('preparationTime', text)}
          />
        ) : (
          <Text style={styles.value}>
            {editableRecipe.preparationTime} minutos
          </Text>
        )}

        {/* Serving Size Field */}
        <Text style={styles.label}>Porciones</Text>
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
      {/* Save/Edit Toggle Button */}
      <TouchableOpacity
        onPress={isEditing ? handleSave : () => setIsEditing(true)}
        style={styles.editButton}>
        <Icon
          name={isEditing ? 'checkmark' : 'create'}
          size={20}
          color="white"
        />
        <Text style={styles.buttonText}>
          {isEditing ? 'Guardar' : 'Editar'}
        </Text>
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
});

export default RecipeScreen;
