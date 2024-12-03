import React, {useState} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';

export default function MealTypeComponent(): React.JSX.Element {
  const [selectedMeal, setSelectedMeal] = useState<string>('Breakfast');

  const handleMealPress = (meal: string) => {
    setSelectedMeal(meal);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.mealButton,
          selectedMeal === 'Breakfast' && styles.selectedMealButton,
        ]}
        onPress={() => handleMealPress('Breakfast')}>
        <Text
          style={[
            styles.mealText,
            selectedMeal === 'Breakfast' && styles.selectedMealText,
          ]}>
          Breakfast
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.mealButton,
          selectedMeal === 'Lunch' && styles.selectedMealButton,
        ]}
        onPress={() => handleMealPress('Lunch')}>
        <Text
          style={[
            styles.mealText,
            selectedMeal === 'Lunch' && styles.selectedMealText,
          ]}>
          Lunch
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.mealButton,
          selectedMeal === 'Dinner' && styles.selectedMealButton,
        ]}
        onPress={() => handleMealPress('Dinner')}>
        <Text
          style={[
            styles.mealText,
            selectedMeal === 'Dinner' && styles.selectedMealText,
          ]}>
          Dinner
        </Text>
      </TouchableOpacity>
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
  },
  mealButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 0.5,
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
