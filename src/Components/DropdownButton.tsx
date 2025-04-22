import DropDownPicker from 'react-native-dropdown-picker';
import {QuantityType, quantityTypes} from '../Types/Types';
import {Dispatch, SetStateAction} from 'react';
//Dropdown Button

type DropdownButtonProps = {
  isPickerOpen: boolean;
  setIsPickerOpen: Dispatch<SetStateAction<boolean>>;
  quantityType: QuantityType;
  setQuantityType: (quantityType: QuantityType) => void;
};

export const DropdownButton = ({
  isPickerOpen,
  setIsPickerOpen,
  quantityType,
  setQuantityType,
}: DropdownButtonProps) => {
  return (
    <DropDownPicker
      open={isPickerOpen}
      setOpen={setIsPickerOpen}
      value={quantityType ?? null}
      items={quantityTypes.map(type => ({
        label: type,
        value: type,
      }))}
      placeholder="Select"
      setValue={callback => {
        const value =
          typeof callback === 'function' ? callback(quantityType) : callback;
        setQuantityType(value as QuantityType);
      }}
      style={{
        backgroundColor: '#ccc',
        borderRadius: 5,
        borderWidth: 0,
        width: 100,
      }}
      textStyle={{fontSize: 16, fontWeight: '500'}}
    />
  );
};
