import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.message}>
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className={styles.actions}>
          <Link to='/' className={styles.primaryButton}>
            Go Home
          </Link>
        </div>

        <div className={styles.links}>
          <p>Or try one of these pages:</p>
          <div className={styles.linkList}>
            <a href='/'>Home</a>
            <a href='/login'>Sign In</a>
            <a href='/dashboard'>Dashboard</a>
            <a href='/profile'>Profile</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
