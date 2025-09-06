import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {QuantityType} from '../Types/Types';

export type PlannedIngredientCardProps = {
  ingredientName: string;
  quantity: number;
  quantityType: QuantityType;
  onPress?: () => void;
  onLongPress?: () => void; // NEW
  onRemove?: () => void;
};

const BRAND = '#fb7945';

const PlannedIngredientCard: React.FC<PlannedIngredientCardProps> = ({
  ingredientName,
  quantity,
  quantityType,
  onPress,
  onLongPress,
  onRemove,
}) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.85}
    onPress={onPress}
    onLongPress={onLongPress}>
    <View style={styles.row}>
      <Image
        source={require('../Assets/icons/breakfast_icon.png')}
        style={{height: 80}}
        resizeMode="contain"
      />
      <View style={{flex: 1, marginLeft: 10}}>
        <Text style={styles.title} numberOfLines={1}>
          {ingredientName}
        </Text>
        <Text style={styles.subtitle}>
          {quantity} {String(quantityType)}
        </Text>
      </View>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  row: {flexDirection: 'row', alignItems: 'center'},
  title: {fontSize: 20, fontWeight: 'bold', color: 'black'},
  subtitle: {fontSize: 14, color: '#666', marginTop: 6},
  removeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BRAND,
  },
  removeText: {color: BRAND, fontWeight: '600'},
});

export default PlannedIngredientCard;
