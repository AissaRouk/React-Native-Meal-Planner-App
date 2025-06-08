// src/Screens/PantryScreen.tsx
import React, {useEffect, useState} from 'react';
import {View, StyleSheet, FlatList, Text} from 'react-native';
import {useAppContext} from '../Context/Context';
import {FloatingButton} from '../Components/FloatingButton';
import {IngredientComponent} from '../Components/IngredientComponent';
import {IngredientSearchModal} from '../Components/IngredientSearchModal';
import {
  getAllIngredientPantries,
  addIngredientPantry,
  updateIngredientPantry,
  deleteIngredientPantry,
} from '../Services/ingredientPantry-db-services';
import {screensBackgroundColor} from '../Utils/Styiling';
import {
  IngredientPantry,
  IngredientPantryWithoutId,
  IngredientWithoutId,
  QuantityType,
} from '../Types/Types';
import AddIngredientModal from '../Components/AddIngredientModal';

export default function PantryScreen(): React.JSX.Element {
  // Access all known ingredients and helper to create new ones
  const {ingredients: allIngredients, addOrUpdateIngredient} = useAppContext();

  // State: list of items currently in the pantry
  const [pantryItems, setPantryItems] = useState<IngredientPantry[]>([]);
  // State: controls visibility of the search‐and‐select modal
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  // State: controls visibility of the “add new ingredient” modal
  const [isAddIngredientModalVisible, setIsAddIngredientModalVisible] =
    useState<boolean>(false);

  /**
   * Load all pantry rows from the database into state
   */
  const loadPantry = async () => {
    try {
      const items = await getAllIngredientPantries();
      setPantryItems(items);
    } catch (e) {
      console.error('Error loading pantry items:', e);
    }
  };

  // Fetch pantry items once on component mount
  useEffect(() => {
    loadPantry();
  }, []);

  /**
   * Update a single pantry row in DB and local state
   */
  const handleUpdate = async (updated: IngredientPantry) => {
    try {
      await updateIngredientPantry(updated);
      setPantryItems(prev =>
        prev.map(item => (item.id === updated.id ? updated : item)),
      );
    } catch (e) {
      console.error('Failed to update pantry item:', e);
    }
  };

  /**
   * Delete a single pantry row in DB and remove it from state
   */
  const handleDelete = async (id: number) => {
    try {
      await deleteIngredientPantry(id);
      setPantryItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error('Failed to delete pantry item:', e);
    }
  };

  /**
   * Add a new pantry entry via the search modal
   * Returns true on success so the modal can close
   */
  const handleAddIngredientPantry = async (
    newEntry: IngredientPantryWithoutId,
  ): Promise<boolean> => {
    try {
      await addIngredientPantry(newEntry);
      await loadPantry();
      return true;
    } catch (e) {
      console.error('Failed to add pantry item:', e);
      return false;
    }
  };

  // Handlers for selector callbacks that only take two args
  const handleChangeQuantity = (id: number, quantity: number) => {
    const item = pantryItems.find(i => i.id === id);
    if (item) handleUpdate({...item, quantity});
  };
  const handleChangeQuantityType = (id: number, quantityType: QuantityType) => {
    const item = pantryItems.find(i => i.id === id);
    if (item) handleUpdate({...item, quantityType});
  };
  const handleRemoveIngredient = (id: number) => {
    handleDelete(id);
  };

  /**
   * Create a brand‐new Ingredient if needed, then add it to pantry
   */
  const handleCreateIngredient = async (
    i: IngredientWithoutId,
  ): Promise<boolean> => {
    const res = await addOrUpdateIngredient({...i, id: -1});
    if (res == -1) return false;
    const added = await handleAddIngredientPantry({
      ingredientId: res,
      quantity: 1,
      quantityType: QuantityType.UNIT,
    });
    return added;
  };

  /** Render each pantry item as an IngredientComponent */
  const renderItem = ({item}: {item: IngredientPantry}) => (
    <IngredientComponent
      ingredients={allIngredients}
      id={item.ingredientId}
      quantity={item.quantity}
      quantityType={item.quantityType}
      number={item.id}
      setQuantity={q => handleChangeQuantity(item.id, q)}
      setQuantityType={qt => handleChangeQuantityType(item.id, qt)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      {/* If no items, show empty message */}
      {pantryItems.length === 0 ? (
        <Text style={styles.emptyText}>Your pantry is empty.</Text>
      ) : (
        <FlatList
          data={pantryItems}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Button to open the ingredient‐search modal */}
      <FloatingButton
        iconName="add"
        iconSize={28}
        iconColor="white"
        onPress={() => setSearchModalVisible(true)}
      />

      {/* Modal: search existing ingredients to add to pantry */}
      <IngredientSearchModal
        visible={isSearchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onAddIngredient={ing =>
          handleAddIngredientPantry({
            ingredientId: ing.id,
            quantity: ing.quantity,
            quantityType: ing.quantityType,
          })
        }
        onChangeQuantity={handleChangeQuantity}
        onChangeQuantityType={(id, type) =>
          handleChangeQuantityType(id, type as QuantityType)
        }
        onRemoveIngredient={handleRemoveIngredient}
        // Transform pantryItems to selector format
        selectedIngredients={pantryItems.map(p => ({
          id: p.ingredientId,
          quantity: p.quantity,
          quantityType: p.quantityType,
        }))}
        onOpenAddIngredientModal={() => {
          setIsAddIngredientModalVisible(true);
        }}
      />

      {/* Modal: add a completely new ingredient to the system */}
      <AddIngredientModal
        visible={isAddIngredientModalVisible}
        onSubmit={handleCreateIngredient}
        onClose={() => setIsAddIngredientModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: screensBackgroundColor,
    padding: 16,
  },
  list: {
    paddingBottom: 80,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 16,
  },
});
