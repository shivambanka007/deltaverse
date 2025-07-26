import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import SpendAnalysisWidget from '../../components/dashboard/SpendAnalysisWidget';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    console.log('🚪 Dashboard: Starting logout process');
    setIsSigningOut(true);
    
    try {
      console.log('🔄 Dashboard: Calling signOut from useAuth');
      const result = await signOut();
      
      console.log('📋 Dashboard: SignOut result:', result);
      
      if (result.success) {
        console.log('✅ Dashboard: Logout successful - global auth manager will handle navigation');
        // Global auth manager will handle navigation automatically
      } else {
        console.error('❌ Dashboard: Logout failed:', result.error);
        // Force navigation even on error
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('❌ Dashboard: Logout error:', error);
      // Force navigation even on error
      navigate('/login', { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Mock financial data
  const financialData = {
    totalBalance: '₹2,45,680',
    monthlyIncome: '₹85,000',
    monthlyExpenses: '₹52,340',
    savings: '₹32,660',
    investments: '₹1,85,420',
    goals: [
      { name: 'Emergency Fund', target: 500000, current: 245680, progress: 49 },
      { name: 'Home Down Payment', target: 2000000, current: 185420, progress: 9 },
      { name: 'Vacation Fund', target: 150000, current: 45000, progress: 30 },
    ],
    recentTransactions: [
      { id: 1, description: 'Salary Credit', amount: '+₹85,000', date: '2024-07-15', type: 'credit' },
      { id: 2, description: 'Rent Payment', amount: '-₹25,000', date: '2024-07-14', type: 'debit' },
      { id: 3, description: 'Grocery Shopping', amount: '-₹3,450', date: '2024-07-13', type: 'debit' },
      { id: 4, description: 'Investment SIP', amount: '-₹15,000', date: '2024-07-12', type: 'investment' },
      { id: 5, description: 'Electricity Bill', amount: '-₹2,890', date: '2024-07-11', type: 'debit' },
    ],
  };

  return (
    <div className={styles.dashboard}>
      {/* Header with Logout */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.welcomeSection}>
            <h1>{getGreeting()}, {user?.displayName || user?.email?.split('@')[0] || 'User'}!</h1>
            <p className={styles.dateTime}>
              {formatDate(currentTime)} • {formatTime(currentTime)}
            </p>
          </div>
          
          <div className={styles.userSection}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" />
                ) : (
                  <span>{(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>
                  {user?.displayName || user?.email || user?.phoneNumber}
                </span>
                <span className={styles.userProvider}>
                  {user?.provider === 'google' ? 'Google Account' : 
                   user?.provider === 'phone' ? 'Phone Account' : 'Email Account'}
                </span>
              </div>
            </div>
            
            <div className={styles.headerActions}>
              <Link 
                to="/financial-health" 
                className={styles.healthButton}
                title="Check your Financial Health Score - Get personalized insights and recommendations"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  {/* Health/Heart with pulse icon */}
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" 
                        fill="currentColor" 
                        opacity="0.9"/>
                  {/* Pulse lines */}
                  <path d="M3 12h3l2-4 4 8 2-4h3" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        fill="none" 
                        opacity="0.8"/>
                </svg>
                <span>Health Score</span>
                {/* Score indicator badge */}
                <div className={styles.scoreBadge}>
                  <span>✨</span>
                </div>
              </Link>
              <Link to="/chat" className={styles.chatButton}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2"/>
                </svg>
                AI Chat
              </Link>

              <button
                className={styles.logoutButton}
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                {isSigningOut ? (
                  <>
                    <div className={styles.spinner}></div>
                    Signing out...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2"/>
                      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className={styles.main}>
        {/* Financial Overview Cards */}
        <section className={styles.overviewSection}>
          <h2>Financial Overview</h2>
          <div className={styles.cardGrid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Total Balance</h3>
                <div className={styles.cardIcon}>💰</div>
              </div>
              <div className={styles.cardValue}>{financialData.totalBalance}</div>
              <div className={styles.cardChange}>+5.2% from last month</div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Monthly Income</h3>
                <div className={styles.cardIcon}>📈</div>
              </div>
              <div className={styles.cardValue}>{financialData.monthlyIncome}</div>
              <div className={styles.cardChange}>Salary credited</div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Monthly Expenses</h3>
                <div className={styles.cardIcon}>📊</div>
              </div>
              <div className={styles.cardValue}>{financialData.monthlyExpenses}</div>
              <div className={styles.cardChange}>-8.3% from last month</div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3>Investments</h3>
                <div className={styles.cardIcon}>📊</div>
              </div>
              <div className={styles.cardValue}>{financialData.investments}</div>
              <div className={styles.cardChange}>+12.4% returns</div>
            </div>
          </div>
        </section>

        {/* Goals and Transactions */}
        <div className={styles.contentGrid}>
          {/* Financial Goals */}
          <section className={styles.goalsSection}>
            <h2>Financial Goals</h2>
            <div className={styles.goalsList}>
              {financialData.goals.map((goal, index) => (
                <div key={index} className={styles.goalItem}>
                  <div className={styles.goalHeader}>
                    <h4>{goal.name}</h4>
                    <span className={styles.goalProgress}>{goal.progress}%</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill}
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                  <div className={styles.goalDetails}>
                    <span>₹{goal.current.toLocaleString('en-IN')} of ₹{goal.target.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Transactions */}
          <section className={styles.transactionsSection}>
            <h2>Recent Transactions</h2>
            <div className={styles.transactionsList}>
              {financialData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className={styles.transactionItem}>
                  <div className={styles.transactionIcon}>
                    {transaction.type === 'credit' ? '💰' : 
                     transaction.type === 'investment' ? '📈' : '💳'}
                  </div>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionDescription}>
                      {transaction.description}
                    </div>
                    <div className={styles.transactionDate}>
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div className={`${styles.transactionAmount} ${
                    transaction.type === 'credit' ? styles.credit : styles.debit
                  }`}>
                    {transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* AI Recommendations and Spend Analysis */}
        <div className={styles.aiSection}>
          <section className={styles.recommendationsSection}>
            <h2>AI Financial Recommendations</h2>
            <div className={styles.recommendationsList}>
              <div className={styles.recommendationItem}>
                <div className={styles.recommendationIcon}>🤖</div>
                <div className={styles.recommendationContent}>
                  <h4>Optimize Your Savings</h4>
                  <p>Based on your spending pattern, you can save an additional ₹8,000 per month by reducing dining out expenses.</p>
                </div>
              </div>
              <div className={styles.recommendationItem}>
                <div className={styles.recommendationIcon}>📊</div>
                <div className={styles.recommendationContent}>
                  <h4>Investment Opportunity</h4>
                  <p>Consider increasing your SIP amount by ₹5,000 to reach your home down payment goal 6 months earlier.</p>
                </div>
              </div>
              <div className={styles.recommendationItem}>
                <div className={styles.recommendationIcon}>🎯</div>
                <div className={styles.recommendationContent}>
                  <h4>Emergency Fund Alert</h4>
                  <p>You're halfway to your emergency fund goal! Consider allocating your next bonus to complete it.</p>
                </div>
              </div>
            </div>
          </section>

          <SpendAnalysisWidget />
        </div>

        {/* AI Financial Insights section removed */}
      </main>
    </div>
  );
};

export default Dashboard;
