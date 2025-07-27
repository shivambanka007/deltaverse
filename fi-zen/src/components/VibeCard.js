import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FiColors } from '../theme/colors';

const VibeCard = () => {
  return (
    <View style={styles.funSection}>
      <Text style={styles.funTitle}>Today's Vibe 🎭</Text>
      <View style={styles.vibeCard}>
        <Text style={styles.vibeEmoji}>🥲</Text>
        <Text style={styles.vibeText}>
          When you check your balance after weekend shopping
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  funSection: {
    marginBottom: 20,
  },
  funTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: FiColors.text,
    marginBottom: 12,
  },
  vibeCard: {
    backgroundColor: FiColors.primary + '10',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FiColors.primary + '20',
  },
  vibeEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  vibeText: {
    fontSize: 13,
    color: FiColors.white,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default VibeCard;