import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Header = () => {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const handleDayPress = (day: string) => {
    setSelectedDay(day);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>Daily Meals</Text>
      </View>
      <ScrollView
        horizontal
        style={styles.scrollView}
        showsHorizontalScrollIndicator={false}>
        {daysOfWeek.map(day => (
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
