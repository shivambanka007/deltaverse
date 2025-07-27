import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FiColors } from '../theme/colors';

const QuickActions = () => {
  const actions = [
    { emoji: '💳', text: 'Cards' },
    { emoji: '📊', text: 'Insights' },
    { emoji: '🎯', text: 'Goals' },
    { emoji: '🏆', text: 'Rewards' },
  ];

  return (
    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionGrid}>
        {actions.map((action, index) => (
          <TouchableOpacity key={index} style={styles.quickActionItem}>
            <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
            <Text style={styles.quickActionText}>{action.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: FiColors.text,
    marginBottom: 16,
  },
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionItem: {
    width: '47%',
    backgroundColor: FiColors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FiColors.secondary + '40',
  },
  quickActionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    color: FiColors.white,
    fontWeight: '500',
  },
});

export default QuickActions;