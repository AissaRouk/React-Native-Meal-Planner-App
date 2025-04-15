// RecipeCard.tsx
import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Recipe} from '../Types/Types';

const RecipeCard = ({recipe}: {recipe: Recipe}) => (
  <View style={styles.card}>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      <Image
        source={require('../Assets/icons/breakfast_icon.png')}
        style={{height: 100}}
        resizeMode="contain"
      />
      <Text style={styles.cardTitle}>{recipe.name}</Text>
    </View>
  </View>
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
});

export default RecipeCard;
