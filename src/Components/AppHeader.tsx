import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

type AppHeaderProps = {
  title: string;
  rightComponent?: React.ReactNode;
};

/**
 * Header component for the application.
 * Displays the title and an optional right component.
 * @param title - The title to be displayed in the header.
 * @param rightComponent - An optional component to be displayed on the right side of the header.
 */
const AppHeader: React.FC<AppHeaderProps> = ({title, rightComponent}) => (
  <View style={styles.headerContainer}>
    <Text style={styles.titleText}>{title}</Text>
    {rightComponent}
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  titleText: {
    fontWeight: 'bold',
    color: 'black',
    fontSize: 28,
  },
});

export default AppHeader;
