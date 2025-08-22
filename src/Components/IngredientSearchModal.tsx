// src/Components/IngredientSearchModal.tsx
import React from 'react';
import {Modal, View, StyleSheet} from 'react-native';
import {ModalHeader} from './ModalHeareComponent';
import {IngredientSearchSelector} from './IngredientSearchSelectorComponent';
import {
  modalSemiTransparentBg,
  modalWhiteBg,
  modalBorderRadius,
} from '../Utils/Styiling';

type IngredientSearchModalProps = {
  visible: boolean;
  onClose: () => void;
  onAddIngredient: (ingredient: any) => void;
  onChangeQuantity: (id: string, quantity: number) => void;
  onChangeQuantityType: (id: string, type: string) => void;
  onRemoveIngredient: (id: string) => void;
  selectedIngredients: any[];
  onOpenAddIngredientModal: () => void;
};

export const IngredientSearchModal: React.FC<IngredientSearchModalProps> = ({
  visible,
  onClose,
  onAddIngredient,
  onChangeQuantity,
  onChangeQuantityType,
  onRemoveIngredient,
  selectedIngredients,
  onOpenAddIngredientModal,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ModalHeader text="Add an ingredient" onClose={onClose} />

        <IngredientSearchSelector
          onAddIngredient={onAddIngredient}
          onChangeQuantity={onChangeQuantity}
          onChangeQuantityType={onChangeQuantityType}
          onRemoveIngredient={onRemoveIngredient}
          selectedIngredients={selectedIngredients}
          onOpenAddIngredientModal={onOpenAddIngredientModal}
        />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: modalSemiTransparentBg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: modalWhiteBg,
    borderRadius: modalBorderRadius,
    padding: 20,
  },
});
