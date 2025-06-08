// src/Components/IngredientSearchSelector.tsx
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import {SearchBar} from '@rneui/themed';
import MiniSearch, {Options, SearchResult, Suggestion} from 'minisearch';
import Icon from '@react-native-vector-icons/ionicons';
import {Ingredient, QuantityType} from '../Types/Types';
import {IngredientComponent} from './IngredientComponent';
import {useAppContext} from '../Context/Context';
import {getIngredientById} from '../Services/ingredient-db-services';
import {greyBorderColor, orangeBackgroundColor} from '../Utils/Styiling';

type IngredientSearchSelectorProps = {
  /**
   * The current list of selected ingredients (with quantity and quantityType)
   * */
  selectedIngredients: Array<
    Ingredient & {quantity: number; quantityType: QuantityType}
  >;
  /**
   * Call whenever the user picks a new Ingredient (by id) to add an empty item to selectedIngredients
   */
  onAddIngredient: (
    ingredient: Ingredient & {quantity: number; quantityType: QuantityType},
  ) => void;
  /**
   * Call whenever the user deletes one of the selectedIngredients
   */
  onRemoveIngredient: (ingredientId: number) => void;
  /**
   * Override how to update quantity / quantityType for a given already‐picked ingredient
   */
  onChangeQuantity: (ingredientId: number, quantity: number) => void;
  onChangeQuantityType: (
    ingredientId: number,
    quantityType: QuantityType,
  ) => void;
  onOpenAddIngredientModal: () => any;
  showResultList?: boolean;
};

export const IngredientSearchSelector: React.FC<
  IngredientSearchSelectorProps
> = ({
  selectedIngredients,
  onAddIngredient,
  onRemoveIngredient,
  onChangeQuantity,
  onChangeQuantityType,
  onOpenAddIngredientModal,
  showResultList,
}) => {
  const {ingredients} = useAppContext();

  //— MiniSearch setup
  const searchParameters: Options = {
    fields: ['name'],
    idField: 'id',
    storeFields: ['name', 'id'],
    searchOptions: {fuzzy: 1, prefix: true},
  };
  const minisearchRef = useRef<MiniSearch<Ingredient> | null>(null);

  //— Search states
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);
  const [selectionViewOpen, setSelectionViewOpen] = useState(false);

  const searchBarRef = useRef<TextInput>(null);
  const suggestionTouchableRef = useRef<any>(null);

  //— 1) initialize / reindex ingredients each time the array changes
  useEffect(() => {
    if (!minisearchRef.current) {
      minisearchRef.current = new MiniSearch<Ingredient>(searchParameters);
    }
    if (ingredients.length > 0) {
      minisearchRef.current.removeAll();
      minisearchRef.current.addAll(ingredients);
    }
  }, [ingredients]);

  //— 2) whenever searchResults changes, decide whether to show “pick one” vs “multiple”
  useEffect(() => {
    if (searchResults.length > 1) {
      setSelectionViewOpen(true);
      setSearchResultsVisible(false);
    } else if (searchResults.length === 1) {
      // if exactly one, auto‐add it
      handleSelectIngredient(searchResults[0].id);
      setSearchResultsVisible(true);
    } else {
      // zero results → keep selectedIngredients visible
      setSelectionViewOpen(false);
      setSearchResultsVisible(true);
    }
  }, [searchResults]);

  function handleSelectIngredient(id: number) {
    // guard against duplicates
    if (selectedIngredients.find(i => i.id === id)) {
      return;
    }
    getIngredientById(id).then(ing => {
      onAddIngredient({...ing, quantity: 1, quantityType: QuantityType.GRAM});
      setSearchValue('');
    });
  }

  function handleSearch(query: string) {
    setSearchResults([]);
    if (query.trim() === '') {
      setSuggestions([]);
      setSuggestionsVisible(false);
      setSelectionViewOpen(false);
      return;
    }
    setSuggestionsVisible(false);
    const results = minisearchRef.current?.search(query) || [];
    setSearchResults(results);

    if (results.length > 1) {
      setSelectionViewOpen(true);
      setSearchResultsVisible(false);
    } else if (results.length === 1) {
      setSelectionViewOpen(false);
      setSearchResultsVisible(true);
    } else {
      setSelectionViewOpen(false);
      setSearchResultsVisible(true);
    }
  }

  function handleTextChange(text: string) {
    setSearchValue(text);
    if (text.trim() === '') {
      setSuggestions([]);
      setSuggestionsVisible(false);
      return;
    }
    const sug = minisearchRef.current?.autoSuggest(text) || [];
    setSuggestions(sug);
    setSuggestionsVisible(sug.length > 0);
  }

  function handleSelectSuggestion(sug: Suggestion) {
    handleSearch(sug.suggestion);
    searchBarRef.current?.blur();
    setSearchValue(sug.suggestion);
    setSuggestionsVisible(false);
  }

  function closeSelectionView() {
    setSelectionViewOpen(false);
    setSearchResultsVisible(true);
  }

  return (
    <View style={{zIndex: 1000 /* ensure it floats above siblings */}}>
      <View
        style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
        <View style={{flex: 1}}>
          <SearchBar
            placeholder="Search ingredients…"
            value={searchValue}
            onChangeText={handleTextChange}
            onSubmitEditing={() => handleSearch(searchValue)}
            lightTheme
            round
            searchIcon={<Icon name="search" size={18} color="grey" />}
            clearIcon={false}
            containerStyle={styles.searchContainer}
            inputContainerStyle={[
              styles.searchInputContainer,
              {
                borderBottomWidth: suggestionsVisible ? 0 : 1,
                borderBottomLeftRadius: suggestionsVisible ? 0 : 5,
                borderBottomRightRadius: suggestionsVisible ? 0 : 5,
              },
            ]}
            inputStyle={styles.searchInput}
            ref={searchBarRef}
          />
          {suggestionsVisible && (
            <ScrollView style={styles.suggestionsContainer}>
              {suggestions.map((sug, idx) => (
                <TouchableOpacity
                  ref={suggestionTouchableRef}
                  key={idx}
                  onPress={() => handleSelectSuggestion(sug)}
                  style={styles.suggestionItem}>
                  <Text style={styles.suggestionText}>{sug.suggestion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <TouchableOpacity
          onPress={() => onOpenAddIngredientModal()}
          style={{
            padding: 8,
            marginLeft: 8,
            backgroundColor: orangeBackgroundColor,
            borderRadius: 5,
          }}>
          <Icon name="add-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {showResultList &&
        searchResultsVisible &&
        selectedIngredients.length > 0 && (
          <ScrollView style={{maxHeight: 200, marginBottom: 8}}>
            {selectedIngredients.map((inst, idx) => (
              <IngredientComponent
                key={idx}
                ingredients={selectedIngredients}
                id={inst.id}
                number={idx}
                quantity={inst.quantity}
                quantityType={inst.quantityType}
                setQuantity={q => onChangeQuantity(inst.id, q)}
                setQuantityType={qt => onChangeQuantityType(inst.id, qt)}
                onDelete={onRemoveIngredient}
              />
            ))}
          </ScrollView>
        )}

      {selectionViewOpen && (
        <>
          <View style={styles.selectionHeader}>
            <Text style={styles.selectionHeaderText}>
              Select an ingredient:
            </Text>
            <Icon
              name="close-circle-outline"
              size={20}
              onPress={closeSelectionView}
            />
          </View>
          <ScrollView style={styles.selectionList}>
            {searchResults.map((res, idx) => {
              const ing = ingredients.find(i => i.id === res.id);
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSelectIngredient(res.id)}
                  style={styles.selectionItem}>
                  <Text style={styles.selectionItemText}>{ing?.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: 0,
  },
  searchInputContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: greyBorderColor,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    margin: 0,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: greyBorderColor,
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    zIndex: 1001,
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
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 4,
  },
  selectionHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  selectionList: {
    maxHeight: 150,
    marginBottom: 8,
  },
  selectionItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectionItemText: {
    fontSize: 15,
    color: '#000',
  },
});
