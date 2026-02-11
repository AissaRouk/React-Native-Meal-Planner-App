// GroceryListScreen.tsx
import React, {useEffect, useState, useCallback} from 'react';
import {View, StyleSheet, FlatList, Text, TouchableOpacity} from 'react-native';
import AppHeader from '../Components/AppHeader';
import {useAppContext} from '../Context/Context';
import {QuantityType, WeeklyEntryType, WeeklyMeal} from '../Types/Types';
import Icon from '@react-native-vector-icons/ionicons';
import {
  screensBackgroundColor,
  orangeBackgroundColor,
  greyBorderColor,
  modalBorderRadius,
} from '../Utils/Styiling';
import {getAllIngredientPantriesDb} from '../Services/ingredientPantry-db-services';
import {getAllWeeklyMealsDb} from '../Services/weeklyMeals-db-services';

interface GroceryItem {
  ingredientId: string;
  name: string;
  toBuy: number;
  quantityType: QuantityType;
}

// Conversión de unidades
const conversionFactors: Record<QuantityType, number> = {
  [QuantityType.TEASPOON]: 1,
  [QuantityType.TABLESPOON]: 2,
  [QuantityType.CUP]: 48,
  [QuantityType.GRAM]: 1,
  [QuantityType.KILOGRAM]: 1000,
  [QuantityType.MILLILITER]: 1,
  [QuantityType.LITER]: 1000,
  [QuantityType.UNIT]: 1,
};

const preferredUnits: QuantityType[][] = [
  [QuantityType.TEASPOON, QuantityType.TABLESPOON, QuantityType.CUP],
  [QuantityType.GRAM, QuantityType.KILOGRAM],
  [QuantityType.MILLILITER, QuantityType.LITER],
];

function unifyQuantities(items: GroceryItem[]): GroceryItem[] {
  const grouped: Record<string, GroceryItem[]> = {};

  for (const item of items) {
    const key = item.ingredientId;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }

  const unified: GroceryItem[] = [];

  for (const ingId in grouped) {
    const items = grouped[ingId];
    const first = items[0];

    const unitGroup = preferredUnits.find(group =>
      group.includes(first.quantityType),
    );

    if (!unitGroup) {
      const total = items.reduce((acc, i) => acc + i.toBuy, 0);
      unified.push({...first, toBuy: total});
      continue;
    }

    const toBase = (qty: number, from: QuantityType) =>
      qty * (conversionFactors[from] || 1);

    const fromBase = (qty: number, to: QuantityType) =>
      qty / (conversionFactors[to] || 1);

    const totalBase = items.reduce(
      (acc, i) => acc + toBase(i.toBuy, i.quantityType),
      0,
    );

    // Use the largest unit from the group
    const targetUnit = unitGroup[unitGroup.length - 1];
    const finalQuantity = fromBase(totalBase, targetUnit);

    unified.push({
      ingredientId: ingId,
      name: first.name,
      toBuy: finalQuantity,
      quantityType: targetUnit,
    });
  }

  return unified;
}

export default function GroceryListScreen(): React.ReactElement {
  const {
    ingredients,
    getIngredientsOfRecipe,
    getAllGroceryBought,
    addGroceryBought,
    removeGroceryBought,
  } = useAppContext();

  const [groceryList, setGroceryList] = useState<GroceryItem[]>([]);
  const [boughtIds, setBoughtIds] = useState<Set<string>>(new Set());
  const [boughtCollapsed, setBoughtCollapsed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadGroceryList = useCallback(async () => {
    setIsLoading(true);
    try {
      const allWeekly: WeeklyMeal[] = await getAllWeeklyMealsDb();
      const neededMap: Record<
        string,
        {ingredientId: string; quantity: number; quantityType: QuantityType}
      > = {};

      for (const wm of allWeekly) {
        const entryType = wm.entryType ?? WeeklyEntryType.RECIPE;
        if (entryType === WeeklyEntryType.INGREDIENT && wm.ingredientId) {
          const key = `${wm.ingredientId}|${wm.quantityType}`;
          if (neededMap[key]) neededMap[key].quantity += wm.quantity ?? 0;
          else
            neededMap[key] = {
              ingredientId: wm.ingredientId,
              quantity: wm.quantity ?? 0,
              quantityType: wm.quantityType!,
            };
        } else if (wm.recipeId) {
          const recipeIngr = await getIngredientsOfRecipe(wm.recipeId);
          for (const ri of recipeIngr) {
            const key = `${ri.id}|${ri.quantityType}`;
            if (neededMap[key]) neededMap[key].quantity += ri.quantity;
            else
              neededMap[key] = {
                ingredientId: ri.id,
                quantity: ri.quantity,
                quantityType: ri.quantityType,
              };
          }
        }
      }

      const pantry = await getAllIngredientPantriesDb();
      const pantryLookup: Record<string, number> = {};
      pantry.forEach(p => (pantryLookup[p.ingredientId] = p.quantity));

      const tempList: GroceryItem[] = [];

      for (const key in neededMap) {
        const needed = neededMap[key];
        const have = pantryLookup[needed.ingredientId] || 0;
        const toBuy = Math.max(0, needed.quantity - have);

        if (toBuy > 0) {
          const ing = ingredients.find(i => i.id === needed.ingredientId);
          if (ing) {
            tempList.push({
              ingredientId: needed.ingredientId,
              name: ing.name,
              toBuy,
              quantityType: needed.quantityType,
            });
          }
        }
      }

      const mergedList = unifyQuantities(tempList);
      mergedList.sort((a, b) => a.name.localeCompare(b.name));

      setGroceryList(mergedList);
      setLastUpdated(new Date());

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
    getAllWeeklyMealsDb,
  ]);

  useEffect(() => {
    loadGroceryList();
  }, [loadGroceryList]);

  const toggleBought = async (id: string) => {
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

  const renderToBuyItem = ({item}: {item: GroceryItem}) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => toggleBought(item.ingredientId)}>
          <Icon name="square-outline" size={24} color={orangeBackgroundColor} />
        </TouchableOpacity>
        <Text style={styles.name}>{item.name}</Text>
      </View>
      <Text style={styles.qty}>
        {item.toBuy.toFixed(2)} {item.quantityType}
      </Text>
    </View>
  );

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
                  {item.name} — {item.toBuy.toFixed(2)} {item.quantityType}
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
