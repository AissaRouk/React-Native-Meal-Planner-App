import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {MealType} from '../Types/Types';

export default function MealTypeComponent({
  mealType,
  onSelectedMeal,
}: {
  mealType: MealType;
  onSelectedMeal: (meal: MealType) => void;
}): React.JSX.Element {
  const handleMealPress = (meal: MealType) => {
    onSelectedMeal(meal);
  };

  return (
    <View style={styles.container}>
      {[MealType.BREAKFAST, MealType.LUNCH, MealType.DINNER].map(meal => (
        <TouchableOpacity
          key={meal}
          style={[
            styles.mealButton,
            mealType === meal && styles.selectedMealButton,
          ]}
          onPress={() => handleMealPress(meal)}>
          <Text
            style={[
              styles.mealText,
              mealType === meal && styles.selectedMealText,
            ]}>
            {meal}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f4f5f7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 20,
  },
  mealButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 0.3,
    borderColor: '#ccc',
  },
  selectedMealButton: {
    backgroundColor: '#fb7945',
    borderColor: '#fb7945',
  },
  mealText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedMealText: {
    color: 'white',
  },
});
