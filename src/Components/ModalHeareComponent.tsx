import {View, Text, TouchableOpacity} from 'react-native';
import Icon from '@react-native-vector-icons/ionicons';
import {orangeBackgroundColor} from '../Utils/Styiling';

//The header of the modal (contains Text + Exit-Button)
export const ModalHeader: React.FC<{text: string; onClose: () => void}> = ({
  text,
  onClose,
}) => (
  <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
    <Text
      style={{
        fontSize: 20,
        marginBottom: 15,
        fontWeight: 'bold',
      }}>
      {text}
    </Text>
    <TouchableOpacity
      onPress={onClose}
      style={{
        height: 30,
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: orangeBackgroundColor,
        borderRadius: 15, // Make it circular
      }}>
      <Icon name="close" size={20} color="white" />
    </TouchableOpacity>
  </View>
);
