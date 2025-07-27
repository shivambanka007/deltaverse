import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FiColors } from '../theme/colors';

const PlantRewards = ({ plantGrowth, rewardPoints }) => {
  const getPlantEmoji = (growth) => {
    if (growth <= 1) return '🌱';
    if (growth <= 3) return '🌿';
    if (growth <= 5) return '🪴';
    return '🌳';
  };

  return (
    <View style={styles.rewardsSection}>
      <View style={styles.plantContainer}>
        <Text style={styles.plantEmoji}>{getPlantEmoji(plantGrowth)}</Text>
        <Text style={styles.plantText}>Your money plant is growing!</Text>
        <Text style={styles.rewardPoints}>{rewardPoints} Fi Points ✨</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rewardsSection: {
    marginBottom: 24,
  },
  plantContainer: {
    backgroundColor: FiColors.secondary + '15',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FiColors.secondary + '30',
  },
  plantEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  plantText: {
    fontSize: 14,
    color: FiColors.white,
    fontWeight: '500',
    marginBottom: 4,
  },
  rewardPoints: {
    fontSize: 12,
    color: FiColors.primary,
    fontWeight: '600',
  },
});

export default PlantRewards;