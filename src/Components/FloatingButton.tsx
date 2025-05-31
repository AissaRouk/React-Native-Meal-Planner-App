// src/Components/FloatingButton.tsx

import React from 'react';
import {TouchableOpacity, StyleSheet, ViewStyle} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';

// Extract exactly the union type of valid Ionicon names:
type IoniconName = React.ComponentProps<typeof Icon>['name'];

type FloatingButtonProps = {
  /** Callback when the button is pressed */
  onPress: () => void;

  /** Name of the Ionicon to display (e.g. "add", "create", etc.) */
  iconName: IoniconName;

  /** Color of the icon */
  iconColor?: string;

  /** Size of the icon (in dp) */
  iconSize?: number;

  /**
   * Optional additional styles for the TouchableOpacity container.
   * Example: { bottom: 24, right: 24, backgroundColor: 'blue' }
   */
  containerStyle?: ViewStyle;

  /**
   * Optional additional styles for the icon itself.
   * Use this if you need to adjust margin/padding on the icon.
   */
  iconContainerStyle?: ViewStyle;
};

/**
 * A circular, floating‐position button with an Ionicon.
 *
 * By default, it sits in the bottom‐right corner (absolute), but you can override via `containerStyle`.
 * Use `iconName`, `iconSize`, and `iconColor` to choose which icon appears.
 */
export const FloatingButton: React.FC<FloatingButtonProps> = ({
  onPress,
  iconName,
  iconColor = 'white',
  iconSize = 28,
  containerStyle,
  iconContainerStyle,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.defaultContainer, containerStyle]}>
      <Icon
        name={iconName}
        size={iconSize}
        color={iconColor}
        style={iconContainerStyle}
      />
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});
