import React, {useEffect, useRef, useState} from 'react';
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
import {Ingredient, QuantityType} from '../Types/Types';
import Icon from '@react-native-vector-icons/ionicons';
import {SearchBar} from '@rneui/themed';
import MiniSearch, {Options, SearchResult, Suggestion} from 'minisearch';
import {IngredientComponent} from './IngredientComponent';
import {FAILED} from '../Services/db-services';
import {handleOnSetQuantity} from '../Utils/utils';
import AddIngredientModal from './AddIngredientModal';
import {greyBorderColor, orangeBackgroundColor} from '../Utils/Styiling';
import {useAppContext} from '../Context/Context';
import {addRecipe} from '../Services/recipe-db-services';
import {addRecipeIngredientMultiple} from '../Services/recipeIngredients-db-services';
import {
  addIngredient,
  getIngredientById,
} from '../Services/ingredient-db-services';

// Types of the AddRecipeModal params
type AddRecipeModalProps = {
  visible: boolean;
  onClose: () => void;
};

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({visible, onClose}) => {
  //
  //STATES
  //
  // Track the current step in the multi-step form (1: Recipe Details, 2: Add Ingredients, 3: Review & Confirm)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // State for recipe details
  const [name, setName] = useState<string>(''); // Recipe name
  const [link, setLink] = useState<string>(''); // Optional recipe link
  const [prepTime, setPrepTime] = useState<string>(''); // Preparation time as string
  const [servings, setServings] = useState<string>(''); // Number of servings as string
  const [selectedIngredients, setSelectedIngredients] = useState<
    (Ingredient & {quantity: number; quantityType: QuantityType})[]
  >([]);

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

  // State for addIngredientModal visibility
  const [isAddIngredientModalVisible, setAddIngredientModalVisible] =
    useState<boolean>(false);

  //
  // CONSTANTS
  //

  //mini-search hook and parameters
  const searchParameters: Options = {
    fields: ['name'], // Fields used for searching
    idField: 'id', // Ensure MiniSearch identifies objects correctly
    storeFields: ['name', 'id'],
    searchOptions: {fuzzy: 1, prefix: true},
  };

  // Persistent MiniSearch instance
  const minisearchRef = useRef<MiniSearch<Ingredient> | null>(null);

  // Initialize MiniSearch only once
  if (!minisearchRef.current) {
    minisearchRef.current = new MiniSearch<Ingredient>(searchParameters);
  }

  // Context state to manage the ingredients
  const {ingredients, setIngredients} = useAppContext();

  //
  // USE EFFECTS
  //

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

  // UseEffect to check the searchResults and modify some states
  useEffect(() => {
    // If we found something
    if (searchResults.length > 1) {
      setIngredientSelectionViewOpen(true);
      // If the search only gets us one ingredient
    } else if (searchResults.length == 1) {
      // add it to the selectedIngredients
      handleSelectIngredient(searchResults[0].id);
      setSearchResultsVisible(true);
    }
  }, [searchResults]);

  // to check the selectedIngredients
  useEffect(() => {
    if (selectedIngredients.length >= 1)
      console.log(
        'useEffect -> selectedIngredients: ' +
          JSON.stringify(selectedIngredients, null, 1),
      );
  });

  // ONLY FOR TESTING
  useEffect(() => {
    if (selectedIngredients.length > 1) {
      console.log(JSON.stringify(selectedIngredients));
    }
  }, [selectedIngredients]);

  //
  //Functions
  //

  // Function to submit the recipe with its details and ingredients
  const handleSubmitRecipe = async (): Promise<void> => {
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

    const response = await addRecipe({
      name: name,
      link: link,
      preparationTime: Number(prepTime),
      servingSize: Number(servings),
    });

    if (response.created && response.insertedId) {
      console.log('Recipe created successfully');
      const recipeIngredientsResponse = await addRecipeIngredientMultiple(
        response.insertedId,
        selectedIngredients,
      );
    }

    // handleOnClose();
  };

  //Function to handle the close button of the AddRecipeModal
  const handleOnClose = (): void => {
    setName('');
    setLink('');
    setPrepTime('');
    setServings('');
    setCurrentStep(1);
    setSelectedIngredients([]);
    setSearchValue('');
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

  const validateStep2 = (): boolean => {
    // don't pass to step3 if there's an ingredient with quantity of 0
    if (
      selectedIngredients.length == 0 ||
      selectedIngredients.some(instance => instance.quantity <= 0)
    ) {
      Alert.alert(
        'Validation Error',
        'All ingredients must have a quantity higher than 0.',
      );
      console.log('validateStep: ' + false);
      return false; // Prevents moving to the next step
    }
    return true; // Allows moving to the next step
  };

  // Handle next step with validation
  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(currentStep + 1);
  };

  const search = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      // Don't hide selectedIngredients view if query is empty
      return;
    }

    setSuggestionsVisible(false);
    setSearchResults([]);
    // Don't hide selectedIngredients view yet
    const results = minisearchRef.current?.search(query) || [];
    setSearchResults(results);

    // Only show ingredient selection view if results found
    if (results.length > 1) {
      setIngredientSelectionViewOpen(true);
      setSearchResultsVisible(false);
    } else if (results.length === 1) {
      setIngredientSelectionViewOpen(false);
      setSearchResultsVisible(true);
    } else {
      // No results: keep showing selectedIngredients
      setIngredientSelectionViewOpen(false);
      setSearchResultsVisible(true); // <-- this keeps the selectedIngredients visible
    }
  };

  // Handle when the text is being changed in the SearchBar
  const handleOnchangeText = (text: string) => {
    setSearchValue(text);

    if (text.trim() === '') {
      setSuggestions([]);
      setSuggestionsVisible(false);
      return;
    }

    // get the ingredient suggestions from minisearch
    const results = minisearchRef.current?.autoSuggest(text) || [];
    // console.log('handleOnchangeText: -> results', results);
    setSuggestions(results);
    // only show when tere are suggestions
    setSuggestionsVisible(results.length >= 1);
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

  //function to handle closing the selectSuggestion View
  const closeSelectSuggestion = () => {
    setIngredientSelectionViewOpen(false);
    setSearchResultsVisible(true);
  };

  // function to change the quantityType value of a specific param
  const setQuantityTypeOfSelectedIngredient = (
    id: number,
    quantityType: QuantityType,
  ) => {
    setSelectedIngredients(prevIngredients => {
      const updatedIngredients = [...prevIngredients];
      const index = updatedIngredients.findIndex(
        ingredient => ingredient.id === id,
      );
      if (index >= 0) {
        updatedIngredients[index].quantityType = quantityType;
      }
      return updatedIngredients;
    });
  };

  // Function to insert ingredients in the selectedIngredients array, it verifies duplicates
  const handleSelectIngredient = async (id: number) => {
    // Check if the ingredient is already selected
    if (selectedIngredients.find(ingredient => ingredient.id === id)) {
      // Alert.alert(
      //   "You already selected this ingredient.\t it's already added in your list",
      // );
      console.log('prompmt!!');
    } else {
      // if not
      // fetch the ingredient first
      const ingredient = await getIngredientById(id);
      console.log(
        'Ingredietn obtained from fetch: ' + JSON.stringify(ingredient),
      );
      //  add it to the array
      setSelectedIngredients(prev => [
        ...prev,
        {
          ...ingredient,
          quantity: 0,
          quantityType: QuantityType.GRAMS,
        },
      ]);

      // if there are two results hide the selection view
      if (searchResults.length > 1)
        // hide the view
        setIngredientSelectionViewOpen(false);

      // show the selectedingredients view
      setSearchResultsVisible(true);
    }
    setSearchValue('');
  };

  // Function to delete an ingredient from selectedIngredients
  const hanldeDeleteIngredient = (id: number) => {
    setSelectedIngredients(prevIngredients => {
      const updatedIngredients = prevIngredients.filter(
        ingredient => ingredient.id !== id,
      );
      console.log('Updated Ingredients: ' + JSON.stringify(updatedIngredients));
      return updatedIngredients;
    });
  };

  // Function to modify the quantity of an ingredient in selectedIngredients
  const setQuantityOfSelectedIngredient = (id: number, quantity: number) => {
    if (selectedIngredients.length > 0) {
      const index: number | undefined = selectedIngredients.findIndex(
        ingredient => ingredient.id == id,
      );
      console.log('index: ' + index);
      if (index >= 0) {
        setSelectedIngredients(prevIngredients => {
          const updatedIngredients = [...prevIngredients];
          updatedIngredients[index].quantity = handleOnSetQuantity(quantity);
          return updatedIngredients;
        });
      }
    }
  };

  // Handle the creation of a new ingredient in the database
  const handleOnSubmitAddIngredient: (
    name: string,
    category: string,
  ) => Promise<boolean> = async (name: string, category: string) => {
    const response = await addIngredient({name, category});
    console.log('response: ' + JSON.stringify(response));
    if (response.created) {
      // add the new ingredient to the selectedIngredients
      if (response.insertedId) {
        const newIngredient: Ingredient = {
          name: name,
          id: response.insertedId,
          category: category,
        };
        setIngredients(prev => [...prev, newIngredient]);
      }
      return response.created;
    } else if (
      !response.created &&
      response.response == 'Ingredient already exists'
    ) {
      Alert.alert('This ingredient already exists');
      return FAILED;
    }
    return FAILED;
  };

  //
  //Components
  //

  //The header of the modal (contains Text + Exit-Button)
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
          backgroundColor: orangeBackgroundColor,
          borderRadius: 15, // Make it circular
        }}>
        <Icon name="close" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );

  //Main return
  return (
    <>
      <Modal
        visible={visible && !isAddIngredientModalVisible}
        animationType="slide"
        transparent={true}>
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
                {/* SearchBar + addIngredientButton */}
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                    marginBottom: 10,
                    overflow: 'visible',
                    position: 'relative',
                  }}>
                  {/* Searchbar which contains: SearchBar + Suggestions dropdown */}
                  <View style={{flex: 1, maxWidth: 300}}>
                    <SearchBar
                      placeholder="Search for ingredients"
                      value={searchValue}
                      onChangeText={handleOnchangeText}
                      onSubmitEditing={() => search(searchValue)}
                      lightTheme
                      round
                      searchIcon={
                        <Icon name="search" size={18} color={'grey'} />
                      }
                      clearIcon={false}
                      containerStyle={styles.searchContainer}
                      inputContainerStyle={[
                        styles.searchInputContainer,
                        styles.searchContainerHeight,
                        //modify the styling when the suggestions dropdown is open
                        {
                          borderBottomWidth: suggestionsVisible ? 0 : 1,
                          borderBottomRightRadius: suggestionsVisible ? 0 : 5,
                          borderBottomLeftRadius: suggestionsVisible ? 0 : 5,
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
                  </View>
                  {/* AddIngredient Modal Button */}
                  <TouchableOpacity
                    onPress={() => setAddIngredientModalVisible(true)}
                    style={[
                      {
                        padding: 10,
                        backgroundColor: orangeBackgroundColor,
                        borderRadius: 5,
                        margin: 5,
                      },
                      styles.searchContainerHeight,
                    ]}>
                    <Icon name="add-outline" size={20} color={'white'} />
                  </TouchableOpacity>
                </View>

                {/* selectedIngredients ScrollView */}
                {searchResultsVisible && selectedIngredients && (
                  <ScrollView
                    style={{zIndex: 2, maxHeight: 350}}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled">
                    {selectedIngredients?.map((instance, index) => (
                      <IngredientComponent
                        key={index}
                        ingredients={ingredients}
                        id={instance.id}
                        number={index}
                        quantity={instance.quantity}
                        quantityType={instance.quantityType}
                        setQuantity={setQuantityOfSelectedIngredient}
                        setQuantityType={setQuantityTypeOfSelectedIngredient}
                        onDelete={hanldeDeleteIngredient}
                      />
                    ))}
                  </ScrollView>
                )}

                {/* Ingredient View to select*/}
                {ingredientSelectionViewOpen && (
                  <>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 10,
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          color: 'black',
                          fontWeight: '500',
                          textAlign: 'center',
                        }}>
                        Select an ingredient to add
                      </Text>
                      <Icon
                        name="close-circle-outline"
                        size={20}
                        style={{marginRight: 10}}
                        onPress={closeSelectSuggestion}
                      />
                    </View>
                    <ScrollView style={{marginBottom: 5}}>
                      {/* Select Ingredient */}
                      {searchResults.map((instance, index) => (
                        <TouchableOpacity
                          key={index}
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
                <View style={styles.reviewSection}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Recipe Name:</Text>
                    <Text style={styles.reviewValue}>{name}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Icon name="timer" size={20} style={styles.reviewIcon} />
                    <Text style={styles.reviewValue}>{prepTime} minutes</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Serving Size:</Text>
                    <Text style={styles.reviewValue}>{servings}</Text>
                  </View>
                  <Text style={styles.ingredientsHeader}>Ingredients:</Text>
                  {/* List all added ingredients */}
                  {selectedIngredients.length > 0 &&
                    selectedIngredients.map((ingredient, index) => (
                      <View style={styles.ingredientRow} key={index}>
                        <Text style={styles.ingredientName}>
                          - {ingredient.name}
                        </Text>
                        <Text style={styles.ingredientDetails}>
                          {ingredient.quantity} {ingredient.quantityType}
                        </Text>
                      </View>
                    ))}
                </View>
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
      {/* Modal to add the ingredients */}
      <AddIngredientModal
        visible={isAddIngredientModalVisible}
        onClose={() => setAddIngredientModalVisible(false)}
        onSubmit={({name, category}) =>
          handleOnSubmitAddIngredient(name, category)
        }
      />
    </>
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
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: greyBorderColor,
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
    backgroundColor: greyBorderColor,
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
    borderColor: greyBorderColor, // Set border color
    borderRadius: 5, // Match other inputs
    paddingHorizontal: 10, // Ensure text doesn't touch the border
  },

  searchContainerHeight: {
    height: 40, // Match other TextInput fields
  },

  searchInput: {
    fontSize: 16,
    color: '#333',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    margin: 0,
  },

  //suggestions
  suggestionsContainer: {
    position: 'absolute', // Position dropdown below SearchBar
    top: 45, // Adjust to match SearchBar height
    left: 0,
    right: 0,
    backgroundColor: 'white', // Dropdown background
    borderWidth: 1,
    borderColor: greyBorderColor,
    borderTopWidth: 0, // Merge with SearchBar border
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    zIndex: 10, // Ensure it appears above other elements
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },

  //currentStep3
  reviewSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: greyBorderColor,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewLabel: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginRight: 5,
  },
  reviewValue: {
    fontSize: 16,
    color: '#555',
  },
  reviewIcon: {
    marginRight: 10,
    color: '#fb7945',
  },
  ingredientsHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  ingredientDetails: {
    fontSize: 16,
    color: '#555',
  },

  //generic
  greyBorder: {
    borderWidth: 1,
    borderColor: greyBorderColor,
  },
});

export default AddRecipeModal;
