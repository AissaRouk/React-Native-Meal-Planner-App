// RecipeCard.tsx
import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {Recipe} from '../Types/Types';

const RecipeCard = ({
  recipe,
  onPress,
  onLongPress,
}: {
  recipe: Recipe;
  onPress?: () => any;
  onLongPress?: () => any;
}) => {
  const defaultIcon = require('../Assets/icons/breakfast_icon.png');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <Image
          source={recipe.image ? {uri: recipe.image} : defaultIcon}
          style={styles.image}
        />
        <Text style={styles.cardTitle}>{recipe.name}</Text>
      </View>
    </TouchableOpacity>
  );
};

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
  cardTitle: {
    fontSize: 25,
    flex: 1,
    fontWeight: 'bold',
    color: 'black',
    marginLeft: 10,
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    objectFit: 'cover', // only works on web. For mobile:
    resizeMode: 'cover', // for iOS/Android
  },
});

export default RecipeCard;
