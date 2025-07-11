// src/Screens/GroceryListScreen.tsx
import React, {useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, FlatList, Text, TouchableOpacity} from 'react-native';
import AppHeader from '../Components/AppHeader';
import {useAppContext} from '../Context/Context';
import {DaysOfWeek, MealType, QuantityType, WeeklyMeal} from '../Types/Types';
import {getWeeklyMealsByDayAndMealType} from '../Services/weeklyMeals-db-services';
import {getIngredientsFromRecipeId} from '../Services/recipeIngredients-db-services';
import {getAllIngredientPantries} from '../Services/ingredientPantry-db-services';
import {
  createGroceryBoughtTable,
  addGroceryBought,
  removeGroceryBought,
  getAllGroceryBought,
} from '../Services/groceryBought-db-services';
import Icon from '@react-native-vector-icons/ionicons';
import {
  screensBackgroundColor,
  orangeBackgroundColor,
  greyBorderColor,
  modalBorderRadius,
} from '../Utils/Styiling';

interface GroceryItem {
  ingredientId: number;
  name: string;
  toBuy: number;
  quantityType: QuantityType;
}

export default function GroceryListScreen(): React.ReactElement {
  const {ingredients} = useAppContext();
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [boughtIds, setBoughtIds] = useState<Set<number>>(new Set());
  const [boughtCollapsed, setBoughtCollapsed] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadGroceryList = useCallback(async () => {
    setIsLoading(true);
    try {
      // ensure our bought‐table exists
      await createGroceryBoughtTable();

      // 1) Gather all planned meals
      const allWeekly: WeeklyMeal[] = [];
      for (const day of Object.values(DaysOfWeek)) {
        for (const meal of Object.values(MealType)) {
          const meals = await getWeeklyMealsByDayAndMealType(
            day as DaysOfWeek,
            meal as MealType,
          );
          allWeekly.push(...meals);
        }
      }

      // 2) Aggregate needs
      type NeedKey = string;
      const neededMap: Record<
        NeedKey,
        {ingredientId: number; quantity: number; quantityType: QuantityType}
      > = {};
      for (const wm of allWeekly) {
        const recipeIngr = await getIngredientsFromRecipeId(wm.recipeId);
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

      // 3) Subtract pantry
      const pantry = await getAllIngredientPantries();
      const pantryLookup: Record<number, number> = {};
      pantry.forEach(p => (pantryLookup[p.ingredientId] = p.quantity));

      // 4) Build to‐buy list
      const list: GroceryItem[] = Object.values(neededMap)
        .map(({ingredientId, quantity, quantityType}) => {
          const have = pantryLookup[ingredientId] || 0;
          const toBuy = Math.max(0, quantity - have);
          const ing = ingredients.find(i => i.id === ingredientId);
          return ing && toBuy > 0
            ? {ingredientId, name: ing.name, toBuy, quantityType}
            : null;
        })
        .filter((x): x is GroceryItem => x !== null)
        .sort((a, b) => a.name.localeCompare(b.name));

      setGroceryList(list);
      setLastUpdated(new Date());

      // load persisted “bought” flags
      const boughtArray = await getAllGroceryBought();
      setBoughtIds(new Set(boughtArray));
    } catch (error) {
      console.error('GroceryListScreen: failed to load list', error);
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);

  useEffect(() => {
    loadGroceryList();
  }, [loadGroceryList]);

  /**
   * Toggle an ingredient's "bought" state both in UI and in DB.
   */
  const toggleBought = async (id: number) => {
    if (boughtIds.has(id)) {
      await removeGroceryBought(id);
      setBoughtIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      await addGroceryBought(id);
      setBoughtIds(prev => new Set(prev).add(id));
    }
  };

  /** Renders each “to buy” card */
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

  // split into two lists
  const toBuyList = groceryList.filter(i => !boughtIds.has(i.ingredientId));
  const boughtList = groceryList.filter(i => boughtIds.has(i.ingredientId));

  return (
    <View style={styles.container}>
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

      {lastUpdated && (
        <Text style={styles.updatedText}>
          Updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}

      <View style={{flex: 1}}>
        <FlatList
          data={toBuyList}
          keyExtractor={item => item.ingredientId.toString()}
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
