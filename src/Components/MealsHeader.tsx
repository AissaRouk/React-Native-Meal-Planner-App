import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {daysOfWeekArray} from '../Assets/Constants';
import {DaysOfWeek} from '../Types/Types';
import {orangeBackgroundColor} from '../Utils/Styiling';
import AppHeader from './AppHeader';

type MealsHeaderProps = {
  selectedDay: DaysOfWeek;
  setSelectedDay: (day: DaysOfWeek) => void;
  onRecipesButtonPress: () => void;
  onLogoutButtonPress: () => void;
};

/**
 * Header component for the meals screen.
 * Displays the title and a button to navigate to the recipe screen.
 * @param selectedDay - The currently selected day of the week.
 * @param setSelectedDay - Function to update the selected day.
 * @param onButtonPress - Function to handle button press event.
 */
const MealsHeader: React.FC<MealsHeaderProps> = ({
  selectedDay,
  setSelectedDay,
  onRecipesButtonPress,
  onLogoutButtonPress,
}) => {
  return (
    <View>
      <AppHeader
        title="Daily Meals"
        rightComponent={
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{
                backgroundColor: orangeBackgroundColor,
                paddingVertical: 10,
                paddingHorizontal: 10,
                borderRadius: 8,
                alignSelf: 'flex-end',
                marginRight: 10,
              }}
              onPress={onLogoutButtonPress}>
              <Icon name="log-out-outline" color={'white'} size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                backgroundColor: orangeBackgroundColor,
                paddingVertical: 10,
                paddingHorizontal: 10,
                borderRadius: 8,
                alignSelf: 'flex-end',
              }}
              onPress={onRecipesButtonPress}>
              <Icon name="book-outline" color={'white'} size={20} />
            </TouchableOpacity>
          </View>
        }
      />
      <ScrollView
        horizontal
        style={styles.scrollView}
        showsHorizontalScrollIndicator={false}>
        {daysOfWeekArray.map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={[
              styles.dayCard,
              selectedDay === day && styles.selectedDayCard,
            ]}>
            <Text
              style={[
                styles.dayText,
                selectedDay === day && styles.selectedDayText,
              ]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    marginBottom: 16,
  },
  dayCard: {
    backgroundColor: '#f2f3f5',
    height: 70,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#e6e6eb',
    borderWidth: 0.5,
    borderRadius: 5,
    marginRight: 16,
  },
  selectedDayCard: {
    backgroundColor: '#fb7945',
  },
  dayText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedDayText: {
    color: 'white',
  },
});

export default MealsHeader;
