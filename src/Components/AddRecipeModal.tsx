import React, {Ref, useEffect, useRef, useState} from 'react';
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
import {
  Ingredient,
  IngredientWithoutId,
  QuantityType,
  RecipeWithoutId,
} from '../Types/Types';
import Icon from '@react-native-vector-icons/ionicons';
import {SearchBar} from '@rneui/themed';
import MiniSearch, {Options, SearchResult, Suggestion} from 'minisearch';
import DropDownPicker from 'react-native-dropdown-picker';
import {handleOnSetQuantity} from '../Utils/utils';
import {IngredientComponent} from './IngredientComponent';
import {getIngredientById} from '../Services/db-services';

// Types of the AddRecipeModal params
type AddRecipeModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (
    recipe: RecipeWithoutId & {ingredients: IngredientWithoutId[]},
  ) => void;
  ingredients: Ingredient[];
  isFetchFinished: boolean;
};

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({
  visible,
  onClose,
  onSubmit,
  ingredients,
  isFetchFinished,
}) => {
  // Track the current step in the multi-step form (1: Recipe Details, 2: Add Ingredients, 3: Review & Confirm)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // State for recipe details
  const [name, setName] = useState<string>(''); // Recipe name
  const [link, setLink] = useState<string>(''); // Optional recipe link
  const [prepTime, setPrepTime] = useState<string>(''); // Preparation time
  const [servings, setServings] = useState<string>(''); // Number of servings
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>(
    [],
  );

  // Variables to control the dropdown
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

  //variables to save the information of the recipeIngredient
  const [quantity, setQuantity] = useState<number>(0);
  const [quantityType, setQuantityType] = useState<QuantityType>(
    QuantityType.GRAMS,
  );
  const quantityTypes: QuantityType[] = Object.values(QuantityType);

  // References to control components
  const suggestionTouchableRef = useRef(null);
  const searchBarRef = useRef<TextInput>(null);

  //State for the search
  const [searchValue, setSearchValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchResultsVisible, setSearchResultsVisible] =
    useState<boolean>(false);

  // State to control the seach selection (when the searchResult > 1)
  const [ingredientSelectionViewOpen, setIngredientSelectionViewOpen] =
    useState<boolean>(false);

  // State for suggestions visibility
  const [fieldsAdded, setFieldsAdded] = useState<boolean>(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState<boolean>(false);

  //mini-search hook and parameters
  const searchParameters: Options = {
    fields: ['name'], // Fields used for searching
    idField: 'id', // Ensure MiniSearch identifies objects correctly
    storeFields: ['name', 'id'],
  };

  //search engine and it's states
  // Persistent MiniSearch instance
  const minisearchRef = useRef<MiniSearch<Ingredient> | null>(null);

  // Initialize MiniSearch only once
  if (!minisearchRef.current) {
    minisearchRef.current = new MiniSearch<Ingredient>({
      fields: ['name'], // Fields used for searching
      idField: 'id', // Ensure MiniSearch identifies objects correctly
      storeFields: ['name', 'id'], // Fields to store in the search results
    });
  }

  // useEffect to add the data only once
  useEffect(() => {
    if (ingredients.length > 0 && !fieldsAdded) {
      minisearchRef.current?.addAll(ingredients);
      setFieldsAdded(true);
      console.log(
        'UseEffect: ingredients added to the minisearch',
        ingredients,
      );
      // console.log('UseEffect: indexed data: ', minisearchRef.current);
    } else {
      console.log('UseEffect: ingredients array is empty');
    }
  }, [ingredients]);

  //(just for testing) useEffect to check the suggestions
  useEffect(() => {
    if (minisearchRef) {
      // console.log(
      //   'UseEffect suggestions -> minisearch content',
      //   JSON.stringify(minisearchRef.current),
      // );
      // console.log(
      //   'UseEffect suggestions -> Autosuggestions: ' +
      //     JSON.stringify(suggestions),
      // );
      // setSuggestionsVisible(true);
    }
  }, [suggestions]);

  //(just for testing) useEffect to check the searchresutlts
  useEffect(() => {
    // If we found something
    if (searchResults) {
      // console.log('searchResults: ' + JSON.stringify(searchResults));
      // If we find more than one ingredient
      if (searchResults.length > 1) {
        setIngredientSelectionViewOpen(true);
      } else if (searchResults.length == 1) {
      }
    }
  }, [searchResults]);

  // to check the selectedIngredients
  useEffect(() => {
    if (selectedIngredients)
      console.log(
        'useEffect -> selectedIngredients: ' +
          JSON.stringify(selectedIngredients, null, 1),
      );
  });

  //
  //Functions
  //

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

  // Handle search
  const search = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]); // Clear results if the query is empty
      return;
    }

    // hide the suggestions
    setSuggestionsVisible(false);
    // hide the searchResults
    setSearchResultsVisible(false);
    // search
    const results = minisearchRef.current?.search(query) || [];
    console.log('Search results:', results);
    // save the results
    setSearchResults(results);
  };

  // Handle when the text is being changed in the SearchBar
  const handleOnchangeText = (text: string) => {
    setSearchValue(text);

    if (text.trim() === '') {
      setSuggestions([]);
      setSuggestionsVisible(false);
      return;
    }

    const results = minisearchRef.current?.autoSuggest(text) || [];
    // console.log('handleOnchangeText: -> results', results);
    setSuggestions(results);
    setSuggestionsVisible(true);
  };

  // Handle when a suggestion is selected
  // and used when the user submits
  const handleSelectSuggestion = (suggestions: Suggestion) => {
    // search for the suggestion or the search value
    search(suggestions.suggestion);
    // blur the SearchBar
    searchBarRef.current?.blur();
    //autocomplete search text
    setSearchValue(suggestions.suggestion);
    // hide suggestions
    setSuggestionsVisible(false);
  };

  // Function to insert ingredients in the selectedIngredients array, it verifies duplicates
  const handleSelectIngredient = async (id: number) => {
    // check if the ingredient is already selected
    if (selectedIngredients?.find(ingredient => ingredient.id == id)) {
      // if it is, alert it
      Alert.alert(
        "You already selected this ingredient.\t it's already added in your list",
      );
      console.log('prompmt!!');
    } else {
      // if not
      // fetch the ingredient first
      const ingredient = await getIngredientById(id);
      console.log(
        'Ingredietn obtained from fetch: ' + JSON.stringify(ingredient),
      );
      //  add it to the array
      selectedIngredients?.push(ingredient);

      // if there are two results hide the selection view
      if (searchResults.length > 1)
        // hide the view
        setIngredientSelectionViewOpen(false);

      // show the selectedingredients view
      setSearchResultsVisible(true);
    }
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

  //Dropdown Button
  const DropdownButton = () => {
    return (
      <DropDownPicker
        open={isPickerOpen}
        setOpen={setIsPickerOpen}
        value={quantityType ?? null}
        items={quantityTypes.map(type => ({
          label: type,
          value: type,
        }))}
        placeholder="Select"
        setValue={setQuantityType}
        style={{
          backgroundColor: '#ccc',
          borderRadius: 5,
          borderWidth: 0,
          width: 100,
        }}
        textStyle={{fontSize: 16, fontWeight: '500'}}
      />
    );
  };

  //Main return
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
                onSubmitEditing={() => search(searchValue)}
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
                    borderBottomWidth: suggestionsVisible ? 0 : 1,
                  },
                ]}
                inputStyle={styles.searchInput}
                ref={searchBarRef}
              />

              {/* Suggestions dropdown */}
              {suggestionsVisible && (
                <ScrollView style={styles.suggestionsContainer}>
                  {suggestions?.map((suggestion, index) => (
                    <TouchableOpacity
                      ref={suggestionTouchableRef}
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

              {/* selectedIngredients ScrollView */}
              {searchResultsVisible && selectedIngredients && (
                <ScrollView>
                  {/* Ingredient View */}
                  {selectedIngredients?.map(instance => (
                    <IngredientComponent
                      key={instance.id}
                      ingredients={ingredients}
                      id={instance.id}
                      quantity={quantity}
                      setQuantity={setQuantity}
                      DropdownButton={DropdownButton}
                    />
                  ))}
                </ScrollView>
              )}

              {/* Ingredient View to select*/}
              {ingredientSelectionViewOpen && (
                <>
                  <Text
                    style={{
                      fontSize: 16,
                      color: 'black',
                      fontWeight: '500',
                      marginTop: 10,
                    }}>
                    Select an ingredient to add
                  </Text>
                  <ScrollView style={{marginBottom: 5}}>
                    {/* Select Ingredient */}
                    {searchResults.map(instance => (
                      <TouchableOpacity
                        onPress={() => handleSelectIngredient(instance.id)}>
                        <Text
                          style={{
                            fontSize: 15,
                            color: 'black',
                            marginTop: 5,
                          }}>
                          {
                            ingredients.find(
                              ingredient => ingredient.id == instance.id,
                            )?.name
                          }
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
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

  //generic
  greyBorder: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default AddRecipeModal;
