import React from "react";
import styles from './Header.module.css';
import { IoIosMail } from "react-icons/io";

const Header = () => {
    return (
        <div className={styles.headerContainer}>
            <div className={styles.titleContainer}>
                <span className={styles.title1}>Тестовое</span>
                <span className={styles.title2}>Название</span>
            </div>
            <div className={styles.contact}>
                <a href="mailto:xxx">
                    Связаться с нами
                    <IoIosMail className={styles.mailIcon} />
                </a>
            </div>
        </div>
    );
};

export default Header;