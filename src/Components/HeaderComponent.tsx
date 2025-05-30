import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {daysOfWeekArray} from '../Assets/Constants';
import {DaysOfWeek} from '../Types/Types';
import Icon from '@react-native-vector-icons/ionicons';
import {orangeBackgroundColor} from '../Utils/Styiling';

const Header = ({
  selectedDay,
  setSelectedDay,
  onButtonPress,
}: {
  selectedDay: DaysOfWeek;
  setSelectedDay: (day: DaysOfWeek) => void;
  onButtonPress: () => void;
}) => {
  const handleDayPress = (day: DaysOfWeek) => {
    setSelectedDay(day);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        {/* Title */}
        <Text style={styles.titleText}>Daily Meals</Text>
        {/* RecipeScreen Button */}
        <TouchableOpacity
          style={{
            backgroundColor: orangeBackgroundColor,
            paddingVertical: 10,
            paddingHorizontal: 10,
            borderRadius: 8,
            alignSelf: 'flex-end',
          }}
          onPress={() => onButtonPress()}>
          <Icon name="book-outline" color={'white'} size={20} />
        </TouchableOpacity>
      </View>
      {/* Weekly days */}
      <ScrollView
        horizontal
        style={styles.scrollView}
        showsHorizontalScrollIndicator={false}>
        {daysOfWeekArray.map(day => (
          <TouchableOpacity
            key={day}
            onPress={() => handleDayPress(day)}
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
  headerContainer: {
    width: '100%',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleText: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 28,
  },
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
    color: 'white', // Make the text more readable with the new background
  },
});

export default Header;
