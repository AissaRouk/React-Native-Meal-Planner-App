// RecipeCard.tsx
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Recipe} from '../Types/Types';

const RecipeCard = ({recipe}: {recipe: Recipe}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Recipe</Text>
    <Text style={styles.text}>ID: {recipe.id}</Text>
    <Text style={styles.text}>Name: {recipe.name}</Text>
    <Text style={styles.text}>Link: {recipe.link}</Text>
    <Text style={styles.text}>
      Preparation Time: {recipe.preparationTime} mins
    </Text>
    <Text style={styles.text}>Serving Size: {recipe.servingSize}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
});

export default RecipeCard;
