import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      // Silent error handling - no console logs
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user?.photoURL ? (
              <img
                src={user.picture}
                alt='Profile'
                className={styles.avatarImage}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {user?.displayName?.charAt(0) ||
                  user?.email?.charAt(0) ||
                  user?.phoneNumber?.charAt(0) ||
                  'U'}
              </div>
            )}
          </div>
          <h1 className={styles.name}>
            {user?.displayName || user?.email || user?.phoneNumber || 'User'}
          </h1>
          <p className={styles.email}>{user?.email || user?.phoneNumber}</p>
        </div>

        <div className={styles.section}>
          <h2>Account Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Display Name</label>
              <span>
                {user?.displayName ||
                  user?.email ||
                  user?.phoneNumber ||
                  'Not set'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Email</label>
              <span>{user?.email || 'Not provided'}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Phone</label>
              <span>{user?.phoneNumber || 'Not provided'}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Sign-in Method</label>
              <span>
                {user?.provider === 'google'
                  ? 'Google Sign-in'
                  : user?.provider === 'phone'
                    ? 'Phone OTP'
                    : user?.provider === 'google_otp'
                      ? 'Google + Phone OTP'
                      : 'Email/Password'}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Email Verified</label>
              <span className={user?.emailVerified ? styles.verified : ''}>
                {user?.emailVerified ? 'Verified' : 'Not verified'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Preferences</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Language</label>
              <span>English</span>
            </div>
            <div className={styles.infoItem}>
              <label>Currency</label>
              <span>USD</span>
            </div>
            <div className={styles.infoItem}>
              <label>Theme</label>
              <span>Light</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h2>Security</h2>
          <div className={styles.securityGrid}>
            <button className={styles.securityButton}>Manage Devices</button>
            <button className={styles.securityButton}>
              Two-Factor Authentication
            </button>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.editButton}>Edit Profile</button>
          <button className={styles.editButton}>Change Password</button>
          <button className={styles.editButton}>Privacy Settings</button>
          <button className={styles.signOutButton} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
