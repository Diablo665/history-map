import React from "react";
import styles from './Header.module.css';
import { IoIosMail } from "react-icons/io";
import { CiLogin, CiLogout } from "react-icons/ci";
import { FiSunrise, FiSunset } from "react-icons/fi";
import { openLoginForm, setIsLogined } from "../../store/loginSlice";
import { useDispatch, useSelector} from "react-redux";
import { useState } from "react";
import { showNotification } from "../../utils/helper";

const Header = () => {
    const dispatch = useDispatch();
    const {isLogined} = useSelector((state) => state.login);
    const [theme, updateTheme] = useState(localStorage.getItem('theme') || 'light');
    document.querySelector("HTML").setAttribute("data-theme", theme);
    const login = () =>{
        dispatch(openLoginForm());
    }

    const logout = () => {
         if (window.confirm('Вы уверены, что хотите выйти?')) { 
            dispatch(setIsLogined(false));
            showNotification("Вы вышли", 'success');
            setTimeout(() => window.location.reload(), 1000);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
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

                <a href="mailto:support@thevoiceofthefortress.fun">
                    Связаться с нами
                    <IoIosMail className={styles.mailIcon} />
                </a>
                {!isLogined ? <span className={styles.entry} onClick={login}> 
                    Вход <CiLogin className={styles.entryIcon}/>
                </span> : <span className={styles.entry} onClick={logout}> 
                    Выйти <CiLogout className={styles.entryIcon}/>
                </span>}
            </div>
        </div>
    );
};

export default Header;