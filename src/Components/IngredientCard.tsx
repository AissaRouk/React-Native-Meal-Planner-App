import {View, Text, StyleSheet} from 'react-native';
import {Ingredient, QuantityType} from '../Types/Types';
export function IngredientCard(
  ingredient: Ingredient & {quantity: number; quantityType: QuantityType},
) {
  return (
    <View style={styles.ingredientRow}>
      <Text style={styles.ingredientName}>- {ingredient.name}</Text>
      <Text style={styles.ingredientDetails}>
        {ingredient.quantity} {ingredient.quantityType}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
