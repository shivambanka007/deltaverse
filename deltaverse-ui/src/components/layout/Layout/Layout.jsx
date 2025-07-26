import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import styles from './Layout.module.css';

const Layout = ({ children }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Silent error handling - no console logs
    }
  };

  return (
    <div className={styles.layout}>
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;
