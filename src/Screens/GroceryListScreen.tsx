// src/Screens/GroceryListScreen.tsx

import React, {useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, FlatList, Text, TouchableOpacity} from 'react-native';
import AppHeader from '../Components/AppHeader';
import {useAppContext} from '../Context/Context';
import {QuantityType, WeeklyMeal} from '../Types/Types';
import Icon from '@react-native-vector-icons/ionicons';
import {
  screensBackgroundColor,
  orangeBackgroundColor,
  greyBorderColor,
  modalBorderRadius,
} from '../Utils/Styiling';
import {getAllIngredientPantriesDb} from '../Services/ingredientPantry-db-services';
import {getAllWeeklyMealsDb} from '../Services/weeklyMeals-db-services'; // Import the new function

// Type for a grocery item to buy
interface GroceryItem {
  ingredientId: string;
  name: string;
  toBuy: number;
  quantityType: QuantityType;
}

export default function GroceryListScreen(): React.ReactElement {
  // Context hooks for app state and actions
  const {
    ingredients,
    getIngredientsOfRecipe,
    getAllGroceryBought,
    addGroceryBought,
    removeGroceryBought,
  } = useAppContext();

  // Local state
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]); // List of items to buy
  const [boughtIds, setBoughtIds] = useState<Set<string>>(new Set()); // Set of bought ingredient IDs
  const [boughtCollapsed, setBoughtCollapsed] = useState<boolean>(false); // Collapse bought section
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null); // Last refresh time
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading indicator

  /**
   * Loads grocery list by:
   * 1. Gathering all planned meals for the week
   * 2. Aggregating needed ingredients
   * 3. Subtracting pantry stock
   * 4. Building the final to-buy list
   * 5. Loading bought flags from DB
   */
  const loadGroceryList = useCallback(async () => {
    setIsLoading(true);
    try {
      const allWeekly: WeeklyMeal[] = await getAllWeeklyMealsDb(); // Use the new function

      // 2) Aggregate ingredient needs from all recipes
      type NeedKey = string;
      const neededMap: Record<
        NeedKey,
        {ingredientId: string; quantity: number; quantityType: QuantityType}
      > = {};
      for (const wm of allWeekly) {
        const recipeIngr = await getIngredientsOfRecipe(wm.recipeId);
        recipeIngr.forEach(ri => {
          const key = `${ri.id}|${ri.quantityType}`;
          if (neededMap[key]) {
            neededMap[key].quantity += ri.quantity;
          } else {
            neededMap[key] = {
              ingredientId: ri.id,
              quantity: ri.quantity,
              quantityType: ri.quantityType,
            };
          }
        });
      }

      // 3) Subtract pantry stock from needed quantities
      const pantry = await getAllIngredientPantriesDb();
      const pantryLookup: Record<string, number> = {};
      pantry.forEach(p => (pantryLookup[p.ingredientId] = p.quantity));

      // 4) Build final to-buy list (exclude items already in pantry)
      const list: GroceryItem[] = [];
      for (const key in neededMap) {
        if (neededMap.hasOwnProperty(key)) {
          const needed = neededMap[key];
          const have = pantryLookup[needed.ingredientId] || 0;
          const toBuy = Math.max(0, needed.quantity - have);

          if (toBuy > 0) {
            const ing = ingredients.find(i => i.id === needed.ingredientId);
            if (ing) {
              list.push({
                ingredientId: needed.ingredientId,
                name: ing.name,
                toBuy: toBuy,
                quantityType: needed.quantityType,
              });
            }
          }
        }
      }

      list.sort((a, b) => a.name.localeCompare(b.name));

      setGroceryList(list);
      setLastUpdated(new Date());

      // 5) Load persisted “bought” flags from DB
      const boughtArray = await getAllGroceryBought();
      setBoughtIds(new Set(boughtArray.map(item => item.ingredientId)));
    } catch (error) {
      console.error('GroceryListScreen: failed to load list', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    ingredients,
    getIngredientsOfRecipe,
    getAllIngredientPantriesDb,
    getAllGroceryBought,
    getAllWeeklyMealsDb, // Add the new function to the dependency array
  ]);

  // Load grocery list on mount and when dependencies change
  useEffect(() => {
    loadGroceryList();
  }, [loadGroceryList]);

  /**
   * Toggle an ingredient's "bought" state both in UI and in DB.
   * Adds/removes the ingredient from the bought set and persists to DB.
   */
  const toggleBought = async (id: string) => {
    if (boughtIds.has(id)) {
      await removeGroceryBought(id); // Remove from DB
      setBoughtIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      await addGroceryBought(id); // Add to DB
      setBoughtIds(prev => new Set(prev).add(id));
    }
  };

  /**
   * Renders each “to buy” grocery card.
   * Shows item name, quantity, and a checkbox to mark as bought.
   */
  const renderToBuyItem = ({item}: {item: GroceryItem}) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => toggleBought(item.ingredientId)}>
          <Icon name="square-outline" size={24} color={orangeBackgroundColor} />
        </TouchableOpacity>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <Text style={styles.qty}>
        {item.toBuy} {item.quantityType}
      </Text>
    </View>
  );

  // Split grocery list into items to buy and already bought
  const toBuyList = groceryList.filter(i => !boughtIds.has(i.ingredientId));
  const boughtList = groceryList.filter(i => boughtIds.has(i.ingredientId));

  return (
    <View style={styles.container}>
      {/* App header with refresh button */}
      <AppHeader
        title="Grocery List"
        rightComponent={
          <TouchableOpacity
            onPress={loadGroceryList}
            style={{
              backgroundColor: orangeBackgroundColor,
              borderRadius: modalBorderRadius,
              padding: 10,
            }}>
            <Icon name="refresh" size={20} color="white" />
          </TouchableOpacity>
        }
      />

      {/* Last updated time */}
      {lastUpdated && (
        <Text style={styles.updatedText}>
          Updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}

      {/* List of items to buy */}
      <View style={{flex: 1}}>
        <FlatList
          data={toBuyList}
          keyExtractor={item => item.ingredientId}
          refreshing={isLoading}
          onRefresh={loadGroceryList}
          renderItem={renderToBuyItem}
          ListEmptyComponent={
            <Text style={styles.empty}>Nothing to buy 🎉</Text>
          }
          contentContainerStyle={
            toBuyList.length === 0 && styles.emptyContainer
          }
        />
      </View>

      {/* Already bought section, collapsible */}
      {boughtList.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.sectionHeaderContainer}
            onPress={() => setBoughtCollapsed(prev => !prev)}>
            <Icon
              name={boughtCollapsed ? 'chevron-down' : 'chevron-up'}
              size={20}
              color="#444"
            />
            <Text style={styles.sectionHeader}>Already Bought</Text>
            <Text style={styles.count}>({boughtList.length})</Text>
          </TouchableOpacity>
          {!boughtCollapsed &&
            boughtList.map(item => (
              <TouchableOpacity
                key={item.ingredientId}
                style={styles.boughtRow}
                onPress={() => toggleBought(item.ingredientId)}>
                <Icon name="checkbox" size={20} color={orangeBackgroundColor} />
                <Text style={[styles.name, styles.nameBought]}>
                  {item.name} — {item.toBuy} {item.quantityType}
                </Text>
              </TouchableOpacity>
            ))}
        </>
      )}
    </View>
  );
}

// Styles for the screen and components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: screensBackgroundColor,
    padding: 16,
  },
  updatedText: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#666',
  },

  /* To Buy Cards */
  card: {
    backgroundColor: 'white',
    borderColor: greyBorderColor,
    borderWidth: 1,
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    color: '#333',
    marginLeft: 12,
  },
  qty: {
    fontSize: 16,
    color: '#555',
    marginLeft: 36,
  },

  /* Already Bought Section */
  sectionHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginLeft: 8,
  },
  count: {
    marginLeft: 4,
    color: '#666',
  },
  boughtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  nameBought: {
    textDecorationLine: 'line-through',
    color: '#999',
    marginLeft: 8,
  },

  /* Empty State */
  empty: {
    textAlign: 'center',
    marginTop: 50,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
