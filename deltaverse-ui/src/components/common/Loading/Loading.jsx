import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={`${styles.spinner} ${styles[size]}`}></div>
      {message && (
        <div className={styles['loading-message']}>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default Loading;
