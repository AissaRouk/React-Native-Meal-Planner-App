import {ColorValue, StyleSheet} from 'react-native';

export const orangeBackgroundColor: ColorValue = '#fb7945';
export const greyBorderColor: ColorValue = '#ccc';

export const genericStyles = StyleSheet.create({
  nameBold: {
    fontSize: 16, // Font size for the ingredient name
    color: 'black', // Black text color
    fontWeight: '500', // Medium font weight
  },
});
