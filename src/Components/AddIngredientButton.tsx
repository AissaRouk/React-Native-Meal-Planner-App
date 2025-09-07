// src/Components/AddIngredientButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  StyleSheet as RNStyleSheet,
} from 'react-native';
import {orangeBackgroundColor} from '../Utils/Styiling';
import Icon from '@react-native-vector-icons/ionicons';

// Props as an object (JSX expects a single props param)
export type AddIngredientButtonProps = {
  setAddIngredientModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  /**
   * You were passing `styles.searchContainerHeight`, which is a style id.
   * Accept a style (or number) and flatten to read its `height`.
   */
  searchContainerHeight: StyleProp<ViewStyle> | number;
  style?: StyleProp<ViewStyle>;
  btnSize?: number;
};

export const AddIngredientButton: React.FC<AddIngredientButtonProps> = ({
  setAddIngredientModalVisible,
  searchContainerHeight,
  style,
  btnSize = 20,
}) => {
  const height =
    typeof searchContainerHeight === 'number'
      ? searchContainerHeight
      : (RNStyleSheet.flatten(searchContainerHeight)?.height as number) ?? 30;

  return (
    <TouchableOpacity
      onPress={() => setAddIngredientModalVisible(true)}
      style={style || styles.btn}
      activeOpacity={0.8}>
      <Icon name="add-outline" size={btnSize} color={'white'} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    padding: 10,
    backgroundColor: orangeBackgroundColor,
    borderRadius: 5,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddIngredientButton;
