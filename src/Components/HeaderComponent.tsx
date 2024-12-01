// Header.tsx
import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const Header = () => {
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
          <View key={day} style={styles.dayCard}>
            <Text style={styles.dayText}>{day}</Text>
          </View>
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
    marginHorizontal: 8,
  },
  dayText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Header;
