import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { FiColors } from './src/theme/colors';
import BalanceCard from './src/components/BalanceCard';
import PlantRewards from './src/components/PlantRewards';
import QuickActions from './src/components/QuickActions';
import VibeCard from './src/components/VibeCard';
import DataService from './src/services/DataService';
import { getAvatarSource } from './src/utils/avatarHelper';

function App() {
  const [balance, setBalance] = useState(12450.75);
  const [plantGrowth, setPlantGrowth] = useState(3);
  const [rewardPoints, setRewardPoints] = useState(245);
  const [currentUser, setCurrentUser] = useState('1010101010');
  const [availableUsers] = useState(DataService.getAvailableUsers());
  const [userAvatar, setUserAvatar] = useState(1);

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      const userBalance = await DataService.getUserBalance(currentUser);
      const avatar = DataService.getUserAvatar(currentUser);
      setBalance(userBalance);
      setUserAvatar(avatar);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleTransaction = (amount) => {
    setBalance(balance + amount);
    if (amount > 0) {
      setPlantGrowth(Math.min(plantGrowth + 1, 6));
      setRewardPoints(rewardPoints + 10);
    }
  };

  const switchUser = (userId) => {
    setCurrentUser(userId);
    DataService.setCurrentUser(userId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={FiColors.background} />
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => {
                const nextUserIndex = (availableUsers.indexOf(currentUser) + 1) % availableUsers.length;
                switchUser(availableUsers[nextUserIndex]);
              }}>
              <Image 
                source={getAvatarSource(userAvatar)}
                style={styles.avatarImage}
              />
            </TouchableOpacity>
            
            <View style={styles.centerContent}>
              <Text style={styles.greeting}>Good morning! 👋</Text>
              <Text style={styles.subtitle}>Money made simple</Text>
            </View>
            
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <Text style={styles.iconEmoji}>📢</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Text style={styles.iconEmoji}>🔔</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.userInfo}>User: {currentUser}</Text>
          
          <BalanceCard balance={balance} />
          
          <PlantRewards plantGrowth={plantGrowth} rewardPoints={rewardPoints} />
          
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => handleTransaction(1000)}>
              <Text style={styles.primaryButtonText}>💰 Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => handleTransaction(-500)}>
              <Text style={styles.secondaryButtonText}>📤 Send Money</Text>
            </TouchableOpacity>
          </View>
          
          <QuickActions />
          
          <VibeCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FiColors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: FiColors.primary,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: FiColors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: FiColors.secondary,
    fontStyle: 'italic',
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FiColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  userInfo: {
    fontSize: 12,
    color: FiColors.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: FiColors.primary,
  },
  secondaryButton: {
    backgroundColor: FiColors.secondary,
  },
  primaryButtonText: {
    color: FiColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: FiColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
