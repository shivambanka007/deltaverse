import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FiColors } from '../theme/colors';

const BalanceCard = ({ balance }) => {
  return (
    <View style={styles.balanceCard}>
      <Text style={styles.balanceLabel}>Total Balance</Text>
      <Text style={styles.balanceAmount}>
        ₹{balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}
      </Text>
      <Text style={styles.balanceSubtext}>Keep it growing! 📈</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  balanceCard: {
    backgroundColor: FiColors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: FiColors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: FiColors.white,
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: FiColors.white,
    opacity: 0.8,
  },
});

export default BalanceCard;