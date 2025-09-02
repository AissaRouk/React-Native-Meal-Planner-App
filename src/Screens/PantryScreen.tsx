// src/Screens/PantryScreen.tsx

import React, {useEffect, useState} from 'react';
import {View, StyleSheet, FlatList, Text} from 'react-native';
import {useAppContext} from '../Context/Context';
import {FloatingButton} from '../Components/FloatingButton';
import {IngredientComponent} from '../Components/IngredientComponent';
import {IngredientSearchModal} from '../Components/IngredientSearchModal';
import {
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
import AppHeader from '../Components/AppHeader';

export default function PantryScreen(): React.JSX.Element {
  // --- Context & state ---
  const {
    ingredients: allIngredients,
    addOrUpdateIngredient,
    getAllIngredientPantries,
  } = useAppContext();
  const [pantryItems, setPantryItems] = useState<IngredientPantry[]>([]);
  const [isSearchModalVisible, setSearchModalVisible] = useState(false);
  const [isAddIngredientModalVisible, setIsAddIngredientModalVisible] =
    useState(false);

  // --- Load pantry rows from DB ---
  const loadPantry = async () => {
    try {
      const items = await getAllIngredientPantries();
      setPantryItems(items);
    } catch (e) {
      console.error('Error loading pantry items:', e);
    }
  };

  useEffect(() => {
    loadPantry();
  }, []);

  // --- Update one pantry row both in DB and state ---
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

  // --- Delete one pantry row from DB and state ---
  const handleDelete = async (id: string) => {
    try {
      await deleteIngredientPantry(id);
      setPantryItems(prev => prev.filter(item => item.id !== id));
    } catch (e) {
      console.error('Failed to delete pantry item:', e);
    }
  };

  // --- Add a pantry row (called from search modal) ---
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

  // --- Wrapers for selector callbacks ---
  const handleChangeQuantity = (id: string, quantity: number) => {
    const item = pantryItems.find(i => i.id === id);
    if (item) handleUpdate({...item, quantity});
  };
  const handleChangeQuantityType = (id: string, quantityType: QuantityType) => {
    const item = pantryItems.find(i => i.id === id);
    if (item) handleUpdate({...item, quantityType});
  };
  const handleRemoveIngredient = (id: string) => {
    handleDelete(id);
  };

  // --- Create brand-new ingredient then add to pantry ---
  const handleCreateIngredient = async (
    i: IngredientWithoutId,
  ): Promise<boolean> => {
    const res = await addOrUpdateIngredient({...i, id: ''});
    if (!res || res == '') return false;
    return handleAddIngredientPantry({
      ingredientId: res,
      quantity: 1,
      quantityType: QuantityType.UNIT,
    });
  };

  // --- Render each pantry row via IngredientComponent ---
  const renderItem = ({
    item,
    index,
  }: {
    item: IngredientPantry;
    index: number;
  }) => (
    <IngredientComponent
      ingredients={allIngredients}
      id={item.ingredientId}
      quantity={item.quantity}
      quantityType={item.quantityType}
      number={index}
      setQuantity={q => handleChangeQuantity(item.id, q)}
      setQuantityType={qt => handleChangeQuantityType(item.id, qt)}
      onDelete={() => handleDelete(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <AppHeader title="My Pantry" />

      {/* Empty-state */}
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

      {/* “+” to open search modal */}
      <FloatingButton
        iconName="add"
        iconSize={28}
        iconColor="white"
        onPress={() => setSearchModalVisible(true)}
      />

      {/* Modal ­– search existing ingredients */}
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
        // pass pantryItems in selector’s expected shape
        selectedIngredients={pantryItems.map(p => ({
          id: p.ingredientId,
          quantity: p.quantity,
          quantityType: p.quantityType,
        }))}
        onOpenAddIngredientModal={() => setIsAddIngredientModalVisible(true)}
      />

      {/* Modal ­– add brand-new ingredient */}
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
