import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  IngredientWithoutId,
  RecipeWithoutId,
  QuantityType,
} from '../Types/Types';
import {Picker} from '@react-native-picker/picker';
import Icon from '@react-native-vector-icons/ionicons';

type AddRecipeModalProps = {
  visible: boolean; // Indicates if the modal is visible
  onClose: () => void; // Callback to close the modal
  onSubmit: (
    recipe: RecipeWithoutId & {ingredients: IngredientWithoutId[]},
  ) => void; // Callback to submit the recipe with its ingredients
};

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  // Track the current step in the multi-step form (1: Recipe Details, 2: Add Ingredients, 3: Review & Confirm)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // State for recipe details
  const [name, setName] = useState<string>(''); // Recipe name
  const [link, setLink] = useState<string>(''); // Optional recipe link
  const [prepTime, setPrepTime] = useState<string>(''); // Preparation time
  const [servings, setServings] = useState<string>(''); // Number of servings

  // State for the ingredients in the recipe
  const [ingredients, setIngredients] = useState<IngredientWithoutId[]>([
    {name: '', category: ''}, // Default empty ingredient
  ]);

  // Function to add a new empty ingredient field
  const addNewIngredientField = (): void => {
    setIngredients([...ingredients, {name: '', category: ''}]);
  };

  // Function to handle changes in the ingredient fields (name or category)
  const handleIngredientChange = (
    index: number,
    field: keyof IngredientWithoutId,
    value: string,
  ): void => {
    const updatedIngredients = [...ingredients]; // Create a copy of the ingredients array
    updatedIngredients[index][field] = value; // Update the specific field for the ingredient at the given index
    setIngredients(updatedIngredients); // Update the state with the modified array
  };

  // Function to submit the recipe with its details and ingredients
  const handleSubmitRecipe = (): void => {
    onSubmit({
      name, // Recipe name
      link, // Recipe link
      preparationTime: parseInt(prepTime), // Convert preparation time to a number
      servingSize: parseInt(servings), // Convert serving size to a number
      ingredients, // Array of ingredients
    });
    onClose(); // Close the modal after submission
  };

  const ModalHeader: React.FC<{text: string; onClose: () => void}> = ({
    text,
    onClose,
  }) => (
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <Text style={styles.title}>{text}</Text>
      <TouchableOpacity
        onPress={onClose}
        style={{
          height: 30,
          width: 30,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fb7945',
          borderRadius: 15, // Make it circular
        }}>
        <Icon name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Step 1: Enter Recipe Details */}
          {currentStep === 1 && (
            <View>
              {/* <Text style={styles.title}>Recipe Details</Text> */}
              <ModalHeader text="Recipe Details" onClose={() => onClose()} />
              {/* Input fields for recipe details */}
              <TextInput
                placeholder="Recipe Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
              <TextInput
                placeholder="Recipe Link"
                value={link}
                onChangeText={setLink}
                style={styles.input}
              />
              <TextInput
                placeholder="Preparation Time (in minutes)"
                value={prepTime}
                onChangeText={setPrepTime}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                placeholder="Serving Size"
                value={servings}
                onChangeText={setServings}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          )}

          {/* Step 2: Add Ingredients */}
          {currentStep === 2 && (
            <View>
              <ModalHeader
                text="Step 2: Add Ingredients"
                onClose={() => onClose()}
              />
              {/* Render a field for each ingredient */}
              {ingredients.map((ingredient, index) => (
                <View key={index}>
                  {/* Ingredient name input */}
                  <TextInput
                    placeholder="Ingredient Name"
                    value={ingredient.name}
                    onChangeText={text =>
                      handleIngredientChange(index, 'name', text)
                    }
                    style={styles.input}
                  />
                  {/* Ingredient category input */}
                  <TextInput
                    placeholder="Ingredient Category"
                    value={ingredient.category}
                    onChangeText={text =>
                      handleIngredientChange(index, 'category', text)
                    }
                    style={styles.input}
                  />
                </View>
              ))}
              {/* Button to add another ingredient */}
              <TouchableOpacity onPress={addNewIngredientField}>
                <Text>Add Another Ingredient</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Review and Confirm */}
          {currentStep === 3 && (
            <View>
              <ModalHeader
                text="Step 3: Review & Confirm"
                onClose={() => onClose()}
              />
              {/* Display the entered recipe details */}
              <Text>Recipe Name: {name}</Text>
              <Text>Preparation Time: {prepTime} minutes</Text>
              <Text>Serving Size: {servings}</Text>
              <Text>Ingredients:</Text>
              {/* List all added ingredients */}
              {ingredients.map((ingredient, index) => (
                <Text key={index}>
                  {ingredient.name} - {ingredient.category}
                </Text>
              ))}
              {/* Button to submit the recipe */}
              <TouchableOpacity onPress={handleSubmitRecipe}>
                <Text>Save Recipe</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            {/* Back button (disabled on the first step) */}
            {currentStep > 1 && (
              <TouchableOpacity
                onPress={() => setCurrentStep(currentStep - 1)}
                style={styles.backButton}>
                <Text>Back</Text>
              </TouchableOpacity>
            )}
            {/* Next button (disabled on the last step) */}
            {currentStep < 3 && (
              <TouchableOpacity
                onPress={() => setCurrentStep(currentStep + 1)}
                style={styles.nextButton}>
                <Text>Next</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%', // Modal width relative to the screen
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  nextButton: {
    padding: 10,
    backgroundColor: '#fb7945',
    borderRadius: 5,
  },
});

export default AddRecipeModal;
