import React, {useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, FlatList, Text, TouchableOpacity} from 'react-native';
import AppHeader from './AppHeader';
import {useAppContext} from '../Context/Context';
import {DaysOfWeek, MealType, QuantityType, WeeklyMeal} from '../Types/Types';
import {getWeeklyMealsByDayAndMealType} from '../Services/weeklyMeals-db-services';
import {getIngredientsFromRecipeId} from '../Services/recipeIngredients-db-services';
import {getAllIngredientPantries} from '../Services/ingredientPantry-db-services';
import Icon from '@react-native-vector-icons/ionicons';
import {screensBackgroundColor, orangeBackgroundColor} from '../Utils/Styiling';

interface GroceryItem {
  ingredientId: number;
  name: string;
  toBuy: number;
  quantityType: QuantityType;
}

export default function GroceryListScreen(): React.ReactElement {
  const {ingredients} = useAppContext();
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const loadGroceryList = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1) Fetch all planned meals across week & meals
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

      // 2) Aggregate recipe ingredients
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

      // 3) Subtract pantry stock
      const pantry = await getAllIngredientPantries();
      const pantryLookup: Record<number, number> = {};
      pantry.forEach(p => {
        pantryLookup[p.ingredientId] = p.quantity;
      });

      // 4) Build grocery list
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
    } catch (error) {
      console.error('GroceryListScreen: failed to load list', error);
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);

  useEffect(() => {
    loadGroceryList();
  }, [loadGroceryList]);

  return (
    <View style={styles.container}>
      <AppHeader
        title="Grocery List"
        rightComponent={
          <TouchableOpacity onPress={loadGroceryList}>
            <Icon name="refresh" size={24} color={orangeBackgroundColor} />
          </TouchableOpacity>
        }
      />

      {lastUpdated && (
        <Text style={styles.updatedText}>
          Updated: {lastUpdated.toLocaleTimeString()}
        </Text>
      )}

      <FlatList
        data={groceryList}
        keyExtractor={item => item.ingredientId.toString()}
        refreshing={isLoading}
        onRefresh={loadGroceryList}
        renderItem={({item}) => (
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.qty}>
              {item.toBuy} {item.quantityType}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No items to buy 🎉</Text>
        }
        contentContainerStyle={
          groceryList.length === 0 && styles.emptyContainer
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: screensBackgroundColor},
  updatedText: {textAlign: 'center', marginVertical: 8, color: '#666'},
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  name: {fontSize: 16, color: '#333'},
  qty: {fontSize: 16, color: '#333', fontWeight: '600'},
  empty: {textAlign: 'center', marginTop: 50, color: '#999'},
  emptyContainer: {flex: 1, justifyContent: 'center'},
});
