import React from "react";
import styles from './Header.module.css';
import { CiLogout } from "react-icons/ci";
import { FiSunrise, FiSunset } from "react-icons/fi";
import { useState } from "react";

const Header = () => {
    const [theme, updateTheme] = useState(localStorage.getItem('theme') || 'light');
    document.querySelector("HTML").setAttribute("data-theme", theme);

    const logout = () => {
         if (window.confirm('Вы уверены, что хотите выйти?')) { 
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('token');
            setTimeout(() => window.location.reload(), 1000);
            
         }
    }

    const setTheme = () => {
        const theme = localStorage.getItem('theme') || 'light';

        switch (theme) {
            case 'light':
                localStorage.setItem('theme', 'dark');
                updateTheme('dark');
                break;
            case 'dark':
                localStorage.setItem('theme', 'light')
                updateTheme('light')
                break;
        };

    }

    return (
        <div className={styles.headerContainer}>
            <div className={styles.titleContainer}>
                <span className={styles.title1}>Голос</span>
                <span className={styles.title2}>Крепости</span>
            </div>
            <div className={styles.contact}>
                {theme === 'light' ? <span className={styles.setTheme} onClick={setTheme} title="Темная тема"> 
                    <FiSunset className={styles.themeIcon}/>
                </span> : <span className={styles.setTheme} onClick={setTheme} title="Светлая тема"> 
                    <FiSunrise className={styles.themeIcon}/>
                </span>}

                <span className={styles.entry} onClick={logout}> 
                    Выйти <CiLogout className={styles.entryIcon}/>
                </span>
            </div>
        </div>
    );
};

export default Header;