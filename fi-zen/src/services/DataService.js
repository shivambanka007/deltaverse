class DataService {
  constructor() {
    this.currentUserId = '1010101010'; // Default user
    this.availableUsers = [
      '1010101010', '1111111111', '1212121212', '1313131313', '1414141414',
      '2020202020', '2121212121', '2222222222', '2525252525', '3333333333',
      '4444444444', '5555555555', '6666666666', '7777777777', '8888888888',
      '9999999999'
    ];
    
    // Mock financial data for different users (using avatars 1-16)
    this.mockUserData = {
      '1010101010': { balance: 125000.50, netWorth: -50000, avatar: 1 },
      '1111111111': { balance: 89750.25, netWorth: 45000, avatar: 2 },
      '1212121212': { balance: 234500.75, netWorth: 180000, avatar: 3 },
      '1313131313': { balance: 67890.00, netWorth: -25000, avatar: 4 },
      '1414141414': { balance: 156780.90, netWorth: 95000, avatar: 5 },
      '2020202020': { balance: 98765.43, netWorth: 12000, avatar: 6 },
      '2121212121': { balance: 345678.21, netWorth: 250000, avatar: 7 },
      '2222222222': { balance: 54321.67, netWorth: -15000, avatar: 8 },
      '2525252525': { balance: 187654.32, netWorth: 125000, avatar: 9 },
      '3333333333': { balance: 76543.89, netWorth: 35000, avatar: 10 },
      '4444444444': { balance: 298765.12, netWorth: 200000, avatar: 11 },
      '5555555555': { balance: 43210.98, netWorth: -8000, avatar: 12 },
      '6666666666': { balance: 165432.76, netWorth: 85000, avatar: 13 },
      '7777777777': { balance: 87654.21, netWorth: 25000, avatar: 14 },
      '8888888888': { balance: 234567.89, netWorth: 175000, avatar: 15 },
      '9999999999': { balance: 123456.78, netWorth: 65000, avatar: 16 }
    };
  }

  // Get list of available test users
  getAvailableUsers() {
    return this.availableUsers;
  }

  // Set current user
  setCurrentUser(userId) {
    if (this.availableUsers.includes(userId)) {
      this.currentUserId = userId;
      return true;
    }
    return false;
  }

  // Get current user ID
  getCurrentUser() {
    return this.currentUserId;
  }

  // Get user's total balance
  async getUserBalance(userId = this.currentUserId) {
    try {
      const userData = this.mockUserData[userId];
      return userData ? userData.balance : 12450.75;
    } catch (error) {
      console.error('Error getting user balance:', error);
      return 12450.75;
    }
  }

  // Get user's net worth
  async getUserNetWorth(userId = this.currentUserId) {
    try {
      const userData = this.mockUserData[userId];
      return userData ? userData.netWorth : -50000;
    } catch (error) {
      console.error('Error getting user net worth:', error);
      return -50000;
    }
  }

  // Mock methods for future implementation
  async loadNetWorth(userId = this.currentUserId) {
    return { totalNetWorth: { amount: await this.getUserNetWorth(userId) } };
  }

  async loadMutualFunds(userId = this.currentUserId) {
    return { funds: [] }; // Mock empty for now
  }

  async loadBankTransactions(userId = this.currentUserId) {
    return { transactions: [] }; // Mock empty for now
  }

  async loadCreditReport(userId = this.currentUserId) {
    return { score: 750 + Math.floor(Math.random() * 100) }; // Mock random score
  }

  // Get user's avatar number
  getUserAvatar(userId = this.currentUserId) {
    const userData = this.mockUserData[userId];
    return userData ? userData.avatar : 1;
  }
}

export default new DataService();