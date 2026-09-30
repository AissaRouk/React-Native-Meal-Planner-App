// src/Components/FloatingButton.tsx

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

// Extract exactly the union type of valid Ionicon names:
type IoniconName = React.ComponentProps<typeof Icon>['name'];

type FloatingButtonProps = {
  onPress: () => void;
  iconName: IoniconName;
  iconColor?: string;
  iconSize?: number;
  containerStyle?: ViewStyle;
  iconContainerStyle?: ViewStyle;
};

/**
 * A circular, floating‐position button with an Ionicon.
 *
 * By default, it sits in the bottom‐right corner (absolute), but you can override via `containerStyle`.
 * Use `iconName`, `iconSize`, and `iconColor` to choose which icon appears.
 */
export const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress, iconName, iconColor = 'white', iconSize = 28, containerStyle, iconContainerStyle, }) => {
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={containerStyle || styles.defaultContainer}>
      <Icon name={iconName} size={iconSize} color={iconColor} style={iconContainerStyle} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  defaultContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#fb7945',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
