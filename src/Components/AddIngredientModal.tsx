import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {SUCCESS} from '../Services/db-services';
import {IngredientWithoutId} from '../Types/Types';

type AddIngredientModalProps = {
  visible: boolean;
  onClose?: () => void;
  onSubmit: (ingredient: IngredientWithoutId) => Promise<boolean>;
};

const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  // States to handle the TextInput values that will go to the new Ingredient
  const [name, setName] = useState<string>(''); // Ingredient name
  const [category, setCategory] = useState<string>(''); // Ingredient category

  // Function to handle submission
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Ingredient name is required.');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Validation Error', 'Ingredient category is required.');
      return;
    }
    const response = await onSubmit({name: name, category: category});
    if (response == SUCCESS) {
      onClose && onClose();
    }
    setName('');
    setCategory('');
  };

  // Function to handle modal close
  const handleClose = () => {
    setName('');
    setCategory('');
    onClose && onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Add Ingredient</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="close" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <TextInput
            placeholder="Ingredient Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Ingredient Category"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
          />

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSubmit} style={styles.nextButton}>
              <Text>Add Ingredient</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent background
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%', // Modal width relative to the screen
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fb7945',
    borderRadius: 15, // Circular button
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 5,
  },
  nextButton: {
    padding: 10,
    backgroundColor: '#fb7945',
    borderRadius: 5,
  },
});

export default AddIngredientModal;
