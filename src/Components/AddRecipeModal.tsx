import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Keyboard } from 'react-native';
import { Ingredient, QuantityType, RecipeWithoutId } from '../Types/Types';
import Icon from '@react-native-vector-icons/ionicons';
import { Image, SearchBar } from '@rneui/themed';
import MiniSearch, { Options, SearchResult, Suggestion } from 'minisearch';
import { IngredientComponent } from './IngredientComponent';
import { FAILED } from '../Services/db-services';
import { handleOnSetQuantity, handleOnSubmitAddIngredient, showToast } from '../Utils/utils';
import AddIngredientModal from './AddIngredientModal';
import { greyBorderColor, modalBorderRadius, modalSemiTransparentBg, modalWhiteBg, orangeBackgroundColor } from '../Utils/Styiling';
import { useAppContext } from '../Context/Context';
import { getIngredientById } from '../Services/ingredient-db-services';
import { IngredientCard } from './IngredientCard';
import { ModalHeader } from './ModalHeareComponent';
import { addRecipeDb } from '../Services/recipe-db-services';
import { AddIngredientButton } from './AddIngredientButton';
import { launchImageLibrary } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';

type AddRecipeModalProps = {
  visible: boolean;
  onClose: () => void;
};

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ visible, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [link, setLink] = useState<string>('');
  const [prepTime, setPrepTime] = useState<string>('');
  const [servings, setServings] = useState<string>('');
  const [selectedIngredients, setSelectedIngredients] = useState<(Ingredient & {
    quantity: number; quantityType: QuantityType
  })[]>([]);
  const suggestionTouchableRef = useRef(null);
  const [searchValue, setSearchValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchResultsVisible, setSearchResultsVisible] = useState<boolean>(false);
  const [ingredientSelectionViewOpen, setIngredientSelectionViewOpen] = useState<boolean>(false);
  const [fieldsAdded, setFieldsAdded] = useState<boolean>(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState<boolean>(false);
  const [isAddIngredientModalVisible, setAddIngredientModalVisible] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const searchParameters: Options = {
    fields: ['name'],
    idField: 'id',
    storeFields: ['name', 'id'],
    searchOptions: { fuzzy: 1, prefix: true },
  };
  const minisearchRef = useRef<MiniSearch<Ingredient> | null>(null);

  if (!minisearchRef.current) {
    minisearchRef.current = new MiniSearch<Ingredient>(searchParameters);
  }

  const { ingredients, setIngredients, setRecipes, addRecipeIngredientMultiple, addIngredient } = useAppContext();


  useEffect(() => {
    if (ingredients.length > 0) {
      if (!fieldsAdded) {
        minisearchRef.current?.addAll(ingredients);
        setFieldsAdded(true);
      }
      else {
        minisearchRef.current?.removeAll();
        minisearchRef.current?.addAll(ingredients);
      }
    } else {
      console.log('UseEffect: ingredients array is empty');
    }
  }, [ingredients]);

  useEffect(() => {
    if (searchResults.length > 1) {
      setIngredientSelectionViewOpen(true);
    } else if (searchResults.length == 1) {
      handleSelectIngredient(searchResults[0].id);
      setSearchResultsVisible(true);
    }
  }, [searchResults]);


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
    const userId = auth().currentUser?.uid;
    if (userId === undefined || '') {
      console.error('User ID is undefined or empty. Cannot add recipe.');
      return;
    } else {
      console.log('userId: ' + userId);
    }

    const newRecipe: RecipeWithoutId = {
      name: name,
      link: link,
      preparationTime: Number(prepTime),
      servingSize: Number(servings),
      userId: userId,
    };

    if (imageUri) {
      newRecipe.image = imageUri;
    }

    const response = await addRecipeDb(newRecipe);

    if (response.created && response.insertedId) {
      const recipeIngredientsResponse = await addRecipeIngredientMultiple(
        response.insertedId,
        selectedIngredients,
      );
      if (recipeIngredientsResponse.created) {
        if (response.insertedId) {
          setRecipes(prev => [
            ...prev,
            { id: response.insertedId!, ...newRecipe },
          ]);
        }
        showToast('Recipe ' + name + ' added.');
      }
    }

    handleOnClose();
  };

  const handleOnClose = (): void => {
    setName('');
    setLink('');
    setPrepTime('');
    setServings('');
    setCurrentStep(1);
    setSelectedIngredients([]);
    setSearchValue('');
    setImageUri(null);
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
    if (
      selectedIngredients.length == 0 ||
      selectedIngredients.some(instance => instance.quantity <= 0)
    ) {
      Alert.alert(
        'Validation Error',
        selectedIngredients.length == 0
          ? 'You must select at least one ingredient'
          : 'All ingredients must have a quantity higher than 0.',
      );
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep(currentStep + 1);
  };

  const search = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSuggestionsVisible(false);
    setSearchResults([]);
    const results = minisearchRef.current?.search(query) || [];
    setSearchResults(results);

    if (results.length > 1) {
      setIngredientSelectionViewOpen(true);
      setSearchResultsVisible(false);
    } else if (results.length === 1) {
      setIngredientSelectionViewOpen(false);
      setSearchResultsVisible(true);
    } else {
      setIngredientSelectionViewOpen(false);
      setSearchResultsVisible(true);
    }
  };

  const handleOnchangeText = (text: string) => {
    setSearchValue(text);

    if (text.trim() === '') {
      setSuggestions([]);
      setSuggestionsVisible(false);
      return;
    }

    const results = minisearchRef.current?.autoSuggest(text) || [];
    setSuggestions(results);
    setSuggestionsVisible(results.length >= 1);
  };

  const handleSelectSuggestion = (suggestions: Suggestion) => {
    search(suggestions.suggestion);
    Keyboard.dismiss();
    setSearchValue(suggestions.suggestion);
    setSuggestionsVisible(false);
  };

  const closeSelectSuggestion = () => {
    setIngredientSelectionViewOpen(false);
    setSearchResultsVisible(true);
  };

  const setQuantityTypeOfSelectedIngredient = (id: string, quantityType: QuantityType,) => {
    setSelectedIngredients(prevIngredients => {
      const updatedIngredients = [...prevIngredients];
      const index = updatedIngredients.findIndex(ingredient => ingredient.id === id);
      if (index >= 0) {
        updatedIngredients[index].quantityType = quantityType;
      }
      return updatedIngredients;
    });
  };

  const handleSelectIngredient = async (id: string) => {
    if (selectedIngredients.find(ingredient => ingredient.id === id)) {
      // Alert.alert(
      //   "You already selected this ingredient.\t it's already added in your list",
      // );
    } else {
      const ingredient = await getIngredientById(id);
      setSelectedIngredients(prev => [
        ...prev,
        { ...ingredient, quantity: 0, quantityType: QuantityType.GRAM },
      ]);

      if (searchResults.length > 1)
        setIngredientSelectionViewOpen(false);

      setSearchResultsVisible(true);
    }
    setSearchValue('');
  };

  const hanldeDeleteIngredient = (id: string) => {
    setSelectedIngredients(prevIngredients => {
      const updatedIngredients = prevIngredients.filter(
        ingredient => ingredient.id !== id,
      );
      return updatedIngredients;
    });
  };

  const setQuantityOfSelectedIngredient = (id: string, quantity: string | number) => {
    if (selectedIngredients.length > 0) {
      const index: number | undefined = selectedIngredients.findIndex(ingredient => ingredient.id == id,);
      if (index >= 0) {
        setSelectedIngredients(prevIngredients => {
          const updatedIngredients = [...prevIngredients];
          let parsedQuantity =
            typeof quantity === 'string'
              ? parseFloat(quantity.replace(',', '.'))
              : quantity;
          updatedIngredients[index].quantity =
            handleOnSetQuantity(parsedQuantity);
          return updatedIngredients;
        });
      }
    }
  };

  const handlePickImage = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo' });
    if (result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri || null);
    }
  };



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
                <ModalHeader text="Recipe Details" onClose={() => handleOnClose()} />
                {imageUri && (
                  <Image source={{ uri: imageUri }} style={{ width: 100, height: 100, marginBottom: 10 }} resizeMode="contain" />
                )}
                <TouchableOpacity onPress={handlePickImage} style={[styles.nextButton, { marginBottom: 10, width: '50%' }]}>
                  <Text style={{ fontWeight: 'bold', color: 'white' }}>
                    Select Image
                  </Text>
                </TouchableOpacity>
                {/* Input fields for recipe details */}
                <TextInput placeholder="Recipe Name" value={name} onChangeText={setName} style={styles.input} />
                <TextInput placeholder="Recipe Link" value={link} onChangeText={setLink} style={styles.input} />
                <TextInput placeholder="Preparation Time (in minutes)" value={String(prepTime)} onChangeText={setPrepTime} keyboardType="numeric" style={styles.input} />
                <TextInput placeholder="Serving Size" value={String(servings)} onChangeText={setServings} keyboardType="numeric" style={styles.input} />
              </View>
            )}

            {/* Step 2: Add Ingredients */}
            {currentStep === 2 && (
              <View>
                <ModalHeader text="Step 2: Add Ingredients" onClose={() => handleOnClose()} />
                {/* SearchBar + addIngredientButton */}
                <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center', marginBottom: 10, overflow: 'visible', position: 'relative' }}>
                  {/* Searchbar which contains: SearchBar + Suggestions dropdown */}
                  <View style={{ flex: 1, maxWidth: 300 }}>
                    <SearchBar placeholder="Search for ingredients" value={searchValue} onChangeText={handleOnchangeText} onSubmitEditing={() => search(searchValue)} lightTheme round
                      searchIcon={
                        <Icon name="search" size={18} color={'grey'} />
                      }
                      clearIcon={false} containerStyle={styles.searchContainer} inputContainerStyle={[
                        styles.searchInputContainer,
                        styles.searchContainerHeight,
                        {
                          borderBottomWidth: suggestionsVisible ? 0 : 1,
                          borderBottomRightRadius: suggestionsVisible ? 0 : 5,
                          borderBottomLeftRadius: suggestionsVisible ? 0 : 5,
                        },
                      ]} inputStyle={styles.searchInput}
                    />
                    {/* Suggestions dropdown */}
                    {suggestionsVisible && (
                      <ScrollView style={styles.suggestionsContainer}>
                        {suggestions?.map((suggestion, index) => (
                          <TouchableOpacity ref={suggestionTouchableRef} key={index} onPress={() => handleSelectSuggestion(suggestion)} style={styles.suggestionItem}>
                            <Text style={styles.suggestionText}>
                              {suggestion.suggestion}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                  {/* AddIngredient Modal Button */}
                  <AddIngredientButton setAddIngredientModalVisible={setAddIngredientModalVisible} searchContainerHeight={styles.searchContainerHeight} />
                </View>

                {/* selectedIngredients ScrollView */}
                {searchResultsVisible && selectedIngredients && (
                  <ScrollView style={{ zIndex: 2, maxHeight: '80%' }} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                    {selectedIngredients?.map((instance, index) => (
                      <IngredientComponent key={index} ingredients={ingredients} id={instance.id} number={index} quantity={instance.quantity} quantityType={instance.quantityType}
                        setQuantity={number => setQuantityOfSelectedIngredient(instance.id, number)} setQuantityType={quantityType => setQuantityTypeOfSelectedIngredient(instance.id, quantityType)}
                        onDelete={hanldeDeleteIngredient}
                      />
                    ))}
                  </ScrollView>
                )}

                {/* Ingredient View to select*/}
                {ingredientSelectionViewOpen && (
                  <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                      <Text style={{ fontSize: 16, color: 'black', fontWeight: '500', textAlign: 'center', }}>
                        Select an ingredient to add
                      </Text>
                      <Icon name="close-circle-outline" size={20} style={{ marginRight: 10 }} onPress={closeSelectSuggestion} />
                    </View>
                    <ScrollView style={{ marginBottom: 5 }}>
                      {/* Select Ingredient */}
                      {searchResults.map((instance, index) => (
                        <TouchableOpacity key={index} onPress={() => handleSelectIngredient(instance.id)}>
                          <Text style={{ fontSize: 15, color: 'black', marginTop: 5, }}>
                            {
                              ingredients.find(ingredient => ingredient.id == instance.id)?.name
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
                <ModalHeader text="Step 3: Review & Confirm" onClose={() => handleOnClose()} />
                {/* Display the entered recipe details */}
                <View style={styles.reviewSection}>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Recipe Name:</Text>
                    <Text style={styles.reviewValue}>{name}</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    {imageUri && (<Image source={{ uri: imageUri }} style={{ width: 50, height: 50, marginRight: 10 }} resizeMode="contain" />)}
                  </View>
                  <View style={styles.reviewRow}>
                    <Icon name="timer" size={20} style={styles.reviewIcon} />
                    <Text style={styles.reviewValue}>{prepTime} minutes</Text>
                  </View>
                  <View style={styles.reviewRow}>
                    <Text style={styles.reviewLabel}>Serving Size:</Text>
                    <Text style={styles.reviewValue}>{servings}</Text>
                    <Icon name="person" size={15} style={{ marginLeft: 5 }} color={'#333'} />
                  </View>
                  <Text style={styles.ingredientsHeader}>Ingredients:</Text>
                  {/* List all added ingredients */}
                  <>
                    {selectedIngredients.length > 0 &&
                      selectedIngredients.map((ingredient, index) => (
                        <IngredientCard key={index} id={ingredient.id} name={ingredient.name} category={ingredient.category} quantity={ingredient.quantity}
                          quantityType={ingredient.quantityType} />
                      ))}
                  </>
                </View>
              </View>
            )}

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              {/* Back button (disabled on the first step) */}
              {currentStep > 1 && (
                <TouchableOpacity onPress={() => setCurrentStep(currentStep - 1)} style={styles.backButton}>
                  <Text>Back</Text>
                </TouchableOpacity>
              )}
              {/* Button to submit the recipe */}
              {currentStep == 3 && (
                <TouchableOpacity onPress={handleSubmitRecipe} style={styles.nextButton}>
                  <Text>Save Recipe</Text>
                </TouchableOpacity>
              )}
              {/* Next button (disabled on the last step) */}
              {currentStep < 3 && (
                <TouchableOpacity onPress={() => handleNextStep()} style={styles.nextButton}>
                  <Text>Next</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
      {/* Modal to add the ingredients */}
      <AddIngredientModal visible={isAddIngredientModalVisible} onClose={() => setAddIngredientModalVisible(false)} onSubmit={({ name, category }) =>
        handleOnSubmitAddIngredient(name, category, addIngredient, setIngredients, handleSelectIngredient, setAddIngredientModalVisible,)
      } />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: modalSemiTransparentBg, // Semi-transparent background
  },
  modalContainer: {
    backgroundColor: modalWhiteBg,
    padding: 20,
    borderRadius: 10,
    width: '90%', // Modal width relative to the screen
  },
  input: {
    borderWidth: 1,
    borderColor: greyBorderColor,
    borderRadius: modalBorderRadius,
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
    backgroundColor: orangeBackgroundColor,
    borderRadius: 5,
  },
  addAnotherIngrButton: {
    backgroundColor: orangeBackgroundColor,
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
    color: orangeBackgroundColor,
  },
  ingredientsHeader: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  //generic
  greyBorder: {
    borderWidth: 1,
    borderColor: greyBorderColor,
  },
});

export default AddRecipeModal;
