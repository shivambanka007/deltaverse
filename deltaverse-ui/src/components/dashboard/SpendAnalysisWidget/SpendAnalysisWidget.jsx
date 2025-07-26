import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { formatCurrency, getCategoryIcon } from '../../../config/spendAnalysisConfig';
import styles from './SpendAnalysisWidget.module.css';

const SpendAnalysisWidget = () => {
  const { user } = useAuth();
  const [spendData, setSpendData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSpendData = useCallback(async () => {
    try {
      setLoading(true);
      // Use mock user ID like fi-mcp pattern
      const userId = user?.phoneNumber || user?.uid || '1111111111';
      const response = await fetch(`/api/v1/spend-analysis/report/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSpendData(data);
      } else {
        // Fallback mock data if API fails
        setSpendData({
          current_month_summary: {
            total_spending: 52340,
            net_cashflow: 32660,
            top_categories: [
              { category: 'CATEGORY_FOOD', total_amount: 18500, percentage_of_total: 35.3 },
              { category: 'CATEGORY_TRANSPORT', total_amount: 12000, percentage_of_total: 22.9 }
            ]
          },
          insights: [
            { title: 'High Food Spending', description: 'You spent 35% on food this month.', severity: 'SEVERITY_MEDIUM' }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching spend data:', error);
      // Fallback mock data on error
      setSpendData({
        current_month_summary: {
          total_spending: 0,
          net_cashflow: 0,
          top_categories: []
        },
        insights: []
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSpendData();
    }
  }, [user, fetchSpendData]);

  if (loading) {
    return (
      <div className={styles.widget}>
        <div className={styles.header}>
          <h3>AI Spend Analysis</h3>
          <div className={styles.spinner}></div>
        </div>
        <div className={styles.loading}>Analyzing your spending...</div>
      </div>
    );
  }

  if (!spendData) {
    return (
      <div className={styles.widget}>
        <div className={styles.header}>
          <h3>AI Spend Analysis</h3>
          <span className={styles.icon}>📊</span>
        </div>
        <div className={styles.noData}>
          <p>Connect your bank accounts to see spending insights</p>
        </div>
      </div>
    );
  }

  const { current_month_summary, insights } = spendData;
  const topCategories = current_month_summary.top_categories?.slice(0, 3) || [];

  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <h3>AI Spend Analysis</h3>
        <span className={styles.icon}>🤖</span>
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <div className={styles.stat}>
          <span className={styles.label}>This Month</span>
          <span className={styles.value}>{formatCurrency(current_month_summary.total_spending)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Cashflow</span>
          <span className={`${styles.value} ${current_month_summary.net_cashflow >= 0 ? styles.positive : styles.negative}`}>
            {formatCurrency(current_month_summary.net_cashflow)}
          </span>
        </div>
      </div>

      {/* Top Categories */}
      <div className={styles.categories}>
        <h4>Top Spending Categories</h4>
        <div className={styles.categoryList}>
          {topCategories.map((category, index) => (
            <div key={index} className={styles.categoryItem}>
              <span className={styles.categoryIcon}>
                {getCategoryIcon(category.category)}
              </span>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryName}>
                  {category.category.replace('CATEGORY_', '').replace('_', ' ')}
                </span>
                <span className={styles.categoryAmount}>
                  {formatCurrency(category.total_amount)}
                </span>
              </div>
              <div className={styles.categoryPercent}>
                {category.percentage_of_total.toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className={styles.insights}>
        <h4>AI Insights</h4>
        <div className={styles.insightsList}>
          {insights?.slice(0, 2).map((insight, index) => (
            <div key={index} className={`${styles.insightItem} ${styles[insight.severity?.toLowerCase()]}`}>
              <div className={styles.insightIcon}>💡</div>
              <div className={styles.insightContent}>
                <div className={styles.insightTitle}>{insight.title}</div>
                <div className={styles.insightDescription}>
                  {insight.description.length > 80 
                    ? `${insight.description.substring(0, 80)}...` 
                    : insight.description}
                </div>
              </div>
            </div>
          )) || (
            <div className={styles.noInsights}>
              <p>Keep spending to get AI insights!</p>
            </div>
          )}
        </div>
      </div>


    </div>
  );
};

export default SpendAnalysisWidget;