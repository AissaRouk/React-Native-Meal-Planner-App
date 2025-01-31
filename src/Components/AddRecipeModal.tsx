import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {Ingredient, IngredientWithoutId, RecipeWithoutId} from '../Types/Types';
import Icon from '@react-native-vector-icons/ionicons';
import {SearchBar} from '@rneui/themed';
import {UseMiniSearch, useMiniSearch} from 'react-minisearch';
import {ingredients} from '../services/dataManager';
import {Options, Suggestion} from 'minisearch';

// Types of the AddRecipeModal params
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

  //State for the search
  const [searchValue, setSearchValue] = useState<string>('');

  //mini-search hook and parameters
  const searchParameters: Options = {
    fields: ['name'], // Fields used for searching
    storeFields: ['id', 'name'], // Store 'id' and 'name' so they can be returned
    idField: 'id', // Ensure MiniSearch identifies objects correctly
  };

  const {
    search,
    autoSuggest,
    searchResults,
    suggestions,
  }: UseMiniSearch<Ingredient> = useMiniSearch(ingredients, searchParameters);

  //(just for testing) useEffect to check the searchresutlts
  useEffect(() => {
    console.log('Autosuggestions: ' + JSON.stringify(suggestions));
  }, [suggestions]);

  // Function to submit the recipe with its details and ingredients
  const handleSubmitRecipe = (): void => {
    if (!name.trim()) {
      Alert.alert('Recipe name is required.');
      return;
    }
    if (isNaN(Number(prepTime)) || Number(prepTime) <= 0) {
      Alert.alert('Preparation time must be a positive number.');
      return;
    }
    if (isNaN(Number(servings)) || Number(servings) <= 0) {
      Alert.alert('Serving size must be a positive number.');
      return;
    }
    // Continue with submission...
    onSubmit({
      name,
      link,
      preparationTime: Number(prepTime),
      servingSize: Number(servings),
      ingredients,
    });
    handleOnClose();
  };

  //Function to handle the close button
  const handleOnClose = (): void => {
    setName('');
    setLink('');
    setPrepTime('');
    setServings('');
    setCurrentStep(1);
    onClose();
  };

  // Validation for Step 1
  const validateStep1 = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Recipe name is required.');
      return false;
    }
    if (isNaN(Number(prepTime)) || Number(prepTime) <= 0) {
      Alert.alert(
        'Validation Error',
        'Preparation time must be a positive number.',
      );
      return false;
    }
    if (isNaN(Number(servings)) || Number(servings) <= 0) {
      Alert.alert(
        'Validation Error',
        'Serving size must be a positive number.',
      );
      return false;
    }
    return true;
  };

  // Validation for Step 2
  const validateStep2 = (): boolean => {
    const invalidIngredient = ingredients.find(
      ingredient => !ingredient.name.trim(),
    );
    if (invalidIngredient) {
      Alert.alert(
        'Validation Error',
        'All ingredients must have a name. Please fill in the missing fields.',
      );
      return false;
    }
    return true;
  };

  // Handle next step with validation
  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(currentStep + 1);
  };

  // Handle when the text is being changed in the SearchBar
  const handleOnchangeText = (text: string) => {
    setSearchValue(text);
    autoSuggest(text);
  };

  // Handle when a suggestion is selected
  const handleSelectSuggestion = (suggestions: Suggestion) => {
    //code to handle suggestion clicking
  };

  //
  //Components
  //

  //The header of the modal (Text + Exit-Button)
  const ModalHeader: React.FC<{text: string; onClose: () => void}> = ({
    text,
    onClose,
  }) => (
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <Text style={styles.title}>{text}</Text>
      <TouchableOpacity
        onPress={handleOnClose}
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
              <ModalHeader
                text="Recipe Details"
                onClose={() => handleOnClose()}
              />
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
                value={String(prepTime)}
                onChangeText={setPrepTime}
                keyboardType="numeric"
                style={styles.input}
              />
              <TextInput
                placeholder="Serving Size"
                value={String(servings)}
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
                onClose={() => handleOnClose()}
              />
              <SearchBar
                placeholder="Search for ingredients"
                value={searchValue}
                onChangeText={handleOnchangeText}
                lightTheme
                round
                searchIcon={<Icon name="search" size={18} color={'grey'} />}
                clearIcon={false}
                containerStyle={{
                  ...styles.searchContainer,
                  borderTopWidth: 0,
                  borderBottomWidth: 0,
                  margin: 0,
                  padding: 0,
                }}
                inputContainerStyle={[
                  styles.searchInputContainer,
                  {
                    borderBottomWidth: suggestions?.length ? 0 : 1,
                  },
                ]}
                inputStyle={styles.searchInput}
              />

              {/* Suggestions dropdown */}
              {suggestions?.length && suggestions?.length > 0 && (
                <ScrollView style={styles.suggestionsContainer}>
                  {suggestions?.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSelectSuggestion(suggestion)}
                      style={styles.suggestionItem}>
                      <Text style={styles.suggestionText}>
                        {suggestion.suggestion}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* Step 3: Review and Confirm */}
          {currentStep === 3 && (
            <View>
              <ModalHeader
                text="Step 3: Review & Confirm"
                onClose={() => handleOnClose()}
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
            {/* Button to submit the recipe */}
            {currentStep == 3 && (
              <TouchableOpacity
                onPress={handleSubmitRecipe}
                style={styles.nextButton}>
                <Text>Save Recipe</Text>
              </TouchableOpacity>
            )}
            {/* Next button (disabled on the last step) */}
            {currentStep < 3 && (
              <TouchableOpacity
                onPress={() => handleNextStep()}
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
  addAnotherIngrButton: {
    backgroundColor: '#fb7945',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  // SeachBar styles
  searchContainer: {
    backgroundColor: 'transparent', // Remove background
    borderColor: 'transparent',
    paddingHorizontal: 0,
  },

  searchInputContainer: {
    backgroundColor: 'white', // Keep background visible
    borderWidth: 1, // Make border visible
    borderColor: '#ccc', // Set border color
    borderRadius: 5, // Match other inputs
    height: 40, // Match other TextInput fields
    paddingHorizontal: 10, // Ensure text doesn't touch the border
  },

  searchInput: {
    fontSize: 16,
    color: '#333',
  },

  //suggestions
  suggestionsContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderTopWidth: 0, // So it merges with the SearchBar border
    margin: 0,
    padding: 0,
    // If you want the lower corners to be rounded
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  suggestionItem: {
    padding: 10,
    // Possibly no border here if you want it super flush
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default AddRecipeModal;
