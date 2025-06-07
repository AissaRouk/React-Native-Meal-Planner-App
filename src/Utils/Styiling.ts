import {ColorValue, StyleSheet} from 'react-native';

// Genric colors
const orangeBackgroundColor: ColorValue = '#fb7945';
const greyBorderColor: ColorValue = '#ccc';
const screensBackgroundColor: ColorValue = '#fff';
const modalSemiTransparentBg: ColorValue = 'rgba(0,0,0,0.5)';
const modalWhiteBg: ColorValue = 'white';
//Generic styles
const modalBorderRadius: number = 10;

const genericStyles = StyleSheet.create({
  nameBold: {
    fontSize: 16, // Font size for the ingredient name
    color: 'black', // Black text color
    fontWeight: '500', // Medium font weight
  },
});

export {
  orangeBackgroundColor,
  genericStyles,
  greyBorderColor,
  modalSemiTransparentBg,
  screensBackgroundColor,
  modalWhiteBg,
  modalBorderRadius,
};
