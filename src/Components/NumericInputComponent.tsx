import React from 'react';
import {TextInput, TextInputProps} from 'react-native';

type NumericInputProps = TextInputProps & {
  value: string;
  onChangeText: (text: string) => void;
};

const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChangeText,
  ...props
}) => {
  const handleChange = (text: string) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    onChangeText(numericText);
  };

  return (
    <TextInput
      value={value}
      onChangeText={handleChange}
      keyboardType="numeric"
      {...props}
    />
  );
};

export default NumericInput;
