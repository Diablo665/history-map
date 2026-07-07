import React from 'react';
import styles from './Loading.module.css';

const Loading = ({ text = 'Загрузка...', size = 'medium' }) => {
    return (
        <div className={`${styles.container} ${styles[`size-${size}`]}`}>
            <div className={styles.spinner} aria-hidden="true" />
            <span className={styles.text}>{text}</span>
        </div>
    );
};

export default Loading